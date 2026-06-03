import { useState } from "react";
import EditButton from "./EditButton";
import EditContactDialog from "./edit/EditContactDialog";
import { Mail, Linkedin, Github, MapPin, ArrowUpRight, Phone } from "lucide-react";

export default function Contact({ contact }) {
  const [open, setOpen] = useState(false);
  const phoneTel = (contact.phone || "").replace(/\s+/g, "");
  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-24 md:py-40 px-6 md:px-12 lg:px-20 border-t border-black/5 bg-[#FDFDFD]"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-start justify-between mb-12">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">05 / Contact</span>
          </div>
          <EditButton onClick={() => setOpen(true)} testid="edit-contact-button" label="Edit Contact" />
        </div>

        <h2
          data-testid="contact-cta"
          className="font-display font-black uppercase text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tightest leading-[0.9] max-w-5xl"
        >
          {contact.cta.split(" ").map((w, i) => (
            <span key={i} className={i === contact.cta.split(" ").length - 1 ? "text-klein" : ""}>
              {w}{" "}
            </span>
          ))}
        </h2>

        <div className="mt-16 grid md:grid-cols-2 gap-6 max-w-4xl">
          <a
            data-testid="contact-email-link"
            href={`mailto:${contact.email}`}
            className="group flex items-start gap-4 p-6 border border-black/10 hover:border-klein hover-lift"
          >
            <Mail className="w-5 h-5 text-klein mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">Email</div>
              <div className="mt-1 font-display font-bold text-lg break-all group-hover:text-klein transition-colors">
                {contact.email}
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-neutral-300 group-hover:text-klein group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
          </a>

          <a
            data-testid="contact-phone-link"
            href={`tel:${phoneTel}`}
            className="group flex items-start gap-4 p-6 border border-black/10 hover:border-klein hover-lift"
          >
            <Phone className="w-5 h-5 text-klein mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">Phone</div>
              <div className="mt-1 font-display font-bold text-lg group-hover:text-klein transition-colors">
                {contact.phone || "—"}
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-neutral-300 group-hover:text-klein group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
          </a>

          <a
            data-testid="contact-linkedin-link"
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-6 border border-black/10 hover:border-klein hover-lift"
          >
            <Linkedin className="w-5 h-5 text-klein mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">LinkedIn</div>
              <div className="mt-1 font-display font-bold text-lg group-hover:text-klein transition-colors">
                /yash-raj-rathi
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-neutral-300 group-hover:text-klein group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
          </a>

          <a
            data-testid="contact-github-link"
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-6 border border-black/10 hover:border-klein hover-lift"
          >
            <Github className="w-5 h-5 text-klein mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">GitHub</div>
              <div className="mt-1 font-display font-bold text-lg group-hover:text-klein transition-colors">
                /yashrajrathiii
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-neutral-300 group-hover:text-klein group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
          </a>

          <div className="md:col-span-2 flex items-start gap-4 p-6 border border-dashed border-black/15">
            <MapPin className="w-5 h-5 text-klein mt-1 shrink-0" />
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500">Based in</div>
              <div data-testid="contact-location" className="mt-1 font-display font-bold text-lg">
                {contact.location}
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditContactDialog open={open} onOpenChange={setOpen} contact={contact} />
    </section>
  );
}
