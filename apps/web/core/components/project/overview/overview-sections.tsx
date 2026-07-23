/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { mutate } from "swr";
import { AlertTriangle, CheckCircle2, Clock, Sparkles, Target, Users } from "lucide-react";
import type {
  IDeliverable,
  IMilestone,
  IRisk,
  IRaciAssignment,
  ITimelineItem,
  IProjectFieldValue,
  IProjectFieldSchema,
  IProjectAIEvaluation,
} from "@plane/types";
import { useMember } from "@/hooks/store/use-member";
import { ProjectOverviewService } from "@/services/overview.service";
import {
  formatFieldValue,
  impactColors,
  overviewSwrKey,
  raciColors,
  recommendationColors,
  recommendationLabels,
  statusColors,
} from "./constants";
import {
  AIEvaluationModal,
  DeliverableModal,
  FieldSchemaModal,
  FieldValueModal,
  MilestoneModal,
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
  risks: IRisk[] | undefined;
  raciAssignments: IRaciAssignment[] | undefined;
  timelineItems: ITimelineItem[] | undefined;
  fieldValues: IProjectFieldValue[] | undefined;
  fieldSchemas: IProjectFieldSchema[] | undefined;
};

export function OverviewSections(props: TOverviewSectionsProps) {
  const {
    workspaceSlug,
    projectId,
    canEdit,
    aiEvaluation,
    deliverables,
    milestones,
    risks,
    raciAssignments,
    timelineItems,
    fieldValues,
    fieldSchemas,
  } = props;

  const { getUserDetails } = useMember();

  const [deliverableModal, setDeliverableModal] = useState<{ open: boolean; data?: IDeliverable | null }>({
    open: false,
  });
  const [milestoneModal, setMilestoneModal] = useState<{ open: boolean; data?: IMilestone | null }>({ open: false });
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
      <div className="space-y-6">
        <SectionCard
          title="AI Evaluation"
          icon={Sparkles}
          canEdit={canEdit}
          onAdd={() => setAiModal(true)}
          addLabel={aiEvaluation ? "Edit" : "Add"}
        >
          {aiEvaluation ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-h3-semibold text-primary">
                  {aiEvaluation.score != null ? `${aiEvaluation.score}` : "—"}
                  <span className="text-sm font-normal text-tertiary"> / 5</span>
                </div>
                {aiEvaluation.recommendation ? (
                  <span
                    className={`text-2xs rounded px-1.5 py-0.5 ${recommendationColors[aiEvaluation.recommendation] || "bg-gray-500/10 text-gray-500"}`}
                  >
                    {recommendationLabels[aiEvaluation.recommendation] || aiEvaluation.recommendation}
                  </span>
                ) : null}
                <span
                  className={`text-2xs rounded px-1.5 py-0.5 capitalize ${statusColors[aiEvaluation.status] || ""}`}
                >
                  {aiEvaluation.status}
                </span>
              </div>
              {aiEvaluation.analysis ? (
                <p className="text-sm leading-relaxed text-secondary">{aiEvaluation.analysis}</p>
              ) : null}
              {aiEvaluation.screened_at ? (
                <p className="text-2xs text-tertiary">Screened {new Date(aiEvaluation.screened_at).toLocaleString()}</p>
              ) : null}
            </div>
          ) : (
            <EmptyMessage>No AI evaluation yet. Add one manually or create a project from kickoff.</EmptyMessage>
          )}
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Deliverables"
            count={deliverables?.length ?? 0}
            icon={CheckCircle2}
            canEdit={canEdit}
            onAdd={() => setDeliverableModal({ open: true, data: null })}
          >
            {deliverables && deliverables.length > 0 ? (
              <ul className="space-y-2">
                {deliverables.map((d) => (
                  <li
                    key={d.id}
                    className="group border-custom-border-100 flex items-center justify-between gap-2 rounded border p-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={d.completed ? "text-green-500" : "text-tertiary"}>
                        {d.completed ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                      </span>
                      <span
                        className={`text-sm truncate ${d.completed ? "text-secondary line-through" : "text-primary"}`}
                      >
                        {d.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.priority && (
                        <span className="text-2xs rounded px-1.5 py-0.5 text-tertiary capitalize">{d.priority}</span>
                      )}
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
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage>No deliverables yet</EmptyMessage>
            )}
          </SectionCard>

          <SectionCard
            title="Milestones"
            count={milestones?.length ?? 0}
            icon={Target}
            canEdit={canEdit}
            onAdd={() => setMilestoneModal({ open: true, data: null })}
          >
            {milestones && milestones.length > 0 ? (
              <ul className="space-y-2">
                {milestones.map((m) => (
                  <li key={m.id} className="group border-custom-border-100 rounded border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-primary">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xs rounded px-1.5 py-0.5 capitalize ${statusColors[m.status] || ""}`}>
                          {m.status.replace("_", " ")}
                        </span>
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
                    {m.definition_of_done && (
                      <p className="text-xs mt-1 line-clamp-2 text-tertiary">{m.definition_of_done}</p>
                    )}
                    {m.due_date && (
                      <p className="text-2xs mt-1 text-tertiary">Due: {new Date(m.due_date).toLocaleDateString()}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage>No milestones yet</EmptyMessage>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Risks"
          count={risks?.length ?? 0}
          icon={AlertTriangle}
          canEdit={canEdit}
          onAdd={() => setRiskModal({ open: true, data: null })}
        >
          {risks && risks.length > 0 ? (
            <div className="space-y-2">
              {risks.map((r) => (
                <div key={r.id} className="group border-custom-border-100 rounded border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-primary">{r.description}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className={`text-2xs rounded px-1.5 py-0.5 capitalize ${impactColors[r.impact] || ""}`}>
                        {r.impact}
                      </span>
                      <span className={`text-2xs rounded px-1.5 py-0.5 capitalize ${statusColors[r.status] || ""}`}>
                        {r.status}
                      </span>
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
                  {r.mitigation && <p className="text-xs mt-1 text-tertiary">Mitigation: {r.mitigation}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage>No risks identified</EmptyMessage>
          )}
        </SectionCard>

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
                  <tr className="border-custom-border-200 text-xs border-b text-left text-tertiary">
                    <th className="pb-2 font-medium">Area</th>
                    <th className="pb-2 font-medium">Member</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Notes</th>
                    {canEdit && <th className="pb-2 font-medium" />}
                  </tr>
                </thead>
                <tbody>
                  {raciAssignments.map((r) => {
                    const member = r.user_id ? getUserDetails(r.user_id) : undefined;
                    return (
                      <tr key={r.id} className="group border-custom-border-100 border-b last:border-0">
                        <td className="py-2 text-primary">{r.area}</td>
                        <td className="py-2 text-secondary">{member?.display_name || "—"}</td>
                        <td className="py-2">
                          <span
                            className={`text-2xs rounded px-1.5 py-0.5 capitalize ${raciColors[r.responsibility] || ""}`}
                          >
                            {r.responsibility}
                          </span>
                        </td>
                        <td className="py-2 text-tertiary">{r.notes || "—"}</td>
                        <td className="py-2">
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
                .map((ti) => (
                  <div key={ti.id} className="group flex items-center gap-3 rounded p-2 hover:bg-layer-1">
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
                      <span className="text-2xs bg-purple-500/10 text-purple-500 shrink-0 rounded px-1.5 py-0.5">
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
                ))}
            </div>
          ) : (
            <EmptyMessage>No timeline items yet</EmptyMessage>
          )}
        </SectionCard>

        <SectionCard
          title="Project Fields"
          count={(fieldSchemas?.length ?? 0) || (fieldValues?.length ?? 0)}
          canEdit={canEdit}
          onAdd={() => setSchemaModal({ open: true, data: null })}
          addLabel="Add field"
        >
          {fieldSchemas && fieldSchemas.length > 0 ? (
            <div className="space-y-3">
              {fieldSchemas.map((schema) => {
                const fv = fieldValues?.find((v) => v.field === schema.id || v.field_detail?.id === schema.id);
                return (
                  <div
                    key={schema.id}
                    className="group border-custom-border-100 flex items-start justify-between gap-3 rounded border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-primary">{schema.name}</h4>
                        <span className="text-2xs rounded bg-layer-1 px-1.5 py-0.5 text-tertiary">
                          {schema.field_type}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-secondary">{fv ? formatFieldValue(fv.value) : "No value set"}</p>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="text-xs rounded px-2 py-1 text-tertiary hover:bg-layer-1 hover:text-primary"
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
                );
              })}
            </div>
          ) : fieldValues && fieldValues.length > 0 ? (
            <div className="space-y-4">
              {fieldValues.map((fv) => (
                <div key={fv.id}>
                  <h4 className="text-sm mb-1 font-medium text-primary">{fv.field_detail?.name}</h4>
                  <p className="text-sm text-secondary">{formatFieldValue(fv.value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyMessage>No custom fields yet. Add a field to get started.</EmptyMessage>
          )}
        </SectionCard>
      </div>

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
