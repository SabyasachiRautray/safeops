import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { API_URL } from "../config/constants";
import { baseApi } from "../api/baseApi";

// Refetch incidents / zones / stats whenever the server pushes an event.
export default function useLiveEvents(token) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token } });
    const refresh = () => dispatch(baseApi.util.invalidateTags(["incidents", "zones", "stats", "history"]));
    ["incident:new", "zone:clear"].forEach((e) => socket.on(e, refresh));
    return () => socket.disconnect();
  }, [token, dispatch]);
}
