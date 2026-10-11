import { useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import LoginPage from "./pages/LoginPage";
import useLiveEvents from "./hooks/useLiveEvents";

export default function App() {
  const { token, user } = useSelector((s) => s.auth);
  useLiveEvents(token); // live refresh when incidents happen

  if (!token) return <LoginPage />;
  if (user.role === "worker")
    return <div className="p-10 text-center">Workers use the mobile app. Please log out.</div>;
  return <AppRoutes />;
}
