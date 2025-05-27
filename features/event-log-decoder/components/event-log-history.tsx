'use client';

import { useEventLogHistory } from '../hooks/use-event-log-history';
import { Button } from '@/components/ui/button';
import { X, Trash2, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { transactionHashAtom, eventLogDataAtom, eventTopicsAtom } from '../atoms/event-log-atoms';
import { eventLogResultAtom } from '../atoms/event-log-atoms';

dayjs.extend(relativeTime);

export function EventLogHistory() {
  const { history, isHistoryPanelOpen, toggleHistoryPanel, removeFromHistory, clearHistory } =
    useEventLogHistory();

  const [, setTransactionHash] = useAtom(transactionHashAtom);
  const [, setEventLogData] = useAtom(eventLogDataAtom);
  const [, setEventTopics] = useAtom(eventTopicsAtom);
  const [, setEventLogResult] = useAtom(eventLogResultAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleHistoryItemClick = useCallback(
    (item: (typeof history)[0]) => {
      if (item.transactionHash) {
        setTransactionHash(item.transactionHash);
      } else if (item.logData && item.topics) {
        setEventLogData(item.logData);
        setEventTopics(item.topics.join('\n'));
      }
      setEventLogResult(item.result);
      toggleHistoryPanel();
    },
    [setTransactionHash, setEventLogData, setEventTopics, setEventLogResult, toggleHistoryPanel]
  );

  const historyItems = history.map((item) => (
    <div
      key={item.id}
      className="border-border hover:bg-muted/50 group cursor-pointer border-b p-4"
      onClick={() => handleHistoryItemClick(item)}
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="flex-1 truncate font-medium">
          {item.eventName || item.result.decodedEvents[0]?.eventName || 'Unknown Event'}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            removeFromHistory(item.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-muted-foreground mb-2 truncate text-sm">
        {item.transactionHash ? (
          <>
            Tx: {item.transactionHash.substring(0, 10)}...
            {item.transactionHash.substring(item.transactionHash.length - 8)}
          </>
        ) : item.topics && item.topics.length > 0 ? (
          <>
            Topic: {item.topics[0].substring(0, 10)}...
            {item.topics[0].substring(item.topics[0].length - 8)}
          </>
        ) : (
          'Raw Data'
        )}
      </div>

      <div className="text-muted-foreground flex items-center text-xs">
        <Clock className="mr-1 h-3 w-3" />
        {dayjs(item.timestamp).fromNow()}
      </div>
    </div>
  ));

  return (
    <>
      <Sheet open={isHistoryPanelOpen} onOpenChange={toggleHistoryPanel}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex h-8 w-full items-center gap-1 sm:w-auto"
          >
            <Clock className="h-4 w-4" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-[350px] flex-col p-0 sm:w-[450px]">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Event Log History</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            {history.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">No event log history yet.</div>
            ) : (
              historyItems
            )}
          </ScrollArea>
          {history.length > 0 && (
            <SheetFooter className="mt-auto border-t p-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear History</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to clear all event log history? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        clearHistory();
                        setIsDialogOpen(false);
                      }}
                    >
                      Clear History
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
