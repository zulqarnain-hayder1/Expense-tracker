from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

router = DefaultRouter()
router.register(r'expenses', TransactionViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
