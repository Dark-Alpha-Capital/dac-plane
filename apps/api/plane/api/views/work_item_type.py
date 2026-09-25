# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.response import Response

from plane.api.serializers.work_item_type import WorkItemTypeCreateUpdateSerializer, WorkItemTypeSerializer
from plane.app.permissions import ProjectAdminPermission
from plane.db.models import IssueType, Project, ProjectIssueType
from .base import BaseAPIView


class WorkItemTypeListCreateAPIEndpoint(BaseAPIView):
    """Manage native IssueType rows bound to one project.

    This is a narrow Community API surface. It intentionally does not implement
    Plane Commercial custom properties or any license-gated UI behavior.
    """

    serializer_class = WorkItemTypeSerializer
    model = IssueType
    permission_classes = [ProjectAdminPermission]
    use_read_replica = True

    def get_project(self, slug, project_id):
        return Project.objects.get(workspace__slug=slug, pk=project_id, archived_at__isnull=True)

    def get_queryset(self):
        return (
            IssueType.objects.filter(
                workspace__slug=self.kwargs.get("slug"),
                project_issue_types__project_id=self.kwargs.get("project_id"),
                project_issue_types__deleted_at__isnull=True,
                deleted_at__isnull=True,
            )
            .order_by("level", "name")
            .distinct()
        )

    def get(self, request, slug, project_id):
        self.get_project(slug, project_id)
        return self.paginate(
            request=request,
            queryset=self.get_queryset(),
            on_results=lambda rows: WorkItemTypeSerializer(rows, many=True).data,
        )

    def post(self, request, slug, project_id):
        project = self.get_project(slug, project_id)
        serializer = WorkItemTypeCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        name = str(serializer.validated_data.get("name") or "").strip()
        if not name:
            return Response({"name": ["This field may not be blank."]}, status=status.HTTP_400_BAD_REQUEST)

        make_default = bool(serializer.validated_data.get("is_default", False))
        try:
            with transaction.atomic():
                issue_type = IssueType.objects.filter(
                    workspace_id=project.workspace_id,
                    name__iexact=name,
                    deleted_at__isnull=True,
                ).first()
                if issue_type is None:
                    issue_type = serializer.save(workspace_id=project.workspace_id, name=name)
                binding, _ = ProjectIssueType.objects.get_or_create(
                    project_id=project.id,
                    issue_type_id=issue_type.id,
                    deleted_at=None,
                    defaults={
                        "workspace_id": project.workspace_id,
                        "is_default": make_default,
                        "level": max(int(issue_type.level or 0), 0),
                    },
                )
                if make_default:
                    ProjectIssueType.objects.filter(
                        project_id=project.id, deleted_at__isnull=True
                    ).exclude(pk=binding.pk).update(is_default=False)
                    binding.is_default = True
                    binding.save(update_fields=["is_default", "updated_at"])
                    IssueType.objects.filter(
                        workspace_id=project.workspace_id,
                        project_issue_types__project_id=project.id,
                        project_issue_types__deleted_at__isnull=True,
                    ).exclude(pk=issue_type.pk).update(is_default=False)
                    if not issue_type.is_default:
                        issue_type.is_default = True
                        issue_type.save(update_fields=["is_default", "updated_at"])
                if not project.is_issue_type_enabled:
                    project.is_issue_type_enabled = True
                    project.save(update_fields=["is_issue_type_enabled", "updated_at"])
        except IntegrityError:
            return Response({"error": "Work item type already exists"}, status=status.HTTP_409_CONFLICT)

        return Response(WorkItemTypeSerializer(issue_type).data, status=status.HTTP_201_CREATED)


class WorkItemTypeDetailAPIEndpoint(WorkItemTypeListCreateAPIEndpoint):
    def get(self, request, slug, project_id, pk):
        self.get_project(slug, project_id)
        row = self.get_queryset().get(pk=pk)
        return Response(WorkItemTypeSerializer(row).data, status=status.HTTP_200_OK)

    def patch(self, request, slug, project_id, pk):
        project = self.get_project(slug, project_id)
        row = self.get_queryset().get(pk=pk)
        serializer = WorkItemTypeCreateUpdateSerializer(row, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        make_default = serializer.validated_data.get("is_default")
        try:
            with transaction.atomic():
                row = serializer.save()
                binding = ProjectIssueType.objects.get(
                    project_id=project.id, issue_type_id=row.id, deleted_at__isnull=True
                )
                if make_default is True:
                    ProjectIssueType.objects.filter(
                        project_id=project.id, deleted_at__isnull=True
                    ).exclude(pk=binding.pk).update(is_default=False)
                    binding.is_default = True
                    binding.save(update_fields=["is_default", "updated_at"])
                    IssueType.objects.filter(
                        workspace_id=project.workspace_id,
                        project_issue_types__project_id=project.id,
                        project_issue_types__deleted_at__isnull=True,
                    ).exclude(pk=row.pk).update(is_default=False)
                elif make_default is False and binding.is_default:
                    binding.is_default = False
                    binding.save(update_fields=["is_default", "updated_at"])
        except IntegrityError:
            return Response({"error": "Work item type already exists"}, status=status.HTTP_409_CONFLICT)

        return Response(WorkItemTypeSerializer(row).data, status=status.HTTP_200_OK)
