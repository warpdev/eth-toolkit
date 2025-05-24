'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';
import type { DecodedEventLog } from '@/lib/types/transaction-types';

interface EventLogsDisplayProps {
  logs: DecodedEventLog[];
}

export const EventLogsDisplay = React.memo(function EventLogsDisplay({
  logs,
}: EventLogsDisplayProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const expandAll = () => {
    setExpandedLogs(new Set(logs.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedLogs(new Set());
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Logs ({logs.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.map((log, index) => {
          const isExpanded = expandedLogs.has(index);

          return (
            <div key={index} className="rounded-lg border bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium">
                    Log #{log.logIndex}
                  </span>
                  {log.eventName && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      {log.eventName}
                    </span>
                  )}
                  {log.removed && (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                      Removed
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleLogExpansion(index)}>
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {/* Contract Address */}
              <div className="mb-2">
                <label className="text-muted-foreground text-xs font-medium">Contract</label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded border bg-white px-2 py-1 font-mono text-xs">
                    {log.address}
                  </code>
                  <CopyButton text={log.address} />
                </div>
              </div>

              {/* Event Signature */}
              {log.signature && (
                <div className="mb-2">
                  <label className="text-muted-foreground text-xs font-medium">Signature</label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded border bg-white px-2 py-1 font-mono text-xs">
                      {log.signature}
                    </code>
                    <CopyButton text={log.signature} />
                  </div>
                </div>
              )}

              {isExpanded && (
                <div className="mt-3 space-y-3 border-t pt-3">
                  {/* Topics */}
                  {log.topics.length > 0 && (
                    <div>
                      <label className="text-muted-foreground text-xs font-medium">
                        Topics ({log.topics.length})
                      </label>
                      <div className="mt-1 space-y-1">
                        {log.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2">
                            <span className="text-muted-foreground w-8 text-xs">
                              [{topicIndex}]
                            </span>
                            <code className="flex-1 rounded border bg-white px-2 py-1 font-mono text-xs">
                              {topic}
                            </code>
                            <CopyButton text={topic} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data */}
                  {log.data && log.data !== '0x' && (
                    <div>
                      <label className="text-muted-foreground text-xs font-medium">Data</label>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="flex-1 rounded border bg-white px-2 py-1 font-mono text-xs break-all">
                          {log.data.length > 100 ? `${log.data.slice(0, 100)}...` : log.data}
                        </code>
                        <CopyButton text={log.data} />
                      </div>
                    </div>
                  )}

                  {/* Decoded Arguments */}
                  {log.args && Object.keys(log.args).length > 0 && (
                    <div>
                      <label className="text-muted-foreground text-xs font-medium">
                        Decoded Arguments
                      </label>
                      <div className="mt-1 space-y-1">
                        {Object.entries(log.args).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-muted-foreground min-w-16 text-xs font-medium">
                              {key}:
                            </span>
                            <code className="flex-1 rounded border bg-white px-2 py-1 font-mono text-xs">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </code>
                            <CopyButton text={String(value)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <div className="text-muted-foreground border-t pt-2 text-center text-xs">
          {logs.length} event log{logs.length !== 1 ? 's' : ''} found in this transaction
        </div>
      </CardContent>
    </Card>
  );
});
