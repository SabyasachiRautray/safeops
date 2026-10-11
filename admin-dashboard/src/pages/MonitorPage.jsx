import { useState, useEffect, useRef } from "react";
import { useListQuery, useMonitorFrameMutation } from "../api";
import { Card, PageTitle, Btn, Badge, inputCls } from "../components/ui";
import useWebcam from "../hooks/useWebcam";

export default function MonitorPage() {
  const { data: cams = [] } = useListQuery("cameras");
  const [send] = useMonitorFrameMutation();
  const cam = useWebcam();
  const [cameraId, setCameraId] = useState("");
  const [live, setLive] = useState(false);
  const [res, setRes] = useState(null);
  const busy = useRef(false);

  const analyse = async (blob, name) => {
    if (!cameraId || busy.current) return;
    busy.current = true;
    const fd = new FormData();
    fd.append("file", blob, name);
    fd.append("cameraId", cameraId);
    const r = await send(fd);
    if (r.data) setRes(r.data);
    busy.current = false;
  };

  // webcam loop: one frame every 3 seconds
  useEffect(() => {
    if (!live || !cam.on) return;
    const id = setInterval(async () => analyse(await cam.grab(), "frame.jpg"), 3000);
    return () => clearInterval(id);
  }, [live, cam.on, cameraId]);

  return (
    <>
      <PageTitle>Live Monitor</PageTitle>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Camera source">
          <select className={`${inputCls} mb-3`} value={cameraId} onChange={(e) => setCameraId(e.target.value)}>
            <option value="">Select camera…</option>
            {cams.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.Zone?.name}</option>)}
          </select>
          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3">
            <video ref={cam.videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {!cam.on
              ? <Btn tone="ghost" onClick={cam.start}>Start webcam</Btn>
              : <Btn tone="ghost" onClick={() => { cam.stop(); setLive(false); }}>Stop webcam</Btn>}
            <Btn disabled={!cam.on || !cameraId} tone={live ? "danger" : "primary"} onClick={() => setLive(!live)}>
              {live ? "Stop monitoring" : "▶ Start monitoring"}
            </Btn>
          </div>
          <div className="text-sm font-medium mb-2">…or upload a demo image / video</div>
          <input type="file" accept="image/*,video/*" className="text-sm"
            onChange={(e) => e.target.files[0] && analyse(e.target.files[0], e.target.files[0].name)} />
        </Card>

        <Card title="Analysis" right={live && <Badge tone="green">● live</Badge>}>
          {!res && <p className="text-slate-400">Waiting for first frame…</p>}
          {res && (
            <>
              <div className={`rounded-lg p-3 mb-3 text-center font-semibold ${res.fire ? "bg-red-100 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                {res.fire ? "🔥 FIRE / SMOKE DETECTED — sirens sent to the zone" : "No fire or smoke"}
              </div>
              {res.ppeMissing?.length > 0 && <p className="text-sm text-amber-700 mb-2">PPE missing or not visible: {res.ppeMissing.join(", ")}</p>}
              {res.annotated && <img className="rounded-lg w-full" src={`data:image/jpeg;base64,${res.annotated}`} />}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
