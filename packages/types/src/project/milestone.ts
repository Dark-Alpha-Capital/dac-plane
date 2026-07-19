/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TMilestoneStatus = "pending" | "in_progress" | "completed" | "blocked";

export interface IMilestone {
  id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  description: string;
  due_date: string | null;
  definition_of_done: string;
  status: TMilestoneStatus;
  sort_order: number;
  deliverable_ids: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
