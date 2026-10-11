import { useListQuery } from "../../api";
import { inputCls } from "../ui";

export default function FieldInput({ field: f, value, onChange }) {
  const { data } = useListQuery(f.from || "plants", { skip: !f.from });

  if (f.t === "select") {
    const options = f.from ? (data || []).map((x) => ({ v: x.id, l: x.name })) : f.options;
    return (
      <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">{f.optional ? "— none —" : "Select…"}</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    );
  }
  if (f.t === "multi") {
    const cur = value || [];
    return (
      <div className="flex flex-wrap gap-2">
        {f.options.map((o) => (
          <button
            type="button" key={o}
            onClick={() => onChange(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o])}
            className={`px-3 py-1 rounded-full text-sm border ${cur.includes(o) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600"}`}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (f.t === "check")
    return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />;

  return <input className={inputCls} type={f.t || "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}
