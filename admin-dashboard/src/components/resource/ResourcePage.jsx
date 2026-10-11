import { useState } from "react";
import { useListQuery, useSaveMutation, useRemoveMutation } from "../../api";
import { Card, PageTitle, Btn } from "../ui";
import ResourceForm from "./ResourceForm";

// Generic table + add/edit/delete page driven by a config from config/resources.jsx
export default function ResourcePage({ config }) {
  const { kind, title, cols, fields, defaults } = config;
  const { data = [], isLoading } = useListQuery(kind);
  const [save, { isLoading: saving, error }] = useSaveMutation();
  const [remove] = useRemoveMutation();
  const [form, setForm] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const { id, ...body } = form;
    const r = await save({ res: kind, id, body });
    if (!r.error) setForm(null);
  };

  return (
    <>
      <PageTitle right={<Btn onClick={() => setForm({ ...(defaults || {}) })}>+ Add</Btn>}>{title}</PageTitle>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>{cols.map(([h]) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}<th /></tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                {cols.map(([h, render]) => <td key={h} className="px-4 py-3">{render(r)}</td>)}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button className="text-emerald-600 mr-3" onClick={() => setForm({ ...r, password: "" })}>Edit</button>
                  <button className="text-red-600" onClick={() => confirm("Delete?") && remove({ res: kind, id: r.id })}>Delete</button>
                </td>
              </tr>
            ))}
            {!isLoading && !data.length && (
              <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={9}>Nothing yet</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      {form && (
        <ResourceForm fields={fields} form={form} setForm={setForm} onSubmit={submit} onClose={() => setForm(null)} saving={saving} error={error} />
      )}
    </>
  );
}
