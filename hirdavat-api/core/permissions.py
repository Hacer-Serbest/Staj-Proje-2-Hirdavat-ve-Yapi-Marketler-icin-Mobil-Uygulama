from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrStaffReadOnly(BasePermission):
    """Aktif (is_active) kullanıcılar okuyabilir; sadece staff kullanıcılar yazabilir.

    Proje 1 tek dükkan sahibi + opsiyonel yardımcı kullanıcı senaryosuna göre tasarlandı.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_staff or request.user.is_superuser)
