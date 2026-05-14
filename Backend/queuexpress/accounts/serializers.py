from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'work_id', 'role', 'profile_image']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users (admin only)"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'confirm_password', 'full_name', 'work_id', 'role', 'profile_image']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # work_id is required for staff role
        if attrs.get('role') == 'staff' and not attrs.get('work_id'):
            raise serializers.ValidationError({"work_id": "Work ID is required for staff members"})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login (both admin and staff)"""
    username = serializers.CharField(required=False, allow_blank=True)
    work_id = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username', '')
        work_id = attrs.get('work_id', '')
        password = attrs.get('password')
        
        # Either username or work_id must be provided, not both
        if not username and not work_id:
            raise serializers.ValidationError("Either username or work_id is required")
        
        if username and work_id:
            raise serializers.ValidationError("Provide either username OR work_id, not both")
        
        # Store for view to use
        attrs['login_type'] = 'username' if username else 'work_id'
        attrs['login_value'] = username if username else work_id
        
        return attrs