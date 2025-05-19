"use client";

import { useEffect, useState, useCallback } from "react";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { ABIRecord, getAllABIs, loadABI, saveABI, deleteABI } from "@/lib/storage/abi-storage";
import { abiStringAtom } from "@/lib/atoms/calldata-atoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Database, Trash2, Bookmark } from "lucide-react";

export function SavedAbiSelector() {
  const setAbiString = useSetAtom(abiStringAtom);
  const [savedAbis, setSavedAbis] = useState<ABIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [abiName, setAbiName] = useState("");
  const [currentAbiString, setCurrentAbiString] = useState("");

  // Memoize the loadSavedAbis function to prevent recreating it on each render
  const loadSavedAbis = useCallback(async () => {
    try {
      setIsLoading(true);
      const abis = await getAllABIs();
      setSavedAbis(abis);
    } catch (error) {
      console.error("Error loading saved ABIs:", error);
      toast.error("Failed to load saved ABIs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saved ABIs on mount
  useEffect(() => {
    loadSavedAbis();
  }, [loadSavedAbis]);


  const handleSelectAbi = async (id: string) => {
    try {
      const abi = await loadABI(id);
      if (abi) {
        setAbiString(abi.abi);
        toast.success(`Loaded ABI: ${abi.name}`);
        
        // Refresh the list to update last used time
        loadSavedAbis();
      }
    } catch (error) {
      console.error("Error loading ABI:", error);
      toast.error("Failed to load ABI");
    }
  };

  const handleSaveCurrentAbi = (currentAbi: string) => {
    setCurrentAbiString(currentAbi);
    setAbiName("");
    setShowSaveDialog(true);
  };

  const handleSaveAbi = async () => {
    if (!abiName.trim()) {
      toast.error("Please enter a name for the ABI");
      return;
    }

    try {
      await saveABI(abiName.trim(), currentAbiString);
      toast.success(`ABI saved as "${abiName}"`);
      setShowSaveDialog(false);
      
      // Refresh the list
      loadSavedAbis();
    } catch (error) {
      console.error("Error saving ABI:", error);
      toast.error("Failed to save ABI");
    }
  };

  const handleDeleteAbi = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler

    try {
      await deleteABI(id);
      toast.success(`Deleted ABI: ${name}`);
      
      // Refresh the list
      loadSavedAbis();
    } catch (error) {
      console.error("Error deleting ABI:", error);
      toast.error("Failed to delete ABI");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save ABI</DialogTitle>
            <DialogDescription>
              Give your ABI a name so you can easily find it later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input
              placeholder="ABI Name"
              value={abiName}
              onChange={(e) => setAbiName(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAbi}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const abiTextarea = document.querySelector('textarea[placeholder*="Paste contract ABI"]') as HTMLTextAreaElement;
          if (abiTextarea) {
            handleSaveCurrentAbi(abiTextarea.value);
          }
        }}
      >
        <Save className="mr-2 h-4 w-4" />
        Save Current ABI
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading || savedAbis.length === 0}>
            <Database className="mr-2 h-4 w-4" />
            {isLoading ? "Loading..." : "Load Saved ABI"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Saved ABIs</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {savedAbis.length === 0 ? (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No saved ABIs</span>
            </DropdownMenuItem>
          ) : (
            savedAbis.map((abi) => (
              <DropdownMenuItem 
                key={abi.id} 
                onClick={() => handleSelectAbi(abi.id)}
                className="flex justify-between"
              >
                <div className="flex items-center">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>{abi.name}</span>
                </div>
                <Trash2 
                  className="h-4 w-4 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDeleteAbi(abi.id, abi.name, e)}
                />
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}