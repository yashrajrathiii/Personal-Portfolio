import { useState } from "react";
import EditButton from "./EditButton";
import EditAboutDialog from "./edit/EditAboutDialog";

export default function About({ about }) {
  const [editing, setEditing] = useState(false);
  return (
    <section
      id="about"
      data-testid="about-section"
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-20 border-t border-black/5"
    >
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-10 lg:gap-16">
        {/* Left sticky */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="md:sticky md:top-32">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">01 / About</span>
            <h2
              data-testid="about-label"
              className="font-display font-black uppercase text-4xl md:text-5xl tracking-tightest mt-4 leading-none"
            >
              {about.label}
            </h2>
            <div className="mt-8 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                What I optimize for
              </span>
              <EditButton onClick={() => setEditing(true)} testid="edit-about-button" label="Edit About" />
            </div>
          </div>
        </div>

        {/* Right paragraphs */}
        <div className="md:col-span-8 lg:col-span-9 space-y-8">
          {about.paragraphs.map((p, i) => (
            <p
              key={i}
              data-testid={`about-paragraph-${i}`}
              className={`leading-relaxed ${
                i === 0
                  ? "font-display font-medium text-2xl md:text-3xl lg:text-4xl tracking-tight text-[#0A0A0A]"
                  : "text-base md:text-lg text-neutral-600 max-w-3xl"
              }`}
            >
              {p}
            </p>
          ))}

          <div className="pt-8 mt-8 border-t border-black/10 flex flex-wrap gap-3">
            {about.highlights.map((h, i) => (
              <span
                key={i}
                data-testid={`about-highlight-${i}`}
                className="inline-flex items-center px-4 py-2 border border-klein/30 text-klein font-mono text-[11px] tracking-[0.15em] uppercase hover:bg-klein hover:text-white transition-colors"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
      <EditAboutDialog open={editing} onOpenChange={setEditing} about={about} />
    </section>
  );
}
