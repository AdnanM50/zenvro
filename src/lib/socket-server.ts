import type { AdminNotification } from '@/types/notification';

export const SOCKET_PORT = process.env.SOCKET_PORT
  ? parseInt(process.env.SOCKET_PORT, 10)
  : 3001;

/**
 * Compatibility helper - returns null in Next.js worker context.
 */
export function getSocketServer() {
  return null;
}

/**
 * Broadcast an admin notification immediately across Socket.IO.
 * Posts to the running Socket.IO server at http://127.0.0.1:3001/emit.
 */
export async function broadcastNotification(notification: AdminNotification) {
  try {
    const res = await fetch(`http://127.0.0.1:${SOCKET_PORT}/emit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      console.log(`[Socket.IO Client] Broadcast delivered to port ${SOCKET_PORT}:`, data);
      return;
    }
    console.warn(`[Socket.IO Client] Broadcast returned status ${res.status}`);
  } catch (err) {
    console.warn(`[Socket.IO Client] Failed to reach socket server on port ${SOCKET_PORT}:`, err);
  }
}
