
import { useRef, useCallback } from "react";
import { Vibration } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

export default function useSiren() {
  const playerRef = useRef(null);

  const start = useCallback(async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      if (!playerRef.current) {
        playerRef.current = createAudioPlayer(
          require("../../assets/siren.wav")
        );
        playerRef.current.loop = true;
        playerRef.current.volume = 1.0;
      }

      playerRef.current.play();
      Vibration.vibrate([0, 600, 400], true);
    } catch (e) {
      console.warn("Siren error:", e);
    }
  }, []);

  const stop = useCallback(() => {
    Vibration.cancel();

    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.seekTo(0);
    }
  }, []);

  return { start, stop };
}
