"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { toast } from "sonner";
import { 
  calldataAtom, 
  abiStringAtom, 
  decodeModeAtom,
  isDecodingAtom,
  decodeErrorAtom
} from "@/lib/atoms/calldata-atoms";
import { decodedResultAtom } from "@/lib/atoms/decoder-result-atom";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDecodeCalldata } from "@/lib/hooks/use-decode-calldata";
import { AbiSelector } from "./abi-selector";
import { SavedAbiSelector } from "./saved-abi-selector";

interface DecoderFormProps {
  onDecodeSuccess?: () => void;
}

export const DecoderForm = React.memo(function DecoderForm({ onDecodeSuccess }: DecoderFormProps) {
  const [calldata, setCalldata] = useAtom(calldataAtom);
  const [abiString, setAbiString] = useAtom(abiStringAtom);
  const [decodeMode, setDecodeMode] = useAtom(decodeModeAtom);
  const isDecoding = useAtomValue(isDecodingAtom);
  const decodeError = useAtomValue(decodeErrorAtom);
  const setDecodedResult = useSetAtom(decodedResultAtom);
  
  const { decodeCalldata, parseAbi } = useDecodeCalldata();

  // When ABI string changes, try to parse it
  useEffect(() => {
    if (decodeMode === "abi" && abiString) {
      parseAbi();
    }
  }, [abiString, decodeMode, parseAbi]);

  // Create toast options object only when decodeError changes
  const errorToastOptions = useMemo(() => ({
    description: decodeError,
    duration: 5000
  }), [decodeError]);
  
  // Watch for decode errors and show toast
  useEffect(() => {
    if (decodeError) {
      toast.error("Decode Error", errorToastOptions);
    }
  }, [decodeError, errorToastOptions]);
  
  const handleDecode = useCallback(async () => {
    const result = await decodeCalldata();
    if (result) {
      setDecodedResult(result);
      
      // Show success toast
      if (!result.error) {
        const successToastOptions = {
          description: `Successfully decoded ${result.functionName}`,
          duration: 3000
        };
        toast.success("Calldata Decoded", successToastOptions);
        
        // Scroll to the result section
        if (onDecodeSuccess) {
          // Small delay to ensure result is rendered
          setTimeout(() => {
            onDecodeSuccess();
          }, 100);
        }
      }
    }
  }, [decodeCalldata, setDecodedResult, onDecodeSuccess]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calldata Decoder</CardTitle>
        <CardDescription>
          Decode Ethereum transaction calldata into human-readable format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Calldata
          </label>
          <Textarea 
            placeholder="Enter calldata hex string (e.g., 0x70a08231000000000000000000000000...)" 
            value={calldata}
            onChange={(e) => setCalldata(e.target.value)}
            className="font-mono h-32"
          />
        </div>

        <Tabs value={decodeMode} onValueChange={(value) => setDecodeMode(value as "signature" | "abi")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signature">Signature Lookup</TabsTrigger>
            <TabsTrigger value="abi">Custom ABI</TabsTrigger>
          </TabsList>
          <TabsContent value="signature" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Automatically lookup function signatures using the 4bytes database.
              This method only requires the calldata and works best for known, verified contracts.
            </p>
          </TabsContent>
          <TabsContent value="abi" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <AbiSelector />
                <SavedAbiSelector />
              </div>
              <Textarea 
                placeholder="Paste contract ABI JSON here..." 
                value={abiString}
                onChange={(e) => setAbiString(e.target.value)}
                className="font-mono h-48"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleDecode}
          disabled={isDecoding || !calldata}
          size="lg"
          className="relative"
        >
          {isDecoding ? (
            <>
              <span className="opacity-0">Decode Calldata</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Decoding...
              </span>
            </>
          ) : (
            "Decode Calldata"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
})