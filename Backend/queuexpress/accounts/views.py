from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from .models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login for both admin and staff
    POST /api/login/
    
    For Admin:
    {
        "username": "admin",
        "password": "admin123"
    }
    
    For Staff:
    {
        "work_id": "STF001",
        "password": "staff123"
    }
    """
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    login_value = serializer.validated_data['login_value']
    password = serializer.validated_data['password']
    login_type = serializer.validated_data['login_type']
    
    # Authenticate based on login type
    if login_type == 'username':
        user = authenticate(request, username=login_value, password=password)
    else:  # work_id
        try:
            # Find user by work_id
            user_obj = User.objects.get(work_id=login_value)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if user is active
    if not user.is_active:
        return Response(
            {'error': 'Account is disabled'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    response_data = {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'role': user.role,
            'work_id': user.work_id
        }
    }
    
    return Response(response_data, status=status.HTTP_200_OK)