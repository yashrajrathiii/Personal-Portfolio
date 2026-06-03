import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, ArrowUpRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import AnalyticsDialog from "./AnalyticsDialog";

export default function Header({ onOpenLogin }) {
  const { isAdmin, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goto = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-black/5" : "bg-transparent"
      }`}
    >
      <div className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between">
        <button
          onClick={() => goto("hero")}
          data-testid="header-logo"
          className="font-display font-black text-base tracking-tightest uppercase hover:text-klein transition-colors"
        >
          YRR<span className="text-klein">.</span>
        </button>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.18em] uppercase">
          {[
            ["About", "about"],
            ["Work", "projects"],
            ["Experience", "experience"],
            ["Skills", "skills"],
            ["Contact", "contact"],
          ].map(([label, id]) => (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => goto(id)}
              className="text-neutral-700 hover:text-klein transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-klein">
                <span className="w-1.5 h-1.5 bg-klein rounded-full animate-pulse" /> Edit Mode
              </span>
              <Button
                data-testid="header-analytics-button"
                variant="ghost"
                size="sm"
                onClick={() => setAnalyticsOpen(true)}
                className="rounded-none font-mono text-[11px] tracking-[0.18em] uppercase hover:text-klein"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Stats
              </Button>
              <Button
                data-testid="logout-button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  toast.success("Logged out");
                }}
                className="rounded-none font-mono text-[11px] tracking-[0.18em] uppercase"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Exit
              </Button>
            </>
          ) : (
            <Button
              data-testid="header-login-button"
              variant="ghost"
              size="sm"
              onClick={onOpenLogin}
              className="rounded-none font-mono text-[11px] tracking-[0.18em] uppercase hover:text-klein"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Admin
            </Button>
          )}
          <Button
            data-testid="header-contact-button"
            onClick={() => goto("contact")}
            className="rounded-none bg-[#0A0A0A] hover:bg-klein text-white font-mono text-[11px] tracking-[0.18em] uppercase px-4"
          >
            Let's Talk <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
      <AnalyticsDialog open={analyticsOpen} onOpenChange={setAnalyticsOpen} />
    </header>
  );
}
