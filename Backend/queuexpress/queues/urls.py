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
    path('staff/profile/', views.staff_profile, name='staff_profile'),
    path('staff/change-password/', views.staff_change_password, name='staff_change_password'),
    
    # Admin APIs
    path('admin/report/', views.admin_report, name='admin_report'),
    path('admin/feedback/', views.admin_feedback, name='admin_feedback'),
    path('admin/settings/', views.update_settings, name='update_settings'),
    path('admin/services/', views.admin_services, name='admin_services'),
    path('admin/services/<int:service_id>/', views.admin_service_detail, name='admin_service_detail'),
    path('admin/staff/', views.admin_staff, name='admin_staff'),
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/change-password/', views.admin_change_password, name='admin_change_password'),
    path('admin/profile/', views.admin_profile, name='admin_profile'),
    path('admin/settings/', views.system_settings, name='system_settings'),
    path('admin/debug-queues/', views.debug_queues, name='debug_queues'),
    path('admin/all-queues/', views.admin_all_queues, name='admin_all_queues'),
    
    # Admin Staff Management
path('admin/staff/<int:staff_id>/', views.admin_staff_update, name='admin_staff_update'),
]