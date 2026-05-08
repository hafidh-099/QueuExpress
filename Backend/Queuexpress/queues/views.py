from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import math

from .models import Service, Batch, Settings, Queue, Feedback
from .serializers import (
    ServiceSerializer, BatchSerializer, SettingsSerializer,
    QueueCreateSerializer, QueueStatusSerializer, QueueSerializer,
    QueueListSerializer, FeedbackSerializer, FeedbackCreateSerializer,
    ReportSerializer
)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_or_create_batch(queue_number, batch_size):
    """
    Get or create a batch for the given queue number.
    
    Formula: batch_number = ceil(queue_number / batch_size)
    """
    batch_number = math.ceil(queue_number / batch_size)
    batch, created = Batch.objects.get_or_create(
        batch_number=batch_number,
        defaults={'batch_limit': batch_size}
    )
    return batch


def get_next_queue_number():
    """
    Get the next queue number for today.
    Increment from the last queue number created today.
    """
    today = timezone.now().date()
    last_queue = Queue.objects.filter(
        created_at__date=today
    ).order_by('-queue_number').first()
    
    if last_queue:
        return last_queue.queue_number + 1
    return 1


def is_staff(user):
    """Helper to check if user is staff"""
    return user.role == 'staff'


def is_admin(user):
    """Helper to check if user is admin"""
    return user.role == 'admin'


# ============================================================================
# CUSTOMER APIs (PUBLIC)
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def join_queue(request):
    """
    Customer joins the queue.
    
    POST /api/join/
    
    Input:
    - phone_number (string): Customer phone number
    - service_id (integer): Service ID
    
    Output:
    - queue_id (integer): Queue ID
    - queue_number (integer): Position in queue
    - batch_number (integer): Batch number
    - estimated_time (integer): Wait time in minutes
    
    Business Logic:
    1. Get last queue_number (today)
    2. queue_number = last + 1
    3. Get batch_size from SETTINGS
    4. Calculate: batch_number = ceil(queue_number / batch_size)
    5. Find or create batch
    6. Save queue
    """
    serializer = QueueCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        service_id = serializer.validated_data['service_id']
        
        # Get next queue number
        queue_number = get_next_queue_number()
        
        # Get settings and batch size
        settings = Settings.get_settings()
        batch_size = settings.batch_size
        
        # Get or create batch
        batch = get_or_create_batch(queue_number, batch_size)
        
        # Get service
        service = get_object_or_404(Service, service_id=service_id)
        
        # Create queue entry
        queue = Queue.objects.create(
            queue_number=queue_number,
            batch=batch,
            service=service,
            phone_number=phone_number,
            status='waiting'
        )
        
        return Response({
            'queue_id': queue.queue_id,
            'queue_number': queue.queue_number,
            'batch_number': batch.batch_number,
            'estimated_time': queue.get_estimated_time()
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def queue_status(request, queue_id):
    """
    Get status of a specific queue.
    
    GET /api/queue/status/<queue_id>/
    
    Output:
    - queue_number
    - batch_number
    - status
    - people_ahead
    - estimated_time
    """
    queue = get_object_or_404(Queue, queue_id=queue_id)
    serializer = QueueStatusSerializer(queue)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_feedback(request):
    """
    Create feedback for a served queue.
    
    POST /api/feedback/
    
    Input:
    - queue_id (integer): Queue ID
    - rating (integer): Rating 1-5
    - message (string, optional): Feedback message
    """
    serializer = FeedbackCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        queue_id = serializer.validated_data['queue_id']
        rating = serializer.validated_data['rating']
        message = serializer.validated_data.get('message', '')
        
        queue = get_object_or_404(Queue, queue_id=queue_id)
        
        feedback, created = Feedback.objects.get_or_create(
            queue=queue,
            defaults={
                'rating': rating,
                'message': message
            }
        )
        
        if not created:
            feedback.rating = rating
            feedback.message = message
            feedback.save()
        
        serializer = FeedbackSerializer(feedback)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# STAFF APIs (REQUIRES JWT + STAFF ROLE)
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def call_next(request):
    """
    Staff calls the next waiting customer.
    
    POST /api/staff/call-next/
    
    Logic:
    - Get first waiting queue
    - Update status to 'called'
    
    Output:
    - Queue details
    """
    if not is_staff(request.user):
        return Response({
            'detail': 'Only staff can call next customer.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get first waiting queue
    queue = Queue.objects.filter(
        status='waiting'
    ).order_by('created_at').first()
    
    if not queue:
        return Response({
            'detail': 'No waiting customers.',
            'queue': None
        }, status=status.HTTP_200_OK)
    
    queue.status = 'called'
    queue.save()
    
    serializer = QueueSerializer(queue)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def serve_queue(request, queue_id):
    """
    Staff marks a queue as served.
    
    POST /api/staff/serve/<queue_id>/
    
    Output:
    - Queue details with served_by and served_at
    """
    if not is_staff(request.user):
        return Response({
            'detail': 'Only staff can serve customers.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queue = get_object_or_404(Queue, queue_id=queue_id)
    
    if queue.status not in ['called', 'waiting']:
        return Response({
            'detail': f'Cannot serve queue with status: {queue.status}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    queue.status = 'served'
    queue.served_by = request.user
    queue.served_at = timezone.now()
    queue.save()
    
    serializer = QueueSerializer(queue)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def skip_queue(request, queue_id):
    """
    Staff skips a customer.
    
    POST /api/staff/skip/<queue_id>/
    
    Output:
    - Queue details with skipped status
    """
    if not is_staff(request.user):
        return Response({
            'detail': 'Only staff can skip customers.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queue = get_object_or_404(Queue, queue_id=queue_id)
    
    if queue.status not in ['called', 'waiting']:
        return Response({
            'detail': f'Cannot skip queue with status: {queue.status}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    queue.status = 'skipped'
    queue.save()
    
    serializer = QueueSerializer(queue)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def queue_list_staff(request):
    """
    Get all waiting queues for staff.
    
    GET /api/staff/queue-list/
    
    Output:
    - List of waiting queues
    """
    if not is_staff(request.user):
        return Response({
            'detail': 'Only staff can view queue list.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queues = Queue.objects.filter(status='waiting').order_by('created_at')
    serializer = QueueListSerializer(queues, many=True)
    
    return Response({
        'count': queues.count(),
        'queues': serializer.data
    }, status=status.HTTP_200_OK)


# ============================================================================
# ADMIN APIs (REQUIRES JWT + ADMIN ROLE)
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_report(request):
    """
    Get admin dashboard report.
    
    GET /api/admin/report/
    
    Output:
    - total_served: Total customers served
    - total_waiting: Current waiting customers
    - total_skipped: Total skipped customers
    - avg_rating: Average customer rating
    - today_transactions: Today's transactions
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can view reports.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Calculate statistics
    total_served = Queue.objects.filter(status='served').count()
    total_waiting = Queue.objects.filter(status='waiting').count()
    total_skipped = Queue.objects.filter(status='skipped').count()
    
    # Average rating
    avg_rating_obj = Feedback.objects.aggregate(Avg('rating'))
    avg_rating = avg_rating_obj['rating__avg'] or 0
    
    # Today's transactions
    today = timezone.now().date()
    today_transactions = Queue.objects.filter(
        created_at__date=today
    ).count()
    
    data = {
        'total_served': total_served,
        'total_waiting': total_waiting,
        'total_skipped': total_skipped,
        'avg_rating': round(avg_rating, 2),
        'today_transactions': today_transactions
    }
    
    serializer = ReportSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_feedback(request):
    """
    Get all feedback for admin review.
    
    GET /api/admin/feedback/
    
    Output:
    - List of all feedback with queue info
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can view feedback.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    feedbacks = Feedback.objects.all().order_by('-created_at')
    serializer = FeedbackSerializer(feedbacks, many=True)
    
    return Response({
        'count': feedbacks.count(),
        'feedback': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_settings(request):
    """
    Update queue settings (Admin only).
    
    PUT /api/admin/settings/
    
    Input:
    - batch_size (integer, optional): Size of each batch
    - reset_time (string, optional): Reset time (HH:MM:SS)
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can update settings.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    settings = Settings.get_settings()
    serializer = SettingsSerializer(settings, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# ADMIN - SERVICE MANAGEMENT
# ============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def service_list_create(request):
    """
    Get all services or create a new service (Admin only).
    
    GET /api/admin/services/
    POST /api/admin/services/
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can manage services.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def service_detail(request, service_id):
    """
    Get, update, or delete a service (Admin only).
    
    GET /api/admin/services/<id>/
    PUT /api/admin/services/<id>/
    DELETE /api/admin/services/<id>/
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can manage services.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    service = get_object_or_404(Service, service_id=service_id)
    
    if request.method == 'GET':
        serializer = ServiceSerializer(service)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        service.delete()
        return Response(
            {'detail': 'Service deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


# ============================================================================
# ADMIN - QUEUE MANAGEMENT
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_queue_list(request):
    """
    Get all queues (Admin only).
    
    GET /api/admin/queues/
    
    Query parameters:
    - status: Filter by status (waiting, called, served, skipped)
    - service_id: Filter by service
    - date: Filter by date (YYYY-MM-DD)
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can view queues.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queues = Queue.objects.all()
    
    # Apply filters
    status_filter = request.query_params.get('status')
    if status_filter:
        queues = queues.filter(status=status_filter)
    
    service_id = request.query_params.get('service_id')
    if service_id:
        queues = queues.filter(service_id=service_id)
    
    date_filter = request.query_params.get('date')
    if date_filter:
        try:
            date_obj = datetime.strptime(date_filter, '%Y-%m-%d').date()
            queues = queues.filter(created_at__date=date_obj)
        except ValueError:
            return Response({
                'detail': 'Invalid date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    queues = queues.order_by('-created_at')
    serializer = QueueSerializer(queues, many=True)
    
    return Response({
        'count': queues.count(),
        'queues': serializer.data
    }, status=status.HTTP_200_OK)
