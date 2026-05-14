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
    Get all waiting queues for staff
    GET /api/staff/queue-list/
    """
    if not is_staff(request.user):
        return Response(
            {'error': 'Staff access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    waiting_queues = Queue.objects.filter(
        status__in=['waiting', 'called']
    ).order_by('created_at')
    
    from .serializers import StaffQueueListSerializer
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
@permission_classes([IsAuthenticated])
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
        from .serializers import AdminStaffSerializer
        serializer = AdminStaffSerializer(staff_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        from .serializers import AdminStaffCreateSerializer
        serializer = AdminStaffCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create staff user
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
            full_name=serializer.validated_data['full_name'],
            work_id=serializer.validated_data['work_id'],
            role='staff'
        )
        
        if 'profile_image' in serializer.validated_data:
            user.profile_image = serializer.validated_data['profile_image']
            user.save()
        
        from .serializers import AdminStaffSerializer
        response_serializer = AdminStaffSerializer(user)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)