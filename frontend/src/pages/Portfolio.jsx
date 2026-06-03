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
import { useState } from "react";

export default function Portfolio({ openAdmin = false }) {
  const { checking } = useAuth();
  const { data, loading } = usePortfolio();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (openAdmin) setLoginOpen(true);
  }, [openAdmin]);

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
