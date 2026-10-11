export function Card({ title, children, className = "", right }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{children}</h1>
      {right}
    </div>
  );
}
