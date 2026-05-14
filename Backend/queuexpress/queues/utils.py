from .models import Queue, Settings, Batch
from datetime import datetime, date
from math import ceil
from django.utils import timezone

def calculate_batch_number(queue_number, batch_size):
    """
    Calculate batch number based on queue number and batch size
    batch_number = ceil(queue_number / batch_size)
    """
    return ceil(queue_number / batch_size)

def get_or_create_batch(batch_number, batch_size):
    """
    Get existing batch or create a new one
    """
    batch, created = Batch.objects.get_or_create(
        batch_number=batch_number,
        defaults={'batch_limit': batch_size}
    )
    
    # Update batch_limit if it changed
    if not created and batch.batch_limit != batch_size:
        batch.batch_limit = batch_size
        batch.save()
    
    return batch

def get_next_queue_number():
    """
    Get the next queue number for today
    """
    today = timezone.now().date()
    
    # Get today's queues
    today_queues = Queue.objects.filter(
        created_at__date=today
    )
    
    if today_queues.exists():
        # Get the highest queue number for today
        last_queue = today_queues.order_by('-queue_number').first()
        return last_queue.queue_number + 1
    else:
        # First queue of the day
        return 1

def calculate_estimated_time(queue_id):
    """
    Calculate estimated wait time based on number of waiting queues before this one
    Each customer takes 10 minutes
    """
    queue = Queue.objects.get(queue_id=queue_id)
    
    # Count waiting queues created before this one
    waiting_before = Queue.objects.filter(
        status='waiting',
        created_at__lt=queue.created_at
    ).count()
    
    # Each waiting customer = 10 minutes
    estimated_minutes = waiting_before * 10
    
    return estimated_minutes

def get_people_ahead(queue_id):
    """
    Get number of people ahead in queue
    """
    queue = Queue.objects.get(queue_id=queue_id)
    
    # Count waiting queues created before this one
    people_ahead = Queue.objects.filter(
        status='waiting',
        created_at__lt=queue.created_at
    ).count()
    
    return people_ahead