import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";

const links = [
  ["/", "Overview"], ["/gate", "Gate Check"], ["/monitor", "Live Monitor"], ["/incidents", "Incidents"],
  ["/plants", "Plants"], ["/zones", "Zones & Rules"], ["/cameras", "Cameras"], ["/users", "People"],
];

export default function Layout() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-white border-r border-slate-200 p-4 flex flex-col">
        <div className="text-xl font-bold text-emerald-600 mb-6">🛡️ SafeOps AI</div>
        <nav className="space-y-1 flex-1">
          {links.map(([to, label]) => (
            <NavLink
              key={to} to={to} end={to === "/"}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="text-xs text-slate-500 border-t pt-3">
          <div className="font-medium text-slate-700">{user.name}</div>
          <div className="capitalize">{user.role}</div>
          <button onClick={() => dispatch(logout())} className="mt-2 text-emerald-600 hover:underline">Log out</button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-6xl"><Outlet /></main>
    </div>
  );
}
