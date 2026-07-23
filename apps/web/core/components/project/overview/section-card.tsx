/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@plane/propel/button";

type TSectionCardProps = {
  title: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  canEdit?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
};

export function SectionCard(props: TSectionCardProps) {
  const { title, count, icon: Icon, canEdit, onAdd, addLabel = "Add", children } = props;

  return (
    <div className="border-custom-border-200 bg-custom-background-100 rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-secondary" />}
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          {count !== undefined && <span className="text-xs text-tertiary">{count}</span>}
        </div>
        {canEdit && onAdd && (
          <Button variant="secondary" size="sm" onClick={onAdd} className="!px-2">
            <Plus className="size-3.5" />
            {addLabel}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

export function EmptyMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm py-4 text-center text-tertiary">{children}</p>;
}
