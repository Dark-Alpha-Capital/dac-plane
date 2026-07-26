/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { Loader } from "@plane/ui";
import { TextArea } from "@plane/ui";
// components
import { PageHead } from "@/components/core/page-title";
import { MarkdownRenderer } from "@/components/ui/markdown-to-component";
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
  const { currentProjectDetails, updateProject } = useProject();
  const { allowPermissions } = useUserPermissions();

  const canEdit = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT,
    workspaceSlug,
    projectId
  );

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);

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

  const { data: objectives, isLoading: loadingObjectives } = useSWR(
    workspaceSlug && projectId ? overviewSwrKey("OBJECTIVES", projectId) : null,
    () => overviewService.getObjectives(workspaceSlug, projectId)
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
    loadingObjectives ||
    loadingRisks ||
    loadingRaci ||
    loadingTimeline ||
    loadingFields ||
    loadingSchemas;

  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails.name} - Overview` : "Project Overview";

  const handleStartEditDescription = () => {
    setDescriptionDraft(currentProjectDetails?.description ?? "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (!workspaceSlug || !projectId) return;
    setIsSavingDescription(true);
    try {
      await updateProject(workspaceSlug, projectId, { description: descriptionDraft });
      setIsEditingDescription(false);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "Description updated." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to update description." });
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setDescriptionDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <PageHead title={pageTitle} />
      <div className="h-full w-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="mb-8">
            <h1 className="text-h2-semibold text-primary">{currentProjectDetails?.name ?? "Project"}</h1>
            {isEditingDescription ? (
              <div className="mt-2 space-y-3">
                <TextArea
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  className="min-h-[120px] w-full"
                  placeholder="Project description (supports markdown)..."
                />
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleSaveDescription} loading={isSavingDescription}>
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEditDescription}
                    disabled={isSavingDescription}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group mt-2">
                {currentProjectDetails?.description ? (
                  <div className="prose-sm max-w-none text-body-md-regular text-secondary prose">
                    <MarkdownRenderer markdown={currentProjectDetails.description} />
                  </div>
                ) : (
                  <p className="text-sm text-tertiary italic">No description yet</p>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleStartEditDescription}
                    className="text-xs mt-1 rounded px-2 py-0.5 text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-layer-1 hover:text-primary"
                  >
                    Edit description
                  </button>
                )}
              </div>
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
              objectives={objectives}
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
