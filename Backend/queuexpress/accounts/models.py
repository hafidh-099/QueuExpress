from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Custom User Model for QueueXpress
    Role determines permissions: admin or staff
    """
    
    # Role choices
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    )
    
    # Additional fields
    full_name = models.CharField(max_length=255, blank=True, null=True)
    work_id = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True, 
        null=True,
        help_text="Unique work ID for staff login (null for admin)"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')
    profile_image = models.ImageField(
        upload_to='staff/', 
        blank=True, 
        null=True,
        help_text="Profile image for staff members"
    )
    
    # Override groups and user_permissions to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='accounts_user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='accounts_user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} - {self.role}"

    def save(self, *args, **kwargs):
        # If user is superuser, set role to admin
        if self.is_superuser:
            self.role = 'admin'
            self.work_id = None  # Admin doesn't need work_id
        # If user is admin, work_id should be null
        elif self.role == 'admin':
            self.work_id = None
        super().save(*args, **kwargs)