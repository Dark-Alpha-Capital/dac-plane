/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { Loader } from "@plane/ui";
// components
import { PageHead } from "@/components/core/page-title";
import { OverviewSections, overviewSwrKey } from "@/components/project/overview";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
// services
import { ProjectOverviewService } from "@/services/overview.service";
import type { Route } from "./+types/page";

const overviewService = new ProjectOverviewService();

function ProjectOverviewPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  const { currentProjectDetails } = useProject();
  const { allowPermissions } = useUserPermissions();

  const canEdit = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT,
    workspaceSlug,
    projectId
  );

  const { data: aiEvaluation, isLoading: loadingAIEvaluation } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("AI_EVALUATION", projectId) : null,
    () => overviewService.getAIEvaluation(workspaceSlug, projectId)
  );

  const { data: deliverables, isLoading: loadingDeliverables } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("DELIVERABLES", projectId) : null,
    () => overviewService.getDeliverables(workspaceSlug, projectId)
  );

  const { data: milestones, isLoading: loadingMilestones } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("MILESTONES", projectId) : null,
    () => overviewService.getMilestones(workspaceSlug, projectId)
  );

  const { data: risks, isLoading: loadingRisks } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("RISKS", projectId) : null,
    () => overviewService.getRisks(workspaceSlug, projectId)
  );

  const { data: raciAssignments, isLoading: loadingRaci } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("RACI", projectId) : null,
    () => overviewService.getRaciAssignments(workspaceSlug, projectId)
  );

  const { data: timelineItems, isLoading: loadingTimeline } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("TIMELINE", projectId) : null,
    () => overviewService.getTimelineItems(workspaceSlug, projectId)
  );

  const { data: fieldValues, isLoading: loadingFields } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("FIELDS", projectId) : null,
    () => overviewService.getFieldValues(workspaceSlug, projectId)
  );

  const { data: fieldSchemas, isLoading: loadingSchemas } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("FIELD_SCHEMAS", projectId) : null,
    () => overviewService.getFieldSchemas(workspaceSlug, projectId)
  );

  const isLoading =
    loadingAIEvaluation ||
    loadingDeliverables ||
    loadingMilestones ||
    loadingRisks ||
    loadingRaci ||
    loadingTimeline ||
    loadingFields ||
    loadingSchemas;

  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails.name} - Overview` : "Project Overview";

  return (
    <div className="flex h-full flex-col">
      <PageHead title={pageTitle} />
      <div className="h-full w-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="mb-8">
            <h1 className="text-h2-semibold text-primary">{currentProjectDetails?.name ?? "Project"}</h1>
            {currentProjectDetails?.description && (
              <p className="mt-2 text-body-md-regular text-secondary">{currentProjectDetails.description}</p>
            )}
          </div>

          {isLoading ? (
            <Loader className="space-y-4">
              <Loader.Item height="120px" />
              <Loader.Item height="120px" />
              <Loader.Item height="120px" />
            </Loader>
          ) : (
            <OverviewSections
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              canEdit={canEdit}
              aiEvaluation={aiEvaluation}
              deliverables={deliverables}
              milestones={milestones}
              risks={risks}
              raciAssignments={raciAssignments}
              timelineItems={timelineItems}
              fieldValues={fieldValues}
              fieldSchemas={fieldSchemas}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default observer(ProjectOverviewPage);
