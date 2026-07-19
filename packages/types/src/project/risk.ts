/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TRiskImpact = "low" | "medium" | "high" | "critical";
export type TRiskLikelihood = "low" | "medium" | "high";
export type TRiskStatus = "identified" | "mitigating" | "resolved" | "accepted";

export interface IRisk {
  id: string;
  workspace_id: string;
  project_id: string;
  description: string;
  impact: TRiskImpact;
  likelihood: TRiskLikelihood;
  mitigation: string;
  status: TRiskStatus;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
