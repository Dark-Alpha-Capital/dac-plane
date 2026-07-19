/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TRaciResponsibility = "responsible" | "accountable" | "consulted" | "informed";

export interface IRaciAssignment {
  id: string;
  workspace_id: string;
  project_id: string;
  area: string;
  user_id: string;
  responsibility: TRaciResponsibility;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
