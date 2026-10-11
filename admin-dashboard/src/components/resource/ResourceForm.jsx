import { Btn, Modal } from "../ui";
import FieldInput from "./FieldInput";

export default function ResourceForm({ fields, form, setForm, onSubmit, onClose, saving, error }) {
  return (
    <Modal title={form.id ? "Edit" : "Add"} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        {fields.map((f) => (
          <div key={f.k}>
            <label className="text-xs font-medium text-slate-500 block mb-1">{f.l}</label>
            <FieldInput field={f} value={form[f.k]} onChange={(v) => setForm({ ...form, [f.k]: v })} />
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error.data?.error || "Failed to save"}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Btn type="button" tone="ghost" onClick={onClose}>Cancel</Btn>
          <Btn disabled={saving}>Save</Btn>
        </div>
      </form>
    </Modal>
  );
}
