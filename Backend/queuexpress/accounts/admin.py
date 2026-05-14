from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for the Custom User model.
    Organizes 'QueueXpress' specific fields into a dedicated section.
    """
    # 1. Columns displayed in the list view
    list_display = ('username', 'full_name', 'work_id', 'role', 'is_staff', 'is_active')
    
    # 2. Filters available in the right sidebar
    list_filter = ('role', 'is_staff', 'is_active', 'groups')
    
    # 3. Searchable fields
    search_fields = ('username', 'full_name', 'work_id', 'email')
    
    # 4. Ordering of the user list
    ordering = ('username',)

    # 5. Fieldsets for the 'Add User' page
    add_fieldsets = list(UserAdmin.add_fieldsets) + [
        ('QueueXpress Details', {
            'fields': ('full_name', 'work_id', 'role', 'profile_image'),
        }),
    ]

    # 6. Fieldsets for the 'Edit User' page
    fieldsets = list(UserAdmin.fieldsets) + [
        ('QueueXpress Details', {
            'fields': ('full_name', 'work_id', 'role', 'profile_image'),
            'classes': ('wide',),  # Optional: adds more spacing in UI
        }),
    ]
