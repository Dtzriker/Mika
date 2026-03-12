
"use client";

import React, { useState } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { CommandInput } from "@/components/command-input";
import { TaskList } from "@/components/task-list";
import { VirtualDesktop } from "@/components/virtual-desktop";
import { 
  Activity, 
  Cpu, 
  History, 
  Layers, 
  Settings, 
  Zap, 
  BrainCircuit,
  MousePointer2,
  Info,
  Link,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EverythingDashboard() {
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [currentScreen, setCurrentScreen] = useState("desktop-clean");

  const executingTask = activeTasks.find(t => t.status === 'executing' || t.status === 'awaiting_verification');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar className="border-r border-sidebar-border" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BrainCircuit className="text-primary-foreground w-5 h-5" />
            </div>
            <h1 className="font-headline font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">Everything</h1>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Automation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Active Tasks">
                    <Activity className="w-4 h-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Active Tasks</span>
                    <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden">{activeTasks.length}</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Execution History">
                    <History className="w-4 h-4" />
                    <span className="group-data-[collapsible=icon]:hidden">History</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Bridge Status</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Local Agent Status">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span className="group-data-[collapsible=icon]:hidden">Local Bridge Agent</span>
                    <Badge variant="outline" className="ml-auto border-accent text-accent group-data-[collapsible=icon]:hidden uppercase text-[10px]">Connected</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="UI Node Scanner">
                    <Layers className="w-4 h-4" />
                    <span className="group-data-[collapsible=icon]:hidden">UI Node Scanner</span>
                    <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden">2.4k Nodes</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="w-4 h-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 relative">
          <header className="h-16 border-b flex items-center px-6 gap-4 justify-between bg-card/20 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex flex-col">
                <h2 className="font-headline font-semibold text-sm">Main Operations Center</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">System Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Scanning Fidelity</span>
                <span className="text-sm font-medium">99.8% Accuracy</span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                v1.0.5-alpha
              </Badge>
            </div>
          </header>

          <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_400px]">
            <div className="flex flex-col h-full bg-background p-6 space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-xs font-bold uppercase tracking-tight">Virtual Prototype Environment</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  Everything is operating the <strong>Virtual Desktop</strong> below. To control your real PC, a Local Bridge Agent must be installed. Currently using <strong>Structured UI Node Scanning</strong> for high-speed execution.
                </AlertDescription>
              </Alert>

              <div className="flex-1 min-h-0 bg-secondary/20 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                <VirtualDesktop 
                  currentScreen={currentScreen} 
                  onScreenChange={setCurrentScreen}
                  activeTask={executingTask}
                />
              </div>
              
              <div className="h-40 glass-panel rounded-2xl p-6 border-white/10 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                 <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Neural Command Interface</span>
                    </div>
                    <CommandInput onTaskCreated={(task) => setActiveTasks(prev => [task, ...prev])} />
                 </div>
              </div>
            </div>

            <aside className="border-l border-white/5 bg-sidebar-background/50 backdrop-blur-sm p-6 overflow-y-auto">
              <TaskList 
                tasks={activeTasks} 
                currentScreenId={currentScreen}
                onUpdateTask={(id, updates) => {
                  setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
                }} 
                onRemoveTask={(id) => {
                  setActiveTasks(prev => prev.filter(t => t.id !== id));
                }} 
                onScreenChange={setCurrentScreen}
              />
            </aside>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
