from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from math import ceil
from django.contrib.auth import get_user_model

from .models import Service, Queue, Feedback, Settings, Batch
from .serializers import (
    ServiceSerializer, QueueJoinSerializer, QueueStatusSerializer,
    FeedbackCreateSerializer, FeedbackSerializer,
    StaffQueueListSerializer, SettingsSerializer,
    AdminStaffSerializer, AdminStaffCreateSerializer
)
from .utils import (
    get_next_queue_number, calculate_batch_number, 
    get_or_create_batch, calculate_estimated_time, get_people_ahead
)

# Get the User model
User = get_user_model()


# ==================== CUSTOMER APIs (Public) ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def join_queue(request):
    """
    Customer joins a queue
    POST /api/join/
    """
    serializer = QueueJoinSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    service_id = serializer.validated_data['service_id']
    
    try:
        service = Service.objects.get(service_id=service_id)
    except Service.DoesNotExist:
        return Response(
            {'error': 'Service not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get system settings
    settings = Settings.objects.first()
    if not settings:
        return Response(
            {'error': 'System settings not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    batch_size = settings.batch_size
    
    with transaction.atomic():
        # Get next queue number
        queue_number = get_next_queue_number()
        
        # Calculate batch number
        batch_number = calculate_batch_number(queue_number, batch_size)
        
        # Get or create batch
        batch = get_or_create_batch(batch_number, batch_size)
        
        # Create queue entry
        queue = Queue.objects.create(
            queue_number=queue_number,
            batch=batch,
            service=service,
            phone_number=phone_number,
            status='waiting'
        )
        
        # Calculate estimated time
        estimated_time = calculate_estimated_time(queue.queue_id)
    
    response_data = {
        'queue_id': queue.queue_id,
        'queue_number': queue_number,
        'batch_number': batch_number,
        'estimated_time': estimated_time,
        'service_name': service.service_name
    }
    
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def queue_status(request, queue_id):
    """
    Check queue status
    GET /api/queue/status/<queue_id>/
    """
    try:
        queue = Queue.objects.get(queue_id=queue_id)
    except Queue.DoesNotExist:
        return Response(
            {'error': 'Queue not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    people_ahead = get_people_ahead(queue_id)
    estimated_time = calculate_estimated_time(queue_id)
    
    response_data = {
        'queue_number': queue.queue_number,
        'status': queue.status,
        'people_ahead': people_ahead,
        'estimated_time': estimated_time
    }
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_feedback(request):
    """
    Create feedback for served queue
    POST /api/feedback/
    """
    serializer = FeedbackCreateSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    queue_id = serializer.validated_data['queue_id']
    rating = serializer.validated_data['rating']
    message = serializer.validated_data.get('message', '')
    
    try:
        queue = Queue.objects.get(queue_id=queue_id)
    except Queue.DoesNotExist:
        return Response(
            {'error': 'Queue not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create feedback
    feedback = Feedback.objects.create(
        queue=queue,
        rating=rating,
        message=message
    )
    
    response_data = FeedbackSerializer(feedback).data
    
    return Response(response_data, status=status.HTTP_201_CREATED)

# ==================== STAFF APIs (JWT Required, role=staff) ====================

def is_staff(user):
    """Helper function to check if user has staff role"""
    return user.is_authenticated and user.role == 'staff'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def call_next(request):
    """
    Call next waiting customer
    POST /api/staff/call-next/
    """
    if not is_staff(request.user):
        return Response(
            {'error': 'Staff access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get the oldest waiting queue
    next_queue = Queue.objects.filter(
        status='waiting'
    ).order_by('created_at').first()
    
    if not next_queue:
        return Response(
            {'message': 'No customers waiting'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update status to 'called'
    next_queue.status = 'called'
    next_queue.save()
    
    response_data = {
        'queue_id': next_queue.queue_id,
        'queue_number': next_queue.queue_number,
        'phone_number': next_queue.phone_number,
        'service_name': next_queue.service.service_name
    }
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def serve_queue(request, queue_id):
    """
    Mark queue as served
    POST /api/staff/serve/<queue_id>/
    """
    if not is_staff(request.user):
        return Response(
            {'error': 'Staff access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        queue = Queue.objects.get(queue_id=queue_id)
    except Queue.DoesNotExist:
        return Response(
            {'error': 'Queue not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if queue.status != 'called':
        return Response(
            {'error': f'Cannot serve queue with status "{queue.status}". Only "called" queues can be served.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    queue.status = 'served'
    queue.served_by = request.user
    queue.save()
    
    return Response({
        'message': 'Queue marked as served',
        'queue_id': queue.queue_id,
        'queue_number': queue.queue_number
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def skip_queue(request, queue_id):
    """
    Skip a waiting/called queue
    POST /api/staff/skip/<queue_id>/
    """
    if not is_staff(request.user):
        return Response(
            {'error': 'Staff access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        queue = Queue.objects.get(queue_id=queue_id)
    except Queue.DoesNotExist:
        return Response(
            {'error': 'Queue not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if queue.status not in ['waiting', 'called']:
        return Response(
            {'error': f'Cannot skip queue with status "{queue.status}"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    queue.status = 'skipped'
    queue.save()
    
    return Response({
        'message': 'Queue skipped',
        'queue_id': queue.queue_id,
        'queue_number': queue.queue_number
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_queue_list(request):
    """
    Get all waiting queues for staff (admin can also view)
    GET /api/staff/queue-list/
    """
    # Allow both staff and admin
    if not is_staff(request.user) and not is_admin(request.user):
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    waiting_queues = Queue.objects.filter(
        status__in=['waiting', 'called']
    ).order_by('created_at')
    
    serializer = StaffQueueListSerializer(waiting_queues, many=True)
    
    return Response({
        'count': waiting_queues.count(),
        'queues': serializer.data
    }, status=status.HTTP_200_OK)

    # ==================== ADMIN APIs (JWT Required, role=admin) ====================

def is_admin(user):
    """Helper function to check if user has admin role"""
    return user.is_authenticated and user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_report(request):
    """
    Get system report
    GET /api/admin/report/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    total_served = Queue.objects.filter(status='served').count()
    total_waiting = Queue.objects.filter(status__in=['waiting', 'called']).count()
    total_skipped = Queue.objects.filter(status='skipped').count()
    
    response_data = {
        'total_served': total_served,
        'total_waiting': total_waiting,
        'total_skipped': total_skipped
    }
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_feedback(request):
    """
    Get all feedback
    GET /api/admin/feedback/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    feedbacks = Feedback.objects.all().order_by('-created_at')
    serializer = FeedbackSerializer(feedbacks, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_settings(request):
    """
    Update system settings (batch_size, reset_time)
    PUT /api/admin/settings/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    settings = Settings.objects.first()
    if not settings:
        return Response(
            {'error': 'Settings not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    batch_size = request.data.get('batch_size')
    reset_time = request.data.get('reset_time')
    
    if batch_size:
        try:
            settings.batch_size = int(batch_size)
        except ValueError:
            return Response(
                {'error': 'batch_size must be an integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    if reset_time:
        settings.reset_time = reset_time
    
    settings.save()
    
    from .serializers import SettingsSerializer
    serializer = SettingsSerializer(settings)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_services(request):
    """
    Get all services or create new service
    GET /api/admin/services/
    POST /api/admin/services/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        service_name = request.data.get('service_name')
        
        if not service_name:
            return Response(
                {'error': 'service_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service, created = Service.objects.get_or_create(service_name=service_name)
        serializer = ServiceSerializer(service)
        
        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': 'Service already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET', 'POST'])
def admin_staff(request):
    """
    Get all staff or create new staff
    GET /api/admin/staff/
    POST /api/admin/staff/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        staff_users = User.objects.filter(role='staff')
        serializer = AdminStaffSerializer(staff_users, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = AdminStaffCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
            full_name=serializer.validated_data['full_name'],
            work_id=serializer.validated_data['work_id'],
            role='staff'
        )
        
        # Handle profile image
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
            user.save()
        
        response_serializer = AdminStaffSerializer(user, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get all dashboard stats for admin
    GET /api/admin/dashboard-stats/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get stats
    total_served = Queue.objects.filter(status='served').count()
    total_waiting = Queue.objects.filter(status__in=['waiting', 'called']).count()
    total_skipped = Queue.objects.filter(status='skipped').count()
    total_staff = User.objects.filter(role='staff').count()
    
    # Get recent queues (last 10)
    recent_queues = Queue.objects.all().order_by('-created_at')[:10]
    
    recent_queues_data = []
    for queue in recent_queues:
        recent_queues_data.append({
            'queue_id': queue.queue_id,
            'queue_number': queue.queue_number,
            'phone_number': queue.phone_number,
            'service_name': queue.service.service_name,
            'batch_number': queue.batch.batch_number,
            'status': queue.status,
            'created_at': queue.created_at,
        })
    
    return Response({
        'stats': {
            'total_served': total_served,
            'total_waiting': total_waiting,
            'total_skipped': total_skipped,
            'total_staff': total_staff,
        },
        'recent_queues': recent_queues_data
    })
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_change_password(request):
    """
    Change admin password
    POST /api/admin/change-password/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'error': 'Current password and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check current password
    if not request.user.check_password(current_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set new password
    request.user.set_password(new_password)
    request.user.save()
    
    return Response(
        {'message': 'Password changed successfully'},
        status=status.HTTP_200_OK
    )
    
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_staff_update(request, staff_id):
    """
    Update or delete staff member
    PUT /api/admin/staff/<staff_id>/
    DELETE /api/admin/staff/<staff_id>/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        staff = User.objects.get(id=staff_id, role='staff')
    except User.DoesNotExist:
        return Response(
            {'error': 'Staff not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Handle DELETE request
    if request.method == 'DELETE':
        staff.delete()
        return Response(
            {'message': 'Staff deleted successfully'},
            status=status.HTTP_200_OK
        )
    
    # Handle PUT request (update)
    full_name = request.data.get('full_name')
    work_id = request.data.get('work_id')
    password = request.data.get('password')
    
    if full_name:
        staff.full_name = full_name
    
    if work_id:
        # Check if work_id is unique
        if User.objects.filter(work_id=work_id).exclude(id=staff_id).exists():
            return Response(
                {'error': 'Work ID already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        staff.work_id = work_id
    
    # Handle profile image upload
    if 'profile_image' in request.FILES:
        staff.profile_image = request.FILES['profile_image']
    
    if password:
        if len(password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        staff.set_password(password)
    
    staff.save()
    
    from .serializers import AdminStaffSerializer
    serializer = AdminStaffSerializer(staff, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_profile(request):
    """
    Get admin profile
    GET /api/admin/profile/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .serializers import AdminStaffSerializer
    serializer = AdminStaffSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_service_detail(request, service_id):
    """
    Update or delete a service
    PUT /api/admin/services/<service_id>/
    DELETE /api/admin/services/<service_id>/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        service = Service.objects.get(service_id=service_id)
    except Service.DoesNotExist:
        return Response(
            {'error': 'Service not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'PUT':
        service_name = request.data.get('service_name')
        if not service_name:
            return Response(
                {'error': 'service_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if service name already exists
        if Service.objects.filter(service_name=service_name).exclude(service_id=service_id).exists():
            return Response(
                {'error': 'Service with this name already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service.service_name = service_name
        service.save()
        
        from .serializers import ServiceSerializer
        serializer = ServiceSerializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        # Check if service has any queues before deleting
        if service.queues.exists():
            return Response(
                {'error': 'Cannot delete service with existing queues'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service.delete()
        return Response(
            {'message': 'Service deleted successfully'},
            status=status.HTTP_200_OK
        )

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def system_settings(request):
    """
    Get or update system settings
    GET /api/admin/settings/
    PUT /api/admin/settings/
    """
    if not is_admin(request.user):
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    settings = Settings.objects.first()
    if not settings:
        # Create default settings if none exist
        settings = Settings.objects.create(batch_size=10, reset_time='00:00:00')
    
    if request.method == 'GET':
        from .serializers import SettingsSerializer
        serializer = SettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        batch_size = request.data.get('batch_size')
        reset_time = request.data.get('reset_time')
        
        if batch_size:
            try:
                settings.batch_size = int(batch_size)
            except ValueError:
                return Response(
                    {'error': 'batch_size must be an integer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if reset_time:
            settings.reset_time = reset_time
        
        settings.save()
        
        from .serializers import SettingsSerializer
        serializer = SettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)