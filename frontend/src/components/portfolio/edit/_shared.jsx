import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function EditShell({ open, onOpenChange, title, subtitle, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border-2 border-[#0A0A0A] bg-white">
        <DialogHeader>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-klein">{subtitle}</span>
          <DialogTitle className="font-display font-black uppercase text-2xl tracking-tightest leading-none">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export function inputClasses() {
  return "rounded-none border-black/15 focus-visible:ring-klein focus-visible:border-klein";
}

export function submitClasses() {
  return "w-full rounded-none bg-klein hover:bg-[#00227A] text-white font-mono text-[11px] tracking-[0.25em] uppercase py-5";
}

export function ghostBtnClasses() {
  return "rounded-none border border-black/15 text-[#0A0A0A] font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-2 hover:border-klein hover:text-klein";
}
