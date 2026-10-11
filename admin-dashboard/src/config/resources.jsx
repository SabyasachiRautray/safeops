import { Badge } from "../components/ui";
import { PPE_TYPES, ROLES } from "./constants";

// Declarative config: one generic <ResourcePage/> drives plants / zones / cameras / users.
// field types: text (default) | password | number | select | multi | check
const toOptions = (arr) => arr.map((v) => ({ v, l: v }));

export const plantsConfig = {
  kind: "plants",
  title: "Plants",
  cols: [["Name", (r) => <b>{r.name}</b>], ["Location", (r) => r.location]],
  fields: [{ k: "name", l: "Name" }, { k: "location", l: "Location" }],
};

export const zonesConfig = {
  kind: "zones",
  title: "Zones & Safety Rules",
  cols: [
    ["Zone", (r) => <b>{r.name}</b>],
    ["Plant", (r) => r.Plant?.name],
    ["Risk", (r) => <Badge tone={r.riskLevel === "high" ? "red" : r.riskLevel === "medium" ? "amber" : "green"}>{r.riskLevel}</Badge>],
    ["Required PPE", (r) => (r.requiredPpe || []).join(", ") || "—"],
    ["Fire check", (r) => (r.fireCheck ? "On" : "Off")],
    ["Status", (r) => <Badge tone={r.status === "alert" ? "red" : "green"}>{r.status}</Badge>],
  ],
  fields: [
    { k: "name", l: "Zone name" },
    { k: "plantId", l: "Plant", t: "select", from: "plants" },
    { k: "riskLevel", l: "Risk level", t: "select", options: toOptions(["low", "medium", "high"]) },
    { k: "requiredPpe", l: "Required PPE", t: "multi", options: PPE_TYPES },
    { k: "allowedRoles", l: "Roles allowed to enter", t: "multi", options: ROLES },
    { k: "fireCheck", l: "Run fire/smoke check at entry", t: "check" },
  ],
  defaults: { riskLevel: "medium", requiredPpe: ["helmet", "vest"], allowedRoles: ROLES, fireCheck: true },
};

export const camerasConfig = {
  kind: "cameras",
  title: "Cameras",
  cols: [
    ["Name", (r) => <b>{r.name}</b>], ["Zone", (r) => r.Zone?.name],
    ["Type", (r) => r.type], ["Active", (r) => (r.active ? "Yes" : "No")],
  ],
  fields: [
    { k: "name", l: "Camera name" },
    { k: "zoneId", l: "Zone", t: "select", from: "zones" },
    { k: "type", l: "Source", t: "select", options: toOptions(["webcam", "rtsp", "upload"]) },
    { k: "streamUrl", l: "Stream URL (RTSP, optional)" },
    { k: "active", l: "Active", t: "check" },
  ],
  defaults: { type: "webcam", active: true },
};

export const usersConfig = {
  kind: "users",
  title: "People",
  cols: [
    ["Name", (r) => <b>{r.name}</b>], ["Email", (r) => r.email],
    ["Role", (r) => <Badge tone="blue">{r.role}</Badge>], ["Emp. code", (r) => r.employeeCode],
    ["Home zone", (r) => r.Zone?.name], ["Active", (r) => (r.active ? "Yes" : "Disabled")],
  ],
  fields: [
    { k: "name", l: "Full name" },
    { k: "email", l: "Email" },
    { k: "password", l: "Password (leave blank to keep)", t: "password" },
    { k: "role", l: "Role", t: "select", options: toOptions(ROLES) },
    { k: "employeeCode", l: "Employee code" },
    { k: "zoneId", l: "Home zone", t: "select", from: "zones", optional: true },
    { k: "active", l: "Active", t: "check" },
  ],
  defaults: { role: "worker", active: true },
};
