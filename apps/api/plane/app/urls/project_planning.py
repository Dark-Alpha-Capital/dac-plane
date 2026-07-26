# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path

from plane.app.views.project_planning import (
    DeliverableViewSet,
    MilestoneViewSet,
    ObjectiveViewSet,
    RiskViewSet,
    RaciAssignmentViewSet,
    TimelineItemViewSet,
    ProjectAIEvaluationViewSet,
)


urlpatterns = [
    # Deliverables
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/deliverables/",
        DeliverableViewSet.as_view({"get": "list", "post": "create"}),
        name="project-deliverables",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/deliverables/<uuid:pk>/",
        DeliverableViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-deliverable",
    ),
    # Milestones
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/milestones/",
        MilestoneViewSet.as_view({"get": "list", "post": "create"}),
        name="project-milestones",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/milestones/<uuid:pk>/",
        MilestoneViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-milestone",
    ),
    # Risks
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/risks/",
        RiskViewSet.as_view({"get": "list", "post": "create"}),
        name="project-risks",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/risks/<uuid:pk>/",
        RiskViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-risk",
    ),
    # Objectives
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/objectives/",
        ObjectiveViewSet.as_view({"get": "list", "post": "create"}),
        name="project-objectives",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/objectives/<uuid:pk>/",
        ObjectiveViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-objective",
    ),
    # RACI Assignments
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/raci-assignments/",
        RaciAssignmentViewSet.as_view({"get": "list", "post": "create"}),
        name="project-raci-assignments",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/raci-assignments/<uuid:pk>/",
        RaciAssignmentViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-raci-assignment",
    ),
    # Timeline Items
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/timeline-items/",
        TimelineItemViewSet.as_view({"get": "list", "post": "create"}),
        name="project-timeline-items",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/timeline-items/<uuid:pk>/",
        TimelineItemViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-timeline-item",
    ),
    # AI Evaluation (singleton per project)
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/ai-evaluation/",
        ProjectAIEvaluationViewSet.as_view({"get": "retrieve", "put": "upsert"}),
        name="project-ai-evaluation",
    ),
]
