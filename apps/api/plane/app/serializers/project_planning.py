# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from plane.db.models import (
    Deliverable,
    Milestone,
    Objective,
    Risk,
    RaciAssignment,
    TimelineItem,
    ProjectAIEvaluation,
)


class DeliverableSerializer(BaseSerializer):
    class Meta:
        model = Deliverable
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "title",
            "description",
            "priority",
            "completed",
            "due_date",
            "sort_order",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at", "created_by", "updated_by"]


class MilestoneSerializer(BaseSerializer):
    deliverable_details = DeliverableSerializer(source="deliverables", many=True, read_only=True)
    deliverable_ids = serializers.PrimaryKeyRelatedField(
        source="deliverables",
        many=True,
        queryset=Deliverable.objects.all(),
        required=False,
    )

    class Meta:
        model = Milestone
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "name",
            "description",
            "due_date",
            "definition_of_done",
            "status",
            "sort_order",
            "deliverable_ids",
            "deliverable_details",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at", "created_by", "updated_by"]


class RiskSerializer(BaseSerializer):
    class Meta:
        model = Risk
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "description",
            "impact",
            "likelihood",
            "mitigation",
            "status",
            "owner_id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at", "created_by", "updated_by"]


class ObjectiveSerializer(BaseSerializer):
    class Meta:
        model = Objective
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "title",
            "description",
            "status",
            "sort_order",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at", "created_by", "updated_by"]


class RaciAssignmentSerializer(BaseSerializer):
    class Meta:
        model = RaciAssignment
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "area",
            "user_id",
            "responsibility",
            "notes",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at", "created_by", "updated_by"]


class TimelineItemSerializer(BaseSerializer):
    class Meta:
        model = TimelineItem
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "title",
            "target_date",
            "milestone_id",
            "notes",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["id", "workspace", "project", "created_at", "updated_at", "created_by", "updated_by"]


class ProjectAIEvaluationSerializer(BaseSerializer):
    class Meta:
        model = ProjectAIEvaluation
        fields = [
            "id",
            "workspace_id",
            "project_id",
            "score",
            "analysis",
            "recommendation",
            "status",
            "external_id",
            "screened_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "id",
            "workspace",
            "project",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
