# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest
from rest_framework import status

from plane.db.models import Intake, IntakeIssue, IssueType, Project, ProjectIssueType, ProjectMember


@pytest.fixture
def project(db, workspace, create_user):
    project = Project.objects.create(
        name="DAC Project Intake", identifier="DACINTAKE", workspace=workspace, created_by=create_user
    )
    ProjectMember.objects.create(project=project, member=create_user, role=20, is_active=True)
    return project


@pytest.mark.contract
class TestWorkItemTypeAPI:
    def url(self, workspace, project):
        return f"/api/v1/workspaces/{workspace.slug}/projects/{project.id}/work-item-types/"

    @pytest.mark.django_db
    def test_create_native_default_type(self, api_key_client, workspace, project):
        response = api_key_client.post(
            self.url(workspace, project),
            {"name": "Project Proposal", "description": "DAC project proposal", "is_default": True},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        issue_type = IssueType.objects.get(name="Project Proposal", workspace=workspace)
        binding = ProjectIssueType.objects.get(project=project, issue_type=issue_type, deleted_at__isnull=True)
        project.refresh_from_db()
        assert binding.is_default is True
        assert issue_type.is_default is True
        assert project.is_issue_type_enabled is True
        assert response.data["id"] == issue_type.id

    @pytest.mark.django_db
    def test_create_is_idempotent_for_same_workspace_name(self, api_key_client, workspace, project):
        url = self.url(workspace, project)
        payload = {"name": "Project Proposal", "is_default": True}
        assert api_key_client.post(url, payload, format="json").status_code == status.HTTP_201_CREATED
        assert api_key_client.post(url, payload, format="json").status_code == status.HTTP_201_CREATED
        assert IssueType.objects.filter(workspace=workspace, name="Project Proposal").count() == 1
        assert ProjectIssueType.objects.filter(project=project, deleted_at__isnull=True).count() == 1


    @pytest.mark.django_db
    def test_public_intake_api_applies_native_default_type(self, api_key_client, workspace, project):
        issue_type = IssueType.objects.create(
            workspace=workspace, name="Project Proposal", is_default=True, is_active=True
        )
        ProjectIssueType.objects.create(
            workspace=workspace, project=project, issue_type=issue_type, is_default=True
        )
        project.intake_view = True
        project.is_issue_type_enabled = True
        project.save(update_fields=["intake_view", "is_issue_type_enabled", "updated_at"])
        Intake.objects.create(
            workspace=workspace, project=project, name="Default Intake", is_default=True
        )
        url = f"/api/v1/workspaces/{workspace.slug}/projects/{project.id}/intake-issues/"
        response = api_key_client.post(
            url, {"issue": {"name": "Acquire ExampleCo", "priority": "none"}}, format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        intake_issue = IntakeIssue.objects.select_related("issue").get(project=project)
        assert intake_issue.issue.type_id == issue_type.id

    @pytest.mark.django_db
    def test_type_is_project_scoped(self, api_key_client, workspace, project, create_user):
        response = api_key_client.post(
            self.url(workspace, project), {"name": "Project Proposal", "is_default": True}, format="json"
        )
        issue_type_id = response.data["id"]
        other = Project.objects.create(name="Other", identifier="OTHER", workspace=workspace)
        ProjectMember.objects.create(project=other, member=create_user, role=20, is_active=True)
        detail = f"/api/v1/workspaces/{workspace.slug}/projects/{other.id}/work-item-types/{issue_type_id}/"
        assert api_key_client.get(detail).status_code == status.HTTP_404_NOT_FOUND
