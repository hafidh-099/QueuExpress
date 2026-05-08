from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
import math

User = get_user_model()


class Service(models.Model):
    """
    Service model representing different services available in the queue system.
    
    Fields:
    - service_id: Primary key
    - service_name: Name of the service
    """
    
    service_id = models.AutoField(primary_key=True)
    service_name = models.CharField(
        max_length=255,
        unique=True,
        help_text='Name of the service (e.g., General Inquiry, Bill Payment)'
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Optional description of the service'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['service_name']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
        indexes = [
            models.Index(fields=['service_name']),
        ]
    
    def __str__(self):
        return self.service_name


class Batch(models.Model):
    """
    Batch model representing groups of customers.
    
    Fields:
    - batch_id: Primary key
    - batch_number: Batch number (integer)
    - batch_limit: Maximum customers in this batch
    - created_at: Timestamp
    """
    
    batch_id = models.AutoField(primary_key=True)
    batch_number = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Batch number'
    )
    batch_limit = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Maximum customers allowed in this batch'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['batch_number']
        verbose_name = 'Batch'
        verbose_name_plural = 'Batches'
        unique_together = ['batch_number']
        indexes = [
            models.Index(fields=['batch_number']),
        ]
    
    def __str__(self):
        return f"Batch {self.batch_number}"


class Settings(models.Model):
    """
    Settings model for queue system configuration.
    
    Fields:
    - setting_id: Primary key
    - batch_size: Size of each batch
    - reset_time: Time to reset queue numbers daily
    - updated_at: Last update timestamp
    """
    
    setting_id = models.AutoField(primary_key=True)
    batch_size = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        help_text='Number of customers per batch'
    )
    reset_time = models.TimeField(
        default='00:00:00',
        help_text='Time to reset queue numbers daily'
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Settings'
        verbose_name_plural = 'Settings'
    
    def __str__(self):
        return f"Queue Settings (Batch Size: {self.batch_size})"
    
    @classmethod
    def get_settings(cls):
        """Get or create default settings"""
        settings, created = cls.objects.get_or_create(setting_id=1)
        return settings


class Queue(models.Model):
    """
    Queue model representing a customer in the queue.
    
    Fields:
    - queue_id: Primary key
    - queue_number: Position in queue (today)
    - batch_id: FK to Batch
    - service_id: FK to Service
    - phone_number: Customer phone number
    - status: Current status
    - created_at: When customer joined
    - served_by: FK to User (staff who served)
    """
    
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('called', 'Called'),
        ('served', 'Served'),
        ('skipped', 'Skipped'),
    ]
    
    queue_id = models.AutoField(primary_key=True)
    queue_number = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text='Queue position number'
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT,
        related_name='queues',
        help_text='Batch this queue belongs to'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='queues',
        help_text='Service requested'
    )
    phone_number = models.CharField(
        max_length=20,
        help_text='Customer phone number'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='waiting',
        help_text='Current queue status'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    served_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Time when customer was served'
    )
    served_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='served_queues',
        help_text='Staff member who served this customer'
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Queue'
        verbose_name_plural = 'Queues'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['queue_number']),
        ]
    
    def __str__(self):
        return f"Queue #{self.queue_number} - {self.phone_number} ({self.status})"
    
    def get_people_ahead(self):
        """Calculate number of waiting customers ahead of this one"""
        return Queue.objects.filter(
            status='waiting',
            created_at__lt=self.created_at
        ).count()
    
    def get_estimated_time(self):
        """
        Calculate estimated wait time in minutes.
        Each customer = 10 minutes.
        """
        people_ahead = self.get_people_ahead()
        return people_ahead * 10


class Feedback(models.Model):
    """
    Feedback model for customer satisfaction.
    
    Fields:
    - feedback_id: Primary key
    - queue_id: FK to Queue
    - rating: Rating 1-5
    - message: Feedback message
    - created_at: Timestamp
    """
    
    feedback_id = models.AutoField(primary_key=True)
    queue = models.OneToOneField(
        Queue,
        on_delete=models.CASCADE,
        related_name='feedback',
        help_text='Queue this feedback is for'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5'
    )
    message = models.TextField(
        blank=True,
        null=True,
        help_text='Customer feedback message'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedback'
        indexes = [
            models.Index(fields=['rating', 'created_at']),
        ]
    
    def __str__(self):
        return f"Feedback for Queue #{self.queue.queue_number} - Rating {self.rating}/5"
