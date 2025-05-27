'use client';

import { useAtom } from 'jotai';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingButton } from '@/components/shared/loading-button';
import {
  transactionHashAtom,
  eventLogDataAtom,
  eventTopicsAtom,
  eventAbiAtom,
  isDecodingAtom,
  isFetchingLogsAtom,
} from '../atoms/event-log-atoms';
import { useEventLogDecoder } from '../hooks/use-event-log-decoder';
import { NetworkSelector } from '@/features/calldata-decoder/components/network-selector';

interface EventLogDecoderFormProps {
  showAbiInput?: boolean;
}

export function EventLogDecoderForm({ showAbiInput = false }: EventLogDecoderFormProps) {
  const [transactionHash, setTransactionHash] = useAtom(transactionHashAtom);
  const [eventLogData, setEventLogData] = useAtom(eventLogDataAtom);
  const [eventTopics, setEventTopics] = useAtom(eventTopicsAtom);
  const [eventAbi, setEventAbi] = useAtom(eventAbiAtom);
  const [isDecoding] = useAtom(isDecodingAtom);
  const [isFetching] = useAtom(isFetchingLogsAtom);

  const { decodeFromTransaction, decodeFromRawData } = useEventLogDecoder();

  const isLoading = isDecoding || isFetching;

  return (
    <Tabs defaultValue="transaction" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="transaction">Transaction Hash</TabsTrigger>
        <TabsTrigger value="raw">Raw Log Data</TabsTrigger>
      </TabsList>

      <TabsContent value="transaction" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="network">Network</Label>
          <NetworkSelector />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tx-hash">
            Transaction Hash
            <span className="sr-only"> (66 characters starting with 0x)</span>
          </Label>
          <Input
            id="tx-hash"
            placeholder="0x..."
            value={transactionHash}
            onChange={(e) => setTransactionHash(e.target.value)}
            aria-required="true"
            aria-describedby="tx-hash-desc"
          />
          <p id="tx-hash-desc" className="sr-only">
            Enter a 66-character Ethereum transaction hash starting with 0x
          </p>
        </div>

        {showAbiInput && (
          <div className="space-y-2">
            <Label htmlFor="event-abi">Event ABI (JSON)</Label>
            <Textarea
              id="event-abi"
              placeholder='[{"type": "event", "name": "Transfer", "inputs": [...]}]'
              className="h-32 font-mono text-sm"
              value={eventAbi}
              onChange={(e) => setEventAbi(e.target.value)}
            />
          </div>
        )}

        <LoadingButton
          onClick={() => decodeFromTransaction(transactionHash)}
          isLoading={isLoading}
          disabled={!transactionHash || isLoading}
          className="w-full"
          aria-label={
            isFetching
              ? 'Fetching event logs from transaction'
              : 'Decode event logs from transaction'
          }
        >
          {isFetching ? 'Fetching Logs...' : 'Decode Event Logs'}
        </LoadingButton>
      </TabsContent>

      <TabsContent value="raw" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-data">
            Event Data (hex)
            <span className="sr-only"> hexadecimal format</span>
          </Label>
          <Input
            id="event-data"
            placeholder="0x..."
            value={eventLogData}
            onChange={(e) => setEventLogData(e.target.value)}
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-topics">
            Event Topics (one per line)
            <span className="sr-only"> separate each topic with a new line</span>
          </Label>
          <Textarea
            id="event-topics"
            placeholder="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef&#10;0x000000000000000000000000..."
            className="h-32 font-mono text-sm"
            value={eventTopics}
            onChange={(e) => setEventTopics(e.target.value)}
            aria-required="true"
            aria-describedby="topics-desc"
          />
          <p id="topics-desc" className="sr-only">
            Enter event topics in hexadecimal format, one per line or comma-separated
          </p>
        </div>

        {showAbiInput && (
          <div className="space-y-2">
            <Label htmlFor="event-abi-raw">Event ABI (JSON)</Label>
            <Textarea
              id="event-abi-raw"
              placeholder='[{"type": "event", "name": "Transfer", "inputs": [...]}]'
              className="h-32 font-mono text-sm"
              value={eventAbi}
              onChange={(e) => setEventAbi(e.target.value)}
            />
          </div>
        )}

        <LoadingButton
          onClick={decodeFromRawData}
          isLoading={isLoading}
          disabled={!eventLogData || !eventTopics || isLoading}
          className="w-full"
          aria-label="Decode event log from raw data"
        >
          Decode Event Log
        </LoadingButton>
      </TabsContent>
    </Tabs>
  );
}
