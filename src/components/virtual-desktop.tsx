
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MousePointer2, Scan, Eye, Maximize2, Loader2, Keyboard, FileText, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBridge } from "@/hooks/use-bridge";

interface VirtualDesktopProps {
  currentScreen: string;
  onScreenChange?: (id: string) => void;
  activeTask?: any;
}

export function VirtualDesktop({ currentScreen, onScreenChange, activeTask }: VirtualDesktopProps) {
  const { status, lastFrame } = useBridge();
  const [isScanning, setIsScanning] = useState(false);
  const placeholderScreen = PlaceHolderImages.find(img => img.id === currentScreen) || PlaceHolderImages[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 800);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentStep = activeTask?.steps?.[activeTask.currentStepIndex];
  const coordinates = currentStep?.coordinates;

  return (
    <div className="relative w-full h-full group cursor-crosshair overflow-hidden bg-black">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        {status.isConnected && lastFrame ? (
          /* REAL LIVE FEED FROM YOUR PC */
          <img 
            src={lastFrame} 
            alt="Live Screen Feed"
            className="w-full h-full object-contain"
          />
        ) : (
          /* FALLBACK TO PROTOTYPE IMAGES */
          <>
            <Image 
              src={placeholderScreen.imageUrl} 
              alt={placeholderScreen.description}
              fill
              className="object-cover opacity-60 transition-opacity duration-1000"
              data-ai-hint={placeholderScreen.imageHint}
            />
            {currentScreen === 'notepad-ui' && (
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="w-full h-full bg-white text-black rounded shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                  <div className="bg-[#f0f0f0] px-4 py-2 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium">Untitled - Notepad</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                    {activeTask?.generatedContent || "Awaiting input..."}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        {isScanning && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-accent/50 shadow-[0_0_15px_hsl(var(--accent))] animate-[scan_2s_linear_infinite]" />
        )}
        
        {activeTask && coordinates && (
          <div 
            className="absolute transition-all duration-1000 ease-in-out z-50"
            style={{ 
              left: `${Math.max(2, Math.min(98, coordinates.x))}%`, 
              top: `${Math.max(2, Math.min(98, coordinates.y))}%` 
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping h-16 w-16 -translate-x-1/2 -translate-y-1/2" />
              <MousePointer2 className="w-10 h-10 text-primary fill-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.9)]" />
              
              <div className="absolute left-12 top-0 bg-background/95 backdrop-blur-md border border-primary/50 p-3 rounded-lg shadow-2xl min-w-[200px] animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-primary">{currentStep.actionType}</span>
                </div>
                <p className="text-[11px] text-foreground font-medium leading-relaxed">{currentStep.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <Badge className={`${status.isConnected ? 'bg-accent/80' : 'bg-background/80'} backdrop-blur-md border-white/10 flex items-center gap-2 py-1 px-3 shadow-lg`}>
          <Monitor className={`w-3 h-3 ${status.isConnected ? 'text-white' : 'text-accent'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {status.isConnected ? `LIVE FEED: ${status.latency}ms` : `Vision Core: ${currentScreen}`}
          </span>
        </Badge>
      </div>

      <style jsx>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
      `}</style>
    </div>
  );
}
