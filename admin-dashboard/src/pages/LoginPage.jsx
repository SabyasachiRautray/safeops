import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../api";
import { setAuth } from "../store/authSlice";
import { Btn, inputCls } from "../components/ui";

export default function LoginPage() {
  const [f, setF] = useState({ email: "admin@safeops.com", password: "admin123" });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();
    const r = await login(f);
    if (r.data) dispatch(setAuth(r.data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 w-96 space-y-4">
        <div className="text-center">
          <div className="text-3xl">🛡️</div>
          <h1 className="text-2xl font-bold text-emerald-600">SafeOps AI</h1>
          <p className="text-sm text-slate-500">Plant safety control room</p>
        </div>
        <input className={inputCls} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={inputCls} type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error.data?.error || "Login failed"}</p>}
        <Btn className="w-full" disabled={isLoading}>Sign in</Btn>
      </form>
    </div>
  );
}
