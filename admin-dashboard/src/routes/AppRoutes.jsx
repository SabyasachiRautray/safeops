import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import OverviewPage from "../pages/OverviewPage";
import GateCheckPage from "../pages/GateCheckPage";
import MonitorPage from "../pages/MonitorPage";
import IncidentsPage from "../pages/IncidentsPage";
import PlantsPage from "../pages/PlantsPage";
import ZonesPage from "../pages/ZonesPage";
import CamerasPage from "../pages/CamerasPage";
import UsersPage from "../pages/UsersPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<OverviewPage />} />
        <Route path="gate" element={<GateCheckPage />} />
        <Route path="monitor" element={<MonitorPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="plants" element={<PlantsPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="cameras" element={<CamerasPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
