from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('check-auth/', views.check_auth, name='check-auth'),
    
    # Admin - Staff Management
    path('admin/staff/', views.list_staff, name='list-staff'),
    path('admin/staff/create/', views.create_staff, name='create-staff'),
    path('admin/staff/<int:pk>/', views.staff_detail, name='staff-detail'),
]
