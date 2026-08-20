"use client";

import * as Dialog from "@radix-ui/react-dialog";

type CreateWorkspaceModalProps = {
  open: boolean;
  value: string;
  error?: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
};

export function CreateWorkspaceModal({
  open,
  value,
  error,
  isSubmitting,
  onOpenChange,
  onValueChange,
  onSubmit,
}: CreateWorkspaceModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-[0_24px_80px_rgba(10,10,10,0.18)] outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                New Workspace
              </p>
              <Dialog.Title className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
                Создать workspace
              </Dialog.Title>
              <Dialog.Description className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                Новый workspace создается пустым. Название можно изменить позже.
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-xl cursor-pointer border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
                aria-label="Закрыть"
              >
                x
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Структура
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Без дефолтных заметок, задач и папок. Только чистое пространство.
            </p>
          </div>

          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit();
            }}
          >
            <label htmlFor="workspace-title" className="block text-sm font-medium text-neutral-700">
              Название workspace
            </label>
            <input
              id="workspace-title"
              autoFocus
              type="text"
              maxLength={100}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder="Например: Личный, Клиент A, Research"
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            />

            {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-xl cursor-pointer border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900"
                >
                  Отмена
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={isSubmitting || !value.trim()}
                className="rounded-xl cursor-pointer bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Создание..." : "Создать workspace"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
