import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config";
import useSiren from "./useSiren";

// Connects to the backend and plays the siren when the worker's zone goes into emergency.
export default function useAlertSocket(token) {
  const [alert, setAlert] = useState(null);
  const siren = useSiren();

  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token }, transports: ["websocket"] });
    socket.on("zone:alert", (p) => { setAlert(p); siren.start(); });
    socket.on("zone:clear", () => { setAlert(null); siren.stop(); });
    return () => { socket.disconnect(); siren.stop(); };
  }, [token]);

  return { alert, silence: siren.stop };
}
