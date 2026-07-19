# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db import models

# Module imports
from .base import BaseModel
from .project import ProjectBaseModel
from .workspace import WorkspaceBaseModel


class ProjectFieldSchema(WorkspaceBaseModel):
    FIELD_TYPE_CHOICES = (
        ("text", "Text"),
        ("rich_text", "Rich Text"),
        ("number", "Number"),
        ("date", "Date"),
        ("user", "User"),
        ("multi_select", "Multi Select"),
        ("url", "URL"),
        ("checklist", "Checklist"),
        ("table", "Table"),
        ("json", "JSON"),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    field_type = models.CharField(max_length=50, choices=FIELD_TYPE_CHOICES, default="text")
    options = models.JSONField(default=list, blank=True)
    is_required = models.BooleanField(default=False)
    sort_order = models.FloatField(default=65535)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Project Field Schema"
        verbose_name_plural = "Project Field Schemas"
        db_table = "project_field_schemas"
        ordering = ("sort_order", "created_at")

    def __str__(self):
        return f"{self.name} ({self.field_type})"


class ProjectFieldValue(ProjectBaseModel):
    field = models.ForeignKey(
        ProjectFieldSchema,
        on_delete=models.CASCADE,
        related_name="values",
    )
    value = models.JSONField(default=dict)

    class Meta:
        verbose_name = "Project Field Value"
        verbose_name_plural = "Project Field Values"
        db_table = "project_field_values"
        unique_together = [("project", "field")]
        ordering = ("field__sort_order",)

    def __str__(self):
        return f"{self.project.name} - {self.field.name}"


class ProjectFieldSchemaTemplate(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    workspace = models.ForeignKey(
        "db.Workspace",
        on_delete=models.CASCADE,
        related_name="field_schema_templates",
        null=True,
        blank=True,
    )
    is_global = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Project Field Schema Template"
        verbose_name_plural = "Project Field Schema Templates"
        db_table = "project_field_schema_templates"
        ordering = ("name",)

    def __str__(self):
        return self.name


class ProjectFieldSchemaTemplateItem(BaseModel):
    template = models.ForeignKey(
        ProjectFieldSchemaTemplate,
        on_delete=models.CASCADE,
        related_name="items",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    field_type = models.CharField(
        max_length=50,
        choices=ProjectFieldSchema.FIELD_TYPE_CHOICES,
        default="text",
    )
    options = models.JSONField(default=list, blank=True)
    is_required = models.BooleanField(default=False)
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Project Field Schema Template Item"
        verbose_name_plural = "Project Field Schema Template Items"
        db_table = "project_field_schema_template_items"
        ordering = ("sort_order",)

    def __str__(self):
        return f"{self.template.name} - {self.name}"


def create_default_project_field_schemas(sender, instance, created, **kwargs):
    if not created:
        return
    defaults = [
        {"name": "Objectives", "field_type": "checklist", "sort_order": 1},
        {"name": "Primary Stack", "field_type": "multi_select", "sort_order": 2},
        {"name": "Board Link", "field_type": "url", "sort_order": 3},
        {"name": "Kickoff Date", "field_type": "date", "sort_order": 4},
        {"name": "Launch Date", "field_type": "date", "sort_order": 5},
        {"name": "Business Value", "field_type": "rich_text", "sort_order": 6},
        {"name": "Notes", "field_type": "rich_text", "sort_order": 7},
    ]
    for field_def in defaults:
        ProjectFieldSchema.objects.create(
            workspace=instance,
            project=None,
            **field_def,
        )
