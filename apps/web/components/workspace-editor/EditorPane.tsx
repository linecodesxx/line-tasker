"use client";

import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { EditorState, type Extension } from "@codemirror/state";
import type { DraftState, WorkspaceFile } from "./types";

type EditorPaneProps = {
  activeFile: WorkspaceFile | null;
  draft: DraftState | null;
  onChange: (fileId: string, value: string) => void;
  onSave: (fileId: string) => void | Promise<void>;
};

function getFileKindLabel(kind: WorkspaceFile["kind"]) {
  switch (kind) {
    case "note":
      return "заметка";
    case "task":
      return "задача";
    default:
      return "системный";
  }
}

function getSubtitleLabel(file: WorkspaceFile) {
  if (file.kind === "task") {
    switch (file.subtitle) {
      case "DONE":
        return "готово";
      case "IN_PROGRESS":
        return "в работе";
      case "TODO":
        return "к выполнению";
      default:
        return file.subtitle;
    }
  }

  return file.subtitle;
}

function buildExtensions(file: WorkspaceFile): Extension[] {
  const extensions: Extension[] = [
    EditorView.lineWrapping,
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "14px",
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
        lineHeight: "1.7",
      },
      ".cm-content": {
        padding: "20px",
        minHeight: "100%",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-editor": {
        height: "100%",
      },
      ".cm-gutters": {
        borderRight: "1px solid transparent",
        backgroundColor: "transparent",
      },
    }),
  ];

  if (file.kind === "note" || file.kind === "meta") {
    extensions.push(markdown());
  }

  if (file.kind === "meta") {
    extensions.push(EditorState.readOnly.of(true));
  }

  return extensions;
}

function renderSaveBadge(
  file: WorkspaceFile,
  draft: DraftState,
) {
  if (file.kind === "meta") {
    return {
      label: "Только чтение",
      className: "border-neutral-200 bg-neutral-50 text-neutral-600",
    };
  }

  switch (draft.saveStatus) {
    case "saving":
      return {
        label: "Сохраняем...",
        className: "border-sky-200 bg-sky-50 text-sky-700",
      };
    case "saved":
      return {
        label: "Сохранено",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "error":
      return {
        label: "Ошибка",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    default:
      return {
        label: draft.isDirty ? "Не сохранено" : "Без изменений",
        className: draft.isDirty
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-600",
      };
  }
}

export function EditorPane({
  activeFile,
  draft,
  onChange,
  onSave,
}: EditorPaneProps) {
  if (!activeFile || !draft) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-neutral-500">
        Выберите файл слева, чтобы открыть его в редакторе.
      </div>
    );
  }

  const extensions = buildExtensions(activeFile);
  const saveBadge = renderSaveBadge(activeFile, draft);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            {activeFile.path}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{activeFile.name}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
            {getFileKindLabel(activeFile.kind)}
          </span>

          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
            {getSubtitleLabel(activeFile)}
          </span>

          <span className={`rounded-full border px-3 py-1.5 ${saveBadge.className}`}>
            {saveBadge.label}
          </span>

          {activeFile.kind !== "meta" ? (
            <button
              type="button"
              onClick={() => void onSave(activeFile.id)}
              disabled={!draft.isDirty || draft.saveStatus === "saving"}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Сохранить
            </button>
          ) : null}
        </div>
      </div>

      {draft.errorMessage ? (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {draft.errorMessage}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror
          value={draft.value}
          height="100%"
          extensions={extensions}
          onChange={(value) => {
            if (activeFile.kind === "meta") return;
            onChange(activeFile.id, value);
          }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            history: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
          }}
          className="h-full"
        />
      </div>
    </>
  );
}
