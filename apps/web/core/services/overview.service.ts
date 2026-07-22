/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import type {
  IDeliverable,
  IMilestone,
  IRisk,
  IRaciAssignment,
  ITimelineItem,
  IProjectFieldValue,
  IProjectFieldSchema,
} from "@plane/types";
import { APIService } from "@/services/api.service";

export class ProjectOverviewService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getDeliverables(workspaceSlug: string, projectId: string): Promise<IDeliverable[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/deliverables/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createDeliverable(
    workspaceSlug: string,
    projectId: string,
    data: { title: string; description?: string; priority?: string; due_date?: string }
  ): Promise<IDeliverable> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/deliverables/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getMilestones(workspaceSlug: string, projectId: string): Promise<IMilestone[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createMilestone(
    workspaceSlug: string,
    projectId: string,
    data: {
      name: string;
      description?: string;
      due_date?: string;
      definition_of_done?: string;
      status?: string;
      deliverable_ids?: string[];
    }
  ): Promise<IMilestone> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getRisks(workspaceSlug: string, projectId: string): Promise<IRisk[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/risks/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createRisk(
    workspaceSlug: string,
    projectId: string,
    data: {
      description: string;
      impact?: string;
      likelihood?: string;
      mitigation?: string;
      status?: string;
    }
  ): Promise<IRisk> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/risks/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getRaciAssignments(workspaceSlug: string, projectId: string): Promise<IRaciAssignment[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/raci-assignments/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createRaciAssignment(
    workspaceSlug: string,
    projectId: string,
    data: {
      area: string;
      user_id?: string;
      responsibility?: string;
      notes?: string;
    }
  ): Promise<IRaciAssignment> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/raci-assignments/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getTimelineItems(workspaceSlug: string, projectId: string): Promise<ITimelineItem[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/timeline-items/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createTimelineItem(
    workspaceSlug: string,
    projectId: string,
    data: {
      title: string;
      target_date?: string;
      notes?: string;
    }
  ): Promise<ITimelineItem> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/timeline-items/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getFieldValues(workspaceSlug: string, projectId: string): Promise<IProjectFieldValue[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-values/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async bulkUpdateFieldValues(
    workspaceSlug: string,
    projectId: string,
    data: { field: string; value: unknown }[]
  ): Promise<IProjectFieldValue[]> {
    return this.put(`/api/workspaces/${workspaceSlug}/projects/${projectId}/project-field-values/bulk/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createFieldSchema(
    workspaceSlug: string,
    data: {
      project_id?: string;
      name: string;
      description?: string;
      field_type: string;
      options?: string[];
      is_required?: boolean;
    }
  ): Promise<IProjectFieldSchema> {
    return this.post(`/api/workspaces/${workspaceSlug}/project-field-schemas/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getFieldSchemas(workspaceSlug: string): Promise<IProjectFieldSchema[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/project-field-schemas/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
