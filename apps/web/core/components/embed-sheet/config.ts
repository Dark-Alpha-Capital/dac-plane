/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

export const EMBED_SHEET_URL = "https://projects.darkalphacapital.com/project-kickoff";

export const EMBED_SHEET_WIDTH = "45vw";

export const EMBED_SHEET_LOCAL_STORAGE_KEY = "embedSheetOpen";

export const EMBED_SHEET_MESSAGE_TYPES = {
  INIT: "PLANE_EMBED_INIT",
  CREATE_PROJECT: "PLANE_EMBED_CREATE_PROJECT",
  CREATE_PROJECT_RESULT: "PLANE_EMBED_CREATE_PROJECT_RESULT",
} as const;

export const EMBED_EXTERNAL_SOURCE = "embed-kickoff";
