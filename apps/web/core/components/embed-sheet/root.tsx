/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useRef, useCallback } from "react";
import { observer } from "mobx-react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { useLocalStorage } from "@plane/hooks";
import { CloseIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { handleCreateProjectFromKickoff, handleUpsertAIEvaluation } from "./bridge";
import {
  EMBED_SHEET_URL,
  EMBED_SHEET_WIDTH,
  EMBED_SHEET_LOCAL_STORAGE_KEY,
  EMBED_SHEET_MESSAGE_TYPES,
  EMBED_EXTERNAL_SOURCE,
} from "./config";

export const EmbedSheet = observer(function EmbedSheet() {
  const { workspaceSlug } = useParams();
  const sheetRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { storedValue: isOpen, setValue: setIsOpen } = useLocalStorage<boolean>(EMBED_SHEET_LOCAL_STORAGE_KEY, false);

  const closeSheet = useCallback(() => setIsOpen(false), [setIsOpen]);

  const slug = workspaceSlug?.toString() ?? "";
  const embedUrl = `${EMBED_SHEET_URL}?workspaceSlug=${encodeURIComponent(slug)}`;

  const sendToIframe = useCallback((message: unknown) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, "*");
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    sendToIframe({
      type: EMBED_SHEET_MESSAGE_TYPES.INIT,
      workspaceSlug: slug,
    });
  }, [sendToIframe, slug]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;

      const message = event.data || {};
      const { type, requestId } = message;
      // Accept nested `data` (preferred) or top-level fields for backwards compatibility.
      const data = message.data ?? message;

      if (type === EMBED_SHEET_MESSAGE_TYPES.CREATE_PROJECT) {
        try {
          const kickoff = data.kickoff ?? {};
          const projectName = kickoff.projectName ?? data.name ?? "Untitled Project";
          const result = await handleCreateProjectFromKickoff({
            workspaceSlug: slug,
            name: projectName,
            identifier:
              data.identifier ?? String(projectName).substring(0, 5).toUpperCase().replace(/\s/g, "") ?? "PROJ",
            kickoff: {
              projectName,
              ...kickoff,
            },
            externalSource: EMBED_EXTERNAL_SOURCE,
            externalId: data.externalId,
          });
          sendToIframe({
            type: EMBED_SHEET_MESSAGE_TYPES.CREATE_PROJECT_RESULT,
            requestId,
            success: true,
            project: result.project,
            results: result.results,
          });
        } catch (error) {
          sendToIframe({
            type: EMBED_SHEET_MESSAGE_TYPES.CREATE_PROJECT_RESULT,
            requestId,
            success: false,
            error: error instanceof Error ? error.message : "Failed to create project",
          });
        }
      }

      if (type === EMBED_SHEET_MESSAGE_TYPES.UPSERT_AI_EVALUATION) {
        try {
          const projectId = data.projectId as string | undefined;
          if (!projectId) {
            throw new Error("projectId is required to upsert AI evaluation");
          }
          const evaluation = await handleUpsertAIEvaluation({
            workspaceSlug: slug,
            projectId,
            score: typeof data.score === "number" ? data.score : null,
            analysis: typeof data.analysis === "string" ? data.analysis : "",
            status:
              data.status === "pending" || data.status === "failed" || data.status === "completed"
                ? data.status
                : "completed",
            externalId: typeof data.externalId === "string" ? data.externalId : null,
            screenedAt: typeof data.screenedAt === "string" ? data.screenedAt : null,
          });
          sendToIframe({
            type: EMBED_SHEET_MESSAGE_TYPES.UPSERT_AI_EVALUATION_RESULT,
            requestId,
            success: true,
            evaluation,
          });
        } catch (error) {
          sendToIframe({
            type: EMBED_SHEET_MESSAGE_TYPES.UPSERT_AI_EVALUATION_RESULT,
            requestId,
            success: false,
            error: error instanceof Error ? error.message : "Failed to save AI evaluation",
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [slug, sendToIframe]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeSheet();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSheet]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (!isOpen) return;
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        const toggleElement = event.target.closest("[data-embed-sheet-toggle]");
        if (!toggleElement) {
          closeSheet();
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, closeSheet]);

  const portalContainer = document.getElementById("full-screen-portal") as HTMLElement;

  if (!portalContainer) return null;

  return createPortal(
    <div
      ref={sheetRef}
      className={cn(
        "absolute top-0 right-0 z-[20] flex h-full flex-col overflow-hidden border-l border-subtle bg-surface-1 transition-all duration-300 ease-in-out",
        {
          "translate-x-0 opacity-100": isOpen,
          "pointer-events-none translate-x-full opacity-0": !isOpen,
        }
      )}
      style={{ width: EMBED_SHEET_WIDTH }}
    >
      <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
        <h3 className="text-sm font-medium">External Tools</h3>
        <button
          type="button"
          className="text-subtle hover:bg-surface-hover grid size-7 place-items-center rounded-sm hover:text-primary"
          onClick={closeSheet}
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={isOpen ? embedUrl : undefined}
        className="size-full flex-1 border-0"
        title="Embedded external tools"
        // eslint-disable-next-line react/iframe-missing-sandbox
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={handleIframeLoad}
      />
    </div>,
    portalContainer
  );
});
