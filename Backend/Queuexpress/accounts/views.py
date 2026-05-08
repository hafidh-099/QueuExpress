from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.utils.decorators import decorator_from_middleware_with_args
from django.db.models import Q

from .models import User
from .serializers import UserSerializer, LoginSerializer, UserCreateSerializer, StaffListSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint for both admin and staff.
    
    POST /api/login/
    
    Input:
    - username (string, optional): For admin login
    - work_id (string, optional): For staff login
    - password (string, required): User password
    
    Output:
    - access (string): JWT access token
    - refresh (string): JWT refresh token
    - user (object): User details
    
    Example:
    Admin login: {"username": "admin", "password": "password"}
    Staff login: {"work_id": "EMP001", "password": "password"}
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """
    Check if user is authenticated.
    
    GET /api/check-auth/
    
    Returns the authenticated user details.
    """
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)


# ============================================================================
# ADMIN ENDPOINTS - STAFF MANAGEMENT
# ============================================================================

def is_admin(user):
    """Helper function to check if user is admin"""
    return user.role == 'admin'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_staff(request):
    """
    Create a new staff member (Admin only).
    
    POST /api/admin/staff/
    
    Input:
    - username (string): Unique username
    - password (string): Password
    - full_name (string): Full name
    - work_id (string): Unique work ID
    - profile_image (file, optional): Profile image
    
    Returns: Created staff details
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can create staff.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UserCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save(role='staff')
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_staff(request):
    """
    List all staff members (Admin only).
    
    GET /api/admin/staff/
    
    Returns: List of staff members
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can view staff.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    staff = User.objects.filter(role='staff')
    serializer = StaffListSerializer(staff, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def staff_detail(request, pk):
    """
    Get, update, or delete a staff member (Admin only).
    
    GET /api/admin/staff/<id>/
    PUT /api/admin/staff/<id>/
    DELETE /api/admin/staff/<id>/
    """
    if not is_admin(request.user):
        return Response({
            'detail': 'Only administrators can manage staff.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(User, pk=pk, role='staff')
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        user.delete()
        return Response(
            {'detail': 'Staff member deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
