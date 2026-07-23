/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export const impactColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

export const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-500",
  in_progress: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  blocked: "bg-red-500/10 text-red-500",
  failed: "bg-red-500/10 text-red-500",
  identified: "bg-gray-500/10 text-gray-500",
  mitigating: "bg-blue-500/10 text-blue-500",
  resolved: "bg-green-500/10 text-green-500",
  accepted: "bg-purple-500/10 text-purple-500",
};

export const recommendationLabels: Record<string, string> = {
  worth_taking: "Worth taking",
  review_needed: "Review needed",
  not_recommended: "Not recommended",
};

export const recommendationColors: Record<string, string> = {
  worth_taking: "bg-green-500/10 text-green-500",
  review_needed: "bg-yellow-500/10 text-yellow-500",
  not_recommended: "bg-red-500/10 text-red-500",
};

export const raciColors: Record<string, string> = {
  responsible: "bg-blue-500/10 text-blue-500",
  accountable: "bg-purple-500/10 text-purple-500",
  consulted: "bg-yellow-500/10 text-yellow-500",
  informed: "bg-gray-500/10 text-gray-500",
};

export const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

export const MILESTONE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
] as const;

export const RISK_IMPACT_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

export const RISK_LIKELIHOOD_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const RISK_STATUS_OPTIONS = [
  { value: "identified", label: "Identified" },
  { value: "mitigating", label: "Mitigating" },
  { value: "resolved", label: "Resolved" },
  { value: "accepted", label: "Accepted" },
] as const;

export const RACI_OPTIONS = [
  { value: "responsible", label: "Responsible" },
  { value: "accountable", label: "Accountable" },
  { value: "consulted", label: "Consulted" },
  { value: "informed", label: "Informed" },
] as const;

export const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "rich_text", label: "Rich text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
  { value: "multi_select", label: "Multi select" },
  { value: "checklist", label: "Checklist" },
  { value: "json", label: "JSON" },
] as const;

export const AI_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
] as const;

export const AI_RECOMMENDATION_OPTIONS = [
  { value: "worth_taking", label: "Worth taking" },
  { value: "review_needed", label: "Review needed" },
  { value: "not_recommended", label: "Not recommended" },
] as const;

export function formatFieldValue(value: Record<string, unknown> | null | undefined): string {
  if (!value || typeof value !== "object") return "—";
  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;
  if (typeof value.url === "string") return value.url;
  if (value.number !== undefined && value.number !== null) return String(value.number);
  if (typeof value.date === "string") return value.date;
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

export function overviewSwrKey(resource: string, projectId: string) {
  return `OVERVIEW_${resource}_${projectId}`;
}
