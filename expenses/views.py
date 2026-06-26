from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db.models import Sum
from .models import Transaction
from .serializers import UserRegisterSerializer, TransactionSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # Search title
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        # Filter type
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
            
        # Filter category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        # Filter date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        # Sorting
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'date_asc':
            queryset = queryset.order_by('date', 'id')
        elif sort_by == 'date_desc':
            queryset = queryset.order_by('-date', '-id')
        elif sort_by == 'amount_asc':
            queryset = queryset.order_by('amount')
        elif sort_by == 'amount_desc':
            queryset = queryset.order_by('-amount')
        else:
            queryset = queryset.order_by('-date', '-id')
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        
        # Aggregate totals
        total_income = transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        net_balance = total_income - total_expense
        
        # Category breakdown
        category_breakdown = []
        categories = transactions.values('category', 'type').annotate(total=Sum('amount')).order_by('-total')
        for cat in categories:
            category_breakdown.append({
                'category': cat['category'],
                'type': cat['type'],
                'total': float(cat['total'])
            })
            
        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'net_balance': float(net_balance),
            'category_breakdown': category_breakdown
        })
