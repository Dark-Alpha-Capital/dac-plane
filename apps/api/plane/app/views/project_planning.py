# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from .. import BaseViewSet
from plane.app.serializers.project_planning import (
    DeliverableSerializer,
    MilestoneSerializer,
    RiskSerializer,
    RaciAssignmentSerializer,
    TimelineItemSerializer,
    ProjectAIEvaluationSerializer,
)
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import (
    Deliverable,
    Milestone,
    Risk,
    RaciAssignment,
    TimelineItem,
    ProjectAIEvaluation,
    Workspace,
)


def _get_workspace(kwargs):
    return Workspace.objects.get(slug=kwargs.get("slug"))


class DeliverableViewSet(BaseViewSet):
    serializer_class = DeliverableSerializer
    model = Deliverable

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
        )

    def perform_create(self, serializer):
        workspace = _get_workspace(self.kwargs)
        serializer.save(workspace_id=workspace.id, project_id=self.kwargs.get("project_id"))

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id):
        serializer = DeliverableSerializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        serializer = DeliverableSerializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, pk):
        obj = Deliverable.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        serializer = DeliverableSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, pk):
        obj = Deliverable.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MilestoneViewSet(BaseViewSet):
    serializer_class = MilestoneSerializer
    model = Milestone

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
        )

    def perform_create(self, serializer):
        workspace = _get_workspace(self.kwargs)
        serializer.save(workspace_id=workspace.id, project_id=self.kwargs.get("project_id"))

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id):
        serializer = MilestoneSerializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        serializer = MilestoneSerializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, pk):
        obj = Milestone.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        serializer = MilestoneSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, pk):
        obj = Milestone.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RiskViewSet(BaseViewSet):
    serializer_class = RiskSerializer
    model = Risk

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
        )

    def perform_create(self, serializer):
        workspace = _get_workspace(self.kwargs)
        serializer.save(workspace_id=workspace.id, project_id=self.kwargs.get("project_id"))

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id):
        serializer = RiskSerializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        serializer = RiskSerializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, pk):
        obj = Risk.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        serializer = RiskSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, pk):
        obj = Risk.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RaciAssignmentViewSet(BaseViewSet):
    serializer_class = RaciAssignmentSerializer
    model = RaciAssignment

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
        )

    def perform_create(self, serializer):
        workspace = _get_workspace(self.kwargs)
        serializer.save(workspace_id=workspace.id, project_id=self.kwargs.get("project_id"))

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id):
        serializer = RaciAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        serializer = RaciAssignmentSerializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, pk):
        obj = RaciAssignment.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        serializer = RaciAssignmentSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, pk):
        obj = RaciAssignment.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TimelineItemViewSet(BaseViewSet):
    serializer_class = TimelineItemSerializer
    model = TimelineItem

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
        )

    def perform_create(self, serializer):
        workspace = _get_workspace(self.kwargs)
        serializer.save(workspace_id=workspace.id, project_id=self.kwargs.get("project_id"))

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id):
        serializer = TimelineItemSerializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        serializer = TimelineItemSerializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, pk):
        obj = TimelineItem.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        serializer = TimelineItemSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, pk):
        obj = TimelineItem.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectAIEvaluationViewSet(BaseViewSet):
    """Singleton AI evaluation per project — GET retrieve, PUT upsert."""

    serializer_class = ProjectAIEvaluationSerializer
    model = ProjectAIEvaluation

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
        )

    def _derive_recommendation(self, score):
        return ProjectAIEvaluation.recommendation_for_score(score)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def retrieve(self, request, slug, project_id):
        obj = self.get_queryset().first()
        if not obj:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(
            ProjectAIEvaluationSerializer(obj).data,
            status=status.HTTP_200_OK,
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def upsert(self, request, slug, project_id):
        workspace = _get_workspace(self.kwargs)
        obj = self.get_queryset().first()
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        score = data.get("score")
        if "recommendation" not in data or not data.get("recommendation"):
            data["recommendation"] = self._derive_recommendation(
                float(score) if score is not None and score != "" else None
            )

        if obj:
            serializer = ProjectAIEvaluationSerializer(obj, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = ProjectAIEvaluationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(workspace_id=workspace.id, project_id=project_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)