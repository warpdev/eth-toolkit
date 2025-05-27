import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { eventLogHistoryAtom } from '../atoms/event-log-atoms';
import type { EventLogHistoryItem } from '@/lib/types/event-log-types';

export function useEventLogHistory() {
  const [history, setHistory] = useAtom(eventLogHistoryAtom);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const addToHistory = useCallback(
    (item: Omit<EventLogHistoryItem, 'id' | 'timestamp'>) => {
      const newItem: EventLogHistoryItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.id !== newItem.id);
        return [newItem, ...filtered].slice(0, 20); // Keep last 20 items
      });
    },
    [setHistory]
  );

  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const toggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen((prev) => !prev);
  }, [setIsHistoryPanelOpen]);

  return {
    history,
    isHistoryPanelOpen,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleHistoryPanel,
  };
}
