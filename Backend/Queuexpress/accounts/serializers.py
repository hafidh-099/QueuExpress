from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'work_id', 'role', 'profile_image', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password_confirm', 'full_name', 'work_id', 'role', 'profile_image']
    
    def validate(self, data):
        """Validate passwords match"""
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data
    
    def create(self, validated_data):
        """Create and return a new user instance"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login (admin and staff)"""
    username = serializers.CharField(required=False, allow_blank=True)
    work_id = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """
        Validate that either username or work_id is provided
        """
        username = data.get('username')
        work_id = data.get('work_id')
        password = data.get('password')
        
        if not password:
            raise serializers.ValidationError({
                'password': 'Password is required.'
            })
        
        if not username and not work_id:
            raise serializers.ValidationError({
                'non_field_errors': 'Either username or work_id must be provided.'
            })
        
        # Authenticate based on username or work_id
        user = None
        if username:
            try:
                user = User.objects.get(username=username)
                if not user.check_password(password):
                    raise serializers.ValidationError({
                        'password': 'Invalid password.'
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'username': 'User not found.'
                })
        
        elif work_id:
            try:
                user = User.objects.get(work_id=work_id)
                if not user.check_password(password):
                    raise serializers.ValidationError({
                        'password': 'Invalid password.'
                    })
            except User.DoesNotExist:
                raise serializers.ValidationError({
                    'work_id': 'Staff not found.'
                })
        
        data['user'] = user
        return data


class StaffListSerializer(serializers.ModelSerializer):
    """Serializer for listing staff members"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'work_id', 'profile_image', 'created_at']
        read_only_fields = ['id', 'created_at']
