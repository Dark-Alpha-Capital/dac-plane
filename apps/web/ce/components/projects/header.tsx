/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { ProjectsBaseHeader } from "@/components/project/header";
import { EmbedSheetToggle } from "./embed-sheet-toggle";

export function ProjectsListHeader() {
  return <ProjectsBaseHeader rightSlot={<EmbedSheetToggle />} />;
}
