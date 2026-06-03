import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatApiErrorDetail } from "@/lib/api";
import { EditShell, inputClasses, submitClasses } from "./_shared";

export default function EditContactDialog({ open, onOpenChange, contact }) {
  const { updateSection } = usePortfolio();
  const [form, setForm] = useState(contact);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setForm(contact); }, [open, contact]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateSection("contact", form);
      toast.success("Contact updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditShell open={open} onOpenChange={onOpenChange} title="Edit Contact" subtitle="Section 05 · Contact">
      <div className="space-y-4">
        {[
          ["email", "Email"],
          ["linkedin", "LinkedIn URL"],
          ["twitter", "Twitter URL"],
          ["location", "Location"],
        ].map(([k, label]) => (
          <div key={k} className="space-y-2">
            <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">{label}</Label>
            <Input
              data-testid={`edit-contact-${k}`}
              value={form[k] || ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className={inputClasses()}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">CTA Line</Label>
          <Textarea
            data-testid="edit-contact-cta"
            value={form.cta || ""}
            onChange={(e) => setForm({ ...form, cta: e.target.value })}
            rows={2}
            className={inputClasses()}
          />
        </div>
        <Button onClick={onSave} disabled={saving} className={submitClasses()} data-testid="save-contact-button">
          {saving ? "Saving..." : "Save Contact →"}
        </Button>
      </div>
    </EditShell>
  );
}
