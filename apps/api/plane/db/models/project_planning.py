# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db import models

# Module imports
from .project import ProjectBaseModel


class Deliverable(ProjectBaseModel):
    PRIORITY_CHOICES = (
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Deliverable"
        verbose_name_plural = "Deliverables"
        db_table = "deliverables"
        ordering = ("sort_order", "created_at")

    def __str__(self):
        return self.title


class Milestone(ProjectBaseModel):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("blocked", "Blocked"),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    definition_of_done = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    sort_order = models.FloatField(default=65535)
    deliverables = models.ManyToManyField(Deliverable, blank=True, related_name="milestones")

    class Meta:
        verbose_name = "Milestone"
        verbose_name_plural = "Milestones"
        db_table = "milestones"
        ordering = ("sort_order", "due_date")

    def __str__(self):
        return self.name


class Risk(ProjectBaseModel):
    IMPACT_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    )
    LIKELIHOOD_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    )
    STATUS_CHOICES = (
        ("identified", "Identified"),
        ("mitigating", "Mitigating"),
        ("resolved", "Resolved"),
        ("accepted", "Accepted"),
    )

    description = models.TextField()
    impact = models.CharField(max_length=10, choices=IMPACT_CHOICES, default="medium")
    likelihood = models.CharField(max_length=10, choices=LIKELIHOOD_CHOICES, default="medium")
    mitigation = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="identified")
    owner = models.ForeignKey(
        "db.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_risks",
    )

    class Meta:
        verbose_name = "Risk"
        verbose_name_plural = "Risks"
        db_table = "risks"
        ordering = ("-impact", "created_at")

    def __str__(self):
        return self.description[:100]


class Objective(ProjectBaseModel):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Objective"
        verbose_name_plural = "Objectives"
        db_table = "objectives"
        ordering = ("sort_order", "created_at")

    def __str__(self):
        return self.title


class RaciAssignment(ProjectBaseModel):
    RESPONSIBILITY_CHOICES = (
        ("responsible", "Responsible"),
        ("accountable", "Accountable"),
        ("consulted", "Consulted"),
        ("informed", "Informed"),
    )

    area = models.CharField(max_length=255)
    user = models.ForeignKey(
        "db.User",
        on_delete=models.CASCADE,
        related_name="raci_assignments",
    )
    responsibility = models.CharField(max_length=20, choices=RESPONSIBILITY_CHOICES)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "RACI Assignment"
        verbose_name_plural = "RACI Assignments"
        db_table = "raci_assignments"
        unique_together = [("project", "area", "user")]
        ordering = ("area", "responsibility")

    def __str__(self):
        return f"{self.area} - {self.responsibility} ({self.user})"


class TimelineItem(ProjectBaseModel):
    title = models.CharField(max_length=255)
    target_date = models.DateField()
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="timeline_items",
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Timeline Item"
        verbose_name_plural = "Timeline Items"
        db_table = "timeline_items"
        ordering = ("target_date",)

    def __str__(self):
        return self.title


class ProjectAIEvaluation(ProjectBaseModel):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    )
    RECOMMENDATION_CHOICES = (
        ("worth_taking", "Worth taking"),
        ("review_needed", "Review needed"),
        ("not_recommended", "Not recommended"),
    )

    score = models.FloatField(null=True, blank=True)
    analysis = models.TextField(blank=True, default="")
    recommendation = models.CharField(
        max_length=32,
        choices=RECOMMENDATION_CHOICES,
        blank=True,
        default="",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    external_id = models.CharField(max_length=255, blank=True, null=True)
    screened_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Project AI Evaluation"
        verbose_name_plural = "Project AI Evaluations"
        db_table = "project_ai_evaluations"
        # One current evaluation per project
        constraints = [
            models.UniqueConstraint(
                fields=["project"],
                condition=models.Q(deleted_at__isnull=True),
                name="unique_project_ai_evaluation_active",
            )
        ]
        ordering = ("-screened_at", "-updated_at")

    def __str__(self):
        return f"{self.project_id} score={self.score}"

    @staticmethod
    def recommendation_for_score(score):
        if score is None:
            return ""
        if score >= 3.5:
            return "worth_taking"
        if score >= 2:
            return "review_needed"
        return "not_recommended"