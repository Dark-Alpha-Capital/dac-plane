# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only

from django.db import transaction
from rest_framework import status
from rest_framework.response import Response

from plane.api.views.base import BaseAPIView
from plane.db.models import Page, Project, ProjectPage
from plane.utils.content_validator import validate_html_content
from plane.utils.permissions import ProjectAdminPermission


def _page_payload(page):
    return {
        "id": str(page.id),
        "name": page.name,
        "description_html": page.description_html,
        "external_source": page.external_source,
        "external_id": page.external_id,
        "access": page.access,
        "updated_at": page.updated_at,
    }


class ProjectExternalPageAPIEndpoint(BaseAPIView):
    """API-key authenticated project Page list/upsert by external identity."""

    permission_classes = [ProjectAdminPermission]

    def get(self, request, slug, project_id):
        project = Project.objects.get(id=project_id, workspace__slug=slug)
        pages = Page.objects.filter(
            workspace=project.workspace,
            project_pages__project=project,
            project_pages__deleted_at__isnull=True,
        ).order_by("-updated_at")
        external_source = request.query_params.get("external_source")
        external_id = request.query_params.get("external_id")
        if external_source:
            pages = pages.filter(external_source=external_source)
        if external_id:
            pages = pages.filter(external_id=external_id)
        return Response([_page_payload(page) for page in pages.distinct()], status=status.HTTP_200_OK)

    def post(self, request, slug, project_id):
        project = Project.objects.get(id=project_id, workspace__slug=slug)
        name = str(request.data.get("name") or "").strip()
        external_source = str(request.data.get("external_source") or "").strip()
        external_id = str(request.data.get("external_id") or "").strip()
        description_html = str(request.data.get("description_html") or "<p></p>")
        if not name or not external_source or not external_id:
            return Response(
                {"error": "name, external_source, and external_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        valid, error, clean_html = validate_html_content(description_html)
        if not valid:
            return Response({"error": error or "invalid HTML"}, status=status.HTTP_400_BAD_REQUEST)

        identity_qs = Page.objects.filter(
            workspace=project.workspace,
            external_source=external_source,
            external_id=external_id,
            deleted_at__isnull=True,
        ).order_by("id")
        if identity_qs.count() > 1:
            return Response(
                {"error": "duplicate external page identity"},
                status=status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():
            page = identity_qs.first()
            created = page is None
            if page is not None:
                linked = ProjectPage.objects.filter(
                    page=page,
                    project=project,
                    deleted_at__isnull=True,
                ).exists()
                if not linked:
                    return Response(
                        {"error": "external page identity belongs to another project"},
                        status=status.HTTP_409_CONFLICT,
                    )
                page.name = name
                page.description_html = clean_html or "<p></p>"
                page.description_json = request.data.get("description_json") or {}
                page.access = int(request.data.get("access", page.access))
                page.updated_by = request.user
                page.save(disable_auto_set_user=True)
            else:
                page = Page.objects.create(
                    workspace=project.workspace,
                    name=name,
                    description_html=clean_html or "<p></p>",
                    description_json=request.data.get("description_json") or {},
                    owned_by=request.user,
                    access=int(request.data.get("access", Page.PUBLIC_ACCESS)),
                    external_source=external_source,
                    external_id=external_id,
                    created_by=request.user,
                    updated_by=request.user,
                )
                ProjectPage.objects.create(
                    workspace=project.workspace,
                    project=project,
                    page=page,
                    created_by=request.user,
                    updated_by=request.user,
                )
        return Response(_page_payload(page), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
