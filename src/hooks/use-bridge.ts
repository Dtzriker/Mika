
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface BridgeStatus {
  isConnected: boolean;
  isStreaming: boolean;
  latency: number;
}

export function useBridge() {
  const [status, setStatus] = useState<BridgeStatus>({
    isConnected: false,
    isStreaming: false,
    latency: 0,
  });
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      // Connect to the local bridge agent running on the user's PC
      const socket = new WebSocket('ws://localhost:9001');
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus(prev => ({ ...prev, isConnected: true }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'screen-frame') {
          setLastFrame(data.payload);
          setStatus(prev => ({ ...prev, isStreaming: true }));
        }
        if (data.type === 'pong') {
          const latency = Date.now() - data.timestamp;
          setStatus(prev => ({ ...prev, latency }));
        }
      };

      socket.onclose = () => {
        setStatus({ isConnected: false, isStreaming: false, latency: 0 });
        // Attempt reconnect after 5 seconds
        setTimeout(connect, 5000);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (e) {
      console.warn("Bridge Agent not found on localhost:9001");
    }
  }, []);

  useEffect(() => {
    connect();
    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 2000);

    return () => {
      clearInterval(pingInterval);
      socketRef.current?.close();
    };
  }, [connect]);

  const sendCommand = useCallback((command: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'execute-command',
        payload: command
      }));
      return true;
    }
    return false;
  }, []);

  return { status, lastFrame, sendCommand };
}
