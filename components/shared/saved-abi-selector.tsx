"use client";

import { useEffect, useState, useCallback } from "react";
import { PrimitiveAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import { ABIRecord, getAllABIs, loadABI, saveABI, deleteABI } from "@/lib/storage/abi-storage";
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
import { Label } from "@/components/ui/label";
import { Save, Database, Trash2, Bookmark } from "lucide-react";

type SavedAbiSelectorProps = {
  abiAtom: PrimitiveAtom<string>;
  showDeleteOption?: boolean;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  saveButtonText?: string;
  loadButtonText?: string;
};

export function SavedAbiSelector({
  abiAtom,
  showDeleteOption = true,
  buttonSize = "sm",
  saveButtonText = "Save ABI",
  loadButtonText = "Load Saved ABI"
}: SavedAbiSelectorProps) {
  const setAbiString = useSetAtom(abiAtom);
  const [savedAbis, setSavedAbis] = useState<ABIRecord[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [abiName, setAbiName] = useState("");
  const [currentAbiString, setCurrentAbiString] = useState("");

  // Memoize the loadSavedAbis function to prevent recreating it on each render
  const loadSavedAbis = useCallback(async () => {
    try {
      const abis = await getAllABIs();
      setSavedAbis(abis);
    } catch (error) {
      console.error("Error loading saved ABIs:", error);
      toast.error("Failed to load saved ABIs");
    }
  }, []);

  // Load saved ABIs on mount
  useEffect(() => {
    loadSavedAbis();
  }, [loadSavedAbis]);

  const handleSelectAbi = async (id: string) => {
    setIsLoadingSaved(true);
    
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
    } finally {
      setIsLoadingSaved(false);
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
      // Validate ABI format
      JSON.parse(currentAbiString);
      
      await saveABI(abiName.trim(), currentAbiString);
      toast.success(`ABI saved as "${abiName}"`);
      setShowSaveDialog(false);
      
      // Refresh the list
      loadSavedAbis();
    } catch (error) {
      console.error("Error saving ABI:", error);
      toast.error("Failed to save ABI. Make sure it's valid JSON.");
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
            <Label htmlFor="abi-name">ABI Name</Label>
            <Input
              id="abi-name"
              placeholder="Enter a descriptive name"
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
        size={buttonSize}
        onClick={() => {
          const abiTextarea = document.querySelector('textarea[placeholder*="Paste contract ABI"]') as HTMLTextAreaElement;
          if (abiTextarea) {
            handleSaveCurrentAbi(abiTextarea.value);
          }
        }}
      >
        <Save className="mr-2 h-4 w-4" />
        {saveButtonText}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={buttonSize} 
            disabled={savedAbis.length === 0 || isLoadingSaved}
          >
            <Database className="mr-2 h-4 w-4" />
            {isLoadingSaved ? "Loading..." : loadButtonText}
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
                className={showDeleteOption ? "flex justify-between" : ""}
              >
                <div className="flex items-center">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>{abi.name}</span>
                </div>
                {showDeleteOption && (
                  <button 
                    onClick={(e) => handleDeleteAbi(abi.id, abi.name, e)}
                    className="p-1"
                    aria-label={`Delete ${abi.name} ABI`}
                  >
                    <Trash2 
                      className="h-4 w-4 text-muted-foreground hover:text-destructive"
                    />
                  </button>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}