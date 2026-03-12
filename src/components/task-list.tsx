
"use client";

import React, { useEffect, useRef } from 'react';
import { 
  Pause, 
  Play, 
  Square, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Activity,
  MoreVertical,
  Loader2,
  Terminal
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { dynamicTaskExecution } from "@/ai/flows/dynamic-task-execution-flow";
import { intelligentTaskVerificationAndRecovery } from "@/ai/flows/intelligent-task-verification-recovery";
import { useBridge } from "@/hooks/use-bridge";

interface Task {
  id: string;
  name: string;
  type: string;
  summary: string;
  status: 'planning' | 'executing' | 'paused' | 'completed' | 'error' | 'stopped' | 'awaiting_verification' | 'quota_wait';
  progress: number;
  originalCommand: string;
  steps?: any[];
  currentStepIndex?: number;
  generatedContent?: string;
}

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onRemoveTask: (id: string) => void;
  currentScreenId: string;
  onScreenChange: (id: string) => void;
}

export function TaskList({ tasks, onUpdateTask, onRemoveTask, currentScreenId, onScreenChange }: TaskListProps) {
  const processingRef = useRef<Set<string>>(new Set());
  const { sendCommand, status: bridgeStatus } = useBridge();

  useEffect(() => {
    const processTask = async (task: Task) => {
      if (processingRef.current.has(task.id)) return;
      if (!['planning', 'executing', 'awaiting_verification'].includes(task.status)) return;
      
      processingRef.current.add(task.id);

      try {
        const uiContext = `Screen: ${currentScreenId}. Bridge: ${bridgeStatus.isConnected ? 'ONLINE' : 'SIMULATED'}.`;
        const mockDataUri = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`; 

        if (task.status === 'planning') {
          const result = await dynamicTaskExecution({
            userCommand: task.originalCommand,
            currentScreenImage: mockDataUri,
            uiContext: uiContext
          });

          const contentStep = result.steps.find(s => s.actionType === 'type' && s.value && s.value.length > 5);

          onUpdateTask(task.id, { 
            status: 'executing', 
            steps: result.steps, 
            currentStepIndex: 0,
            progress: 10,
            summary: result.nextActionInstruction || "Beginning task execution...",
            generatedContent: contentStep?.value || task.generatedContent
          });
        } 
        else if (task.status === 'executing' && task.steps && task.currentStepIndex !== undefined) {
          const currentStep = task.steps[task.currentStepIndex];
          
          if (!currentStep) {
            onUpdateTask(task.id, { status: 'completed', progress: 100 });
            return;
          }

          // SEND TO REAL PC IF CONNECTED
          if (bridgeStatus.isConnected) {
            sendCommand(currentStep);
          }

          // Delay to simulate movement
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Screen Change Logic (Simulation only)
          if (!bridgeStatus.isConnected) {
            const stepText = (currentStep.description + " " + (currentStep.targetElement || "")).toLowerCase();
            if (stepText.includes('notepad')) onScreenChange('notepad-ui');
            else if (stepText.includes('browser')) onScreenChange('browser-window');
          }

          const nextIndex = task.currentStepIndex + 1;
          const isLastStep = nextIndex >= task.steps.length;

          if (isLastStep) {
            onUpdateTask(task.id, { status: 'completed', progress: 100, summary: "Task completed successfully." });
          } else {
            onUpdateTask(task.id, { 
              currentStepIndex: nextIndex,
              progress: 10 + Math.floor((nextIndex / task.steps.length) * 80),
              summary: task.steps[nextIndex].description
            });
          }
        }
      } catch (error: any) {
        console.error("Execution Error:", error);
        onUpdateTask(task.id, { status: 'error', summary: "System bridge interrupted." });
      } finally {
        processingRef.current.delete(task.id);
      }
    };

    const activeTask = tasks.find(t => t.status === 'planning' || t.status === 'executing' || t.status === 'awaiting_verification');
    if (activeTask) processTask(activeTask);
  }, [tasks, currentScreenId, onUpdateTask, onScreenChange, bridgeStatus.isConnected, sendCommand]);

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="border-white/5 bg-card/40 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-sm">{task.name}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{task.summary}</p>
              </div>
              <Badge variant="outline" className="text-[9px] uppercase">{task.status}</Badge>
            </div>
            <Progress value={task.progress} className="h-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
