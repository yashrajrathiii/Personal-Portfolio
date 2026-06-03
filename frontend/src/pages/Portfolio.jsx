import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import Header from "@/components/portfolio/Header";
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import Experience from "@/components/portfolio/Experience";
import Projects from "@/components/portfolio/Projects";
import Skills from "@/components/portfolio/Skills";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";
import AdminLoginDialog from "@/components/portfolio/AdminLoginDialog";
import api from "@/lib/api";
import { useState } from "react";

function getOrCreateVisitorId() {
  let id = localStorage.getItem("yrr_visitor_id");
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem("yrr_visitor_id", id);
  }
  return id;
}

export default function Portfolio({ openAdmin = false }) {
  const { checking, isAdmin } = useAuth();
  const { data, loading } = usePortfolio();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (openAdmin) setLoginOpen(true);
  }, [openAdmin]);

  // Log visit once per session (skip if admin)
  useEffect(() => {
    if (checking) return;
    if (isAdmin) return;
    if (sessionStorage.getItem("yrr_visit_logged")) return;
    sessionStorage.setItem("yrr_visit_logged", "1");
    api
      .post("/analytics/visit", {
        path: window.location.pathname,
        referrer: document.referrer || "",
        user_agent: navigator.userAgent || "",
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || "",
        visitor_id: getOrCreateVisitorId(),
      })
      .catch(() => {});
  }, [checking, isAdmin]);

  if (checking || loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]" data-testid="portfolio-loading">
        <div className="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">Loading the portfolio</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#0A0A0A] selection:bg-klein selection:text-white">
      <Header onOpenLogin={() => setLoginOpen(true)} />
      <main>
        <Hero hero={data.hero} />
        <About about={data.about} />
        <Projects projects={data.projects} />
        <Experience experience={data.experience} />
        <Skills skills={data.skills} />
        <Contact contact={data.contact} />
      </main>
      <Footer onOpenLogin={() => setLoginOpen(true)} />
      <AdminLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
