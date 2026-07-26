/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

export const impactColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const statusColors: Record<string, string> = {
  active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  blocked: "bg-red-500/10 text-red-500 border-red-500/20",
  on_hold: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  identified: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  mitigating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  accepted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export const fieldTypeColors: Record<string, string> = {
  text: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  rich_text: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  number: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  date: "bg-green-500/10 text-green-500 border-green-500/20",
  url: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  multi_select: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  checklist: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  json: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export const recommendationLabels: Record<string, string> = {
  worth_taking: "Worth taking",
  review_needed: "Review needed",
  not_recommended: "Not recommended",
};

export const recommendationColors: Record<string, string> = {
  worth_taking: "bg-green-500/10 text-green-500 border-green-500/20",
  review_needed: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  not_recommended: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const raciColors: Record<string, string> = {
  responsible: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  accountable: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  consulted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  informed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const timelineColors = [
  "bg-blue-500/10 text-blue-500",
  "bg-purple-500/10 text-purple-500",
  "bg-green-500/10 text-green-500",
  "bg-orange-500/10 text-orange-500",
  "bg-pink-500/10 text-pink-500",
  "bg-cyan-500/10 text-cyan-500",
  "bg-yellow-500/10 text-yellow-500",
  "bg-indigo-500/10 text-indigo-500",
  "bg-red-500/10 text-red-500",
  "bg-teal-500/10 text-teal-500",
  "bg-lime-500/10 text-lime-500",
  "bg-amber-500/10 text-amber-500",
] as const;

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

export const OBJECTIVE_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
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
