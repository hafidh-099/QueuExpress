from django.urls import path
from . import views

urlpatterns = [
    # ========== CUSTOMER APIs (PUBLIC) ==========
    path('join/', views.join_queue, name='join-queue'),
    path('queue/status/<int:queue_id>/', views.queue_status, name='queue-status'),
    path('feedback/', views.create_feedback, name='create-feedback'),
    
    # ========== STAFF APIs (PRIVATE) ==========
    path('staff/call-next/', views.call_next, name='call-next'),
    path('staff/serve/<int:queue_id>/', views.serve_queue, name='serve-queue'),
    path('staff/skip/<int:queue_id>/', views.skip_queue, name='skip-queue'),
    path('staff/queue-list/', views.queue_list_staff, name='queue-list-staff'),
    
    # ========== ADMIN APIs (PRIVATE) ==========
    path('admin/report/', views.admin_report, name='admin-report'),
    path('admin/feedback/', views.admin_feedback, name='admin-feedback'),
    path('admin/settings/', views.update_settings, name='update-settings'),
    path('admin/services/', views.service_list_create, name='service-list-create'),
    path('admin/services/<int:service_id>/', views.service_detail, name='service-detail'),
    path('admin/queues/', views.admin_queue_list, name='admin-queue-list'),
]
