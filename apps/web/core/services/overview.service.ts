/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
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
  TProjectAIEvaluationUpsert,
  TDeliverablePriority,
  TMilestoneStatus,
  TObjectiveStatus,
  TRiskImpact,
  TRiskLikelihood,
  TRiskStatus,
  TRaciResponsibility,
} from "@plane/types";
import { APIService } from "@/services/api.service";

export type TDeliverablePayload = {
  title: string;
  description?: string;
  priority?: TDeliverablePriority | string;
  completed?: boolean;
  due_date?: string | null;
};

export type TMilestonePayload = {
  name: string;
  description?: string;
  due_date?: string | null;
  definition_of_done?: string;
  status?: TMilestoneStatus | string;
  deliverable_ids?: string[];
};

export type TRiskPayload = {
  description: string;
  impact?: TRiskImpact | string;
  likelihood?: TRiskLikelihood | string;
  mitigation?: string;
  status?: TRiskStatus | string;
  owner_id?: string | null;
};

export type TRaciPayload = {
  area: string;
  user_id?: string;
  responsibility?: TRaciResponsibility | string;
  notes?: string;
};

export type TObjectivePayload = {
  title: string;
  description?: string;
  status?: TObjectiveStatus | string;
  sort_order?: number;
};

export type TTimelinePayload = {
  title: string;
  target_date: string;
  milestone_id?: string | null;
  notes?: string;
};

export type TFieldSchemaPayload = {
  name: string;
  description?: string;
  field_type: string;
  options?: string[];
  is_required?: boolean;
};

export class ProjectOverviewService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  private projectPath(workspaceSlug: string, projectId: string, resource: string, pk?: string) {
    const base = `/api/workspaces/${workspaceSlug}/projects/${projectId}/${resource}/`;
    return pk ? `${base}${pk}/` : base;
  }

  // ── Deliverables ──────────────────────────────────────────────

  async getDeliverables(workspaceSlug: string, projectId: string): Promise<IDeliverable[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "deliverables"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createDeliverable(workspaceSlug: string, projectId: string, data: TDeliverablePayload): Promise<IDeliverable> {
    return this.post(this.projectPath(workspaceSlug, projectId, "deliverables"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateDeliverable(
    workspaceSlug: string,
    projectId: string,
    deliverableId: string,
    data: Partial<TDeliverablePayload>
  ): Promise<IDeliverable> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "deliverables", deliverableId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteDeliverable(workspaceSlug: string, projectId: string, deliverableId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "deliverables", deliverableId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── Milestones ────────────────────────────────────────────────

  async getMilestones(workspaceSlug: string, projectId: string): Promise<IMilestone[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "milestones"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createMilestone(workspaceSlug: string, projectId: string, data: TMilestonePayload): Promise<IMilestone> {
    return this.post(this.projectPath(workspaceSlug, projectId, "milestones"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateMilestone(
    workspaceSlug: string,
    projectId: string,
    milestoneId: string,
    data: Partial<TMilestonePayload>
  ): Promise<IMilestone> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "milestones", milestoneId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteMilestone(workspaceSlug: string, projectId: string, milestoneId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "milestones", milestoneId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── Risks ─────────────────────────────────────────────────────

  async getRisks(workspaceSlug: string, projectId: string): Promise<IRisk[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "risks"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createRisk(workspaceSlug: string, projectId: string, data: TRiskPayload): Promise<IRisk> {
    return this.post(this.projectPath(workspaceSlug, projectId, "risks"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateRisk(
    workspaceSlug: string,
    projectId: string,
    riskId: string,
    data: Partial<TRiskPayload>
  ): Promise<IRisk> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "risks", riskId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteRisk(workspaceSlug: string, projectId: string, riskId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "risks", riskId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── RACI ──────────────────────────────────────────────────────

  async getRaciAssignments(workspaceSlug: string, projectId: string): Promise<IRaciAssignment[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "raci-assignments"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createRaciAssignment(workspaceSlug: string, projectId: string, data: TRaciPayload): Promise<IRaciAssignment> {
    return this.post(this.projectPath(workspaceSlug, projectId, "raci-assignments"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateRaciAssignment(
    workspaceSlug: string,
    projectId: string,
    assignmentId: string,
    data: Partial<TRaciPayload>
  ): Promise<IRaciAssignment> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "raci-assignments", assignmentId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteRaciAssignment(workspaceSlug: string, projectId: string, assignmentId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "raci-assignments", assignmentId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── Objectives ────────────────────────────────────────────────

  async getObjectives(workspaceSlug: string, projectId: string): Promise<IObjective[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "objectives"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createObjective(workspaceSlug: string, projectId: string, data: TObjectivePayload): Promise<IObjective> {
    return this.post(this.projectPath(workspaceSlug, projectId, "objectives"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateObjective(
    workspaceSlug: string,
    projectId: string,
    objectiveId: string,
    data: Partial<TObjectivePayload>
  ): Promise<IObjective> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "objectives", objectiveId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteObjective(workspaceSlug: string, projectId: string, objectiveId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "objectives", objectiveId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── Timeline ──────────────────────────────────────────────────

  async getTimelineItems(workspaceSlug: string, projectId: string): Promise<ITimelineItem[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "timeline-items"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createTimelineItem(workspaceSlug: string, projectId: string, data: TTimelinePayload): Promise<ITimelineItem> {
    return this.post(this.projectPath(workspaceSlug, projectId, "timeline-items"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateTimelineItem(
    workspaceSlug: string,
    projectId: string,
    itemId: string,
    data: Partial<TTimelinePayload>
  ): Promise<ITimelineItem> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "timeline-items", itemId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteTimelineItem(workspaceSlug: string, projectId: string, itemId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "timeline-items", itemId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── Field values ──────────────────────────────────────────────

  async getFieldValues(workspaceSlug: string, projectId: string): Promise<IProjectFieldValue[]> {
    return this.get(this.projectPath(workspaceSlug, projectId, "project-field-values"))
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createFieldValue(
    workspaceSlug: string,
    projectId: string,
    data: { field: string; value: Record<string, unknown> }
  ): Promise<IProjectFieldValue> {
    return this.post(this.projectPath(workspaceSlug, projectId, "project-field-values"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateFieldValue(
    workspaceSlug: string,
    projectId: string,
    valueId: string,
    data: { value: Record<string, unknown> }
  ): Promise<IProjectFieldValue> {
    return this.patch(this.projectPath(workspaceSlug, projectId, "project-field-values", valueId), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteFieldValue(workspaceSlug: string, projectId: string, valueId: string): Promise<void> {
    return this.delete(this.projectPath(workspaceSlug, projectId, "project-field-values", valueId))
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async bulkUpdateFieldValues(
    workspaceSlug: string,
    projectId: string,
    values: { field: string; value: unknown }[]
  ): Promise<IProjectFieldValue[]> {
    return this.put(`/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-values/bulk/`, {
      values,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── Field schemas ─────────────────────────────────────────────

  async getFieldSchemas(workspaceSlug: string, projectId?: string): Promise<IProjectFieldSchema[]> {
    const url = projectId
      ? `/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-schemas/`
      : `/api/workspaces/${workspaceSlug}/project-field-schemas/`;
    return this.get(url)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createFieldSchema(
    workspaceSlug: string,
    data: TFieldSchemaPayload,
    projectId?: string
  ): Promise<IProjectFieldSchema> {
    const url = projectId
      ? `/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-schemas/`
      : `/api/workspaces/${workspaceSlug}/project-field-schemas/`;
    return this.post(url, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateFieldSchema(
    workspaceSlug: string,
    schemaId: string,
    data: Partial<TFieldSchemaPayload>,
    projectId?: string
  ): Promise<IProjectFieldSchema> {
    const url = projectId
      ? `/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-schemas/${schemaId}/`
      : `/api/workspaces/${workspaceSlug}/project-field-schemas/${schemaId}/`;
    return this.patch(url, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteFieldSchema(workspaceSlug: string, schemaId: string, projectId?: string): Promise<void> {
    const url = projectId
      ? `/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-schemas/${schemaId}/`
      : `/api/workspaces/${workspaceSlug}/project-field-schemas/${schemaId}/`;
    return this.delete(url)
      .then(() => undefined)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ── AI Evaluation ─────────────────────────────────────────────

  async getAIEvaluation(workspaceSlug: string, projectId: string): Promise<IProjectAIEvaluation | null> {
    return this.get(this.projectPath(workspaceSlug, projectId, "ai-evaluation"))
      .then((response) => response?.data ?? null)
      .catch((error) => {
        if (error?.response?.status === 404) return null;
        throw error?.response?.data;
      });
  }

  async upsertAIEvaluation(
    workspaceSlug: string,
    projectId: string,
    data: TProjectAIEvaluationUpsert
  ): Promise<IProjectAIEvaluation> {
    return this.put(this.projectPath(workspaceSlug, projectId, "ai-evaluation"), data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
