/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Input, TextArea } from "@plane/ui";
import { cn } from "@plane/utils";
import { ProjectOverviewService } from "@/services/overview.service";

const overviewService = new ProjectOverviewService();

export type TCreateProjectPlanningData = {
  deliverables: { title: string }[];
  milestones: { name: string; definition_of_done?: string }[];
  risks: { description: string }[];
  timeline: { title: string; target_date: string }[];
};

export const emptyPlanningData = (): TCreateProjectPlanningData => ({
  deliverables: [],
  milestones: [],
  risks: [],
  timeline: [],
});

export async function seedProjectPlanning(
  workspaceSlug: string,
  projectId: string,
  planning: TCreateProjectPlanningData
) {
  await Promise.all([
    ...planning.deliverables
      .filter((d) => d.title.trim())
      .map((d) =>
        overviewService.createDeliverable(workspaceSlug, projectId, { title: d.title.trim() }).catch(() => null)
      ),
    ...planning.milestones
      .filter((m) => m.name.trim())
      .map((m) =>
        overviewService
          .createMilestone(workspaceSlug, projectId, {
            name: m.name.trim(),
            definition_of_done: m.definition_of_done?.trim() || undefined,
          })
          .catch(() => null)
      ),
    ...planning.risks
      .filter((r) => r.description.trim())
      .map((r) =>
        overviewService.createRisk(workspaceSlug, projectId, { description: r.description.trim() }).catch(() => null)
      ),
    ...planning.timeline
      .filter((t) => t.title.trim() && t.target_date)
      .map((t) =>
        overviewService
          .createTimelineItem(workspaceSlug, projectId, {
            title: t.title.trim(),
            target_date: t.target_date,
          })
          .catch(() => null)
      ),
  ]);
}

type TRepeatableSectionProps = {
  title: string;
  emptyLabel: string;
  items: { id: string }[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderItem: (id: string, index: number) => React.ReactNode;
};

function RepeatableSection(props: TRepeatableSectionProps) {
  const { title, emptyLabel, items, onAdd, onRemove, renderItem } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-primary">{title}</h4>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs flex items-center gap-1 text-tertiary hover:text-primary"
        >
          <Plus className="size-3.5" />
          Add
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-tertiary">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">{renderItem(item.id, index)}</div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="hover:text-red-500 mt-2 rounded p-1 text-tertiary"
                aria-label="Remove"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type TProjectPlanningAttributesProps = {
  value: TCreateProjectPlanningData;
  onChange: (value: TCreateProjectPlanningData) => void;
};

let rowId = 0;
const nextId = () => `plan-row-${++rowId}`;

export function ProjectPlanningAttributes(props: TProjectPlanningAttributesProps) {
  const { value, onChange } = props;
  const [isOpen, setIsOpen] = useState(false);

  const [deliverableIds, setDeliverableIds] = useState<string[]>([]);
  const [milestoneIds, setMilestoneIds] = useState<string[]>([]);
  const [riskIds, setRiskIds] = useState<string[]>([]);
  const [timelineIds, setTimelineIds] = useState<string[]>([]);

  const syncDeliverables = (ids: string[], rows: TCreateProjectPlanningData["deliverables"]) => {
    setDeliverableIds(ids);
    onChange({ ...value, deliverables: rows });
  };

  return (
    <div className="border-custom-border-200 rounded-lg border">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-medium text-primary">Planning details (optional)</p>
          <p className="text-xs text-tertiary">
            Seed deliverables, milestones, risks, and timeline. You can edit everything on Overview later.
          </p>
        </div>
        <ChevronDown className={cn("size-4 text-tertiary transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-custom-border-200 space-y-5 border-t px-4 py-4">
          <RepeatableSection
            title="Deliverables"
            emptyLabel="No deliverables added"
            items={deliverableIds.map((id) => ({ id }))}
            onAdd={() => {
              const id = nextId();
              syncDeliverables([...deliverableIds, id], [...value.deliverables, { title: "" }]);
            }}
            onRemove={(id) => {
              const index = deliverableIds.indexOf(id);
              if (index < 0) return;
              syncDeliverables(
                deliverableIds.filter((x) => x !== id),
                value.deliverables.filter((_, i) => i !== index)
              );
            }}
            renderItem={(_id, index) => (
              <Input
                value={value.deliverables[index]?.title ?? ""}
                onChange={(e) => {
                  const next = [...value.deliverables];
                  next[index] = { title: e.target.value };
                  onChange({ ...value, deliverables: next });
                }}
                placeholder="Deliverable title"
                className="w-full"
              />
            )}
          />

          <RepeatableSection
            title="Milestones"
            emptyLabel="No milestones added"
            items={milestoneIds.map((id) => ({ id }))}
            onAdd={() => {
              const id = nextId();
              setMilestoneIds((prev) => [...prev, id]);
              onChange({ ...value, milestones: [...value.milestones, { name: "", definition_of_done: "" }] });
            }}
            onRemove={(id) => {
              const index = milestoneIds.indexOf(id);
              if (index < 0) return;
              setMilestoneIds((prev) => prev.filter((x) => x !== id));
              onChange({
                ...value,
                milestones: value.milestones.filter((_, i) => i !== index),
              });
            }}
            renderItem={(_id, index) => (
              <div className="space-y-2">
                <Input
                  value={value.milestones[index]?.name ?? ""}
                  onChange={(e) => {
                    const next = [...value.milestones];
                    next[index] = { ...next[index], name: e.target.value };
                    onChange({ ...value, milestones: next });
                  }}
                  placeholder="Milestone name"
                  className="w-full"
                />
                <TextArea
                  value={value.milestones[index]?.definition_of_done ?? ""}
                  onChange={(e) => {
                    const next = [...value.milestones];
                    next[index] = { ...next[index], definition_of_done: e.target.value };
                    onChange({ ...value, milestones: next });
                  }}
                  placeholder="Definition of done (optional)"
                  className="min-h-14 w-full"
                />
              </div>
            )}
          />

          <RepeatableSection
            title="Risks"
            emptyLabel="No risks added"
            items={riskIds.map((id) => ({ id }))}
            onAdd={() => {
              const id = nextId();
              setRiskIds((prev) => [...prev, id]);
              onChange({ ...value, risks: [...value.risks, { description: "" }] });
            }}
            onRemove={(id) => {
              const index = riskIds.indexOf(id);
              if (index < 0) return;
              setRiskIds((prev) => prev.filter((x) => x !== id));
              onChange({ ...value, risks: value.risks.filter((_, i) => i !== index) });
            }}
            renderItem={(_id, index) => (
              <TextArea
                value={value.risks[index]?.description ?? ""}
                onChange={(e) => {
                  const next = [...value.risks];
                  next[index] = { description: e.target.value };
                  onChange({ ...value, risks: next });
                }}
                placeholder="Risk description"
                className="min-h-14 w-full"
              />
            )}
          />

          <RepeatableSection
            title="Timeline"
            emptyLabel="No timeline items added"
            items={timelineIds.map((id) => ({ id }))}
            onAdd={() => {
              const id = nextId();
              setTimelineIds((prev) => [...prev, id]);
              onChange({ ...value, timeline: [...value.timeline, { title: "", target_date: "" }] });
            }}
            onRemove={(id) => {
              const index = timelineIds.indexOf(id);
              if (index < 0) return;
              setTimelineIds((prev) => prev.filter((x) => x !== id));
              onChange({ ...value, timeline: value.timeline.filter((_, i) => i !== index) });
            }}
            renderItem={(_id, index) => (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={value.timeline[index]?.title ?? ""}
                  onChange={(e) => {
                    const next = [...value.timeline];
                    next[index] = { ...next[index], title: e.target.value };
                    onChange({ ...value, timeline: next });
                  }}
                  placeholder="Title"
                  className="w-full"
                />
                <Input
                  type="date"
                  value={value.timeline[index]?.target_date ?? ""}
                  onChange={(e) => {
                    const next = [...value.timeline];
                    next[index] = { ...next[index], target_date: e.target.value };
                    onChange({ ...value, timeline: next });
                  }}
                  className="w-full"
                />
              </div>
            )}
          />

          <p className="text-xs text-tertiary">
            Tip: Add RACI assignments from the project Overview after members are on the project.
          </p>
        </div>
      )}
    </div>
  );
}
