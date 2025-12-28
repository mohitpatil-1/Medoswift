import { io } from "socket.io-client";
import { API_URL } from "./api.js";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}
