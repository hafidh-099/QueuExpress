from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    
    Fields:
    - id: UUID (primary key)
    - username: Unique username (for admin login)
    - password: Hashed password
    - full_name: Full name of the user
    - work_id: Unique work ID (for staff login, nullable)
    - role: User role (admin or staff)
    - profile_image: Optional profile image
    """
    
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('staff', 'Staff Member'),
    ]
    
    # Phone validation regex
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must contain 9-15 digits.'
    )
    
    # Custom fields
    full_name = models.CharField(
        max_length=255,
        blank=False,
        help_text='Full name of the user'
    )
    
    work_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        help_text='Unique work ID for staff (used for staff login)'
    )
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='staff',
        help_text='User role determines access permissions'
    )
    
    profile_image = models.ImageField(
        upload_to='staff/',
        null=True,
        blank=True,
        help_text='Optional profile image'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['work_id']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.role}) - {self.username}"
    
    def is_admin(self):
        """Check if user is an administrator"""
        return self.role == 'admin'
    
    def is_staff_member(self):
        """Check if user is a staff member"""
        return self.role == 'staff'
