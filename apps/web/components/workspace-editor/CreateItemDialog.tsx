"use client";

import * as Dialog from "@radix-ui/react-dialog";

type CreateItemDialogProps = {
  open: boolean;
  mode: "folder" | "note" | null;
  value: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
};

export function CreateItemDialog({
  open,
  mode,
  value,
  isSubmitting,
  onOpenChange,
  onValueChange,
  onSubmit,
}: CreateItemDialogProps) {
  const isFolder = mode === "folder";
  const title = isFolder ? "Создать папку" : "Создать файл";
  const description = isFolder
    ? "Введите название новой папки."
    : "Введите название нового файла.";
  const label = isFolder ? "Название папки" : "Название файла";
  const placeholder = isFolder ? "Дизайн" : "Заметки со встречи";
  const action = isFolder ? "Создать папку" : "Создать файл";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-semibold text-neutral-900">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-neutral-500">
            {description}
          </Dialog.Description>

          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmit();
            }}
          >
            <label className="block text-sm font-medium text-neutral-700">
              {label}
            </label>
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder={placeholder}
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900"
                >
                  Отмена
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={isSubmitting || !value.trim()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Создаем..." : action}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
