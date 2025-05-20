"use client";

import { useSetAtom } from "jotai";
import { abiStringAtom } from "@/lib/atoms/calldata-atoms";
import { SAMPLE_ABIS } from "@/lib/sample-data/sample-abis";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function AbiSelector() {
  const setAbiString = useSetAtom(abiStringAtom);

  const handleSelectAbi = (abiName: string) => {
    const abi =
      SAMPLE_ABIS[abiName as keyof typeof SAMPLE_ABIS];
    if (abi) {
      setAbiString(JSON.stringify(abi, null, 2));
    }
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium">
        Contract ABI
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-4">
            Sample ABIs
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.keys(SAMPLE_ABIS).map((abiName) => (
            <DropdownMenuItem
              key={abiName}
              onClick={() => handleSelectAbi(abiName)}
            >
              {abiName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
