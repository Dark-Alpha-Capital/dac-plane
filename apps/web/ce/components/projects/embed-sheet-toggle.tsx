/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useLocalStorage } from "@plane/hooks";
import { IconButton } from "@plane/propel/icon-button";
import { SidePanelIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { EMBED_SHEET_LOCAL_STORAGE_KEY } from "@/components/embed-sheet/config";

export const EmbedSheetToggle = observer(function EmbedSheetToggle() {
  const { storedValue: isOpen, setValue: setIsOpen } = useLocalStorage<boolean>(EMBED_SHEET_LOCAL_STORAGE_KEY, false);

  return (
    <IconButton
      variant="ghost"
      size="lg"
      className={cn({ "bg-surface-hover": isOpen })}
      data-embed-sheet-toggle
      icon={SidePanelIcon}
      onClick={() => setIsOpen(!isOpen)}
    />
  );
});
