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

export async function handleCreateProjectFromKickoff({
  workspaceSlug,
  name,
  identifier,
  kickoff,
  externalSource,
  externalId,
}: CreateProjectFromKickoffArgs) {
  const description = buildDescription(kickoff);

  const project = await projectApiService.createProject(workspaceSlug, {
    name,
    identifier,
    description,
    ...(externalSource ? { external_source: externalSource } : {}),
    ...(externalId ? { external_id: externalId } : {}),
  } as Parameters<typeof projectApiService.createProject>[1]);

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
