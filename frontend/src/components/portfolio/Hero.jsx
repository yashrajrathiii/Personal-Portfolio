import { useState } from "react";
import EditButton from "./EditButton";
import EditHeroDialog from "./edit/EditHeroDialog";
import { ArrowDown } from "lucide-react";

export default function Hero({ hero }) {
  const [editing, setEditing] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-screen pt-32 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Edit button */}
      <div className="absolute top-24 right-6 md:right-12 lg:right-20 z-10">
        <EditButton onClick={() => setEditing(true)} testid="edit-hero-button" label="Edit Hero" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Overline */}
        <div className="flex items-center gap-3 mb-8 fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="w-8 h-px bg-klein" />
          <span data-testid="hero-overline" className="font-mono text-[11px] tracking-[0.3em] uppercase text-klein">
            {hero.overline}
          </span>
        </div>

        {/* Name */}
        <h1
          data-testid="hero-name"
          className="font-display font-black uppercase tracking-tightest leading-[0.85] text-[18vw] md:text-[14vw] lg:text-[11vw] fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          {hero.name.split(" ").map((word, i) => (
            <span key={i} className="block">
              {word === hero.name.split(" ")[hero.name.split(" ").length - 1] ? (
                <span>
                  {word}
                  <span className="text-klein">.</span>
                </span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>

        {/* Hook + tagline */}
        <div className="mt-12 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 md:col-start-6 fade-up" style={{ animationDelay: "0.35s" }}>
            <p
              data-testid="hero-hook"
              className="font-display font-bold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight text-[#0A0A0A]"
            >
              {hero.hook}
            </p>
            <p data-testid="hero-tagline" className="mt-6 text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl">
              {hero.tagline}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-8 font-mono text-[11px] tracking-[0.2em] uppercase text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span data-testid="hero-available">{hero.available}</span>
              </div>
              <div>
                <span className="text-neutral-400">Based in </span>
                <span data-testid="hero-location" className="text-[#0A0A0A]">{hero.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <button
          data-testid="hero-scroll-cue"
          onClick={() => scrollTo("about")}
          className="absolute bottom-8 left-6 md:left-12 lg:left-20 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase text-neutral-500 hover:text-klein transition-colors"
        >
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          Scroll
        </button>
      </div>

      {/* Marquee bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-black/5 bg-white/30 backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap font-display font-bold text-sm tracking-tight uppercase">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex items-center gap-12 px-6">
              {["Product Strategy", "0→1 Discovery", "User Research", "Roadmapping", "Data-Driven", "PRD Craft", "Cross-Functional", "Workshop Facilitation", "Growth Loops", "Experiment Design"].map((w) => (
                <span key={w} className="flex items-center gap-12 text-neutral-700">
                  {w}
                  <span className="text-klein">★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <EditHeroDialog open={editing} onOpenChange={setEditing} hero={hero} />
    </section>
  );
}
