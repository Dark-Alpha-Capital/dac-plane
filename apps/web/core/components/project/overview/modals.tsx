/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type {
  IDeliverable,
  IMilestone,
  IRisk,
  IRaciAssignment,
  ITimelineItem,
  IProjectFieldSchema,
  IProjectFieldValue,
  IProjectAIEvaluation,
  TProjectAIEvaluationUpsert,
} from "@plane/types";
import { Checkbox, Input, ModalCore, TextArea } from "@plane/ui";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import type {
  TDeliverablePayload,
  TMilestonePayload,
  TRiskPayload,
  TRaciPayload,
  TTimelinePayload,
  TFieldSchemaPayload,
} from "@/services/overview.service";
import {
  AI_RECOMMENDATION_OPTIONS,
  AI_STATUS_OPTIONS,
  FIELD_TYPE_OPTIONS,
  MILESTONE_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  RACI_OPTIONS,
  RISK_IMPACT_OPTIONS,
  RISK_LIKELIHOOD_OPTIONS,
  RISK_STATUS_OPTIONS,
} from "./constants";

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-sm mb-1.5 block font-medium text-secondary">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
  id,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-custom-border-200 bg-custom-background-100 text-sm focus:border-custom-primary-100 w-full rounded-md border px-3 py-2 text-primary outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ModalFooter({
  onClose,
  isSubmitting,
  isEdit,
}: {
  onClose: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="border-custom-border-200 flex justify-end gap-2 border-t px-5 py-4">
      <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
        {isEdit ? "Update" : "Create"}
      </Button>
    </div>
  );
}

type TBaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// ── Deliverable ─────────────────────────────────────────────────

type TDeliverableModalProps = TBaseModalProps & {
  data?: IDeliverable | null;
  onSubmit: (payload: TDeliverablePayload) => Promise<void>;
};

export function DeliverableModal(props: TDeliverableModalProps) {
  const { isOpen, onClose, data, onSubmit } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TDeliverablePayload>({
    defaultValues: { title: "", description: "", priority: "medium", completed: false, due_date: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      title: data?.title ?? "",
      description: data?.description ?? "",
      priority: data?.priority ?? "medium",
      completed: data?.completed ?? false,
      due_date: data?.due_date ?? "",
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TDeliverablePayload) => {
    try {
      await onSubmit({
        ...formData,
        due_date: formData.due_date || null,
      });
      onClose();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: data ? "Deliverable updated." : "Deliverable created.",
      });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save deliverable." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit deliverable" : "Add deliverable"}</h3>
          <div>
            <FieldLabel required>Title</FieldLabel>
            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field }) => <Input {...field} className="w-full" hasError={Boolean(errors.title)} />}
            />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <Controller
              control={control}
              name="description"
              render={({ field }) => <TextArea {...field} className="min-h-20 w-full" />}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Priority</FieldLabel>
              <Controller
                control={control}
                name="priority"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value || "medium"} onChange={onChange} options={PRIORITY_OPTIONS} />
                )}
              />
            </div>
            <div>
              <FieldLabel>Due date</FieldLabel>
              <Controller
                control={control}
                name="due_date"
                render={({ field }) => <Input {...field} value={field.value ?? ""} type="date" className="w-full" />}
              />
            </div>
          </div>
          <Controller
            control={control}
            name="completed"
            render={({ field: { value, onChange } }) => (
              <label htmlFor="deliverable-completed" className="text-sm flex items-center gap-2 text-secondary">
                <Checkbox id="deliverable-completed" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                Completed
              </label>
            )}
          />
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── Milestone ───────────────────────────────────────────────────

type TMilestoneModalProps = TBaseModalProps & {
  data?: IMilestone | null;
  onSubmit: (payload: TMilestonePayload) => Promise<void>;
};

export function MilestoneModal(props: TMilestoneModalProps) {
  const { isOpen, onClose, data, onSubmit } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TMilestonePayload>({
    defaultValues: { name: "", description: "", status: "pending", definition_of_done: "", due_date: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: data?.name ?? "",
      description: data?.description ?? "",
      status: data?.status ?? "pending",
      definition_of_done: data?.definition_of_done ?? "",
      due_date: data?.due_date ?? "",
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TMilestonePayload) => {
    try {
      await onSubmit({ ...formData, due_date: formData.due_date || null });
      onClose();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: data ? "Milestone updated." : "Milestone created.",
      });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save milestone." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit milestone" : "Add milestone"}</h3>
          <div>
            <FieldLabel required>Name</FieldLabel>
            <Controller
              control={control}
              name="name"
              rules={{ required: true }}
              render={({ field }) => <Input {...field} className="w-full" hasError={Boolean(errors.name)} />}
            />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <Controller
              control={control}
              name="description"
              render={({ field }) => <TextArea {...field} className="min-h-20 w-full" />}
            />
          </div>
          <div>
            <FieldLabel>Definition of done</FieldLabel>
            <Controller
              control={control}
              name="definition_of_done"
              render={({ field }) => <TextArea {...field} className="min-h-20 w-full" />}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value || "pending"} onChange={onChange} options={MILESTONE_STATUS_OPTIONS} />
                )}
              />
            </div>
            <div>
              <FieldLabel>Due date</FieldLabel>
              <Controller
                control={control}
                name="due_date"
                render={({ field }) => <Input {...field} value={field.value ?? ""} type="date" className="w-full" />}
              />
            </div>
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── Risk ────────────────────────────────────────────────────────

type TRiskModalProps = TBaseModalProps & {
  projectId: string;
  data?: IRisk | null;
  onSubmit: (payload: TRiskPayload) => Promise<void>;
};

export function RiskModal(props: TRiskModalProps) {
  const { isOpen, onClose, data, onSubmit, projectId } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TRiskPayload>({
    defaultValues: {
      description: "",
      impact: "medium",
      likelihood: "medium",
      mitigation: "",
      status: "identified",
      owner_id: null,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      description: data?.description ?? "",
      impact: data?.impact ?? "medium",
      likelihood: data?.likelihood ?? "medium",
      mitigation: data?.mitigation ?? "",
      status: data?.status ?? "identified",
      owner_id: data?.owner_id ?? null,
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TRiskPayload) => {
    try {
      await onSubmit(formData);
      onClose();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: data ? "Risk updated." : "Risk created." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save risk." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit risk" : "Add risk"}</h3>
          <div>
            <FieldLabel required>Description</FieldLabel>
            <Controller
              control={control}
              name="description"
              rules={{ required: true }}
              render={({ field }) => (
                <TextArea {...field} className="min-h-20 w-full" hasError={Boolean(errors.description)} />
              )}
            />
          </div>
          <div>
            <FieldLabel>Mitigation</FieldLabel>
            <Controller
              control={control}
              name="mitigation"
              render={({ field }) => <TextArea {...field} className="min-h-16 w-full" />}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <FieldLabel>Impact</FieldLabel>
              <Controller
                control={control}
                name="impact"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value || "medium"} onChange={onChange} options={RISK_IMPACT_OPTIONS} />
                )}
              />
            </div>
            <div>
              <FieldLabel>Likelihood</FieldLabel>
              <Controller
                control={control}
                name="likelihood"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value || "medium"} onChange={onChange} options={RISK_LIKELIHOOD_OPTIONS} />
                )}
              />
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value || "identified"} onChange={onChange} options={RISK_STATUS_OPTIONS} />
                )}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Owner</FieldLabel>
            <Controller
              control={control}
              name="owner_id"
              render={({ field: { value, onChange } }) => (
                <MemberDropdown
                  projectId={projectId}
                  value={value ?? null}
                  onChange={(memberId) => onChange(memberId || null)}
                  placeholder="Select owner"
                  multiple={false}
                  buttonVariant="border-with-text"
                />
              )}
            />
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── RACI ────────────────────────────────────────────────────────

type TRaciModalProps = TBaseModalProps & {
  projectId: string;
  data?: IRaciAssignment | null;
  onSubmit: (payload: TRaciPayload) => Promise<void>;
};

export function RaciModal(props: TRaciModalProps) {
  const { isOpen, onClose, data, onSubmit, projectId } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TRaciPayload>({
    defaultValues: { area: "", user_id: "", responsibility: "responsible", notes: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      area: data?.area ?? "",
      user_id: data?.user_id ?? "",
      responsibility: data?.responsibility ?? "responsible",
      notes: data?.notes ?? "",
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TRaciPayload) => {
    try {
      await onSubmit(formData);
      onClose();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: data ? "RACI updated." : "RACI created." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save RACI assignment." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit RACI" : "Add RACI assignment"}</h3>
          <div>
            <FieldLabel required>Area</FieldLabel>
            <Controller
              control={control}
              name="area"
              rules={{ required: true }}
              render={({ field }) => <Input {...field} className="w-full" hasError={Boolean(errors.area)} />}
            />
          </div>
          <div>
            <FieldLabel required>Member</FieldLabel>
            <Controller
              control={control}
              name="user_id"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <MemberDropdown
                  projectId={projectId}
                  value={value || null}
                  onChange={(memberId) => onChange(memberId ?? "")}
                  placeholder="Select member"
                  multiple={false}
                  buttonVariant="border-with-text"
                />
              )}
            />
            {errors.user_id && <p className="text-xs text-red-500 mt-1">Member is required</p>}
          </div>
          <div>
            <FieldLabel>Responsibility</FieldLabel>
            <Controller
              control={control}
              name="responsibility"
              render={({ field: { value, onChange } }) => (
                <SelectField value={value || "responsible"} onChange={onChange} options={RACI_OPTIONS} />
              )}
            />
          </div>
          <div>
            <FieldLabel>Notes</FieldLabel>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => <TextArea {...field} className="min-h-16 w-full" />}
            />
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── Timeline ────────────────────────────────────────────────────

type TTimelineModalProps = TBaseModalProps & {
  data?: ITimelineItem | null;
  milestones?: IMilestone[];
  onSubmit: (payload: TTimelinePayload) => Promise<void>;
};

export function TimelineModal(props: TTimelineModalProps) {
  const { isOpen, onClose, data, onSubmit, milestones = [] } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TTimelinePayload>({
    defaultValues: { title: "", target_date: "", milestone_id: null, notes: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      title: data?.title ?? "",
      target_date: data?.target_date ?? "",
      milestone_id: data?.milestone_id ?? null,
      notes: data?.notes ?? "",
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TTimelinePayload) => {
    try {
      await onSubmit({
        ...formData,
        milestone_id: formData.milestone_id || null,
      });
      onClose();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: data ? "Timeline item updated." : "Timeline item created.",
      });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save timeline item." });
    }
  };

  const milestoneOptions = [{ value: "", label: "None" }, ...milestones.map((m) => ({ value: m.id, label: m.name }))];

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit timeline item" : "Add timeline item"}</h3>
          <div>
            <FieldLabel required>Title</FieldLabel>
            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field }) => <Input {...field} className="w-full" hasError={Boolean(errors.title)} />}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Target date</FieldLabel>
              <Controller
                control={control}
                name="target_date"
                rules={{ required: true }}
                render={({ field }) => (
                  <Input {...field} type="date" className="w-full" hasError={Boolean(errors.target_date)} />
                )}
              />
            </div>
            <div>
              <FieldLabel>Milestone</FieldLabel>
              <Controller
                control={control}
                name="milestone_id"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value ?? ""} onChange={(v) => onChange(v || null)} options={milestoneOptions} />
                )}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Notes</FieldLabel>
            <Controller
              control={control}
              name="notes"
              render={({ field }) => <TextArea {...field} className="min-h-16 w-full" />}
            />
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── Field schema ────────────────────────────────────────────────

type TFieldSchemaModalProps = TBaseModalProps & {
  data?: IProjectFieldSchema | null;
  onSubmit: (payload: TFieldSchemaPayload) => Promise<void>;
};

export function FieldSchemaModal(props: TFieldSchemaModalProps) {
  const { isOpen, onClose, data, onSubmit } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TFieldSchemaPayload>({
    defaultValues: { name: "", description: "", field_type: "text", is_required: false },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: data?.name ?? "",
      description: data?.description ?? "",
      field_type: data?.field_type ?? "text",
      is_required: data?.is_required ?? false,
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TFieldSchemaPayload) => {
    try {
      await onSubmit(formData);
      onClose();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: data ? "Field updated." : "Field created." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save field." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit field" : "Add project field"}</h3>
          <div>
            <FieldLabel required>Name</FieldLabel>
            <Controller
              control={control}
              name="name"
              rules={{ required: true }}
              render={({ field }) => <Input {...field} className="w-full" hasError={Boolean(errors.name)} />}
            />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <Controller
              control={control}
              name="description"
              render={({ field }) => <TextArea {...field} className="min-h-16 w-full" />}
            />
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <Controller
              control={control}
              name="field_type"
              render={({ field: { value, onChange } }) => (
                <SelectField value={value || "text"} onChange={onChange} options={FIELD_TYPE_OPTIONS} />
              )}
            />
          </div>
          <Controller
            control={control}
            name="is_required"
            render={({ field: { value, onChange } }) => (
              <label htmlFor="field-required" className="text-sm flex items-center gap-2 text-secondary">
                <Checkbox id="field-required" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
                Required
              </label>
            )}
          />
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── Field value ─────────────────────────────────────────────────

type TFieldValueModalProps = TBaseModalProps & {
  schema: IProjectFieldSchema;
  data?: IProjectFieldValue | null;
  onSubmit: (value: Record<string, unknown>) => Promise<void>;
};

export function FieldValueModal(props: TFieldValueModalProps) {
  const { isOpen, onClose, schema, data, onSubmit } = props;
  const existing =
    typeof data?.value?.text === "string"
      ? data.value.text
      : typeof data?.value?.content === "string"
        ? data.value.content
        : data?.value
          ? JSON.stringify(data.value)
          : "";

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{ content: string }>({ defaultValues: { content: "" } });

  useEffect(() => {
    if (!isOpen) return;
    reset({ content: existing });
  }, [isOpen, existing, reset]);

  const submit = async (formData: { content: string }) => {
    try {
      const type = schema.field_type;
      let value: Record<string, unknown>;
      if (type === "number") value = { number: Number(formData.content) || 0 };
      else if (type === "date") value = { date: formData.content };
      else if (type === "url") value = { url: formData.content };
      else value = { text: formData.content };

      await onSubmit(value);
      onClose();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "Field value saved." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save field value." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">Set value — {schema.name}</h3>
          <div>
            <FieldLabel>Value</FieldLabel>
            <Controller
              control={control}
              name="content"
              render={({ field }) =>
                schema.field_type === "rich_text" || schema.field_type === "checklist" ? (
                  <TextArea {...field} className="min-h-24 w-full" />
                ) : (
                  <Input
                    {...field}
                    type={schema.field_type === "number" ? "number" : schema.field_type === "date" ? "date" : "text"}
                    className="w-full"
                  />
                )
              }
            />
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}

// ── AI Evaluation ───────────────────────────────────────────────

type TAIEvaluationModalProps = TBaseModalProps & {
  data?: IProjectAIEvaluation | null;
  onSubmit: (payload: TProjectAIEvaluationUpsert) => Promise<void>;
};

export function AIEvaluationModal(props: TAIEvaluationModalProps) {
  const { isOpen, onClose, data, onSubmit } = props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TProjectAIEvaluationUpsert>({
    defaultValues: { score: null, analysis: "", status: "completed", recommendation: "review_needed" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      score: data?.score ?? null,
      analysis: data?.analysis ?? "",
      status: data?.status ?? "completed",
      recommendation: data?.recommendation || "review_needed",
      screened_at: data?.screened_at ?? new Date().toISOString(),
    });
  }, [isOpen, data, reset]);

  const submit = async (formData: TProjectAIEvaluationUpsert) => {
    try {
      await onSubmit({
        ...formData,
        score:
          formData.score === null || formData.score === undefined || Number.isNaN(Number(formData.score))
            ? null
            : Number(formData.score),
        screened_at: formData.screened_at || new Date().toISOString(),
      });
      onClose();
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Success", message: "AI evaluation saved." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to save AI evaluation." });
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4 p-5">
          <h3 className="text-lg font-medium text-primary">{data ? "Edit AI evaluation" : "Add AI evaluation"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Score (0–5)</FieldLabel>
              <Controller
                control={control}
                name="score"
                render={({ field: { value, onChange } }) => (
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
                    className="w-full"
                  />
                )}
              />
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange } }) => (
                  <SelectField value={value || "completed"} onChange={onChange} options={AI_STATUS_OPTIONS} />
                )}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Recommendation</FieldLabel>
            <Controller
              control={control}
              name="recommendation"
              render={({ field: { value, onChange } }) => (
                <SelectField value={value || "review_needed"} onChange={onChange} options={AI_RECOMMENDATION_OPTIONS} />
              )}
            />
          </div>
          <div>
            <FieldLabel>Analysis</FieldLabel>
            <Controller
              control={control}
              name="analysis"
              render={({ field }) => <TextArea {...field} value={field.value ?? ""} className="min-h-28 w-full" />}
            />
          </div>
        </div>
        <ModalFooter onClose={onClose} isSubmitting={isSubmitting} isEdit={Boolean(data)} />
      </form>
    </ModalCore>
  );
}
