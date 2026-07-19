/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TDeliverablePriority = "high" | "medium" | "low";

export interface IDeliverable {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  description: string;
  priority: TDeliverablePriority;
  completed: boolean;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
