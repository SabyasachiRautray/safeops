import { useState } from "react";
import { useIncidentsQuery, useIncidentActionMutation, useCreateIncidentMutation, useListQuery } from "../api";
import { API_URL } from "../config/constants";
import { Card, PageTitle, Badge, Btn, inputCls } from "../components/ui";

export default function IncidentsPage() {
  const { data = [] } = useIncidentsQuery();
  const { data: zones = [] } = useListQuery("zones");
  const [act] = useIncidentActionMutation();
  const [create] = useCreateIncidentMutation();
  const [sim, setSim] = useState({ zoneId: "", type: "fire" });

  return (
    <>
      <PageTitle>Incidents</PageTitle>

      <Card title="Simulate an emergency (demo)" className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select className={`${inputCls} max-w-xs`} value={sim.zoneId} onChange={(e) => setSim({ ...sim, zoneId: e.target.value })}>
            <option value="">Select zone…</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <select className={`${inputCls} max-w-[150px]`} value={sim.type} onChange={(e) => setSim({ ...sim, type: e.target.value })}>
            {["fire", "smoke", "manual"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <Btn tone="danger" disabled={!sim.zoneId} onClick={() => create(sim)}>
            🚨 Trigger — sirens on phones in that zone
          </Btn>
        </div>
      </Card>

      <div className="space-y-3">
        {data.map((i) => (
          <Card key={i.id} className={i.status !== "resolved" && i.severity === "critical" ? "border-red-300" : ""}>
            <div className="flex gap-4 items-start">
              {i.evidence && <img src={`${API_URL}${i.evidence}`} className="w-28 h-20 object-cover rounded-lg" />}
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <b>{i.type.toUpperCase()}</b>
                  <Badge tone="amber">{i.severity}</Badge>
                  <Badge tone={i.status === "resolved" ? "green" : i.status === "open" ? "red" : "blue"}>{i.status}</Badge>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {i.Zone?.name} {i.Camera ? `· ${i.Camera.name}` : ""} · {new Date(i.createdAt).toLocaleString()}
                </div>
              </div>
              {i.status === "open" && <Btn tone="ghost" onClick={() => act({ id: i.id, action: "ack" })}>Acknowledge</Btn>}
              {i.status !== "resolved" && <Btn onClick={() => act({ id: i.id, action: "resolve" })}>Resolve</Btn>}
            </div>
          </Card>
        ))}
        {!data.length && <p className="text-slate-400">No incidents recorded.</p>}
      </div>
    </>
  );
}
