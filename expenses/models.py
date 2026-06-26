from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Rent', 'Rent'),
        ('Hostel Rent', 'Hostel Rent'),
        ('Mess Fee', 'Mess Fee'),
        ('Travel Expenses', 'Travel Expenses'),
        ('Tuition Fee', 'Tuition Fee'),
        ('Stationery & Books', 'Stationery & Books'),
        ('Pocket Money', 'Pocket Money'),
        ('Utilities', 'Utilities'),
        ('Entertainment', 'Entertainment'),
        ('Salary', 'Salary'),
        ('Freelance', 'Freelance'),
        ('Others', 'Others'),
    ]

    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Others')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='expense')
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.type}): {self.amount}"
