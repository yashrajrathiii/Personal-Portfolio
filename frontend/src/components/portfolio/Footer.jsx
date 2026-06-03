import { Lock } from "lucide-react";

export default function Footer({ onOpenLogin }) {
  return (
    <footer data-testid="site-footer" className="border-t border-black/10 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 grid md:grid-cols-3 gap-8 items-end">
        <div>
          <div className="font-display font-black text-3xl uppercase tracking-tightest">
            YRR<span className="text-klein">.</span>
          </div>
          <p className="mt-2 font-mono text-[11px] tracking-[0.18em] uppercase text-neutral-500">
            Product Manager · Bengaluru
          </p>
        </div>
        <div className="text-sm text-neutral-500 font-mono tracking-wider">
          © {new Date().getFullYear()} Yash Raj Rathi.<br />
          Built with intent, not templates.
        </div>
        <div className="flex md:justify-end">
          <button
            data-testid="footer-admin-button"
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-klein font-mono text-[10px] tracking-[0.25em] uppercase transition-colors"
          >
            <Lock className="w-3 h-3" /> Admin
          </button>
        </div>
      </div>
    </footer>
  );
}
