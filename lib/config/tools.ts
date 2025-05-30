import { FileCode, Wrench, LucideIcon } from 'lucide-react';

export type ToolStatus = 'active' | 'coming-soon' | 'experimental';

export type ToolCategory = 'calldata' | 'contract' | 'transaction' | 'utility';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  status: ToolStatus;
  category: ToolCategory;
  keywords?: string[];
  shortcut?: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'decoder',
    title: 'Calldata Decoder',
    description: 'Decode Ethereum transaction calldata into human-readable format',
    icon: FileCode,
    href: '/calldata/decoder',
    status: 'active',
    category: 'calldata',
    keywords: ['decode', 'calldata', 'transaction', 'hex', 'abi'],
    shortcut: 'cmd+d',
  },
  {
    id: 'encoder',
    title: 'Calldata Encoder',
    description: 'Encode function calls and parameters into calldata',
    icon: Wrench,
    href: '/calldata/encoder',
    status: 'active',
    category: 'calldata',
    keywords: ['encode', 'calldata', 'function', 'abi', 'parameters'],
    shortcut: 'cmd+e',
  },
];

export const getToolById = (id: string): Tool | undefined => {
  return TOOLS.find((tool) => tool.id === id);
};

export const getToolsByCategory = (category: ToolCategory): Tool[] => {
  return TOOLS.filter((tool) => tool.category === category);
};

export const getActiveTools = (): Tool[] => {
  return TOOLS.filter((tool) => tool.status === 'active');
};
