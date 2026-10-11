const styles = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-white border border-slate-300 hover:bg-slate-50",
};

export function Btn({ tone = "primary", className = "", ...props }) {
  return <button {...props} className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${styles[tone]} ${className}`} />;
}
