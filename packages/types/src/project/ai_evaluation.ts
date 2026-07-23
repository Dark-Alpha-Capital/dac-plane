/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export type TAIEvaluationStatus = "pending" | "completed" | "failed";
export type TAIEvaluationRecommendation = "worth_taking" | "review_needed" | "not_recommended" | "";

export interface IProjectAIEvaluation {
  id: string;
  workspace_id: string;
  project_id: string;
  score: number | null;
  analysis: string;
  recommendation: TAIEvaluationRecommendation;
  status: TAIEvaluationStatus;
  external_id: string | null;
  screened_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export type TProjectAIEvaluationUpsert = {
  score?: number | null;
  analysis?: string;
  status?: TAIEvaluationStatus;
  external_id?: string | null;
  screened_at?: string | null;
  recommendation?: TAIEvaluationRecommendation;
};
