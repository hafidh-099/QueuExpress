from rest_framework import serializers
from accounts.models import User
from .models import Service, Batch, Settings, Queue, Feedback


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    
    class Meta:
        model = Service
        fields = ['service_id', 'service_name', 'description', 'created_at']
        read_only_fields = ['service_id', 'created_at']


class BatchSerializer(serializers.ModelSerializer):
    """Serializer for Batch model"""
    
    class Meta:
        model = Batch
        fields = ['batch_id', 'batch_number', 'batch_limit', 'created_at']
        read_only_fields = ['batch_id', 'created_at']


class SettingsSerializer(serializers.ModelSerializer):
    """Serializer for Settings model"""
    
    class Meta:
        model = Settings
        fields = ['setting_id', 'batch_size', 'reset_time', 'updated_at']
        read_only_fields = ['setting_id', 'updated_at']


class QueueCreateSerializer(serializers.Serializer):
    """Serializer for creating a new queue entry (customer join)"""
    
    phone_number = serializers.CharField(
        max_length=20,
        required=True,
        help_text='Customer phone number'
    )
    service_id = serializers.IntegerField(
        required=True,
        help_text='Service ID'
    )
    
    def validate_phone_number(self, value):
        """Validate phone number is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Phone number is required.")
        return value
    
    def validate_service_id(self, value):
        """Validate service exists"""
        if not Service.objects.filter(service_id=value).exists():
            raise serializers.ValidationError("Service not found.")
        return value


class QueueStatusSerializer(serializers.ModelSerializer):
    """Serializer for queue status information"""
    
    people_ahead = serializers.SerializerMethodField()
    estimated_time = serializers.SerializerMethodField()
    batch_number = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Queue
        fields = [
            'queue_id', 'queue_number', 'batch_number', 'status',
            'phone_number', 'service_name', 'people_ahead', 'estimated_time',
            'created_at'
        ]
        read_only_fields = ['queue_id', 'created_at']
    
    def get_people_ahead(self, obj):
        """Get number of people ahead"""
        return obj.get_people_ahead()
    
    def get_estimated_time(self, obj):
        """Get estimated wait time in minutes"""
        return obj.get_estimated_time()
    
    def get_batch_number(self, obj):
        """Get batch number"""
        return obj.batch.batch_number
    
    def get_service_name(self, obj):
        """Get service name"""
        return obj.service.service_name


class QueueSerializer(serializers.ModelSerializer):
    """Serializer for Queue model"""
    
    batch_number = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    served_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Queue
        fields = [
            'queue_id', 'queue_number', 'batch_number', 'status',
            'phone_number', 'service_name', 'created_at', 'served_at',
            'served_by_name', 'updated_at'
        ]
        read_only_fields = ['queue_id', 'created_at', 'updated_at']
    
    def get_batch_number(self, obj):
        return obj.batch.batch_number
    
    def get_service_name(self, obj):
        return obj.service.service_name
    
    def get_served_by_name(self, obj):
        return obj.served_by.full_name if obj.served_by else None


class QueueListSerializer(serializers.ModelSerializer):
    """Serializer for listing queues"""
    
    batch_number = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Queue
        fields = [
            'queue_id', 'queue_number', 'batch_number', 'status',
            'phone_number', 'service_name', 'created_at'
        ]
        read_only_fields = ['queue_id', 'created_at']
    
    def get_batch_number(self, obj):
        return obj.batch.batch_number
    
    def get_service_name(self, obj):
        return obj.service.service_name


class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for Feedback model"""
    
    queue_id = serializers.IntegerField(source='queue.queue_id', read_only=True)
    phone_number = serializers.CharField(source='queue.phone_number', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['feedback_id', 'queue_id', 'phone_number', 'rating', 'message', 'created_at']
        read_only_fields = ['feedback_id', 'created_at']


class FeedbackCreateSerializer(serializers.Serializer):
    """Serializer for creating feedback"""
    
    queue_id = serializers.IntegerField(required=True)
    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=True,
        help_text='Rating from 1 to 5'
    )
    message = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Feedback message'
    )
    
    def validate_queue_id(self, value):
        """Validate queue exists and is served"""
        try:
            queue = Queue.objects.get(queue_id=value)
            if queue.status != 'served':
                raise serializers.ValidationError(
                    "Can only provide feedback for served queues."
                )
            return value
        except Queue.DoesNotExist:
            raise serializers.ValidationError("Queue not found.")


class ReportSerializer(serializers.Serializer):
    """Serializer for admin report"""
    
    total_served = serializers.IntegerField()
    total_waiting = serializers.IntegerField()
    total_skipped = serializers.IntegerField()
    avg_rating = serializers.FloatField()
    today_transactions = serializers.IntegerField()
