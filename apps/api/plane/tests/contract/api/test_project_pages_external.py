from uuid import uuid4

import pytest
from rest_framework import status

from plane.db.models import Page, Project, ProjectMember, ProjectPage


@pytest.mark.contract
@pytest.mark.django_db
class TestProjectExternalPageAPIEndpoint:
    def _project(self, workspace, create_user):
        project=Project.objects.create(
            name="Page Project",identifier="PG",workspace=workspace,created_by=create_user
        )
        ProjectMember.objects.create(project=project,workspace=workspace,member=create_user,role=20)
        return project

    def test_api_key_admin_can_idempotently_upsert_external_page(self, api_key_client, workspace, create_user):
        project=self._project(workspace,create_user)
        url=f"/api/v1/workspaces/{workspace.slug}/projects/{project.id}/pages/"
        payload={
            "name":"DAC-PM Approved Plan",
            "description_html":"<p>Version one</p>",
            "external_source":"dac-pm",
            "external_id":"canonical-project-1",
        }
        first=api_key_client.post(url,payload,format="json")
        assert first.status_code==status.HTTP_201_CREATED, first.data
        page_id=first.data["id"]

        payload["description_html"]="<p>Version two</p>"
        second=api_key_client.post(url,payload,format="json")
        assert second.status_code==status.HTTP_200_OK, second.data
        assert second.data["id"]==page_id
        assert Page.objects.filter(external_source="dac-pm",external_id="canonical-project-1").count()==1
        assert ProjectPage.objects.filter(project=project,page_id=page_id).count()==1
        assert "Version two" in second.data["description_html"]

    def test_page_html_is_sanitized(self, api_key_client, workspace, create_user):
        project=self._project(workspace,create_user)
        url=f"/api/v1/workspaces/{workspace.slug}/projects/{project.id}/pages/"
        response=api_key_client.post(url,{
            "name":"Plan","description_html":"<p>safe</p><script>alert(1)</script>",
            "external_source":"dac-pm","external_id":"canonical-project-2",
        },format="json")
        assert response.status_code==status.HTTP_201_CREATED
        assert "<script" not in response.data["description_html"]

    def test_list_can_filter_by_external_identity(self, api_key_client, workspace, create_user):
        project=self._project(workspace,create_user)
        Page.objects.create(
            workspace=workspace,name="Other",owned_by=create_user,
            external_source="other",external_id="x",created_by=create_user
        )
        page=Page.objects.create(
            workspace=workspace,name="DAC",owned_by=create_user,
            external_source="dac-pm",external_id="canonical",created_by=create_user
        )
        ProjectPage.objects.create(workspace=workspace,project=project,page=page,created_by=create_user)
        url=f"/api/v1/workspaces/{workspace.slug}/projects/{project.id}/pages/?external_source=dac-pm&external_id=canonical"
        response=api_key_client.get(url)
        assert response.status_code==status.HTTP_200_OK
        assert len(response.data)==1 and response.data[0]["id"]==str(page.id)
