
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
              <div className="bg-white p-2 rounded-xl shadow-lg">
                <img 
                  src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/amazon-marine-logo.png" 
                  alt="Amazon Marine Logo" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<i class="fas fa-ship text-blue-600 text-2xl"></i>';
                  }}
                />
              </div>
              <h2 className="text-white text-2xl font-black tracking-tight">Amazon Marine</h2>
            </div>
            <p className="text-sm leading-relaxed">
              A global company specialized in sea freight and logistics services, striving to provide innovative and secure solutions for our clients worldwide. Founded on precision and trust.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i className="fab fa-facebook-f text-sm"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i className="fab fa-linkedin-in text-sm"></i></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i className="fab fa-instagram text-sm"></i></a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-8">Contact Us</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fas fa-map-marker-alt text-sm"></i>
                </div>
                <span className="text-sm">Villa 129 – 2nd District, Fifth Settlement – New Cairo.</span>
              </li>
              <li className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0">
                  <i className="fas fa-phone-alt text-sm"></i>
                </div>
                <span className="text-sm">0225601776 – 01200744888</span>
              </li>
              <li className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0">
                  <i className="fas fa-clock text-sm"></i>
                </div>
                <span className="text-sm">Sun - Thu (9AM - 6PM)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-8">Core Expertise</h3>
            <ul className="grid grid-cols-1 gap-4">
              {['Global Sea Freight', 'Reefer Transportation', 'Customs Clearance', 'Cargo Insurance', 'Inland Transport'].map(service => (
                <li key={service}>
                  <a href="#" className="text-sm hover:text-blue-400 transition-colors flex items-center gap-2 justify-center md:justify-start">
                    <i className="fas fa-chevron-right text-[8px] text-blue-600"></i>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Amazon Marine - All Rights Reserved.</p>
          <p className="text-blue-500">Founded by Captain Mostafa El-Dowlatly</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
