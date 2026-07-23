# Generated migration for ProjectAIEvaluation

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0123_project_planning_entities"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectAIEvaluation",
            fields=[
                (
                    "created_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="Created At"),
                ),
                (
                    "updated_at",
                    models.DateTimeField(auto_now=True, verbose_name="Last Modified At"),
                ),
                (
                    "deleted_at",
                    models.DateTimeField(blank=True, null=True, verbose_name="Deleted At"),
                ),
                (
                    "id",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("score", models.FloatField(blank=True, null=True)),
                ("analysis", models.TextField(blank=True, default="")),
                (
                    "recommendation",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("worth_taking", "Worth taking"),
                            ("review_needed", "Review needed"),
                            ("not_recommended", "Not recommended"),
                        ],
                        default="",
                        max_length=32,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("completed", "Completed"),
                            ("failed", "Failed"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("external_id", models.CharField(blank=True, max_length=255, null=True)),
                ("screened_at", models.DateTimeField(blank=True, null=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="projectaievaluation_created_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Created By",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_projectaievaluation",
                        to="db.project",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="projectaievaluation_updated_by",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="workspace_projectaievaluation",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project AI Evaluation",
                "verbose_name_plural": "Project AI Evaluations",
                "db_table": "project_ai_evaluations",
                "ordering": ("-screened_at", "-updated_at"),
            },
        ),
        migrations.AddConstraint(
            model_name="projectaievaluation",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("project",),
                name="unique_project_ai_evaluation_active",
            ),
        ),
    ]
