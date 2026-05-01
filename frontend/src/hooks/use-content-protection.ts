'use client';
/**
 * useContentProtection — hook que dificulta cópia/captura de conteúdo.
 *
 * SECURITY: Estas medidas são DETERRENTES, não infalíveis. Atacantes
 * determinados podem usar emuladores ou DevTools.
 * A defesa de fato vem da WATERMARK FORENSE (server-side), que permite
 * identificar a origem de qualquer mídia vazada.
 */
import { useEffect } from 'react';

export function useContentProtection(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const protectedRoot = target.closest('.protected');
      if (protectedRoot) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen';
      const isSave  = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
      const isCopy  = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c';
      const isView  = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u';
      const isDevtools =
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()));

      if (isPrintScreen || isSave || isPrint || isView || isDevtools) {
        e.preventDefault();
        if (isPrintScreen) {
          // Best-effort: limpa clipboard.
          navigator.clipboard?.writeText('').catch(() => {});
        }
      }
      const protectedFocused = (e.target as HTMLElement | null)?.closest('.protected');
      if (isCopy && protectedFocused) e.preventDefault();
    };

    const onDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.protected')) e.preventDefault();
    };

    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('.protected') && !target.closest('[data-interactive="true"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown',     onKeyDown);
    document.addEventListener('dragstart',   onDragStart);
    document.addEventListener('selectstart', onSelectStart);

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown',     onKeyDown);
      document.removeEventListener('dragstart',   onDragStart);
      document.removeEventListener('selectstart', onSelectStart);
    };
  }, []);
}
