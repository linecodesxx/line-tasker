import { useCallback, useEffect, useState } from "react";

export type ContextMenuState<T = void> = {
  x: number;
  y: number;
  payload: T;
} | null;

export function useContextMenu<T = void>() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState<T>>(null);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    if (!contextMenu) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", closeContextMenu, true);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("resize", closeContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, [closeContextMenu, contextMenu]);

  const openContextMenu = useCallback(
    (event: React.MouseEvent, payload: T) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        payload,
      });
    },
    [],
  );

  return { contextMenu, openContextMenu, closeContextMenu };
}
