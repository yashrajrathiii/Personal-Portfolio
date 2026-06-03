import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatApiErrorDetail } from "@/lib/api";
import { EditShell, inputClasses, submitClasses, ghostBtnClasses } from "./_shared";
import { Trash2 } from "lucide-react";

const empty = { role: "", company: "", duration: "", location: "", bullets: [] };

export default function EditExperienceDialog({ open, onOpenChange, experience, editingId, setEditingId }) {
  const { addExperience, updateExperience, deleteExperience } = usePortfolio();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingId) {
      const e = experience.find((x) => x.id === editingId);
      if (e) setForm(e);
    } else {
      setForm(empty);
    }
  }, [open, editingId, experience]);

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        bullets: (form.bullets || []).filter((b) => b && b.trim() !== ""),
      };
      if (editingId) await updateExperience(editingId, payload);
      else await addExperience(payload);
      toast.success(editingId ? "Role updated" : "Role added");
      onOpenChange(false);
      setEditingId(null);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editingId) return;
    if (!window.confirm("Delete this role?")) return;
    setSaving(true);
    try {
      await deleteExperience(editingId);
      toast.success("Role deleted");
      onOpenChange(false);
      setEditingId(null);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditShell
      open={open}
      onOpenChange={onOpenChange}
      title={editingId ? "Edit Role" : "Add Role"}
      subtitle="Section 03 · Experience"
    >
      <div className="space-y-4">
        {[
          ["role", "Role"],
          ["company", "Company"],
          ["duration", "Duration (e.g. 2024 — Present)"],
          ["location", "Location"],
        ].map(([k, label]) => (
          <div key={k} className="space-y-2">
            <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">{label}</Label>
            <Input
              data-testid={`edit-exp-${k}`}
              value={form[k] || ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className={inputClasses()}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
            Bullets (one per line)
          </Label>
          <Textarea
            data-testid="edit-exp-bullets"
            value={(form.bullets || []).join("\n")}
            onChange={(e) => setForm({ ...form, bullets: e.target.value.split("\n") })}
            rows={6}
            className={inputClasses()}
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onSave} disabled={saving} className={submitClasses() + " flex-1"} data-testid="save-experience-button">
            {saving ? "Saving..." : editingId ? "Update Role →" : "Add Role →"}
          </Button>
          {editingId && (
            <button
              type="button"
              onClick={onDelete}
              data-testid="delete-experience-button"
              className={ghostBtnClasses() + " text-red-600 border-red-200 hover:border-red-500 hover:text-red-700"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </EditShell>
  );
}
