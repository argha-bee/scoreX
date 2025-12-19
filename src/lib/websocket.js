import { WebSocketServer } from "ws";

let wss;
const clients = new Map(); // matchId -> Set of WebSocket connections

export const initializeWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === "subscribe") {
          // Subscribe to a specific match
          const { matchId } = data;

          if (!clients.has(matchId)) {
            clients.set(matchId, new Set());
          }

          clients.get(matchId).add(ws);
          ws.matchId = matchId;

          ws.send(
            JSON.stringify({
              type: "subscribed",
              matchId,
              message: "Successfully subscribed to match updates",
            })
          );

          console.log(`Client subscribed to match: ${matchId}`);
        }

        if (data.type === "unsubscribe") {
          const { matchId } = data;

          if (clients.has(matchId)) {
            clients.get(matchId).delete(ws);
          }

          ws.send(
            JSON.stringify({
              type: "unsubscribed",
              matchId,
              message: "Successfully unsubscribed from match updates",
            })
          );
        }

        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      // Remove client from all subscriptions
      if (ws.matchId && clients.has(ws.matchId)) {
        clients.get(ws.matchId).delete(ws);

        if (clients.get(ws.matchId).size === 0) {
          clients.delete(ws.matchId);
        }
      }
      console.log("WebSocket connection closed");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Send initial connection message
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connection established",
      })
    );
  });

  console.log("WebSocket server initialized");
};

export const broadcastScoreUpdate = (matchId, data) => {
  if (!clients.has(matchId)) {
    return;
  }

  const message = JSON.stringify({
    type: "score-update",
    matchId,
    data,
    timestamp: new Date().toISOString(),
  });

  clients.get(matchId).forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(message);
    }
  });

  console.log(
    `Broadcast score update to ${clients.get(matchId).size} clients for match ${matchId}`
  );
};

export const broadcastMatchUpdate = (matchId, updateType, data) => {
  if (!clients.has(matchId)) {
    return;
  }

  const message = JSON.stringify({
    type: "match-update",
    updateType, // 'toss', 'innings-break', 'match-complete', etc.
    matchId,
    data,
    timestamp: new Date().toISOString(),
  });

  clients.get(matchId).forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};
