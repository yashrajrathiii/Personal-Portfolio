import { useState } from "react";
import EditButton from "./EditButton";
import EditExperienceDialog from "./edit/EditExperienceDialog";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Experience({ experience }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { isAdmin } = useAuth();
  return (
    <section
      id="experience"
      data-testid="experience-section"
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20 border-t border-black/5"
    >
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-10 lg:gap-16">
        <div className="md:col-span-4 lg:col-span-3">
          <div className="md:sticky md:top-32">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">03 / Experience</span>
            <h2
              data-testid="experience-heading"
              className="mt-4 font-display font-black uppercase text-4xl md:text-5xl tracking-tightest leading-none"
            >
              Where<br />I've shipped
            </h2>
            {isAdmin && (
              <button
                data-testid="add-experience-button"
                onClick={() => {
                  setEditingId(null);
                  setOpen(true);
                }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-klein text-klein font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-klein hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          <div className="relative border-l border-black/15">
            {experience.map((e) => (
              <div
                key={e.id}
                data-testid={`experience-item-${e.id}`}
                className="group relative pl-8 md:pl-12 pb-12 last:pb-0"
              >
                <span className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#0A0A0A] group-hover:border-klein group-hover:bg-klein transition-colors" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-klein">
                      {e.duration}
                      {e.location && <span className="text-neutral-400"> · {e.location}</span>}
                    </div>
                    <h3 className="mt-2 font-display font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                      {e.role}
                      <span className="text-neutral-400"> · </span>
                      <span className="text-klein">{e.company}</span>
                    </h3>
                    {e.bullets && e.bullets.length > 0 && (
                      <ul className="mt-4 space-y-2 text-neutral-600 leading-relaxed max-w-2xl">
                        {e.bullets.map((b, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-klein font-bold mt-1">—</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {isAdmin && (
                    <EditButton
                      onClick={() => {
                        setEditingId(e.id);
                        setOpen(true);
                      }}
                      testid={`edit-experience-${e.id}`}
                      label="Edit Role"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditExperienceDialog
        open={open}
        onOpenChange={setOpen}
        experience={experience}
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </section>
  );
}
