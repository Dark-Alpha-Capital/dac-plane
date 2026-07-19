# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path

from plane.app.views.project_meta import (
    ProjectFieldSchemaViewSet,
    ProjectFieldValueViewSet,
    ProjectFieldValuesBulkUpdateEndpoint,
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/project-field-schemas/",
        ProjectFieldSchemaViewSet.as_view({"get": "list", "post": "create"}),
        name="project-field-schemas",
    ),
    path(
        "workspaces/<str:slug>/project-field-schemas/<uuid:pk>/",
        ProjectFieldSchemaViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-field-schema",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-field-schemas/",
        ProjectFieldSchemaViewSet.as_view({"get": "list", "post": "create"}),
        name="project-field-schemas",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-field-schemas/<uuid:pk>/",
        ProjectFieldSchemaViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-field-schema",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-field-values/",
        ProjectFieldValueViewSet.as_view({"get": "list", "post": "create"}),
        name="project-field-values",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-field-values/<uuid:pk>/",
        ProjectFieldValueViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-field-value",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-field-values/bulk/",
        ProjectFieldValuesBulkUpdateEndpoint.as_view(),
        name="project-field-values-bulk",
    ),
]
