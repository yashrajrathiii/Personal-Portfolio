import { useState } from "react";
import EditButton from "./EditButton";
import EditProjectsDialog from "./edit/EditProjectsDialog";
import { ArrowUpRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const spanClasses = {
  sm: "md:col-span-4",
  md: "md:col-span-6",
  lg: "md:col-span-8",
};

function ProjectCard({ p, onEdit }) {
  const { isAdmin } = useAuth();
  const span = spanClasses[p.span] || spanClasses.md;
  return (
    <article
      data-testid={`project-card-${p.id}`}
      className={`group relative border border-black/10 bg-white hover-lift hover:border-klein ${span}`}
    >
      {p.image_url ? (
        <div className="aspect-[16/10] overflow-hidden bg-neutral-100 border-b border-black/10">
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-[16/6] grid-bg border-b border-black/10 flex items-end p-6">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-400">No Cover</span>
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
              {p.year && <span>{p.year}</span>}
              {p.year && p.role && <span className="w-1 h-1 bg-neutral-300 rounded-full" />}
              {p.role && <span>{p.role}</span>}
            </div>
            <h3 className="mt-3 font-display font-bold text-2xl md:text-3xl tracking-tight leading-tight">
              {p.title}
            </h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-klein group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>

        <p className="mt-4 text-neutral-600 leading-relaxed">{p.summary}</p>

        {p.impact && (
          <div className="mt-6 pt-4 border-t border-black/10">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400">Impact</span>
            <p className="mt-1 font-display font-bold text-base md:text-lg text-klein">{p.impact}</p>
          </div>
        )}

        {p.tags && p.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {p.tags.map((t, i) => (
              <span key={i} className="font-mono text-[10px] tracking-[0.15em] uppercase text-neutral-500 border border-black/10 px-2 py-1">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="absolute top-3 right-3 z-10">
          <EditButton onClick={onEdit} testid={`edit-project-${p.id}`} label="Edit Project" />
        </div>
      )}
    </article>
  );
}

export default function Projects({ projects }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { isAdmin } = useAuth();

  return (
    <section
      id="projects"
      data-testid="projects-section"
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-white border-t border-black/5"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">02 / Work</span>
            <h2
              data-testid="projects-heading"
              className="mt-4 font-display font-black uppercase text-5xl md:text-6xl lg:text-7xl tracking-tightest leading-none"
            >
              My<br />
              <span className="text-klein">Projects</span>
            </h2>
          </div>
          {isAdmin && (
            <button
              data-testid="add-project-button"
              onClick={() => {
                setEditingId(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-klein text-white font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-[#00227A] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 auto-rows-auto">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              p={p}
              onEdit={() => {
                setEditingId(p.id);
                setOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <EditProjectsDialog
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        editingId={editingId}
        setEditingId={setEditingId}
      />
    </section>
  );
}
