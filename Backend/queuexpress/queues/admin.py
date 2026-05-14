from django.contrib import admin
from .models import Service, Batch, Settings, Queue, Feedback

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('service_id', 'service_name')
    search_fields = ('service_name',)

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batch_id', 'batch_number', 'batch_limit')
    search_fields = ('batch_number',)

@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('setting_id', 'batch_size', 'reset_time', 'updated_at')
    readonly_fields = ('updated_at',)

@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    list_display = ('queue_id', 'queue_number', 'batch', 'service', 'phone_number', 'status', 'created_at')
    list_filter = ('status', 'service', 'created_at')
    search_fields = ('queue_number', 'phone_number')
    readonly_fields = ('created_at',)

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('feedback_id', 'queue', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')