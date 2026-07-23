/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the License for details.
 */

import { ProjectOverviewService } from "@/services/overview.service";
import { ProjectService as ProjectApiService } from "@/services/project";

const overviewService = new ProjectOverviewService();
const projectApiService = new ProjectApiService();

interface KickoffPayload {
  projectName: string;
  department?: string | null;
  projectOwners?: string[] | null;
  productDirection?: string[] | null;
  engineeringLead?: string | null;
  objectives?: string | null;
  platformEnables?: string[] | null;
  keyDeliverables?: string[] | null;
  raciMatrix?:
    | {
        area: string;
        responsible?: string | null;
        accountable?: string | null;
        consulted?: string | null;
        informed?: string | null;
      }[]
    | null;
  risksAndBlockers?: string[] | null;
  timeline?:
    | {
        milestone: string;
        targetDate?: string | null;
        status?: string | null;
      }[]
    | null;
  chosenTool?: string | null;
  techStack?: string | null;
  definitionOfDone?:
    | {
        milestone: string;
        criteria: string[];
      }[]
    | null;
  additionalNotes?: string;
}

interface CreateProjectFromKickoffArgs {
  workspaceSlug: string;
  name: string;
  identifier: string;
  kickoff: KickoffPayload;
  externalSource?: string;
  externalId?: string;
}

/** Plane rejects names containing: &+,:;$^}{*=?@#|'<>.()%!- */
function sanitizeName(name: string): string {
  return (
    name
      .replace(/[&+,:;$^}{*=?@#|'<>.()%!-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 255) || "Untitled Project"
  );
}

function sanitizeIdentifier(raw: string): string {
  return (
    raw
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 5) || "PROJ"
  );
}

function mapStatus(status: string | null | undefined): string {
  if (status === "completed") return "completed";
  if (status === "in-progress") return "in_progress";
  return "pending";
}

function buildDescription(kickoff: KickoffPayload): string {
  const parts = [`# ${kickoff.projectName}`];
  if (kickoff.department) parts.push(`**Department:** ${kickoff.department}`);
  if (kickoff.objectives) parts.push(`## Objectives\n${kickoff.objectives}`);
  if (kickoff.projectOwners?.length) {
    parts.push(`## Project Owners\n${kickoff.projectOwners.map((o) => `- ${o}`).join("\n")}`);
  }
  if (kickoff.keyDeliverables?.length) {
    parts.push(`## Key Deliverables\n${kickoff.keyDeliverables.map((d) => `- ${d}`).join("\n")}`);
  }
  if (kickoff.additionalNotes) parts.push(`## Notes\n${kickoff.additionalNotes}`);
  return parts.join("\n\n").slice(0, 4000);
}

function apiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const data = ("data" in error ? (error as { data: unknown }).data : error) as Record<string, unknown>;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.detail === "string") return data.detail;
    const nameErr = data?.name;
    if (Array.isArray(nameErr) && nameErr[0]) return `name: ${String(nameErr[0])}`;
    const idErr = data?.identifier;
    if (Array.isArray(idErr) && idErr[0]) return `identifier: ${String(idErr[0])}`;
  }
  return "Failed to create project";
}

export async function handleCreateProjectFromKickoff({
  workspaceSlug,
  name,
  identifier,
  kickoff,
  externalSource,
  externalId,
}: CreateProjectFromKickoffArgs) {
  const safeName = sanitizeName(name || kickoff.projectName || "Untitled Project");
  const safeIdentifier = sanitizeIdentifier(identifier);

  let project;
  try {
    project = await projectApiService.createProject(workspaceSlug, {
      name: safeName,
      identifier: safeIdentifier,
      description: buildDescription({ ...kickoff, projectName: safeName }),
      network: 2,
      ...(externalSource ? { external_source: externalSource } : {}),
      ...(externalId ? { external_id: externalId } : {}),
    } as Parameters<typeof projectApiService.createProject>[1]);
  } catch (error) {
    throw new Error(apiErrorMessage(error), { cause: error });
  }

  if (!project?.id) {
    throw new Error("Plane did not return a project id");
  }

  const projectId = project.id;

  const [milestones, risks, raci, deliverables, timelineItems] = await Promise.all([
    Promise.all(
      kickoff.timeline?.map((t) =>
        overviewService
          .createMilestone(workspaceSlug, projectId, {
            name: t.milestone,
            status: mapStatus(t.status),
            definition_of_done: JSON.stringify(
              kickoff.definitionOfDone?.find((d) => d.milestone === t.milestone)?.criteria ?? []
            ),
          })
          .catch(() => null)
      ) ?? []
    ),
    Promise.all(
      kickoff.risksAndBlockers?.map((desc) =>
        overviewService.createRisk(workspaceSlug, projectId, { description: desc }).catch(() => null)
      ) ?? []
    ),
    Promise.all(
      (kickoff.raciMatrix ?? []).flatMap((row) =>
        [
          { role: row.responsible, responsibility: "responsible" },
          { role: row.accountable, responsibility: "accountable" },
          { role: row.consulted, responsibility: "consulted" },
          { role: row.informed, responsibility: "informed" },
        ]
          .filter((r) => r.role)
          .map(({ responsibility }) =>
            overviewService
              .createRaciAssignment(workspaceSlug, projectId, {
                area: row.area,
                responsibility,
              })
              .catch(() => null)
          )
      )
    ),
    Promise.all(
      kickoff.keyDeliverables?.map((title) =>
        overviewService.createDeliverable(workspaceSlug, projectId, { title }).catch(() => null)
      ) ?? []
    ),
    Promise.all(
      kickoff.timeline?.map((t) =>
        overviewService
          .createTimelineItem(workspaceSlug, projectId, {
            title: t.milestone,
            target_date: t.targetDate ?? undefined,
          })
          .catch(() => null)
      ) ?? []
    ),
  ]);

  return {
    project,
    results: {
      milestones: milestones.filter(Boolean),
      risks: risks.filter(Boolean),
      raci: raci.filter(Boolean),
      deliverables: deliverables.filter(Boolean),
      timelineItems: timelineItems.filter(Boolean),
    },
  };
}

export type UpsertAIEvaluationArgs = {
  workspaceSlug: string;
  projectId: string;
  score?: number | null;
  analysis?: string;
  status?: "pending" | "completed" | "failed";
  externalId?: string | null;
  screenedAt?: string | null;
};

export async function handleUpsertAIEvaluation({
  workspaceSlug,
  projectId,
  score,
  analysis,
  status,
  externalId,
  screenedAt,
}: UpsertAIEvaluationArgs) {
  return overviewService.upsertAIEvaluation(workspaceSlug, projectId, {
    score: score ?? null,
    analysis: analysis ?? "",
    status: status ?? "completed",
    external_id: externalId ?? null,
    screened_at: screenedAt ?? new Date().toISOString(),
  });
}
