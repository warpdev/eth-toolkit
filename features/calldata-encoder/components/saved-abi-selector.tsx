"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSetAtom } from "jotai";
import { abiStringAtom } from "../atoms/encoder-atoms";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Database, Save } from "lucide-react";
import { toast } from "sonner";
import { ABIRecord, getAllABIs, loadABI, saveABI } from "@/lib/storage/abi-storage";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SavedAbiSelector() {
  const setAbiString = useSetAtom(abiStringAtom);
  const [savedAbis, setSavedAbis] = useState<ABIRecord[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [abiName, setAbiName] = useState("");
  
  // Load saved ABIs on mount
  useEffect(() => {
    const loadSavedAbis = async () => {
      try {
        const abis = await getAllABIs();
        setSavedAbis(abis);
      } catch (error) {
        console.error("Failed to load saved ABIs:", error);
      }
    };
    
    loadSavedAbis();
  }, []);
  
  // Handle loading a saved ABI
  const handleLoadAbi = useCallback(async (id: string) => {
    setIsLoadingSaved(true);
    
    try {
      const abiRecord = await loadABI(id);
      if (abiRecord) {
        setAbiString(abiRecord.abi);
        toast.success("ABI loaded", {
          description: `Successfully loaded ABI: ${abiRecord.name}`,
          duration: 2000
        });
      }
    } catch (error) {
      toast.error("Failed to load ABI", {
        description: "There was an error loading the saved ABI",
        duration: 3000
      });
      console.error("Failed to load ABI:", error);
    } finally {
      setIsLoadingSaved(false);
    }
  }, [setAbiString]);
  
  // Handle saving current ABI
  const handleSaveAbi = useCallback(async (currentAbiString: string) => {
    if (!abiName.trim()) {
      toast.error("Name required", {
        description: "Please provide a name for the ABI",
        duration: 3000
      });
      return;
    }
    
    try {
      // Validate ABI format
      JSON.parse(currentAbiString);
      
      // Save ABI
      const id = await saveABI(abiName, currentAbiString);
      
      // Reload list of saved ABIs
      const abis = await getAllABIs();
      setSavedAbis(abis);
      
      // Close dialog and reset name field
      setSaveDialogOpen(false);
      setAbiName("");
      
      toast.success("ABI saved", {
        description: `Successfully saved ABI: ${abiName}`,
        duration: 2000
      });
    } catch (error) {
      toast.error("Failed to save ABI", {
        description: "There was an error saving the ABI. Make sure it's valid JSON.",
        duration: 3000
      });
      console.error("Failed to save ABI:", error);
    }
  }, [abiName]);
  
  return (
    <div className="flex space-x-2">
      {/* Save ABI Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save ABI
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save ABI</DialogTitle>
            <DialogDescription>
              Give this ABI a name to save it for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="abi-name">ABI Name</Label>
            <Input
              id="abi-name"
              value={abiName}
              onChange={(e) => setAbiName(e.target.value)}
              placeholder="Enter a descriptive name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => window.document.querySelector('textarea')?.value && handleSaveAbi(window.document.querySelector('textarea')?.value)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Load Saved ABI Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={savedAbis.length === 0 || isLoadingSaved}>
            <Database className="mr-2 h-4 w-4" />
            {isLoadingSaved ? "Loading..." : "Load Saved ABIs"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Saved ABIs</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {savedAbis.length === 0 ? (
            <DropdownMenuItem disabled>No saved ABIs</DropdownMenuItem>
          ) : (
            savedAbis.map((abi) => (
              <DropdownMenuItem
                key={abi.id}
                onClick={() => handleLoadAbi(abi.id)}
              >
                {abi.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}