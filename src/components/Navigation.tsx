import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import sharkLogo from "@/assets/shark-logo.png";
export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
    setIsMobileMenuOpen(false);
  };
  const handleBetbraClick = () => {
    window.open("https://betbra.bet.br/register/?affid=shark100", "_blank");
  };
  const handleVideoClick = () => {
    window.open("https://www.youtube.com/watch?v=jRyoWL-plJ0&list=PLMxf7zH7RQEDdrP26qkavZC2o134fle2L", "_blank");
  };
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-card shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => window.scrollTo({
          top: 0,
          behavior: "smooth"
        })} className="flex items-center gap-2">
            <img src={sharkLogo} alt="Shark 100% Green" className="h-10 w-auto" />
            <span className="text-xl font-black hidden sm:inline">
              <span className="text-gradient">Shark  100% Green </span>
              
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => scrollToSection("calculadoras")} className="hover:text-primary">
              Calculadoras
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("casas")} className="hover:text-primary">
              Ferramentas Extras
            </Button>
            <Button variant="ghost" onClick={handleVideoClick} className="hover:text-primary">
              Video Calculadoras
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("sobre")} className="hover:text-primary">
              Sobre
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("contato")} className="hover:text-primary">
              Contato
            </Button>
            
            {/* Separador */}
            <div className="w-px h-6 bg-border/50" />
            
            {/* Toggle de Tema */}
            <ThemeToggle />
            
            {/* Botão Betbra Destacado */}
            <Button onClick={handleBetbraClick} className="relative bg-[#00D9D9] text-black hover:bg-[#00C4C4] shadow-lg hover:shadow-xl transition-all font-bold">
              <span className="flex flex-col items-center gap-0 leading-tight">
                <span className="text-sm">Cadastro</span>
                <span className="text-sm">Betbra</span>
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {/* Botão Betbra Mobile */}
            <Button onClick={handleBetbraClick} className="w-full bg-[#00D9D9] text-black hover:bg-[#00C4C4] shadow-lg mb-3 font-bold">
              <span className="flex flex-col items-center leading-tight">
                <span className="text-sm">Cadastro Betbra</span>
                <span className="text-xs opacity-70">Oferta Exclusiva</span>
              </span>
            </Button>

            <Button variant="ghost" onClick={() => scrollToSection("calculadoras")} className="w-full justify-start hover:text-primary">
              Calculadoras
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("casas")} className="w-full justify-start hover:text-primary">
              Ferramentas Extras
            </Button>
            <Button variant="ghost" onClick={handleVideoClick} className="w-full justify-start hover:text-primary">
              Video Calculadoras
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("sobre")} className="w-full justify-start hover:text-primary">
              Sobre
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("contato")} className="w-full justify-start hover:text-primary">
              Contato
            </Button>
          </div>}
      </div>
    </nav>;
};