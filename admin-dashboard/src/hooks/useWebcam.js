import { useRef, useState, useCallback, useEffect } from "react";

export default function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [on, setOn] = useState(false);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 540 } });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    setOn(true);
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setOn(false);
  }, []);
  useEffect(() => stop, [stop]);

  // grab the current frame as a JPEG blob
  const grab = useCallback(
    () =>
      new Promise((resolve) => {
        const v = videoRef.current;
        const c = document.createElement("canvas");
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        c.getContext("2d").drawImage(v, 0, 0);
        c.toBlob(resolve, "image/jpeg", 0.85);
      }),
    []
  );

  return { videoRef, on, start, stop, grab };
}
