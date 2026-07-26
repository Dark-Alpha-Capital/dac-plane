/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TObjectiveStatus = "active" | "in_progress" | "completed" | "on_hold";

export interface IObjective {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description: string;
  status: TObjectiveStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
