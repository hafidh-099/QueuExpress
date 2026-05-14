from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from queues.models import Service, Settings
from datetime import time

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed initial data for QueueXpress'

    def handle(self, *args, **kwargs):
        # Create sample services
        services = ['General Inquiry', 'Bill Payment', 'Document Processing', 'Complaint Desk']
        for service_name in services:
            Service.objects.get_or_create(service_name=service_name)
        self.stdout.write(self.style.SUCCESS(f'Created {len(services)} services'))

        # Create sample staff (for testing)
        staff_data = [
            {'username': 'staff1', 'work_id': 'STF001', 'password': 'staff123', 'full_name': 'John Doe'},
            {'username': 'staff2', 'work_id': 'STF002', 'password': 'staff123', 'full_name': 'Jane Smith'},
        ]
        
        for data in staff_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'work_id': data['work_id'],
                    'full_name': data['full_name'],
                    'role': 'staff'
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created staff: {data["username"]}'))
        
        # Ensure settings exist
        settings, created = Settings.objects.get_or_create(
            setting_id=1,
            defaults={
                'batch_size': 10,
                'reset_time': time(0, 0, 0)
            }
        )
        self.stdout.write(self.style.SUCCESS('Settings configured'))

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))