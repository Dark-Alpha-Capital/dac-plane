# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from plane.db.models import ProjectFieldSchema, ProjectFieldValue


class ProjectFieldSchemaSerializer(BaseSerializer):
    class Meta:
        model = ProjectFieldSchema
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "name",
            "description",
            "field_type",
            "options",
            "is_required",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at"]


class ProjectFieldValueSerializer(BaseSerializer):
    field_detail = ProjectFieldSchemaSerializer(source="field", read_only=True)

    class Meta:
        model = ProjectFieldValue
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "field",
            "field_detail",
            "value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at"]

    def validate(self, attrs):
        field = attrs.get("field")
        value = attrs.get("value", {})
        if field and field.is_required and not value:
            raise serializers.ValidationError(f"Field '{field.name}' is required.")
        return attrs
