/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore } from "@plane/ui";

type TPlanningItemActionsProps = {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  deleteTitle?: string;
  deleteContent?: string;
};

export function PlanningItemActions(props: TPlanningItemActionsProps) {
  const {
    canEdit,
    onEdit,
    onDelete,
    deleteTitle = "Delete item",
    deleteContent = "Are you sure you want to delete this item? This action cannot be undone.",
  } = props;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!canEdit) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
      setIsDeleteOpen(false);
      setToast({ type: TOAST_TYPE.SUCCESS, title: "Deleted", message: "Item removed successfully." });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to delete item." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="rounded p-1 text-tertiary hover:bg-layer-1 hover:text-primary"
          aria-label="Edit"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="hover:text-red-500 rounded p-1 text-tertiary hover:bg-layer-1"
          aria-label="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <AlertModalCore
        isOpen={isDeleteOpen}
        handleClose={() => setIsDeleteOpen(false)}
        handleSubmit={handleDelete}
        isSubmitting={isDeleting}
        title={deleteTitle}
        content={deleteContent}
      />
    </>
  );
}
