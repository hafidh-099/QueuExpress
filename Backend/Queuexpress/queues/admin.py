from django.contrib import admin
from .models import Service, Batch, Settings, Queue, Feedback


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin for Service model"""
    list_display = ['service_id', 'service_name', 'created_at']
    search_fields = ['service_name']
    readonly_fields = ['service_id', 'created_at', 'updated_at']
    ordering = ['service_name']


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    """Admin for Batch model"""
    list_display = ['batch_id', 'batch_number', 'batch_limit', 'created_at']
    search_fields = ['batch_number']
    readonly_fields = ['batch_id', 'created_at']
    ordering = ['batch_number']


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    """Admin for Settings model"""
    list_display = ['setting_id', 'batch_size', 'reset_time', 'updated_at']
    readonly_fields = ['setting_id', 'updated_at']
    
    def has_add_permission(self, request):
        """Allow only one Settings instance"""
        return not Settings.objects.exists() or Settings.objects.count() == 1


@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    """Admin for Queue model"""
    list_display = ['queue_id', 'queue_number', 'phone_number', 'status', 'service', 'created_at']
    list_filter = ['status', 'service', 'created_at']
    search_fields = ['phone_number', 'queue_number']
    readonly_fields = ['queue_id', 'created_at', 'updated_at', 'served_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Queue Info', {
            'fields': ('queue_id', 'queue_number', 'batch', 'service')
        }),
        ('Customer Info', {
            'fields': ('phone_number',)
        }),
        ('Status', {
            'fields': ('status', 'served_by', 'served_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    """Admin for Feedback model"""
    list_display = ['feedback_id', 'queue', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['queue__phone_number', 'message']
    readonly_fields = ['feedback_id', 'created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Feedback Info', {
            'fields': ('feedback_id', 'queue')
        }),
        ('Rating', {
            'fields': ('rating', 'message')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
