import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatApiErrorDetail } from "@/lib/api";
import { EditShell, inputClasses, submitClasses } from "./_shared";

export default function EditHeroDialog({ open, onOpenChange, hero }) {
  const { updateSection } = usePortfolio();
  const [form, setForm] = useState(hero);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setForm(hero); }, [open, hero]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateSection("hero", form);
      toast.success("Hero updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditShell open={open} onOpenChange={onOpenChange} title="Edit Hero" subtitle="Section 00 · Hero">
      <div className="space-y-4">
        {[
          ["overline", "Overline"],
          ["name", "Name"],
          ["hook", "Hook (the 5-second line)"],
          ["location", "Location"],
          ["available", "Availability"],
        ].map(([k, label]) => (
          <div key={k} className="space-y-2">
            <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">{label}</Label>
            <Input
              data-testid={`edit-hero-${k}`}
              value={form[k] || ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className={inputClasses()}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">Tagline</Label>
          <Textarea
            data-testid="edit-hero-tagline"
            value={form.tagline || ""}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            rows={3}
            className={inputClasses()}
          />
        </div>
        <Button onClick={onSave} disabled={saving} className={submitClasses()} data-testid="save-hero-button">
          {saving ? "Saving..." : "Save Hero →"}
        </Button>
      </div>
    </EditShell>
  );
}
