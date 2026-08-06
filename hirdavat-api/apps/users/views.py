from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import ChangePasswordSerializer, CustomTokenObtainPairSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ — username + password ile JWT access/refresh token döner.

    Brute-force denemelerine karşı IP başına dakikada 5 istekle sınırlıdır (bkz. settings.DEFAULT_THROTTLE_RATES['login']).
    """

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = 'login'


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — giriş yapmış kullanıcının profili."""

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Şifre başarıyla güncellendi.'}, status=status.HTTP_200_OK)
