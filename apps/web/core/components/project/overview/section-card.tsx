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
    <div className="bg-custom-background-100 border-custom-border-200 hover:border-custom-border-300 rounded-xl border p-5 transition-colors">
      <div className="border-custom-border-100 mb-4 flex items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="bg-custom-background-90 border-custom-border-200 flex size-7 items-center justify-center rounded-md border">
              <Icon className="size-3.5 text-secondary" />
            </div>
          )}
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          {count !== undefined && (
            <span className="bg-custom-background-90 text-2xs border-custom-border-200 inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-tertiary">
              {count}
            </span>
          )}
        </div>
        {canEdit && onAdd && (
          <Button variant="secondary" size="sm" onClick={onAdd} className="!px-2.5">
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
  return (
    <div className="flex flex-col items-center py-8">
      <p className="text-sm text-center text-tertiary">{children}</p>
    </div>
  );
}
