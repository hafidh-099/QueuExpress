from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Service(models.Model):
    """Service types available in the queue system"""
    service_id = models.AutoField(primary_key=True)
    service_name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        db_table = 'services'
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
    
    def __str__(self):
        return self.service_name


class Batch(models.Model):
    """Batch grouping for queue numbers"""
    batch_id = models.AutoField(primary_key=True)
    batch_number = models.IntegerField()
    batch_limit = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'batches'
        verbose_name = 'Batch'
        verbose_name_plural = 'Batches'
        unique_together = ['batch_number']  # Ensure batch numbers are unique
    
    def __str__(self):
        return f"Batch {self.batch_number} (Limit: {self.batch_limit})"


class Settings(models.Model):
    """System settings configuration"""
    setting_id = models.AutoField(primary_key=True)
    batch_size = models.IntegerField(default=10, help_text="Number of queues per batch")
    reset_time = models.TimeField(default='00:00:00', help_text="Time when queue resets daily")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'settings'
        verbose_name = 'Setting'
        verbose_name_plural = 'Settings'
    
    def __str__(self):
        return f"Batch Size: {self.batch_size}, Reset Time: {self.reset_time}"


class Queue(models.Model):
    """Main queue model for customers"""
    
    STATUS_CHOICES = (
        ('waiting', 'Waiting'),
        ('called', 'Called'),
        ('served', 'Served'),
        ('skipped', 'Skipped'),
    )
    
    queue_id = models.AutoField(primary_key=True)
    queue_number = models.IntegerField()
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='queues')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='queues')
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)
    served_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='served_queues'
    )
    
    class Meta:
        db_table = 'queues'
        verbose_name = 'Queue'
        verbose_name_plural = 'Queues'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Queue #{self.queue_number} - {self.status}"


class Feedback(models.Model):
    """Customer feedback for served queues"""
    feedback_id = models.AutoField(primary_key=True)
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'feedbacks'
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedbacks'
    
    def __str__(self):
        return f"Feedback for Queue #{self.queue.queue_number} - Rating: {self.rating}"