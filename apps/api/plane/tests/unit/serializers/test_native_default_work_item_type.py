# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest

from plane.app.serializers.issue import IssueCreateSerializer
from plane.db.models import IssueType, Project, ProjectIssueType


@pytest.mark.unit
class TestNativeDefaultWorkItemType:
    @pytest.mark.django_db
    def test_issue_create_uses_project_default_type(self, workspace):
        project = Project.objects.create(name="DAC Project Intake", identifier="DACINTAKE", workspace=workspace)
        issue_type = IssueType.objects.create(
            workspace=workspace, name="Project Proposal", is_default=True, is_active=True
        )
        ProjectIssueType.objects.create(
            workspace=workspace, project=project, issue_type=issue_type, is_default=True
        )
        serializer = IssueCreateSerializer(
            data={"name": "Acquire ExampleCo"},
            context={
                "project_id": project.id,
                "workspace_id": workspace.id,
                "default_assignee_id": None,
                "allow_triage_state": True,
            },
        )
        assert serializer.is_valid(), serializer.errors
        issue = serializer.save()
        assert issue.type_id == issue_type.id

    @pytest.mark.django_db
    def test_issue_create_without_default_remains_untyped(self, workspace):
        project = Project.objects.create(name="Normal", identifier="NORMAL", workspace=workspace)
        serializer = IssueCreateSerializer(
            data={"name": "Normal work"},
            context={
                "project_id": project.id,
                "workspace_id": workspace.id,
                "default_assignee_id": None,
                "allow_triage_state": True,
            },
        )
        assert serializer.is_valid(), serializer.errors
        issue = serializer.save()
        assert issue.type_id is None
