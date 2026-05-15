// Cloudflare Worker for handling Real-time Bus Tracking via WebSockets
// This operates independently of the Next.js app to ensure low latency.

interface Env {
  // Add bindings here if needed (e.g., KV for caching active routes)
}

// In-memory store for active connections per route
// Note: In a true multi-colo edge environment, you would use Durable Objects 
// for strict ordering and consistency across regions, or KV/Redis for pub/sub.
// For this architecture, we simulate the PubSub pattern within a single isolate.
const activeConnections = new Map<string, Set<WebSocket>>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const url = new URL(request.url);
    // Expected path format: /ws/logistics/:routeId
    const pathParts = url.pathname.split('/');
    if (pathParts.length < 4 || pathParts[2] !== 'logistics') {
        return new Response('Invalid WebSocket path', { status: 400 });
    }

    const routeId = pathParts[3];

    // Setup WebSocket pair
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Accept the connection
    server.accept();

    // Initialize the set for this route if it doesn't exist
    if (!activeConnections.has(routeId)) {
        activeConnections.set(routeId, new Set());
    }
    const connections = activeConnections.get(routeId)!;
    connections.add(server);

    server.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data as string);
            
            // If the message is from a driver (type: 'LOCATION_UPDATE')
            if (data.type === 'LOCATION_UPDATE') {
                const { lat, lng, speed, timestamp } = data.payload;
                
                // Broadcast to all other subscribers on this route
                const broadcastMessage = JSON.stringify({
                    type: 'BUS_LOCATION',
                    payload: { lat, lng, speed, timestamp }
                });

                connections.forEach((conn) => {
                    // Don't send the message back to the sender
                    if (conn !== server) {
                        try {
                            conn.send(broadcastMessage);
                        } catch (e) {
                            // Connection might be dead, remove it
                            connections.delete(conn);
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Error processing WebSocket message:', e);
        }
    });

    server.addEventListener('close', () => {
        connections.delete(server);
        if (connections.size === 0) {
            activeConnections.delete(routeId);
        }
    });

    server.addEventListener('error', (err) => {
        console.error('WebSocket Error:', err);
        connections.delete(server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};
