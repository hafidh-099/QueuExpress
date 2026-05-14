from django.urls import path
from . import views

urlpatterns = [
    # Customer APIs (Public)
    path('join/', views.join_queue, name='join_queue'),
    path('queue/status/<int:queue_id>/', views.queue_status, name='queue_status'),
    path('feedback/', views.create_feedback, name='create_feedback'),
    
    # Staff APIs
    path('staff/call-next/', views.call_next, name='call_next'),
    path('staff/serve/<int:queue_id>/', views.serve_queue, name='serve_queue'),
    path('staff/skip/<int:queue_id>/', views.skip_queue, name='skip_queue'),
    path('staff/queue-list/', views.staff_queue_list, name='staff_queue_list'),
    
    # Admin APIs
    path('admin/report/', views.admin_report, name='admin_report'),
    path('admin/feedback/', views.admin_feedback, name='admin_feedback'),
    path('admin/settings/', views.update_settings, name='update_settings'),
    path('admin/services/', views.admin_services, name='admin_services'),
    path('admin/staff/', views.admin_staff, name='admin_staff'),
]