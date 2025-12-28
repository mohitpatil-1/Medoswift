import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function main() {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  // expose to routes for emitting
  app.set("io", io);

  io.on("connection", (socket) => {
    // Client can join rooms:
    // - order:<orderId>
    // - user:<userId>
    socket.on("join", ({ rooms }) => {
      if (!Array.isArray(rooms)) return;
      for (const r of rooms) socket.join(String(r));
    });
    socket.on("leave", ({ rooms }) => {
      if (!Array.isArray(rooms)) return;
      for (const r of rooms) socket.leave(String(r));
    });
  });

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`✅ MedoSwift API running on http://localhost:${env.port}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Fatal error:", e);
  process.exit(1);
});
