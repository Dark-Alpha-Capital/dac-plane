/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { useSWRConfig } from "swr";
import { AlertTriangle, Calendar, CheckCircle2, Clock, Flag, Sparkles, Target, Users } from "lucide-react";
import type {
  IDeliverable,
  IMilestone,
  IObjective,
  IRisk,
  IRaciAssignment,
  ITimelineItem,
  IProjectFieldValue,
  IProjectFieldSchema,
  IProjectAIEvaluation,
} from "@plane/types";
import { Avatar } from "@plane/ui";
import { useMember } from "@/hooks/store/use-member";
import { getFileURL } from "@plane/utils";
import { ProjectOverviewService } from "@/services/overview.service";
import {
  fieldTypeColors,
  formatFieldValue,
  impactColors,
  overviewSwrKey,
  priorityColors,
  raciColors,
  recommendationColors,
  recommendationLabels,
  statusColors,
  timelineColors,
} from "./constants";
import {
  AIEvaluationModal,
  DeliverableModal,
  FieldSchemaModal,
  FieldValueModal,
  MilestoneModal,
  ObjectiveModal,
  RaciModal,
  RiskModal,
  TimelineModal,
} from "./modals";
import { PlanningItemActions } from "./planning-item-actions";
import { EmptyMessage, SectionCard } from "./section-card";

const overviewService = new ProjectOverviewService();

type TOverviewSectionsProps = {
  workspaceSlug: string;
  projectId: string;
  canEdit: boolean;
  aiEvaluation: IProjectAIEvaluation | null | undefined;
  deliverables: IDeliverable[] | undefined;
  milestones: IMilestone[] | undefined;
  objectives: IObjective[] | undefined;
  risks: IRisk[] | undefined;
  raciAssignments: IRaciAssignment[] | undefined;
  timelineItems: ITimelineItem[] | undefined;
  fieldValues: IProjectFieldValue[] | undefined;
  fieldSchemas: IProjectFieldSchema[] | undefined;
};

function Badge({
  label,
  className = "bg-gray-500/10 text-gray-500 border-gray-500/20",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`text-2xs inline-flex items-center rounded-full border px-2 py-0.5 font-medium capitalize ${className}`}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

function ScoreBar({ score, max = 5 }: { score: number | null; max?: number }) {
  if (score === null) return <span className="text-sm text-tertiary">—</span>;
  const pct = Math.min(Math.max((score / max) * 100, 0), 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="bg-custom-background-90 h-2 w-24 overflow-hidden rounded-full">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-primary">
        {score} <span className="font-normal text-tertiary">/ {max}</span>
      </span>
    </div>
  );
}

export function OverviewSections(props: TOverviewSectionsProps) {
  const {
    workspaceSlug,
    projectId,
    canEdit,
    aiEvaluation,
    deliverables,
    milestones,
    objectives,
    risks,
    raciAssignments,
    timelineItems,
    fieldValues,
    fieldSchemas,
  } = props;

  const { getUserDetails } = useMember();
  const { mutate } = useSWRConfig();

  const [deliverableModal, setDeliverableModal] = useState<{ open: boolean; data?: IDeliverable | null }>({
    open: false,
  });
  const [milestoneModal, setMilestoneModal] = useState<{ open: boolean; data?: IMilestone | null }>({ open: false });
  const [objectiveModal, setObjectiveModal] = useState<{ open: boolean; data?: IObjective | null }>({ open: false });
  const [riskModal, setRiskModal] = useState<{ open: boolean; data?: IRisk | null }>({ open: false });
  const [raciModal, setRaciModal] = useState<{ open: boolean; data?: IRaciAssignment | null }>({ open: false });
  const [timelineModal, setTimelineModal] = useState<{ open: boolean; data?: ITimelineItem | null }>({ open: false });
  const [schemaModal, setSchemaModal] = useState<{ open: boolean; data?: IProjectFieldSchema | null }>({ open: false });
  const [valueModal, setValueModal] = useState<{
    open: boolean;
    schema?: IProjectFieldSchema;
    data?: IProjectFieldValue | null;
  }>({ open: false });
  const [aiModal, setAiModal] = useState(false);

  const refresh = (resource: string) => mutate(overviewSwrKey(resource, projectId));

  return (
    <>
      <div className="space-y-5">
        {/* ── AI Evaluation ──────────────────────────────── */}
        <SectionCard
          title="AI Evaluation"
          icon={Sparkles}
          canEdit={canEdit}
          onAdd={() => setAiModal(true)}
          addLabel={aiEvaluation ? "Edit" : "Add"}
        >
          {aiEvaluation ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <ScoreBar score={aiEvaluation.score} />
                {aiEvaluation.recommendation ? (
                  <Badge
                    label={recommendationLabels[aiEvaluation.recommendation] || aiEvaluation.recommendation}
                    className={recommendationColors[aiEvaluation.recommendation]}
                  />
                ) : null}
                <Badge label={aiEvaluation.status} className={statusColors[aiEvaluation.status]} />
              </div>
              {aiEvaluation.analysis ? (
                <div className="border-custom-border-100 rounded-lg border p-3">
                  <p className="text-sm leading-relaxed text-secondary">{aiEvaluation.analysis}</p>
                </div>
              ) : null}
              {aiEvaluation.screened_at ? (
                <p className="text-2xs flex items-center gap-1.5 text-tertiary">
                  <Calendar className="size-3" />
                  Screened {new Date(aiEvaluation.screened_at).toLocaleString()}
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyMessage>No AI evaluation yet. Add one manually or create a project from kickoff.</EmptyMessage>
          )}
        </SectionCard>

        {/* ── Objectives ─────────────────────────────────── */}
        <SectionCard
          title="Objectives"
          count={objectives?.length ?? 0}
          icon={Target}
          canEdit={canEdit}
          onAdd={() => setObjectiveModal({ open: true, data: null })}
        >
          {objectives && objectives.length > 0 ? (
            <div className="space-y-2">
              {objectives.map((o) => (
                <div
                  key={o.id}
                  className="group border-custom-border-100 hover:border-custom-border-200 rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">{o.title}</span>
                        <Badge label={o.status} className={statusColors[o.status]} />
                      </div>
                      {o.description && (
                        <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed text-tertiary">{o.description}</p>
                      )}
                    </div>
                    <PlanningItemActions
                      canEdit={canEdit}
                      onEdit={() => setObjectiveModal({ open: true, data: o })}
                      onDelete={async () => {
                        await overviewService.deleteObjective(workspaceSlug, projectId, o.id);
                        await refresh("OBJECTIVES");
                      }}
                      deleteTitle="Delete objective"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage>No objectives yet</EmptyMessage>
          )}
        </SectionCard>

        {/* ── Deliverables + Milestones grid ─────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard
            title="Deliverables"
            count={deliverables?.length ?? 0}
            icon={CheckCircle2}
            canEdit={canEdit}
            onAdd={() => setDeliverableModal({ open: true, data: null })}
          >
            {deliverables && deliverables.length > 0 ? (
              <div className="space-y-2">
                {deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="group border-custom-border-100 hover:border-custom-border-200 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={d.completed ? "text-green-500" : "text-tertiary"}>
                            {d.completed ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                          </span>
                          <span
                            className={`text-sm ${d.completed ? "text-secondary line-through" : "font-medium text-primary"}`}
                          >
                            {d.title}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {d.priority && <Badge label={d.priority} className={priorityColors[d.priority]} />}
                          {d.due_date && (
                            <span className="text-2xs flex items-center gap-1 text-tertiary">
                              <Calendar className="size-3" />
                              {new Date(d.due_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <PlanningItemActions
                        canEdit={canEdit}
                        onEdit={() => setDeliverableModal({ open: true, data: d })}
                        onDelete={async () => {
                          await overviewService.deleteDeliverable(workspaceSlug, projectId, d.id);
                          await refresh("DELIVERABLES");
                        }}
                        deleteTitle="Delete deliverable"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMessage>No deliverables yet</EmptyMessage>
            )}
          </SectionCard>

          <SectionCard
            title="Milestones"
            count={milestones?.length ?? 0}
            icon={Flag}
            canEdit={canEdit}
            onAdd={() => setMilestoneModal({ open: true, data: null })}
          >
            {milestones && milestones.length > 0 ? (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="group border-custom-border-100 hover:border-custom-border-200 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary">{m.name}</span>
                          <Badge label={m.status} className={statusColors[m.status]} />
                        </div>
                        {m.definition_of_done && (
                          <p className="text-xs mt-1.5 line-clamp-2 text-tertiary">{m.definition_of_done}</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {m.due_date && (
                            <span className="text-2xs flex items-center gap-1 text-tertiary">
                              <Calendar className="size-3" />
                              Due{" "}
                              {new Date(m.due_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <PlanningItemActions
                        canEdit={canEdit}
                        onEdit={() => setMilestoneModal({ open: true, data: m })}
                        onDelete={async () => {
                          await overviewService.deleteMilestone(workspaceSlug, projectId, m.id);
                          await refresh("MILESTONES");
                        }}
                        deleteTitle="Delete milestone"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyMessage>No milestones yet</EmptyMessage>
            )}
          </SectionCard>
        </div>

        {/* ── Risks ──────────────────────────────────────── */}
        <SectionCard
          title="Risks"
          count={risks?.length ?? 0}
          icon={AlertTriangle}
          canEdit={canEdit}
          onAdd={() => setRiskModal({ open: true, data: null })}
        >
          {risks && risks.length > 0 ? (
            <div className="divide-y-custom-border-100 divide-y">
              {risks.map((r) => (
                <div key={r.id} className="group py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-primary">{r.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge label={r.impact} className={impactColors[r.impact]} />
                        {r.likelihood && <span className="text-2xs text-tertiary">Likelihood: {r.likelihood}</span>}
                        <Badge label={r.status} className={statusColors[r.status]} />
                      </div>
                      {r.mitigation && <p className="text-xs mt-1.5 text-tertiary">Mitigation: {r.mitigation}</p>}
                    </div>
                    <PlanningItemActions
                      canEdit={canEdit}
                      onEdit={() => setRiskModal({ open: true, data: r })}
                      onDelete={async () => {
                        await overviewService.deleteRisk(workspaceSlug, projectId, r.id);
                        await refresh("RISKS");
                      }}
                      deleteTitle="Delete risk"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage>No risks identified</EmptyMessage>
          )}
        </SectionCard>

        {/* ── RACI Matrix ────────────────────────────────── */}
        <SectionCard
          title="RACI Matrix"
          count={raciAssignments?.length ?? 0}
          icon={Users}
          canEdit={canEdit}
          onAdd={() => setRaciModal({ open: true, data: null })}
        >
          {raciAssignments && raciAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-custom-border-200 border-b">
                    <th className="text-xs pb-2.5 text-left font-medium text-tertiary">Area</th>
                    <th className="text-xs pb-2.5 text-left font-medium text-tertiary">Member</th>
                    <th className="text-xs pb-2.5 text-left font-medium text-tertiary">Role</th>
                    <th className="text-xs pb-2.5 text-left font-medium text-tertiary">Notes</th>
                    {canEdit && <th className="text-xs pb-2.5 font-medium text-tertiary" />}
                  </tr>
                </thead>
                <tbody>
                  {raciAssignments.map((r) => {
                    const member = r.user_id ? getUserDetails(r.user_id) : undefined;
                    return (
                      <tr
                        key={r.id}
                        className="group border-custom-border-100 hover:bg-custom-background-90 border-b transition-colors last:border-0"
                      >
                        <td className="py-2.5 pr-3 font-medium text-primary">{r.area}</td>
                        <td className="py-2.5 pr-3">
                          {member ? (
                            <div className="flex items-center gap-2">
                              <Avatar name={member.display_name} src={getFileURL(member.avatar_url)} size="sm" />
                              <span className="text-secondary">{member.display_name}</span>
                            </div>
                          ) : (
                            <span className="text-tertiary">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          <Badge label={r.responsibility} className={raciColors[r.responsibility]} />
                        </td>
                        <td className="max-w-[180px] truncate py-2.5 pr-3 text-tertiary">{r.notes || "—"}</td>
                        <td className="py-2.5">
                          <PlanningItemActions
                            canEdit={canEdit}
                            onEdit={() => setRaciModal({ open: true, data: r })}
                            onDelete={async () => {
                              await overviewService.deleteRaciAssignment(workspaceSlug, projectId, r.id);
                              await refresh("RACI");
                            }}
                            deleteTitle="Delete RACI assignment"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyMessage>No RACI assignments yet</EmptyMessage>
          )}
        </SectionCard>

        {/* ── Timeline ───────────────────────────────────── */}
        <SectionCard
          title="Timeline"
          count={timelineItems?.length ?? 0}
          icon={Clock}
          canEdit={canEdit}
          onAdd={() => setTimelineModal({ open: true, data: null })}
        >
          {timelineItems && timelineItems.length > 0 ? (
            <div className="space-y-1">
              {[...timelineItems]
                .toSorted((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
                .map((ti) => {
                  const colorIdx = new Date(ti.target_date).getMonth() % timelineColors.length;
                  return (
                    <div
                      key={ti.id}
                      className="group border-custom-border-100 hover:border-custom-border-200 flex items-center gap-3 rounded-lg border p-2.5 transition-colors"
                    >
                      <div
                        className={`text-xs flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold ${timelineColors[colorIdx]}`}
                      >
                        {new Date(ti.target_date).getDate()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-primary">{ti.title}</p>
                        <p className="text-2xs text-tertiary">
                          {new Date(ti.target_date).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {ti.milestone_id && (
                        <span className="text-2xs bg-purple-500/10 text-purple-500 border-purple-500/20 shrink-0 rounded-full border px-2 py-0.5 font-medium">
                          milestone
                        </span>
                      )}
                      <PlanningItemActions
                        canEdit={canEdit}
                        onEdit={() => setTimelineModal({ open: true, data: ti })}
                        onDelete={async () => {
                          await overviewService.deleteTimelineItem(workspaceSlug, projectId, ti.id);
                          await refresh("TIMELINE");
                        }}
                        deleteTitle="Delete timeline item"
                      />
                    </div>
                  );
                })}
            </div>
          ) : (
            <EmptyMessage>No timeline items yet</EmptyMessage>
          )}
        </SectionCard>

        {/* ── Project Fields ─────────────────────────────── */}
        <SectionCard
          title="Project Fields"
          count={(fieldSchemas?.length ?? 0) || (fieldValues?.length ?? 0)}
          canEdit={canEdit}
          onAdd={() => setSchemaModal({ open: true, data: null })}
          addLabel="Add field"
        >
          {fieldSchemas && fieldSchemas.length > 0 ? (
            <div className="space-y-2.5">
              {fieldSchemas.map((schema) => {
                const fv = fieldValues?.find((v) => v.field === schema.id || v.field_detail?.id === schema.id);
                return (
                  <div
                    key={schema.id}
                    className="group border-custom-border-100 hover:border-custom-border-200 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-primary">{schema.name}</h4>
                          <Badge
                            label={schema.field_type}
                            className={
                              fieldTypeColors[schema.field_type] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
                            }
                          />
                          {schema.is_required && <span className="text-2xs text-red-500 font-medium">Required</span>}
                        </div>
                        {fv ? (
                          <p className="text-sm mt-1.5 font-medium text-secondary">{formatFieldValue(fv.value)}</p>
                        ) : (
                          <p className="text-sm mt-1.5 text-tertiary italic">No value set</p>
                        )}
                      </div>
                      {canEdit && (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            className="text-xs rounded-md px-2 py-1 text-tertiary transition-colors hover:bg-layer-1 hover:text-primary"
                            onClick={() => setValueModal({ open: true, schema, data: fv ?? null })}
                          >
                            {fv ? "Edit value" : "Set value"}
                          </button>
                          <PlanningItemActions
                            canEdit={canEdit}
                            onEdit={() => setSchemaModal({ open: true, data: schema })}
                            onDelete={async () => {
                              await overviewService.deleteFieldSchema(workspaceSlug, schema.id, projectId);
                              await Promise.all([refresh("FIELD_SCHEMAS"), refresh("FIELDS")]);
                            }}
                            deleteTitle="Deactivate field"
                            deleteContent="This will deactivate the field schema for this project."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : fieldValues && fieldValues.length > 0 ? (
            <div className="space-y-3">
              {fieldValues.map((fv) => (
                <div key={fv.id} className="border-custom-border-100 rounded-lg border p-3">
                  <h4 className="text-sm mb-1 font-medium text-primary">{fv.field_detail?.name || "Field"}</h4>
                  <p className="text-sm text-secondary">{formatFieldValue(fv.value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage>No custom fields yet. Add a field to get started.</EmptyMessage>
          )}
        </SectionCard>
      </div>

      <ObjectiveModal
        isOpen={objectiveModal.open}
        data={objectiveModal.data}
        onClose={() => setObjectiveModal({ open: false })}
        onSubmit={async (payload) => {
          if (objectiveModal.data) {
            await overviewService.updateObjective(workspaceSlug, projectId, objectiveModal.data.id, payload);
          } else {
            await overviewService.createObjective(workspaceSlug, projectId, payload);
          }
          await refresh("OBJECTIVES");
        }}
      />

      <DeliverableModal
        isOpen={deliverableModal.open}
        data={deliverableModal.data}
        onClose={() => setDeliverableModal({ open: false })}
        onSubmit={async (payload) => {
          if (deliverableModal.data) {
            await overviewService.updateDeliverable(workspaceSlug, projectId, deliverableModal.data.id, payload);
          } else {
            await overviewService.createDeliverable(workspaceSlug, projectId, payload);
          }
          await refresh("DELIVERABLES");
        }}
      />

      <MilestoneModal
        isOpen={milestoneModal.open}
        data={milestoneModal.data}
        onClose={() => setMilestoneModal({ open: false })}
        onSubmit={async (payload) => {
          if (milestoneModal.data) {
            await overviewService.updateMilestone(workspaceSlug, projectId, milestoneModal.data.id, payload);
          } else {
            await overviewService.createMilestone(workspaceSlug, projectId, payload);
          }
          await refresh("MILESTONES");
        }}
      />

      <RiskModal
        isOpen={riskModal.open}
        projectId={projectId}
        data={riskModal.data}
        onClose={() => setRiskModal({ open: false })}
        onSubmit={async (payload) => {
          if (riskModal.data) {
            await overviewService.updateRisk(workspaceSlug, projectId, riskModal.data.id, payload);
          } else {
            await overviewService.createRisk(workspaceSlug, projectId, payload);
          }
          await refresh("RISKS");
        }}
      />

      <RaciModal
        isOpen={raciModal.open}
        projectId={projectId}
        data={raciModal.data}
        onClose={() => setRaciModal({ open: false })}
        onSubmit={async (payload) => {
          if (raciModal.data) {
            await overviewService.updateRaciAssignment(workspaceSlug, projectId, raciModal.data.id, payload);
          } else {
            await overviewService.createRaciAssignment(workspaceSlug, projectId, payload);
          }
          await refresh("RACI");
        }}
      />

      <TimelineModal
        isOpen={timelineModal.open}
        data={timelineModal.data}
        milestones={milestones}
        onClose={() => setTimelineModal({ open: false })}
        onSubmit={async (payload) => {
          if (timelineModal.data) {
            await overviewService.updateTimelineItem(workspaceSlug, projectId, timelineModal.data.id, payload);
          } else {
            await overviewService.createTimelineItem(workspaceSlug, projectId, payload);
          }
          await refresh("TIMELINE");
        }}
      />

      <FieldSchemaModal
        isOpen={schemaModal.open}
        data={schemaModal.data}
        onClose={() => setSchemaModal({ open: false })}
        onSubmit={async (payload) => {
          if (schemaModal.data) {
            await overviewService.updateFieldSchema(workspaceSlug, schemaModal.data.id, payload, projectId);
          } else {
            await overviewService.createFieldSchema(workspaceSlug, payload, projectId);
          }
          await refresh("FIELD_SCHEMAS");
        }}
      />

      {valueModal.schema && (
        <FieldValueModal
          isOpen={valueModal.open}
          schema={valueModal.schema}
          data={valueModal.data}
          onClose={() => setValueModal({ open: false })}
          onSubmit={async (value) => {
            if (valueModal.data) {
              await overviewService.updateFieldValue(workspaceSlug, projectId, valueModal.data.id, { value });
            } else {
              await overviewService.createFieldValue(workspaceSlug, projectId, {
                field: valueModal.schema!.id,
                value,
              });
            }
            await refresh("FIELDS");
          }}
        />
      )}

      <AIEvaluationModal
        isOpen={aiModal}
        data={aiEvaluation}
        onClose={() => setAiModal(false)}
        onSubmit={async (payload) => {
          await overviewService.upsertAIEvaluation(workspaceSlug, projectId, payload);
          await refresh("AI_EVALUATION");
        }}
      />
    </>
  );
}
