/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export interface ITimelineItem {
  id: string;
  workspace_id: string;
  project_id: string;
  title: string;
  target_date: string;
  milestone_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
