import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
import type { Route } from "./+types/page";

function ProjectOverviewPage(_props: Route.ComponentProps) {
  const { t } = useTranslation();
  const { currentProjectDetails } = useProject();

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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="border-custom-border-200 bg-custom-background-100 rounded-lg border p-6">
              <h2 className="text-lg mb-4 font-semibold text-primary">{t("common.details")}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">ID</span>
                  <span className="text-sm text-primary">{currentProjectDetails?.identifier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">Created</span>
                  <span className="text-sm text-primary">
                    {currentProjectDetails?.created_at
                      ? new Date(currentProjectDetails.created_at).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">Project Lead</span>
                  <span className="text-sm text-primary">
                    {currentProjectDetails?.project_lead
                      ? typeof currentProjectDetails.project_lead === "string"
                        ? currentProjectDetails.project_lead
                        : ((currentProjectDetails.project_lead as { display_name?: string }).display_name ?? "-")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">Default Assignee</span>
                  <span className="text-sm text-primary">
                    {currentProjectDetails?.default_assignee
                      ? typeof currentProjectDetails.default_assignee === "string"
                        ? currentProjectDetails.default_assignee
                        : ((currentProjectDetails.default_assignee as { display_name?: string }).display_name ?? "-")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">Network</span>
                  <span className="text-sm text-primary">
                    {currentProjectDetails?.network === 2 ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-custom-border-200 bg-custom-background-100 rounded-lg border p-6">
              <h2 className="text-lg mb-4 font-semibold text-primary">Project Fields</h2>
              <p className="text-sm text-tertiary">Configure custom fields for this project in workspace settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default observer(ProjectOverviewPage);
