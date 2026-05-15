from rest_framework import serializers
from .models import Service, Batch, Settings, Queue, Feedback
from accounts.models import User

class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    
    class Meta:
        model = Service
        fields = ['service_id', 'service_name']


class BatchSerializer(serializers.ModelSerializer):
    """Serializer for Batch model"""
    
    class Meta:
        model = Batch
        fields = ['batch_id', 'batch_number', 'batch_limit']


class SettingsSerializer(serializers.ModelSerializer):
    """Serializer for Settings model"""
    
    class Meta:
        model = Settings
        fields = ['setting_id', 'batch_size', 'reset_time', 'updated_at']
        read_only_fields = ['setting_id', 'updated_at']


class QueueSerializer(serializers.ModelSerializer):
    """Serializer for Queue model"""
    service_name = serializers.CharField(source='service.service_name', read_only=True)
    batch_number = serializers.IntegerField(source='batch.batch_number', read_only=True)
    served_by_name = serializers.CharField(source='served_by.full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Queue
        fields = [
            'queue_id', 'queue_number', 'batch_number', 'service_id', 
            'service_name', 'phone_number', 'status', 'created_at', 
            'served_by', 'served_by_name'
        ]
        read_only_fields = ['queue_id', 'queue_number', 'created_at']


class QueueJoinSerializer(serializers.Serializer):
    """Serializer for customers joining queue"""
    phone_number = serializers.CharField(max_length=15, required=True)
    service_id = serializers.IntegerField(required=True)
    
    def validate_service_id(self, value):
        try:
            service = Service.objects.get(service_id=value)
        except Service.DoesNotExist:
            raise serializers.ValidationError("Service not found")
        return value


class QueueStatusSerializer(serializers.Serializer):
    """Serializer for queue status response"""
    queue_number = serializers.IntegerField()
    status = serializers.CharField()
    people_ahead = serializers.IntegerField()
    estimated_time = serializers.IntegerField(help_text="Estimated wait time in minutes")


class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for Feedback model"""
    phone_number = serializers.CharField(source='queue.phone_number', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['feedback_id', 'queue_id', 'rating', 'message', 'created_at', 'phone_number']
        read_only_fields = ['feedback_id', 'created_at']


class FeedbackCreateSerializer(serializers.Serializer):
    """Serializer for creating feedback"""
    queue_id = serializers.IntegerField(required=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    message = serializers.CharField(required=False, allow_blank=True)
    
    def validate_queue_id(self, value):
        try:
            queue = Queue.objects.get(queue_id=value)
            if queue.status != 'served':
                raise serializers.ValidationError("Feedback can only be given for served queues")
        except Queue.DoesNotExist:
            raise serializers.ValidationError("Queue not found")
        return value


class CallNextSerializer(serializers.Serializer):
    """Serializer for call next response"""
    queue_id = serializers.IntegerField()
    queue_number = serializers.IntegerField()
    phone_number = serializers.CharField()
    service_name = serializers.CharField()


class StaffQueueListSerializer(serializers.ModelSerializer):
    """Serializer for staff queue list"""
    service_name = serializers.CharField(source='service.service_name')
    batch_number = serializers.IntegerField(source='batch.batch_number')
    
    class Meta:
        model = Queue
        fields = [
            'queue_id', 'queue_number', 'batch_number', 'service_name',
            'phone_number', 'status', 'created_at'
        ]


class AdminReportSerializer(serializers.Serializer):
    """Serializer for admin report"""
    total_served = serializers.IntegerField()
    total_waiting = serializers.IntegerField()
    total_skipped = serializers.IntegerField()


class AdminStaffSerializer(serializers.ModelSerializer):
    """Serializer for admin staff management"""
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'work_id', 'role', 'profile_image', 'profile_image_url', 'is_active']
        read_only_fields = ['id']
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

class AdminStaffCreateSerializer(serializers.Serializer):
    """Serializer for admin creating staff"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, min_length=6)
    full_name = serializers.CharField(required=True)
    work_id = serializers.CharField(required=True)
    profile_image = serializers.ImageField(required=False)
    
    def validate_work_id(self, value):
        if User.objects.filter(work_id=value).exists():
            raise serializers.ValidationError("Work ID already exists")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value