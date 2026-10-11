import { useStatsQuery, useIncidentsQuery, useHistoryQuery, useListQuery } from "../api";
import { Card, PageTitle, Badge } from "../components/ui";

const Stat = ({ label, value, tone }) => (
  <Card>
    <div className="text-sm text-slate-500">{label}</div>
    <div className={`text-3xl font-bold ${tone || ""}`}>{value ?? "–"}</div>
  </Card>
);

export default function OverviewPage() {
  const { data: s } = useStatsQuery();
  const { data: incidents = [] } = useIncidentsQuery();
  const { data: history = [] } = useHistoryQuery();
  const { data: zones = [] } = useListQuery("zones");

  return (
    <>
      <PageTitle>Overview</PageTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Allowed today" value={s?.allowedToday} tone="text-emerald-600" />
        <Stat label="Denied today" value={s?.deniedToday} tone="text-amber-600" />
        <Stat label="Open incidents" value={s?.openIncidents} tone="text-red-600" />
        <Stat label="Zones in alert" value={s?.zonesInAlert} tone="text-red-600" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {zones.map((z) => (
          <Card key={z.id} className={z.status === "alert" ? "border-red-400 bg-red-50" : ""}>
            <div className="flex justify-between">
              <b>{z.name}</b>
              <Badge tone={z.status === "alert" ? "red" : "green"}>{z.status}</Badge>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Risk: {z.riskLevel} · Needs: {(z.requiredPpe || []).join(", ") || "none"}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Recent incidents">
          {incidents.slice(0, 6).map((i) => (
            <div key={i.id} className="flex justify-between text-sm py-1.5 border-b last:border-0">
              <span>{i.type.toUpperCase()} · {i.Zone?.name}</span>
              <Badge tone={i.status === "resolved" ? "green" : "red"}>{i.status}</Badge>
            </div>
          ))}
          {!incidents.length && <p className="text-sm text-slate-400">All clear.</p>}
        </Card>
        <Card title="Latest gate checks">
          {history.slice(0, 6).map((h) => (
            <div key={h.id} className="flex justify-between text-sm py-1.5 border-b last:border-0">
              <span>{h.User?.name} → {h.Zone?.name}</span>
              <Badge tone={h.decision === "allowed" ? "green" : "red"}>{h.decision}</Badge>
            </div>
          ))}
          {!history.length && <p className="text-sm text-slate-400">No checks yet.</p>}
        </Card>
      </div>
    </>
  );
}
