const { aiUrl, useLlm } = require("../config");

const strip = (s) => (s ? s.replace(/^data:image\/\w+;base64,/, "") : null);
const isVideo = (f) => /^video\//.test(f.mimetype || "") || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.originalname || "");

async function post(path, file, extra = {}) {
  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname || "upload.jpg");
  for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
  const r = await fetch(`${aiUrl}${path}`, { method: "POST", body: form });
  if (!r.ok) throw new Error(`AI service ${path} failed: ${r.status}`);
  return r.json();
}

/**
 * Calls the FastAPI AI backend (api.py) and normalises the answer to:
 * { frames: [ [worker,...], ... ], fire: bool, fireType, annotated: base64 }
 * worker = { worker, status, missing: [...], unverified: [...] }
 */
exports.analyze = async (file, { ppe = true, fire = true } = {}) => {
  if (isVideo(file)) {
    const r = await post("/analyze/video", file, { every_sec: 1, max_frames: 12, use_llm: false });
    const alertDet = r.frames.flatMap((f) => f.detections || []).find((d) => d.ALERT);
    return {
      frames: r.frames.map((f) => f.workers || []),
      fire: !!r.summary.fire_confirmed,
      fireType: alertDet?.label || "fire",
      annotated: strip(r.key_frame?.ppe_image || r.key_frame?.fire_image),
    };
  }
  const path = ppe && fire ? "/analyze/image" : ppe ? "/analyze/ppe" : "/analyze/fire";
  const r = await post(path, file, { use_llm: useLlm, annotate: true });
  const p = r.ppe || (r.workers ? r : null);
  const f = r.fire || (r.detections ? r : null);
  const alertDet = f?.detections?.find((d) => d.ALERT);
  return {
    frames: p ? [p.workers] : [],
    fire: !!f?.summary?.alert,
    fireType: alertDet?.label || "fire",
    annotated: strip(p?.annotated_image || f?.annotated_image),
  };
};

/**
 * Compare AI output with the zone's required PPE.
 * Fail-safe: an item the AI could not see ("unverified") is NOT accepted.
 * Everyone in the frame must satisfy the rule.
 */
exports.evalPpe = (frames, required) => {
  let personFound = false, ok = false, lastUnverified = new Set();
  const missing = new Set();
  for (const workers of frames) {
    if (!workers || !workers.length) continue;
    personFound = true;
    let frameOk = true;
    const fu = new Set();
    for (const w of workers) for (const item of required) {
      if ((w.missing || []).includes(item)) { missing.add(item); frameOk = false; }
      else if ((w.unverified || []).includes(item)) { fu.add(item); frameOk = false; }
    }
    if (frameOk) ok = true; else lastUnverified = fu;
  }
  const m = [...missing];
  const un = ok ? [] : [...lastUnverified].filter((i) => !missing.has(i));
  return { personFound, ok: ok && !m.length, missing: m, unverified: un,
    detected: required.filter((i) => !m.includes(i) && !un.includes(i)) };
};
