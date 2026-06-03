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

const empty = { title: "", summary: "", impact: "", tags: [], image_url: "", role: "", year: "", span: "md" };

export default function EditProjectsDialog({ open, onOpenChange, projects, editingId, setEditingId }) {
  const { addProject, updateProject, deleteProject } = usePortfolio();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingId) {
      const p = projects.find((x) => x.id === editingId);
      if (p) setForm(p);
    } else {
      setForm(empty);
    }
  }, [open, editingId, projects]);

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags.filter((t) => t && t.trim()) : [],
      };
      if (editingId) await updateProject(editingId, payload);
      else await addProject(payload);
      toast.success(editingId ? "Project updated" : "Project added");
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
    if (!window.confirm("Delete this project?")) return;
    setSaving(true);
    try {
      await deleteProject(editingId);
      toast.success("Project deleted");
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
      title={editingId ? "Edit Project" : "Add Project"}
      subtitle="Section 02 · Work"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Title</Label>
          <Input
            data-testid="edit-proj-title"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClasses()}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Summary</Label>
          <Textarea
            data-testid="edit-proj-summary"
            value={form.summary || ""}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={3}
            className={inputClasses()}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Impact</Label>
          <Input
            data-testid="edit-proj-impact"
            value={form.impact || ""}
            onChange={(e) => setForm({ ...form, impact: e.target.value })}
            className={inputClasses()}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Year</Label>
            <Input
              data-testid="edit-proj-year"
              value={form.year || ""}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className={inputClasses()}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Role</Label>
            <Input
              data-testid="edit-proj-role"
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClasses()}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Size</Label>
            <select
              data-testid="edit-proj-span"
              value={form.span || "md"}
              onChange={(e) => setForm({ ...form, span: e.target.value })}
              className="w-full h-10 px-3 rounded-none border border-black/15 focus:outline-none focus:border-klein bg-white"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Image URL</Label>
          <Input
            data-testid="edit-proj-image"
            value={form.image_url || ""}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://..."
            className={inputClasses()}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
            Tags (comma-separated)
          </Label>
          <Input
            data-testid="edit-proj-tags"
            value={(form.tags || []).join(", ")}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((s) => s.trim()) })}
            className={inputClasses()}
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onSave} disabled={saving} className={submitClasses() + " flex-1"} data-testid="save-project-button">
            {saving ? "Saving..." : editingId ? "Update Project →" : "Add Project →"}
          </Button>
          {editingId && (
            <button
              type="button"
              onClick={onDelete}
              data-testid="delete-project-button"
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
