import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatApiErrorDetail } from "@/lib/api";
import { EditShell, inputClasses, submitClasses } from "./_shared";
import { Plus, X } from "lucide-react";

export default function EditSkillsDialog({ open, onOpenChange, skills }) {
  const { updateSection } = usePortfolio();
  const [groups, setGroups] = useState(skills.groups || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setGroups(skills.groups || []); }, [open, skills]);

  const updateGroup = (idx, patch) => {
    const next = [...groups];
    next[idx] = { ...next[idx], ...patch };
    setGroups(next);
  };
  const removeGroup = (idx) => setGroups(groups.filter((_, i) => i !== idx));
  const addGroup = () => setGroups([...groups, { category: "New Category", items: [] }]);

  const onSave = async () => {
    setSaving(true);
    try {
      const cleaned = groups
        .filter((g) => g.category && g.category.trim())
        .map((g) => ({
          category: g.category,
          items: (Array.isArray(g.items) ? g.items : []).filter((it) => it && it.trim()),
        }));
      await updateSection("skills", { groups: cleaned });
      toast.success("Skills updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditShell open={open} onOpenChange={onOpenChange} title="Edit Skills" subtitle="Section 04 · Capabilities">
      <div className="space-y-5">
        {groups.map((g, idx) => (
          <div key={idx} className="border border-black/10 p-4 space-y-3" data-testid={`edit-skill-group-${idx}`}>
            <div className="flex items-center gap-2">
              <Input
                value={g.category}
                onChange={(e) => updateGroup(idx, { category: e.target.value })}
                placeholder="Category"
                className={inputClasses()}
              />
              <button
                type="button"
                onClick={() => removeGroup(idx)}
                className="p-2 border border-black/15 hover:border-red-500 hover:text-red-600"
                data-testid={`remove-skill-group-${idx}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                Items (comma-separated)
              </Label>
              <Input
                value={(g.items || []).join(", ")}
                onChange={(e) => updateGroup(idx, { items: e.target.value.split(",").map((s) => s.trim()) })}
                className={inputClasses() + " mt-1"}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addGroup}
          data-testid="add-skill-group-button"
          className="w-full py-3 border border-dashed border-black/15 font-mono text-[11px] tracking-[0.2em] uppercase text-neutral-500 hover:border-klein hover:text-klein flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
        <Button onClick={onSave} disabled={saving} className={submitClasses()} data-testid="save-skills-button">
          {saving ? "Saving..." : "Save Skills →"}
        </Button>
      </div>
    </EditShell>
  );
}
