
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Footer from './components/Footer';
import FAQSection from './components/FAQSection';
import ArbCRM from './components/ArbCRM';
import CustomsSection from './components/CustomsSection';
import { Shipment, Lead } from './types';

function App() {
  const [showCRM, setShowCRM] = useState(false);

  // Initialize mock data if nothing exists
  useEffect(() => {
    if (!localStorage.getItem('amz_shipments')) {
      const mockShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'AMZ-4921',
          customerName: 'Global Trade Co.',
          bookingDate: '2024-03-01',
          bookingNumber: 'BK-1029',
          blNumber: 'BL-99201',
          shippingLine: 'CMA',
          shipmentMode: 'Sea',
          shipmentType: 'FCL',
          shipmentDirection: 'Export',
          containerType: 'Dry',
          containerSize: '40’',
          placeOfLoading: 'Alexandria',
          pol: 'Alexandria',
          pod: 'Antwerp',
          cargoDescription: 'Frozen Vegetables',
          loadingDate: '2024-03-02',
          currentLocation: 'At Sea',
          status: 'At Sea',
          origin: 'Egypt',
          destination: 'Belgium',
          shippingDate: '2024-03-03',
          eta: '2024-03-15',
          salesRep: 'RASHA',
          currency: 'USD',
          documents: []
        }
      ];
      localStorage.setItem('amz_shipments', JSON.stringify(mockShipments));
    }
    if (!localStorage.getItem('amz_leads')) {
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'Ahmed Yassin',
          phone: '+201012345678',
          cargoType: 'Industrial Machines',
          route: 'Cairo -> Dubai',
          status: 'New',
          date: '2024-03-04',
          salesName: 'C.MOSTAFA'
        }
      ];
      localStorage.setItem('amz_leads', JSON.stringify(mockLeads));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-inter">
      {showCRM && <ArbCRM onClose={() => setShowCRM(false)} />}
      
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1600&h=600" 
            alt="Cargo Ship" 
            className="absolute inset-0 w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>
          <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-start text-white">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight max-w-2xl animate-fade-in">
              We Move Your World <br />
              <span className="text-blue-500">With Safety & Trust</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-xl leading-relaxed">
              Integrated logistics solutions including sea freight, customs clearance, and insurance. Captain Mostafa El-Dowlatly's expertise at your service.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all hover:scale-105">
                Start Shipping Now
              </button>
              <button onClick={() => document.getElementById('customs')?.scrollIntoView({behavior: 'smooth'})} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all">
                Customs Clearance Services
              </button>
            </div>
          </div>
        </section>

        {/* Features & AI Section */}
        <section id="services" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">AI-Powered Logistics Services</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">We combine deep maritime experience with tomorrow's technology to offer unique shipping experiences and real-time tracking.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Chatbot Column */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-600 h-full">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <i className="fas fa-headset text-blue-600"></i>
                    Intelligent Support & Tracking
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    Talk to our AI assistant to inquire about services, rates, or track your shipment instantly via ID.
                  </p>
                  <ChatBot />
                </div>
              </div>

              {/* Highlights Column */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-r-4 border-slate-900 flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-3">
                    <i className="fas fa-star text-blue-600"></i>
                    Why Amazon Marine?
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                        <i className="fas fa-temperature-low text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Reefer Cargo Solutions</h4>
                        <p className="text-sm text-slate-600">Specialized in temperature-sensitive cargo with the latest monitoring tech.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0">
                        <i className="fas fa-shield-alt text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">110% Insurance Coverage</h4>
                        <p className="text-sm text-slate-600">Providing maximum security for your cargo with comprehensive protection.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                        <i className="fas fa-globe text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Global Port Network</h4>
                        <p className="text-sm text-slate-600">Access to over 150 global ports with door-to-door shipping systems.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-lg overflow-hidden relative">
                  <i className="fas fa-anchor absolute -bottom-10 -right-10 text-9xl opacity-10"></i>
                  <h4 className="text-xl font-bold mb-3">24/7 Monitoring</h4>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    We believe transparency is the foundation of success, hence we provide around-the-clock monitoring teams to ensure on-time delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CustomsSection />

        <FAQSection />

        {/* Stats Section */}
        <section className="bg-white py-20 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Precision Monitoring</div>
              </div>
              <div>
                <div className="text-4xl font-black text-blue-600 mb-2">+150</div>
                <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Global Ports</div>
              </div>
              <div>
                <div className="text-4xl font-black text-blue-600 mb-2">110%</div>
                <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Insurance Cover</div>
              </div>
              <div>
                <div className="text-4xl font-black text-blue-600 mb-2">0</div>
                <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Customs Issues</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-700 to-blue-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-black mb-6">Ready to Send Your First Shipment?</h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join thousands of businesses that trust Amazon Marine to move their cargo across continents. Precision, safety, and absolute professionalism.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:01200744888" className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-phone-alt"></i>
                Call Us Now
              </a>
              <button className="bg-blue-500 text-white border-2 border-blue-400 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition-all">
                Request a Quote
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button 
          onClick={() => setShowCRM(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-600 transition-all"
          title="Staff CRM Access"
        >
          <i className="fas fa-user-shield text-2xl"></i>
        </button>
        <a 
          href="https://wa.me/01200744888" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce hover:scale-110 active:scale-95 transition-all"
        >
          <i className="fab fa-whatsapp text-3xl"></i>
        </a>
      </div>
    </div>
  );
}

export default App;
