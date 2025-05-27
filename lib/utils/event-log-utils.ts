import { decodeEventLog, parseEventLogs, type Abi, type Hex, type Log } from 'viem';
import type { DecodedEventLog, EventABI } from '@/lib/types';

/**
 * Decode event log data with ABI
 */
export function decodeEventLogWithAbi(
  log: { data: Hex; topics: Hex[] },
  abi: Abi | EventABI[]
): DecodedEventLog | null {
  try {
    const decoded = decodeEventLog({
      abi: abi as Abi,
      data: log.data,
      topics: log.topics as [] | [Hex, ...Hex[]],
      strict: false,
    });

    const eventAbi = (abi as EventABI[]).find((item) => item.name === decoded.eventName);
    const indexed: Record<string, boolean> = {};

    if (eventAbi) {
      eventAbi.inputs.forEach((input) => {
        indexed[input.name] = input.indexed;
      });
    }

    // Ensure args is a plain object
    const args = decoded.args
      ? Array.isArray(decoded.args)
        ? decoded.args.reduce((acc, val, idx) => ({ ...acc, [idx]: val }), {})
        : decoded.args
      : {};

    return {
      eventName: decoded.eventName || 'Unknown',
      args: args as Record<string, unknown>,
      indexed,
      raw: {
        data: log.data,
        topics: log.topics as Hex[],
      },
    };
  } catch (error) {
    console.error('Error decoding event log:', error);
    return null;
  }
}

/**
 * Decode multiple event logs
 */
export function decodeEventLogs(logs: Log[], abi: Abi | EventABI[]): DecodedEventLog[] {
  try {
    const parsedLogs = parseEventLogs({
      abi: abi as Abi,
      logs,
      strict: false,
    });

    return parsedLogs.map((log) => {
      const eventAbi = (abi as EventABI[]).find((item) => item.name === log.eventName);
      const indexed: Record<string, boolean> = {};

      if (eventAbi) {
        eventAbi.inputs.forEach((input) => {
          indexed[input.name] = input.indexed;
        });
      }

      // Ensure args is a plain object
      const args = log.args
        ? Array.isArray(log.args)
          ? log.args.reduce((acc, val, idx) => ({ ...acc, [idx]: val }), {})
          : log.args
        : {};

      return {
        eventName: log.eventName || 'Unknown',
        args: args as Record<string, unknown>,
        indexed,
        raw: {
          data: log.data || ('0x' as Hex),
          topics: log.topics as Hex[],
        },
      };
    });
  } catch (error) {
    console.error('Error decoding event logs:', error);
    return [];
  }
}

/**
 * Extract event signature from topics
 */
export function getEventSignature(topics: Hex[]): Hex | null {
  return topics.length > 0 ? topics[0] : null;
}

/**
 * Format event log for display
 */
export function formatEventLog(event: DecodedEventLog): string {
  const args = Object.entries(event.args)
    .map(([key, value]) => `${key}: ${formatArgValue(value)}`)
    .join(', ');

  return `${event.eventName}(${args})`;
}

/**
 * Format argument value for display
 */
function formatArgValue(value: unknown): string {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatArgValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Parse event ABI from string
 */
export function parseEventAbi(abiString: string): EventABI[] {
  try {
    const parsed = JSON.parse(abiString);
    const events = Array.isArray(parsed) ? parsed : [parsed];

    return events.filter((item) => item.type === 'event');
  } catch (error) {
    console.error('Error parsing event ABI:', error);
    return [];
  }
}

/**
 * Generate event ABI from signature text
 */
export function generateEventAbiFromSignature(signature: string): EventABI | null {
  try {
    // Parse signature like "Transfer(address indexed from, address indexed to, uint256 value)"
    const match = signature.match(/^(\w+)\((.*)\)$/);
    if (!match) return null;

    const [, eventName, paramsStr] = match;
    const params = paramsStr
      .split(',')
      .map((param) => param.trim())
      .filter(Boolean);

    const inputs = params.map((param) => {
      const parts = param.split(/\s+/);
      const indexed = parts.includes('indexed');
      const type = parts[0];
      const name = parts[parts.length - 1];

      return {
        name,
        type,
        indexed,
        internalType: type,
      };
    });

    return {
      type: 'event',
      name: eventName,
      inputs,
      anonymous: false,
    };
  } catch (error) {
    console.error('Error generating ABI from signature:', error);
    return null;
  }
}
