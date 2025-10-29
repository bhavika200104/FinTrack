from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Category

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_categories(sender, instance, created, **kwargs):
    """
    Signal to create default categories for new users
    """
    if created:
        # Create default income category
        Category.objects.create(
            name="Salary",
            type="income",
            user=instance
        )
        
        # Create default expense category
        Category.objects.create(
            name="Groceries",
            type="expense",
            user=instance
        )
