import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatApiErrorDetail } from "@/lib/api";
import { EditShell, inputClasses, submitClasses } from "./_shared";

export default function EditAboutDialog({ open, onOpenChange, about }) {
  const { updateSection } = usePortfolio();
  const [form, setForm] = useState(about);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setForm(about); }, [open, about]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateSection("about", {
        ...form,
        paragraphs: (form.paragraphs || []).filter((p) => p.trim() !== ""),
        highlights: (form.highlights || []).filter((p) => p.trim() !== ""),
      });
      toast.success("About updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditShell open={open} onOpenChange={onOpenChange} title="Edit About" subtitle="Section 01 · About">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Section Label</Label>
          <Input
            data-testid="edit-about-label"
            value={form.label || ""}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={inputClasses()}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
            Paragraphs (one per line, first is the headline)
          </Label>
          <Textarea
            data-testid="edit-about-paragraphs"
            value={(form.paragraphs || []).join("\n\n")}
            onChange={(e) => setForm({ ...form, paragraphs: e.target.value.split(/\n{2,}/) })}
            rows={10}
            className={inputClasses()}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
            Highlights (comma-separated)
          </Label>
          <Input
            data-testid="edit-about-highlights"
            value={(form.highlights || []).join(", ")}
            onChange={(e) =>
              setForm({ ...form, highlights: e.target.value.split(",").map((s) => s.trim()) })
            }
            className={inputClasses()}
          />
        </div>
        <Button onClick={onSave} disabled={saving} className={submitClasses()} data-testid="save-about-button">
          {saving ? "Saving..." : "Save About →"}
        </Button>
      </div>
    </EditShell>
  );
}
