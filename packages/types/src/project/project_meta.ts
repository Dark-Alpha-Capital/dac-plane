/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TProjectFieldType =
  | "text"
  | "rich_text"
  | "number"
  | "date"
  | "user"
  | "multi_select"
  | "url"
  | "checklist"
  | "table"
  | "json";

export interface IProjectFieldSchema {
  id: string;
  workspace_id: string;
  project_id: string | null;
  name: string;
  description: string;
  field_type: TProjectFieldType;
  options: string[];
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IProjectFieldValue {
  id: string;
  workspace_id: string;
  project_id: string;
  field: string;
  field_detail: IProjectFieldSchema;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
