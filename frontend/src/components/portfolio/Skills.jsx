import { useState } from "react";
import EditButton from "./EditButton";
import EditSkillsDialog from "./edit/EditSkillsDialog";

export default function Skills({ skills }) {
  const [open, setOpen] = useState(false);
  return (
    <section
      id="skills"
      data-testid="skills-section"
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-[#0A0A0A] text-white border-t border-black/5"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">04 / Capabilities</span>
            <h2
              data-testid="skills-heading"
              className="mt-4 font-display font-black uppercase text-5xl md:text-6xl lg:text-7xl tracking-tightest leading-none"
            >
              The<br />
              <span className="text-klein" style={{ color: "#5C8AFF" }}>Toolkit</span>
            </h2>
          </div>
          <EditButton onClick={() => setOpen(true)} testid="edit-skills-button" label="Edit Skills" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {skills.groups.map((g, idx) => (
            <div
              key={idx}
              data-testid={`skill-group-${idx}`}
              className="bg-[#0A0A0A] p-6 md:p-8 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40">
                  0{idx + 1}
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: "#5C8AFF" }}>
                  {g.items.length} skills
                </span>
              </div>
              <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight mb-6">{g.category}</h3>
              <ul className="space-y-2">
                {g.items.map((it, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-white/70 hover:text-white transition-colors">
                    <span className="font-mono text-[10px]" style={{ color: "#5C8AFF" }}>—</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <EditSkillsDialog open={open} onOpenChange={setOpen} skills={skills} />
    </section>
  );
}
