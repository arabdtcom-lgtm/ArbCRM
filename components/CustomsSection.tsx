
import React from 'react';

const CustomsSection: React.FC = () => {
  const ports = [
    { name: "Alexandria / Dekheila Port", icon: "fa-anchor" },
    { name: "Damietta Port", icon: "fa-ship" },
    { name: "Sokhna Port", icon: "fa-industry" },
    { name: "Port Said East/West", icon: "fa-map-marked-alt" }
  ];

  const features = [
    {
      title: "ACID Support",
      desc: "We assist in extracting ACID numbers via Nafeza and reviewing CargoX with professional precision.",
      icon: "fa-file-signature"
    },
    {
      title: "Document Review",
      desc: "Rigorous inspection of invoices and origin certificates pre-shipment to avoid fines or delays.",
      icon: "fa-clipboard-check"
    },
    {
      title: "Fast-Track Clearance",
      desc: "Our average clearance time is the fastest due to long-standing relations and customs expertise.",
      icon: "fa-bolt"
    }
  ];

  return (
    <section id="customs" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
        <i className="fas fa-file-invoice text-[40rem] absolute -top-20 -right-20 rotate-12"></i>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 text-left">
            <div>
              <span className="text-blue-500 font-black uppercase tracking-[0.2em] text-sm">Customs Clearance Experts</span>
              <h2 className="text-4xl md:text-5xl font-black mt-4 leading-tight">
                Clearance Specialists <br/>
                <span className="text-blue-400">& Nafeza Partners</span>
              </h2>
            </div>
            
            <p className="text-slate-400 text-lg leading-relaxed">
              Customs procedures are among the most complex stages of the logistics process. We provide specialized teams across all Egyptian and global ports to ensure your cargo flows without technical or legal obstacles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ports.map((port, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <i className={`fas ${port.icon} text-blue-500`}></i>
                  <span className="font-bold text-sm">{port.name}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-2xl transition-all flex items-center gap-3 w-fit"
            >
              <i className="fas fa-headset"></i>
              Get Immediate Consultation
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {features.map((f, idx) => (
              <div key={idx} className="bg-white group hover:bg-blue-600 transition-all duration-500 p-8 rounded-[2rem] shadow-2xl flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/20 group-hover:text-white transition-all">
                  <i className={`fas ${f.icon} text-2xl`}></i>
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-white transition-all">{f.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed group-hover:text-blue-50 transition-all">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default CustomsSection;
