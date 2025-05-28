import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { eventLogHistoryAtom } from '../atoms/event-log-atoms';
import type { EventLogHistoryItem } from '@/lib/types/event-log-types';

export function useEventLogHistory() {
  const [history, setHistory] = useAtom(eventLogHistoryAtom);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const addToHistory = useCallback(
    (item: Omit<EventLogHistoryItem, 'id' | 'timestamp'>) => {
      try {
        const newItem: EventLogHistoryItem = {
          ...item,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };

        setHistory((prev) => {
          // Handle both sync and async values
          const currentHistory = Array.isArray(prev) ? prev : [];
          const filtered = currentHistory.filter((h: EventLogHistoryItem) => h.id !== newItem.id);
          return [newItem, ...filtered].slice(0, 20); // Keep last 20 items
        });
      } catch (error) {
        console.error('Failed to add item to history:', error);
        toast.error('Failed to save to history', {
          description: 'There was an error saving your event log to history. Please try again.',
        });
      }
    },
    [setHistory]
  );

  const removeFromHistory = useCallback(
    (id: string) => {
      try {
        setHistory((prev) => {
          // Handle both sync and async values
          const currentHistory = Array.isArray(prev) ? prev : [];
          return currentHistory.filter((item: EventLogHistoryItem) => item.id !== id);
        });
      } catch (error) {
        console.error('Failed to remove item from history:', error);
        toast.error('Failed to remove from history', {
          description: 'There was an error removing the item from history. Please try again.',
        });
      }
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    try {
      setHistory([]);
      toast.success('History cleared', {
        description: 'All event log history has been cleared.',
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history', {
        description: 'There was an error clearing the history. Please try again.',
      });
    }
  }, [setHistory]);

  const toggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen((prev) => !prev);
  }, [setIsHistoryPanelOpen]);

  // Handle potential storage errors when reading history
  const safeHistory = (() => {
    try {
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Failed to read history from storage:', error);
      return [];
    }
  })();

  return {
    history: safeHistory,
    isHistoryPanelOpen,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleHistoryPanel,
  };
}
