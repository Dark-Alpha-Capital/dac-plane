# Generated migration for ProjectFieldSchema and related models

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0121_alter_estimate_type"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectFieldSchema",
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
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                (
                    "field_type",
                    models.CharField(
                        choices=[
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
                        ],
                        default="text",
                        max_length=50,
                    ),
                ),
                ("options", models.JSONField(blank=True, default=list)),
                ("is_required", models.BooleanField(default=False)),
                ("sort_order", models.FloatField(default=65535)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldschema_created_by",
                        to="db.user",
                        verbose_name="Created By",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.CASCADE,
                        related_name="field_schemas",
                        to="db.project",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldschema_updated_by",
                        to="db.user",
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="field_schemas",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Field Schema",
                "verbose_name_plural": "Project Field Schemas",
                "db_table": "project_field_schemas",
                "ordering": ("sort_order", "created_at"),
            },
        ),
        migrations.CreateModel(
            name="ProjectFieldSchemaTemplate",
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
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("is_global", models.BooleanField(default=False)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldschematemplate_created_by",
                        to="db.user",
                        verbose_name="Created By",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldschematemplate_updated_by",
                        to="db.user",
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.CASCADE,
                        related_name="field_schema_templates",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Field Schema Template",
                "verbose_name_plural": "Project Field Schema Templates",
                "db_table": "project_field_schema_templates",
                "ordering": ("name",),
            },
        ),
        migrations.CreateModel(
            name="ProjectFieldSchemaTemplateItem",
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
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                (
                    "field_type",
                    models.CharField(
                        choices=[
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
                        ],
                        default="text",
                        max_length=50,
                    ),
                ),
                ("options", models.JSONField(blank=True, default=list)),
                ("is_required", models.BooleanField(default=False)),
                ("sort_order", models.FloatField(default=65535)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldschematemplateitem_created_by",
                        to="db.user",
                        verbose_name="Created By",
                    ),
                ),
                (
                    "template",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="items",
                        to="db.projectfieldschematemplate",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldschematemplateitem_updated_by",
                        to="db.user",
                        verbose_name="Last Modified By",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Field Schema Template Item",
                "verbose_name_plural": "Project Field Schema Template Items",
                "db_table": "project_field_schema_template_items",
                "ordering": ("sort_order",),
            },
        ),
        migrations.CreateModel(
            name="ProjectFieldValue",
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
                ("value", models.JSONField(default=dict)),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldvalue_created_by",
                        to="db.user",
                        verbose_name="Created By",
                    ),
                ),
                (
                    "field",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="values",
                        to="db.projectfieldschema",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="field_values",
                        to="db.project",
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="projectfieldvalue_updated_by",
                        to="db.user",
                        verbose_name="Last Modified By",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="field_values",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Field Value",
                "verbose_name_plural": "Project Field Values",
                "db_table": "project_field_values",
                "ordering": ("field__sort_order",),
                "unique_together": {("project", "field")},
            },
        ),
    ]
