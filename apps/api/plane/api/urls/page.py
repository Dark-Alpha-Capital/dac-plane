# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only

from django.urls import path

from plane.api.views import ProjectExternalPageAPIEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/pages/",
        ProjectExternalPageAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="project-external-pages",
    ),
]
