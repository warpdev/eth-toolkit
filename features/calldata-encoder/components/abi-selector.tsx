"use client";

import React, { useState, useCallback } from "react";
import { useSetAtom } from "jotai";
import { abiStringAtom } from "../atoms/encoder-atoms";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { validateAbiString } from "@/lib/utils";

export function AbiSelector() {
  const setAbiString = useSetAtom(abiStringAtom);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file) return;
    
    // Validate file type (allow any text or JSON file)
    if (!file.type.includes("text") && !file.type.includes("json") && !file.name.endsWith(".json")) {
      toast.error("Invalid file type", {
        description: "Please upload a text or JSON file containing an ABI",
        duration: 3000
      });
      return;
    }
    
    // Read file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Validate ABI format
        const validation = validateAbiString(content);
        if (!validation.isValid) {
          toast.error("Invalid ABI format", {
            description: validation.error || "The file does not contain a valid ABI",
            duration: 3000
          });
          return;
        }
        
        // Set ABI string
        setAbiString(content);
        
        toast.success("ABI loaded", {
          description: "ABI loaded from file successfully",
          duration: 2000
        });
      } catch (error) {
        toast.error("Invalid ABI format", {
          description: "The file does not contain valid JSON data",
          duration: 3000
        });
      }
    };
    
    reader.onerror = () => {
      toast.error("File read error", {
        description: "Failed to read the uploaded file",
        duration: 3000
      });
    };
    
    reader.readAsText(file);
  }, [setAbiString]);
  
  // File input change handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input value to allow uploading the same file again
    e.target.value = "";
  }, [handleFileUpload]);
  
  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);
  
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative ${isDragging ? "ring-2 ring-primary" : ""}`}
    >
      <input
        type="file"
        accept=".json,text/plain"
        id="abi-file-input"
        className="sr-only"
        onChange={handleFileChange}
      />
      <label htmlFor="abi-file-input">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          asChild
        >
          <span>
            <Upload className="mr-2 h-4 w-4" />
            Upload ABI
          </span>
        </Button>
      </label>
    </div>
  );
}