import { observer } from "mobx-react";
import useSWR from "swr";
import { AlertTriangle, CheckCircle2, Clock, Target, Users } from "lucide-react";
// plane imports
import type { IDeliverable, IRisk, ITimelineItem, IProjectFieldValue } from "@plane/types";
import { Loader } from "@plane/ui";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
// services
import { ProjectOverviewService } from "@/services/overview.service";
import type { Route } from "./+types/page";

const overviewService = new ProjectOverviewService();

const impactColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-500",
  in_progress: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  blocked: "bg-red-500/10 text-red-500",
};

const raciColors: Record<string, string> = {
  responsible: "bg-blue-500/10 text-blue-500",
  accountable: "bg-purple-500/10 text-purple-500",
  consulted: "bg-yellow-500/10 text-yellow-500",
  informed: "bg-gray-500/10 text-gray-500",
};

function ProjectOverviewPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  const { currentProjectDetails } = useProject();

  const { data: deliverables, isLoading: loadingDeliverables } = useSWR(
    workspaceSlug && projectId ? `OVERVIEW_DELIVERABLES_${projectId}` : null,
    () => overviewService.getDeliverables(workspaceSlug, projectId)
  );

  const { data: milestones, isLoading: loadingMilestones } = useSWR(
    workspaceSlug && projectId ? `OVERVIEW_MILESTONES_${projectId}` : null,
    () => overviewService.getMilestones(workspaceSlug, projectId)
  );

  const { data: risks, isLoading: loadingRisks } = useSWR(
    workspaceSlug && projectId ? `OVERVIEW_RISKS_${projectId}` : null,
    () => overviewService.getRisks(workspaceSlug, projectId)
  );

  const { data: raciAssignments, isLoading: loadingRaci } = useSWR(
    workspaceSlug && projectId ? `OVERVIEW_RACI_${projectId}` : null,
    () => overviewService.getRaciAssignments(workspaceSlug, projectId)
  );

  const { data: timelineItems, isLoading: loadingTimeline } = useSWR(
    workspaceSlug && projectId ? `OVERVIEW_TIMELINE_${projectId}` : null,
    () => overviewService.getTimelineItems(workspaceSlug, projectId)
  );

  const { data: fieldValues, isLoading: loadingFields } = useSWR(
    workspaceSlug && projectId ? `OVERVIEW_FIELDS_${projectId}` : null,
    () => overviewService.getFieldValues(workspaceSlug, projectId)
  );

  const isLoading =
    loadingDeliverables || loadingMilestones || loadingRisks || loadingRaci || loadingTimeline || loadingFields;

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
            <div className="space-y-6">
              {/* Deliverables + Milestones */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SectionCard title="Deliverables" count={deliverables?.length ?? 0} icon={CheckCircle2}>
                  {deliverables && deliverables.length > 0 ? (
                    <ul className="space-y-2">
                      {deliverables.map((d: IDeliverable) => (
                        <li
                          key={d.id}
                          className="border-custom-border-100 flex items-center justify-between rounded border p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className={d.completed ? "text-green-500" : "text-tertiary"}>
                              {d.completed ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                            </span>
                            <span className={`text-sm ${d.completed ? "text-secondary line-through" : "text-primary"}`}>
                              {d.title}
                            </span>
                          </div>
                          {d.priority && (
                            <span className="text-2xs rounded px-1.5 py-0.5 text-tertiary capitalize">
                              {d.priority}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyMessage>No deliverables yet</EmptyMessage>
                  )}
                </SectionCard>

                <SectionCard title="Milestones" count={milestones?.length ?? 0} icon={Target}>
                  {milestones && milestones.length > 0 ? (
                    <ul className="space-y-2">
                      {milestones.map((m) => (
                        <li key={m.id} className="border-custom-border-100 rounded border p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">{m.name}</span>
                            <span
                              className={`text-2xs rounded px-1.5 py-0.5 capitalize ${statusColors[m.status] || ""}`}
                            >
                              {m.status.replace("_", " ")}
                            </span>
                          </div>
                          {m.definition_of_done && (
                            <p className="text-xs mt-1 line-clamp-2 text-tertiary">{m.definition_of_done}</p>
                          )}
                          {m.due_date && (
                            <p className="text-2xs mt-1 text-tertiary">
                              Due: {new Date(m.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyMessage>No milestones yet</EmptyMessage>
                  )}
                </SectionCard>
              </div>

              {/* Risks */}
              <SectionCard title="Risks" count={risks?.length ?? 0} icon={AlertTriangle}>
                {risks && risks.length > 0 ? (
                  <div className="space-y-2">
                    {risks.map((r: IRisk) => (
                      <div key={r.id} className="border-custom-border-100 rounded border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-primary">{r.description}</p>
                          <div className="flex shrink-0 gap-1">
                            <span
                              className={`text-2xs rounded px-1.5 py-0.5 capitalize ${impactColors[r.impact] || ""}`}
                            >
                              {r.impact}
                            </span>
                            <span
                              className={`text-2xs rounded px-1.5 py-0.5 capitalize ${statusColors[r.status] || ""}`}
                            >
                              {r.status}
                            </span>
                          </div>
                        </div>
                        {r.mitigation && <p className="text-xs mt-1 text-tertiary">Mitigation: {r.mitigation}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage>No risks identified</EmptyMessage>
                )}
              </SectionCard>

              {/* RACI */}
              <SectionCard title="RACI Matrix" count={raciAssignments?.length ?? 0} icon={Users}>
                {raciAssignments && raciAssignments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="text-sm w-full">
                      <thead>
                        <tr className="border-custom-border-200 text-xs border-b text-left text-tertiary">
                          <th className="pb-2 font-medium">Area</th>
                          <th className="pb-2 font-medium">Role</th>
                          <th className="pb-2 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raciAssignments.map((r) => (
                          <tr key={r.id} className="border-custom-border-100 border-b last:border-0">
                            <td className="py-2 text-primary">{r.area}</td>
                            <td className="py-2">
                              <span
                                className={`text-2xs rounded px-1.5 py-0.5 capitalize ${raciColors[r.responsibility] || ""}`}
                              >
                                {r.responsibility}
                              </span>
                            </td>
                            <td className="py-2 text-tertiary">{r.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyMessage>No RACI assignments yet</EmptyMessage>
                )}
              </SectionCard>

              {/* Timeline */}
              <SectionCard title="Timeline" count={timelineItems?.length ?? 0} icon={Clock}>
                {timelineItems && timelineItems.length > 0 ? (
                  <div className="space-y-1">
                    {[...timelineItems]
                      .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
                      .map((ti: ITimelineItem) => (
                        <div key={ti.id} className="flex items-center gap-3 rounded p-2 hover:bg-layer-1">
                          <div className="bg-blue-500/10 text-xs text-blue-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium">
                            {new Date(ti.target_date).getDate()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-primary">{ti.title}</p>
                            <p className="text-2xs text-tertiary">
                              {new Date(ti.target_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {ti.milestone_id && (
                            <span className="bg-purple-500/10 text-2xs text-purple-500 shrink-0 rounded px-1.5 py-0.5">
                              milestone
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <EmptyMessage>No timeline items yet</EmptyMessage>
                )}
              </SectionCard>

              {/* Custom Fields */}
              <SectionCard title="Project Fields" count={fieldValues?.length ?? 0}>
                {fieldValues && fieldValues.length > 0 ? (
                  <div className="space-y-4">
                    {fieldValues.map((fv: IProjectFieldValue) => (
                      <div key={fv.id}>
                        <h4 className="text-sm mb-1 font-medium text-primary">{fv.field_detail?.name}</h4>
                        <p className="text-sm text-secondary">{JSON.stringify(fv.value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage>
                    No custom fields configured. Add them via the API at /project-field-schemas/.
                  </EmptyMessage>
                )}
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="border-custom-border-200 bg-custom-background-100 rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-secondary" />}
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
        </div>
        {count !== undefined && <span className="text-xs text-tertiary">{count}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return <p className="text-sm py-4 text-center text-tertiary">{children}</p>;
}

export default observer(ProjectOverviewPage);
