// ═══ SOCKET.IO КЛИЕНТ ДЛЯ REAL-TIME ОБНОВЛЕНИЙ ═══
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;
  
  socket = io('http://localhost:3001', {
    auth: { token },
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('[SOCKET] ✅ Подключено к серверу');
  });
  
  socket.on('disconnect', () => {
    console.log('[SOCKET] ❌ Отключено от сервера');
  });
  
  socket.on('connect_error', (err) => {
    console.error('[SOCKET] Ошибка подключения:', err.message);
  });
  
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Хук для подписки на события
export function useSocketEvent(event: string, callback: (data: any) => void) {
  useEffect(() => {
    if (!socket) return;
    
    socket.on(event, callback);
    
    return () => {
      socket?.off(event, callback);
    };
  }, [event, callback]);
}
