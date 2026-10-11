import { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { useListQuery, useVerifyMutation } from "../api";
import { Card, PageTitle, Btn, inputCls } from "../components/ui";
import useWebcam from "../hooks/useWebcam";

function getBadgeSubject(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const encoded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
    return claims.type === "badge" && claims.sub ? String(claims.sub) : null;
  } catch {
    return null;
  }
}

export default function GateCheckPage() {
  const { data: zones = [] } = useListQuery("zones");
  const { data: users = [], isLoading: usersLoading } = useListQuery("users");
  const [verify, { isLoading }] = useVerifyMutation();
  const cam = useWebcam();
  const [zoneId, setZoneId] = useState("");
  const [badgeToken, setBadgeToken] = useState("");
  const [scannedUser, setScannedUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const scanning = useRef(false);
  const awaitingNextQr = useRef(false);
  const qrAbsentFrames = useRef(0);

  const run = async (blob, name, details = {}) => {
    const selectedZoneId = details.zoneId ?? zoneId;
    const selectedBadgeToken = details.badgeToken ?? badgeToken;
    const selectedUserId = details.userId ?? userId;
    if (!selectedZoneId) return setMsg("Select a zone first");
    if (!selectedBadgeToken && !selectedUserId) return setMsg("Scan an ID QR or pick an employee");
    if (!blob) {
      setResult({ decision: "denied", reason: "Could not capture a camera frame" });
      return;
    }

    const fd = new FormData();
    fd.append("file", blob, name);
    fd.append("zoneId", selectedZoneId);
    if (selectedBadgeToken) fd.append("badgeToken", selectedBadgeToken); else fd.append("userId", selectedUserId);
    try {
      const r = await verify(fd);
      setResult(r.data || { decision: "denied", reason: r.error?.data?.error || "Request failed" });
    } catch (error) {
      setResult({ decision: "denied", reason: error.message || "Request failed" });
    }
  };

  // keep looking for a QR code in the webcam feed
  useEffect(() => {
    if (!cam.on || usersLoading) return;
    scanning.current = true;
    const canvas = document.createElement("canvas");
    const id = setInterval(() => {
      const v = cam.videoRef.current;
      if (!v?.videoWidth || (!scanning.current && !awaitingNextQr.current)) return;
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(v, 0, 0);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code?.data) {
        qrAbsentFrames.current = 0;
        if (scanning.current && !awaitingNextQr.current) {
          scanning.current = false;
          const token = code.data;
          const subjectId = getBadgeSubject(token);
          const user = subjectId && users.find((item) => String(item.id) === subjectId);
          const zone = user && zones.find((item) => String(item.id) === String(user.zoneId));
          setBadgeToken(token);
          setResult(null);
          setScannedUser(user || null);
          setUserId("");

          void (async () => {
            if (!subjectId) {
              setMsg("Invalid ID card QR");
            } else if (!user) {
              setMsg("Employee from this QR was not found");
            } else if (!zone) {
              setMsg("Employee found, but no assigned zone is available");
            } else {
              setZoneId(String(zone.id));
              setMsg(`Verifying ${user.name} in ${zone.name}…`);
              try {
                const frame = await cam.grab();
                await run(frame, "webcam.jpg", { badgeToken: token, zoneId: String(zone.id) });
              } catch (error) {
                setResult({ decision: "denied", reason: error.message || "Could not capture or verify the camera frame" });
              } finally {
                setBadgeToken("");
                setScannedUser(null);
                setUserId("");
                setZoneId("");
                awaitingNextQr.current = true;
                qrAbsentFrames.current = 0;
                setMsg("Verification complete. Remove the ID card to scan the next employee.");
              }
            }
            if (!subjectId || !user || !zone) {
              setBadgeToken("");
              setScannedUser(null);
              setZoneId("");
              awaitingNextQr.current = true;
              setMsg(!subjectId ? "Invalid ID card QR. Remove it to try again." : !user ? "Employee not found. Remove the ID card to try again." : "No assigned zone. Remove the ID card to try again.");
            }
          })();
        }
      } else if (awaitingNextQr.current) {
        qrAbsentFrames.current += 1;
        if (qrAbsentFrames.current >= 3) {
          awaitingNextQr.current = false;
          qrAbsentFrames.current = 0;
          scanning.current = true;
          setMsg("Ready for next employee — present an ID card");
        }
      }
    }, 400);
    return () => { scanning.current = false; clearInterval(id); };
  }, [cam.on, cam.grab, usersLoading, users, zones]);

  const ok = result?.decision === "allowed";
  return (
    <>
      <PageTitle>Gate Check</PageTitle>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="1. Identify & capture">
          <label className="text-xs text-slate-500">Zone being entered (read from ID card)</label>
          <select className={`${inputCls} mb-3`} value={zoneId} disabled={Boolean(badgeToken)} onChange={(e) => setZoneId(e.target.value)}>
            <option value="">Select zone…</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          {scannedUser && <p className="text-sm text-slate-600 mb-3">Employee: <b>{scannedUser.name}</b> · {scannedUser.employeeCode || "No employee code"}</p>}

          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
            <video ref={cam.videoRef} className="w-full h-full object-cover" muted playsInline />
            {!cam.on && <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Camera off</div>}
          </div>
          <div className="flex gap-2 mb-3">
            {!cam.on ? <Btn tone="ghost" onClick={cam.start}>Start webcam (scans QR)</Btn> : <Btn tone="ghost" onClick={cam.stop}>Stop</Btn>}
          </div>
          <p className="text-sm text-slate-500 min-h-5">{msg}</p>

          <hr className="my-4" />
          <div className="text-sm font-medium mb-2">Demo mode (no QR / no camera)</div>
          <select className={`${inputCls} mb-2`} value={userId} disabled={Boolean(badgeToken)} onChange={(e) => { setUserId(e.target.value); setBadgeToken(""); }}>
            <option value="">Pick employee…</option>
            {users.filter((u) => u.role === "worker").map((u) => <option key={u.id} value={u.id}>{u.name} ({u.employeeCode})</option>)}
          </select>
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm flex-1" />
            <Btn disabled={!file || isLoading} onClick={() => run(file, file.name)}>Upload & verify</Btn>
          </div>
        </Card>

        <Card title="2. Decision">
          {isLoading && <p className="text-slate-500">Analysing with AI…</p>}
          {!result && !isLoading && <p className="text-slate-400">Result appears here.</p>}
          {result && !isLoading && (
            <div>
              <div className={`rounded-xl p-5 text-center mb-4 ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                <div className="text-4xl">{ok ? "✅" : "⛔"}</div>
                <div className="text-2xl font-bold">{ok ? "ACCESS GRANTED" : "ACCESS DENIED"}</div>
                <div className="text-sm mt-1">{result.reason}</div>
              </div>
              {result.user && <p className="text-sm mb-2"><b>{result.user.name}</b> · {result.user.employeeCode} → <b>{result.zone.name}</b></p>}
              <div className="flex flex-wrap gap-2 mb-3">
                {result.required?.map((p) => {
                  const missing = result.missing?.includes(p);
                  const unverified = result.unverified?.includes(p);
                  const cls = missing ? "bg-red-100 text-red-700" : unverified ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
                  return <span key={p} className={`px-3 py-1 rounded-full text-sm ${cls}`}>{missing ? "✗" : unverified ? "?" : "✓"} {p}</span>;
                })}
              </div>
              {result.annotated && <img className="rounded-lg w-full" src={`data:image/jpeg;base64,${result.annotated}`} />}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
