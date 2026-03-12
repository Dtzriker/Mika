
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { naturalLanguageTaskInitiation } from "@/ai/flows/natural-language-task-initiation";
import { toast } from "@/hooks/use-toast";

interface CommandInputProps {
  onTaskCreated: (task: any) => void;
}

export function CommandInput({ onTaskCreated }: CommandInputProps) {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!command.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await naturalLanguageTaskInitiation({ command });
      
      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.taskName,
        type: result.taskType,
        summary: result.actionPlanSummary,
        status: 'planning',
        progress: 0,
        originalCommand: command,
        createdAt: new Date()
      };

      onTaskCreated(newTask);
      setCommand('');
      toast({
        title: "Task Initiated",
        description: `Everything is now planning: ${result.taskName}`,
      });
    } catch (error: any) {
      console.error(error);
      const isQuota = error?.message?.includes('429');
      toast({
        variant: "destructive",
        title: isQuota ? "Quota Limit Reached" : "Command Error",
        description: isQuota 
          ? "The AI is currently busy. Please wait about 60 seconds before trying again." 
          : "Failed to interpret command. Please check your connection and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
      <div className="relative flex-1">
        <Textarea
          placeholder="What should Everything do for you? (e.g., 'Open Notepad and model a simple tree')"
          className="min-h-0 h-full resize-none bg-background/50 border-white/10 focus:ring-primary focus:border-primary pl-4 pr-12 pt-3"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
        />
        <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground font-mono">
          CMD + ENTER
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>Everything can operate any application it sees</span>
        </div>
        <Button 
          type="submit" 
          disabled={!command.trim() || isProcessing}
          className="gap-2 px-6 shadow-lg shadow-primary/20"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Execute Command</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
