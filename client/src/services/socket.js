import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_SOCKET || "http://localhost:5000",
{
  transports: ["websocket"],
});

export default socket;
