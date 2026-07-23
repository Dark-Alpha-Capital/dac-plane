# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from .. import BaseViewSet, BaseAPIView
from plane.app.serializers.project_meta import (
    ProjectFieldSchemaSerializer,
    ProjectFieldValueSerializer,
)
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import ProjectFieldSchema, ProjectFieldValue, Workspace


class ProjectFieldSchemaViewSet(BaseViewSet):
    serializer_class = ProjectFieldSchemaSerializer
    model = ProjectFieldSchema

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(is_active=True)
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id=None):
        workspace = Workspace.objects.get(slug=slug)
        serializer = ProjectFieldSchemaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace_id=workspace.id, project_id=project_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id=None):
        queryset = self.get_queryset().filter(project_id=project_id)
        serializer = ProjectFieldSchemaSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, pk, project_id=None):
        field_schema = ProjectFieldSchema.objects.get(pk=pk, workspace__slug=slug)
        serializer = ProjectFieldSchemaSerializer(field_schema, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, pk, project_id=None):
        field_schema = ProjectFieldSchema.objects.get(pk=pk, workspace__slug=slug)
        field_schema.is_active = False
        field_schema.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectFieldValueViewSet(BaseViewSet):
    serializer_class = ProjectFieldValueSerializer
    model = ProjectFieldValue

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .select_related("field")
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def create(self, request, slug, project_id):
        workspace = Workspace.objects.get(slug=slug)
        serializer = ProjectFieldValueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace_id=workspace.id, project_id=project_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        queryset = self.get_queryset()
        serializer = ProjectFieldValueSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def partial_update(self, request, slug, project_id, pk):
        field_value = ProjectFieldValue.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        serializer = ProjectFieldValueSerializer(field_value, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def destroy(self, request, slug, project_id, pk):
        field_value = ProjectFieldValue.objects.get(pk=pk, workspace__slug=slug, project_id=project_id)
        field_value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectFieldValuesBulkUpdateEndpoint(BaseAPIView):
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def put(self, request, slug, project_id):
        workspace = Workspace.objects.get(slug=slug)
        values_data = request.data.get("values", [])
        results = []

        for value_data in values_data:
            field_id = value_data.get("field")
            value = value_data.get("value", {})

            obj, created = ProjectFieldValue.objects.update_or_create(
                workspace_id=workspace.id,
                project_id=project_id,
                field_id=field_id,
                defaults={"value": value},
            )
            results.append(ProjectFieldValueSerializer(obj).data)

        return Response(results, status=status.HTTP_200_OK)
