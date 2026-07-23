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

function buildDescription(kickoff: KickoffPayload): string {
  const lines: string[] = [];
  const {
    projectName,
    department,
    projectOwners,
    engineeringLead,
    objectives,
    platformEnables,
    keyDeliverables,
    risksAndBlockers,
    chosenTool,
    techStack,
    additionalNotes,
  } = kickoff;

  lines.push(`# ${projectName}`);
  if (department) lines.push(`**Department:** ${department}`);
  lines.push("");
  if (objectives) lines.push(`## Objectives\n${objectives}`);
  if (projectOwners?.length) lines.push(`## Project Owners\n${projectOwners.map((o) => `- ${o}`).join("\n")}`);
  if (engineeringLead) lines.push(`## Engineering Lead\n${engineeringLead}`);
  if (platformEnables?.length) lines.push(`## Platform Enables\n${platformEnables.map((p) => `- ${p}`).join("\n")}`);
  if (keyDeliverables?.length) lines.push(`## Key Deliverables\n${keyDeliverables.map((d) => `- ${d}`).join("\n")}`);
  if (risksAndBlockers?.length) lines.push(`## Risks & Blockers\n${risksAndBlockers.map((r) => `- ${r}`).join("\n")}`);
  if (techStack) lines.push(`## Tech Stack\n${techStack}`);
  if (chosenTool) lines.push(`## Chosen Tool\n${chosenTool}`);
  if (additionalNotes) lines.push(`## Additional Notes\n${additionalNotes}`);
  lines.push("");
  lines.push("---");
  lines.push("```json");
  lines.push(JSON.stringify(kickoff, null, 2));
  lines.push("```");
  return lines.join("\n");
}

function mapStatus(status: string | null | undefined): string {
  if (status === "completed") return "completed";
  if (status === "in-progress") return "in_progress";
  return "pending";
}

function sanitizeIdentifier(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 5) || "PROJ";
}

function randomIdentifierSuffix(length = 2): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function resolveAvailableIdentifier(
  workspaceSlug: string,
  preferred: string
): Promise<string> {
  const base = sanitizeIdentifier(preferred);

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate =
      attempt === 0
        ? base
        : sanitizeIdentifier(`${base.slice(0, Math.max(1, 5 - 2))}${randomIdentifierSuffix(2)}`);

    try {
      // eslint-disable-next-line no-await-in-loop
      const availability = await projectApiService.checkProjectIdentifierAvailability(
        workspaceSlug,
        candidate
      );
      if (!availability?.exists) {
        return candidate;
      }
    } catch {
      // If availability check fails, still try create with this candidate.
      return candidate;
    }
  }

  return sanitizeIdentifier(`${base.slice(0, 2)}${randomIdentifierSuffix(3)}`);
}

function extractApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const data = record.data;
    if (data && typeof data === "object") {
      const dataRecord = data as Record<string, unknown>;
      if (typeof dataRecord.error === "string" && dataRecord.error.trim()) {
        return dataRecord.error;
      }
      if (typeof dataRecord.detail === "string" && dataRecord.detail.trim()) {
        return dataRecord.detail;
      }
      if (typeof dataRecord.message === "string" && dataRecord.message.trim()) {
        return dataRecord.message;
      }
    }
    if (typeof record.error === "string" && record.error.trim()) return record.error;
    if (typeof record.detail === "string" && record.detail.trim()) return record.detail;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
    if (typeof record.statusText === "string" && record.statusText.trim()) {
      return record.statusText;
    }
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
  const description = buildDescription(kickoff);
  const resolvedIdentifier = await resolveAvailableIdentifier(workspaceSlug, identifier);

  let project;
  try {
    project = await projectApiService.createProject(workspaceSlug, {
      name,
      identifier: resolvedIdentifier,
      description,
      ...(externalSource ? { external_source: externalSource } : {}),
      ...(externalId ? { external_id: externalId } : {}),
    } as Parameters<typeof projectApiService.createProject>[1]);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error), { cause: error });
  }

  const projectId = project.id;

  const milestonePromises =
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
    ) ?? [];

  const timelinePromises =
    kickoff.timeline?.map((t) =>
      overviewService
        .createTimelineItem(workspaceSlug, projectId, {
          title: t.milestone,
          target_date: t.targetDate ?? undefined,
        })
        .catch(() => null)
    ) ?? [];

  const riskPromises =
    kickoff.risksAndBlockers?.map((desc) =>
      overviewService.createRisk(workspaceSlug, projectId, { description: desc }).catch(() => null)
    ) ?? [];

  const raciPromises: Promise<unknown>[] = [];
  if (kickoff.raciMatrix) {
    for (const raci of kickoff.raciMatrix) {
      const roles = [
        { role: raci.responsible, responsibility: "responsible" },
        { role: raci.accountable, responsibility: "accountable" },
        { role: raci.consulted, responsibility: "consulted" },
        { role: raci.informed, responsibility: "informed" },
      ].filter((r) => r.role);
      for (const { responsibility } of roles) {
        raciPromises.push(
          overviewService
            .createRaciAssignment(workspaceSlug, projectId, { area: raci.area, responsibility })
            .catch(() => null)
        );
      }
    }
  }

  const deliverablePromises =
    kickoff.keyDeliverables?.map((title) =>
      overviewService.createDeliverable(workspaceSlug, projectId, { title }).catch(() => null)
    ) ?? [];

  const [milestones, risks, raci, deliverables, timelineItems] = await Promise.all([
    Promise.all(milestonePromises),
    Promise.all(riskPromises),
    Promise.all(raciPromises),
    Promise.all(deliverablePromises),
    Promise.all(timelinePromises),
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
