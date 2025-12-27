
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [trackingNo, setTrackingNo] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNo.trim()) return;

    const event = new CustomEvent('trackShipment', { detail: trackingNo });
    window.dispatchEvent(event);

    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    setTimeout(() => {
      setTrackingNo('');
    }, 500);
    
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Our Services', href: '#services' },
    { name: 'Customs', href: '#customs' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-white p-1 rounded-lg">
              <img 
                src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/amazon-marine-logo.png" 
                alt="Amazon Marine Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<i class="fas fa-ship text-blue-600 text-2xl"></i>';
                }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black tracking-tight whitespace-nowrap leading-none">AMAZON MARINE</h1>
              <p className="text-[9px] text-blue-400 uppercase font-black tracking-[0.2em] hidden sm:block mt-1">Global Logistics</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex space-x-8 items-center text-sm font-semibold">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="hover:text-blue-400 transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <form onSubmit={handleTrack} className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-700 focus-within:border-blue-500 transition-all">
              <input 
                type="text" 
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="Track No. (e.g. AMZ-123)"
                className="bg-transparent border-none text-xs px-3 py-1.5 outline-none w-40"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
              >
                <i className="fas fa-search"></i>
                Track
              </button>
            </form>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <form onSubmit={handleTrack} className="flex items-center bg-slate-800 rounded-full p-1 border border-slate-700 focus-within:border-blue-500 transition-all max-w-[150px] sm:max-w-none">
              <input 
                type="text" 
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="Track..."
                className="bg-transparent border-none text-[10px] sm:text-xs px-2 py-1 outline-none w-16 sm:w-24"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all"
                aria-label="Track"
              >
                <i className="fas fa-search text-[10px] sm:text-xs"></i>
              </button>
            </form>

            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-xl text-slate-300 hover:text-white transition-colors"
              aria-label="Open Menu"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        {/* Sidebar */}
        <div 
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-lg">
                <img 
                  src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/amazon-marine-logo.png" 
                  alt="Amazon Marine" 
                  className="h-6 w-auto object-contain"
                />
              </div>
              <span className="font-black text-sm tracking-tight">AMAZON MARINE</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Close Menu"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
            <div className="flex flex-col gap-4 text-left font-bold text-lg">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-slate-300 hover:text-blue-400 transition-all flex items-center justify-between group"
                >
                  {link.name}
                  <i className="fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></i>
                </a>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800">
              <a 
                href="#contact" 
                onClick={() => setIsMenuOpen(false)}
                className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 transition-all"
              >
                Contact Us Now
              </a>
            </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-slate-950/50">
            <div className="flex justify-around text-slate-400 text-xl">
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-facebook"></i></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
