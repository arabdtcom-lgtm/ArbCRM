
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Lead, Shipment, LeadStatus, ShipmentStatus, ShipDoc } from '../types';
import { generateDashboardBrief, parseLogisticsText } from '../services/geminiService';
import { OFFICIAL_SHIPPING_LINES } from '../constants';

// --- Improved Components with better Touch Handling ---

const InteractiveStatusBadge = memo(({ status, onChange }: { status: LeadStatus, onChange: (s: LeadStatus) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const getStyle = (s: LeadStatus) => {
    switch (s) {
      case 'New': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Contacted': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Quoted': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'Won': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Lost': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Quoted', 'Won', 'Lost'];

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${getStyle(status)}`}
      >
        <span>{status}</span>
        <i className={`fas fa-chevron-down text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl z-[300] overflow-hidden py-1 animate-scale-in">
          {statuses.map(s => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onChange(s); setIsOpen(false); }}
              className={`w-full text-left px-4 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 active:bg-white/10 transition-all flex items-center gap-3 ${status === s ? 'text-blue-400 bg-blue-400/5' : 'text-slate-400'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const InteractiveShipmentStatusBadge = memo(({ status, onChange }: { status: ShipmentStatus, onChange: (s: ShipmentStatus) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const getStyle = (s: ShipmentStatus) => {
    switch (s) {
      case 'Pending': return 'bg-orange-600/20 text-orange-500 border-orange-500/30';
      case 'In Transit': return 'bg-blue-600/20 text-blue-400 border-blue-400/30';
      case 'At Sea': return 'bg-cyan-600/20 text-cyan-400 border-cyan-400/30';
      case 'Customs': return 'bg-purple-600/20 text-purple-400 border-purple-400/30';
      case 'Delivered': return 'bg-green-600/20 text-green-400 border-green-400/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const statuses: ShipmentStatus[] = ['Pending', 'In Transit', 'At Sea', 'Customs', 'Delivered'];

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 group shadow-sm ${getStyle(status)}`}
      >
        {status}
        <i className={`fas fa-chevron-down text-[8px] ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-[300] overflow-hidden py-1 animate-scale-in">
          {statuses.map(s => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onChange(s); setIsOpen(false); }}
              className={`w-full text-left px-4 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 active:bg-white/10 transition-all flex items-center gap-3 ${status === s ? 'text-blue-400 bg-blue-400/5' : 'text-slate-400'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const KPIBox = memo(({ label, val, icon }: any) => (
  <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all group flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-600 transition-all">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <div className="mt-6">
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{label}</div>
      <div className="text-3xl font-black text-white tracking-tighter">{val}</div>
    </div>
  </div>
));

const ArbCRM: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'shipments' | 'customs' | 'team'>(() => {
    return (localStorage.getItem('amz_active_tab') as any) || 'dashboard';
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [salesReps, setSalesReps] = useState<string[]>([]);
  const [dashboardBrief, setDashboardBrief] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [directionFilter, setDirectionFilter] = useState('All');
  const [lineFilter, setLineFilter] = useState('All');
  const [shipmentSearchTerm, setShipmentSearchTerm] = useState('');

  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedShipmentForDocs, setSelectedShipmentForDocs] = useState<Shipment | null>(null);
  const [selectedDocForEmail, setSelectedDocForEmail] = useState<ShipDoc | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  
  const [importText, setImportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [newShipmentData, setNewShipmentData] = useState<Partial<Shipment>>({
    trackingNumber: '',
    customerName: '',
    bookingNumber: '',
    blNumber: '',
    shippingLine: OFFICIAL_SHIPPING_LINES[0],
    shipmentMode: 'Sea',
    shipmentType: 'FCL',
    shipmentDirection: 'Export',
    containerType: 'Dry',
    containerSize: '40’',
    origin: '',
    destination: '',
    eta: getTodayDate(),
    loadingDate: getTodayDate(),
    bookingDate: getTodayDate(),
    shippingDate: getTodayDate(),
    currency: 'USD',
    status: 'Pending'
  });

  useEffect(() => {
    localStorage.setItem('amz_active_tab', activeTab);
  }, [activeTab]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    const savedReps = JSON.parse(localStorage.getItem('amz_sales_reps') || '["C.MOSTAFA", "RASHA", "AYA", "YOUNS"]');
    const savedLeads = JSON.parse(localStorage.getItem('amz_leads') || '[]');
    const savedShipments = JSON.parse(localStorage.getItem('amz_shipments') || '[]');
    
    setSalesReps(savedReps);
    setLeads(savedLeads);
    setShipments(savedShipments);

    const loadBrief = async () => {
      try {
        const brief = await generateDashboardBrief({ leads: savedLeads, shipments: savedShipments });
        setDashboardBrief(brief);
      } catch (e) { console.error("Brief generation error:", e); }
    };
    loadBrief();
  }, []);

  const syncData = useCallback((newL?: Lead[], newS?: Shipment[], newR?: string[]) => {
    if (newL) { localStorage.setItem('amz_leads', JSON.stringify(newL)); setLeads(newL); }
    if (newS) { localStorage.setItem('amz_shipments', JSON.stringify(newS)); setShipments(newS); }
    if (newR) { localStorage.setItem('amz_sales_reps', JSON.stringify(newR)); setSalesReps(newR); }
  }, []);

  const handleSmartImport = async () => {
    if (!importText.trim() || isParsing) return;
    setIsParsing(true);
    try {
      const parsedData = await parseLogisticsText(importText);
      const newShipment: Shipment = {
        id: Date.now().toString(),
        trackingNumber: parsedData.trackingNumber || `AMZ-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: parsedData.customerName || 'NEW CLIENT',
        blNumber: parsedData.blNumber || 'TBD',
        bookingNumber: parsedData.bookingNumber || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        shippingLine: parsedData.shippingLine?.value || 'MSC',
        origin: parsedData.origin || 'UNDEFINED',
        destination: parsedData.destination || 'UNDEFINED',
        placeOfLoading: parsedData.origin || 'UNDEFINED',
        pol: parsedData.origin || 'UNDEFINED',
        pod: parsedData.destination || 'UNDEFINED',
        cargoDescription: parsedData.cargoDescription || 'AI Generated Entry',
        inlandFreight: parsedData.inlandFreight || 0,
        gensetCost: parsedData.gensetCost || 0,
        officialReceipts: parsedData.officialReceipts || 0,
        overnightStay: parsedData.overnightStay || 0,
        currency: (parsedData.currency as any) || 'USD',
        status: 'Pending',
        detailedCustomsStatus: 'Not Started',
        shipmentMode: 'Sea',
        shipmentType: 'FCL',
        shipmentDirection: 'Export',
        containerType: 'Dry',
        containerSize: '40’',
        bookingDate: getTodayDate(),
        loadingDate: getTodayDate(),
        currentLocation: 'Hub',
        shippingDate: getTodayDate(),
        eta: parsedData.eta || getTodayDate(),
        salesRep: salesReps[0],
        documents: [],
      };
      const updated = [...shipments, newShipment];
      syncData(undefined, updated);
      setIsSmartImportOpen(false);
      setImportText('');
      showToast('Neural Data Stream Parsed Successfully.');
    } catch (err) {
      console.error(err);
      showToast('Parsing failed. Review input format.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualAdd = () => {
    const { trackingNumber, customerName, origin, destination } = newShipmentData;
    if (!trackingNumber || !customerName || !origin || !destination) {
      showToast('Missing required fields (ID, Client, Origin, Destination)', 'error');
      return;
    }

    const fullShipment: Shipment = {
      id: Date.now().toString(),
      salesRep: salesReps[0],
      currentLocation: origin as string,
      detailedCustomsStatus: 'Not Started',
      placeOfLoading: origin as string,
      pol: origin as string,
      pod: destination as string,
      cargoDescription: 'Manual Entry',
      documents: [],
      ...newShipmentData as Shipment
    };

    const updated = [...shipments, fullShipment];
    syncData(undefined, updated);
    setIsManualAddOpen(false);
    showToast('New Shipment Assets Recorded.');
    setNewShipmentData({
        trackingNumber: '',
        customerName: '',
        bookingNumber: '',
        blNumber: '',
        shippingLine: OFFICIAL_SHIPPING_LINES[0],
        shipmentMode: 'Sea',
        shipmentType: 'FCL',
        shipmentDirection: 'Export',
        containerType: 'Dry',
        containerSize: '40’',
        origin: '',
        destination: '',
        eta: getTodayDate(),
        loadingDate: getTodayDate(),
        bookingDate: getTodayDate(),
        shippingDate: getTodayDate(),
        currency: 'USD',
        status: 'Pending'
    });
  };

  const handleOpenDocs = (shipment: Shipment) => {
    setSelectedShipmentForDocs(shipment);
    setIsDocsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedShipmentForDocs) return;

    const newDoc: ShipDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      status: 'Pending',
      uploadDate: getTodayDate()
    };

    const updatedShipments = shipments.map(s => {
      if (s.id === selectedShipmentForDocs.id) {
        const updatedDocs = [...(s.documents || []), newDoc];
        const updatedShipment = { ...s, documents: updatedDocs };
        setSelectedShipmentForDocs(updatedShipment);
        return updatedShipment;
      }
      return s;
    });

    syncData(undefined, updatedShipments);
    showToast(`Document "${file.name}" uploaded.`);
  };

  const handleVerifyDoc = (docId: string) => {
    if (!selectedShipmentForDocs) return;

    const updatedShipments = shipments.map(s => {
      if (s.id === selectedShipmentForDocs.id) {
        const updatedDocs = s.documents?.map(d => 
          d.id === docId ? { ...d, status: d.status === 'Verified' ? 'Pending' : 'Verified' as any } : d
        );
        const updatedShipment = { ...s, documents: updatedDocs };
        setSelectedShipmentForDocs(updatedShipment);
        return updatedShipment;
      }
      return s;
    });

    syncData(undefined, updatedShipments);
  };

  const handleDeleteDoc = (docId: string) => {
    if (!selectedShipmentForDocs) return;

    const updatedShipments = shipments.map(s => {
      if (s.id === selectedShipmentForDocs.id) {
        const updatedDocs = s.documents?.filter(d => d.id !== docId);
        const updatedShipment = { ...s, documents: updatedDocs };
        setSelectedShipmentForDocs(updatedShipment);
        return updatedShipment;
      }
      return s;
    });

    syncData(undefined, updatedShipments);
    showToast('Document removed from manifest.');
  };

  const handleInitiateEmail = (doc: ShipDoc) => {
    setSelectedDocForEmail(doc);
    setIsEmailModalOpen(true);
  };

  const handleSendEmailLink = () => {
    if (!recipientEmail || !selectedDocForEmail || !selectedShipmentForDocs) return;
    
    const subject = encodeURIComponent(`Amazon Marine Logistics: Document Link - ${selectedShipmentForDocs.trackingNumber}`);
    const directLink = `${window.location.origin}/view-doc/${selectedDocForEmail.id}`;
    const body = encodeURIComponent(
      `Dear Partner,\n\nPlease find the requested document linked below for shipment ${selectedShipmentForDocs.trackingNumber} (${selectedShipmentForDocs.customerName}).\n\nDocument Name: ${selectedDocForEmail.name}\nDirect Link: ${directLink}\n\nThank you,\nAmazon Marine Ops Team`
    );
    
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    
    setIsEmailModalOpen(false);
    setRecipientEmail('');
    showToast(`Email drafted for ${recipientEmail}`);
  };

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const dirMatch = directionFilter === 'All' || s.shipmentDirection === directionFilter;
      const lineMatch = lineFilter === 'All' || s.shippingLine === lineFilter;
      const sMatch = !shipmentSearchTerm || 
        (s.trackingNumber?.toLowerCase() || '').includes(shipmentSearchTerm.toLowerCase()) ||
        (s.customerName?.toLowerCase() || '').includes(shipmentSearchTerm.toLowerCase());
      return dirMatch && lineMatch && sMatch;
    });
  }, [shipments, directionFilter, lineFilter, shipmentSearchTerm]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#020617] flex flex-col md:flex-row font-inter text-slate-300 antialiased overflow-hidden" dir="ltr">
      {notification && (
        <div className="fixed bottom-10 right-10 z-[3000] bg-slate-900 border border-slate-800 px-8 py-4 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-4">
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-rose-500'}`}></i>
          <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#020617] border-r border-slate-800 flex flex-col shrink-0 z-[160]">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-lg p-1">
             <img src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/amazon-marine-logo.png" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-xs font-black text-white tracking-widest uppercase">Amazon CRM</h1>
        </div>

        <nav className="flex-1 px-6 space-y-1 overflow-x-auto md:overflow-y-auto flex md:flex-col pb-4 md:pb-0 scrollbar-hide">
          {[
            { id: 'dashboard', icon: 'fa-rocket', label: 'HUB' },
            { id: 'leads', icon: 'fa-users', label: 'Prospects' },
            { id: 'shipments', icon: 'fa-ship', label: 'Manifest' },
            { id: 'customs', icon: 'fa-file-shield', label: 'Customs' },
            { id: 'team', icon: 'fa-id-badge', label: 'Team' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)}
              className={`min-w-max md:min-w-0 flex items-center gap-4 p-4 rounded-xl transition-all active:scale-95 ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6 text-center`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-800 hidden md:block">
           <button onClick={onClose} className="w-full text-slate-600 hover:text-rose-500 flex items-center justify-center gap-3 text-[10px] font-black uppercase transition-colors">
             <i className="fas fa-power-off"></i> Exit System
           </button>
        </div>
      </aside>

      {/* Main Command Console */}
      <main className="flex-1 overflow-y-auto bg-[#020617] p-6 md:p-12 relative scrollbar-hide">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-fade-in">
            <header className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard Command</h2>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Status: Online</p>
              </div>
              <button onClick={onClose} className="md:hidden w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 active:scale-90">
                <i className="fas fa-times"></i>
              </button>
            </header>

            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><i className="fas fa-brain text-sm"></i></div>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Strategic Brief</h3>
               </div>
               <p className="text-lg text-blue-100/70 italic leading-relaxed">
                 "{dashboardBrief || "Synthesizing latest telemetry..."}"
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <KPIBox label="Manifest Units" val={shipments.length} icon="fa-box" />
               <KPIBox label="In Transit" val={shipments.filter(s => s.status !== 'Delivered').length} icon="fa-truck" />
               <KPIBox label="Leads Pool" val={leads.length} icon="fa-user-clock" />
               <KPIBox label="Conversions" val={leads.filter(l => l.status === 'Won').length} icon="fa-trophy" />
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Fleet Manifest</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase mt-1">{filteredShipments.length} Active Records</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => setIsSmartImportOpen(true)} className="flex-1 sm:flex-none bg-slate-800 text-slate-300 px-6 py-4 rounded-xl text-[10px] font-black uppercase active:scale-95">AI Parse</button>
                <button onClick={() => setIsManualAddOpen(true)} className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 active:scale-95">New Entry</button>
              </div>
            </header>

            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-4">
               <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"></i>
                  <input 
                    type="text" 
                    placeholder="Search by ID or Entity..." 
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                    value={shipmentSearchTerm}
                    onChange={(e) => setShipmentSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-4">
                 <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)} className="bg-[#020617] border border-slate-800 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none active:bg-slate-800 transition-colors">
                    <option value="All">All Directions</option>
                    <option value="Export">Export</option>
                    <option value="Import">Import</option>
                 </select>
                 <select value={lineFilter} onChange={e => setLineFilter(e.target.value)} className="bg-[#020617] border border-slate-800 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none active:bg-slate-800 transition-colors">
                    <option value="All">All Lines</option>
                    {OFFICIAL_SHIPPING_LINES.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
               </div>
            </div>

            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs whitespace-nowrap">
                   <thead className="bg-[#020617] text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                     <tr>
                       <th className="px-8 py-6">Tracking / ID</th>
                       <th className="px-8 py-6">Customer / Route</th>
                       <th className="px-8 py-6">Status Node</th>
                       <th className="px-8 py-6 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/30">
                     {filteredShipments.map(s => (
                       <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-mono font-black text-blue-400 text-sm tracking-tighter">{s.trackingNumber}</div>
                            <div className="text-[9px] text-slate-600 mt-1 uppercase font-bold">{s.shippingLine}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-black text-white">{s.customerName}</div>
                            <div className="text-[9px] text-slate-600 mt-1 uppercase font-bold">{s.origin} → {s.destination}</div>
                          </td>
                          <td className="px-8 py-6">
                             <InteractiveShipmentStatusBadge status={s.status} onChange={status => {
                               const updated = shipments.map(x => x.id === s.id ? { ...x, status } : x);
                               syncData(undefined, updated);
                             }} />
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2">
                               <button 
                                 onClick={() => handleOpenDocs(s)}
                                 className="w-10 h-10 rounded-lg bg-slate-800 text-slate-500 hover:text-blue-500 active:scale-95 transition-all flex items-center justify-center relative group"
                                 title="Manage Documents"
                               >
                                 <i className="fas fa-folder-open text-xs"></i>
                                 {s.documents && s.documents.length > 0 && (
                                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                                     {s.documents.length}
                                   </span>
                                 )}
                               </button>
                               <button className="w-10 h-10 rounded-lg bg-slate-800 text-slate-500 hover:text-blue-500 active:scale-95 transition-all flex items-center justify-center">
                                 <i className="fas fa-ellipsis-v text-xs"></i>
                               </button>
                             </div>
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* Smart Import Modal */}
        {isSmartImportOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-[#0f172a] w-full max-w-xl rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl animate-scale-in">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Metadata Parser</h3>
                 <button onClick={() => setIsSmartImportOpen(false)} className="text-slate-500 hover:text-white p-4 active:scale-90"><i className="fas fa-times text-lg"></i></button>
              </div>
              <textarea 
                 className="w-full h-48 bg-[#020617] border border-slate-800 rounded-2xl p-6 text-blue-400 font-mono text-xs outline-none mb-6 focus:border-blue-500 transition-all shadow-inner"
                 placeholder="Paste manifest or invoice data..."
                 value={importText}
                 onChange={e => setImportText(e.target.value)}
              />
              <button 
                onClick={handleSmartImport} 
                disabled={isParsing || !importText.trim()} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-600 active:scale-95"
              >
                {isParsing ? <><i className="fas fa-circle-notch animate-spin"></i> Analyzing...</> : <><i className="fas fa-bolt"></i> Run Intelligence Scan</>}
              </button>
            </div>
          </div>
        )}

        {/* Manual Add Modal */}
        {isManualAddOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/90 flex items-center justify-center p-4 md:p-6 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] border border-slate-800 p-6 md:p-10 shadow-2xl my-8 animate-scale-in">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Asset Registration</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Direct Manifest Entry</p>
                 </div>
                 <button onClick={() => setIsManualAddOpen(false)} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:scale-90 transition-all">
                    <i className="fas fa-times text-lg"></i>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tracking ID *</label>
                    <input type="text" placeholder="e.g. AMZ-9021" className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.trackingNumber} onChange={e => setNewShipmentData({...newShipmentData, trackingNumber: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client Name *</label>
                    <input type="text" placeholder="Entity Name" className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.customerName} onChange={e => setNewShipmentData({...newShipmentData, customerName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Shipping Line</label>
                    <select className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.shippingLine} onChange={e => setNewShipmentData({...newShipmentData, shippingLine: e.target.value})}>
                        {OFFICIAL_SHIPPING_LINES.map(line => <option key={line} value={line}>{line}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Origin *</label>
                    <input type="text" placeholder="Port of Origin" className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.origin} onChange={e => setNewShipmentData({...newShipmentData, origin: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination *</label>
                    <input type="text" placeholder="Port of Discharge" className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.destination} onChange={e => setNewShipmentData({...newShipmentData, destination: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ETA Date</label>
                    <input type="date" className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.eta} onChange={e => setNewShipmentData({...newShipmentData, eta: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Shipment Mode</label>
                    <select className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.shipmentMode} onChange={e => setNewShipmentData({...newShipmentData, shipmentMode: e.target.value as any})}>
                        <option value="Sea">Sea Freight</option>
                        <option value="Land">Land Transport</option>
                        <option value="Air">Air Cargo</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Container Type</label>
                    <select className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.containerType} onChange={e => setNewShipmentData({...newShipmentData, containerType: e.target.value as any})}>
                        <option value="Dry">Dry</option>
                        <option value="Reefer">Reefer</option>
                        <option value="Open Top">Open Top</option>
                        <option value="Flat Rack">Flat Rack</option>
                        <option value="High Cube">High Cube</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Direction</label>
                    <select className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3.5 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all" value={newShipmentData.shipmentDirection} onChange={e => setNewShipmentData({...newShipmentData, shipmentDirection: e.target.value as any})}>
                        <option value="Export">Export</option>
                        <option value="Import">Import</option>
                    </select>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                 <button onClick={() => setIsManualAddOpen(false)} className="flex-1 bg-slate-800 text-slate-400 py-4 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all">Cancel</button>
                 <button onClick={handleManualAdd} className="flex-[2] bg-blue-600 text-white py-4 rounded-xl text-[10px] font-black uppercase shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Confirm Dispatch</button>
              </div>
            </div>
          </div>
        )}

        {/* Document Management Modal */}
        {isDocsModalOpen && selectedShipmentForDocs && (
          <div className="fixed inset-0 z-[1100] bg-slate-950/90 flex items-center justify-center p-4 md:p-6 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#0f172a] w-full max-w-3xl rounded-[2.5rem] border border-slate-800 p-6 md:p-10 shadow-2xl my-8 animate-scale-in">
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                      <i className="fas fa-folder-open text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Document Vault</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Ref: {selectedShipmentForDocs.trackingNumber} | {selectedShipmentForDocs.customerName}
                      </p>
                    </div>
                 </div>
                 <button onClick={() => setIsDocsModalOpen(false)} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:scale-90 transition-all">
                    <i className="fas fa-times text-lg"></i>
                 </button>
              </div>

              <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-center relative group">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <i className="fas fa-cloud-upload-alt text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Click or Drag to Upload</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">PDF, JPG, PNG, DOC (MAX 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Active Files ({selectedShipmentForDocs.documents?.length || 0})</h4>
                
                {(!selectedShipmentForDocs.documents || selectedShipmentForDocs.documents.length === 0) ? (
                  <div className="py-12 text-center bg-slate-900/20 rounded-2xl border border-slate-800/50">
                    <i className="fas fa-inbox text-4xl text-slate-800 mb-4"></i>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No documents attached to this unit.</p>
                  </div>
                ) : (
                  selectedShipmentForDocs.documents.map(doc => (
                    <div key={doc.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                          doc.type === 'PDF' ? 'bg-rose-500/10 text-rose-500' : 
                          doc.type === 'DOC' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {doc.type}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white truncate max-w-[150px] md:max-w-[250px]">{doc.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-slate-600 font-bold uppercase">{doc.uploadDate}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              doc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleInitiateEmail(doc)}
                          className="w-9 h-9 rounded-lg bg-slate-800 text-slate-500 hover:text-blue-400 active:scale-90 transition-all"
                          title="Email Link"
                        >
                          <i className="fas fa-envelope text-[10px]"></i>
                        </button>
                        <button 
                          onClick={() => handleVerifyDoc(doc.id)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                            doc.status === 'Verified' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-800 text-slate-500 hover:text-emerald-500'
                          }`}
                          title={doc.status === 'Verified' ? 'Unverify' : 'Verify'}
                        >
                          <i className="fas fa-check-double text-[10px]"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="w-9 h-9 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-500 active:scale-90 transition-all"
                          title="Delete Document"
                        >
                          <i className="fas fa-trash-alt text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center">
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Global Ops Node: Delta-7</p>
                <button onClick={() => setIsDocsModalOpen(false)} className="bg-slate-800 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all">Close Vault</button>
              </div>
            </div>
          </div>
        )}

        {/* Email Document Link Modal */}
        {isEmailModalOpen && selectedDocForEmail && (
          <div className="fixed inset-0 z-[1200] bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-[#0f172a] w-full max-w-md rounded-[2rem] border border-slate-800 p-8 shadow-2xl animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-black text-white uppercase tracking-tighter">Share Document Link</h3>
                 <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-500 hover:text-white p-2"><i className="fas fa-times"></i></button>
              </div>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">A direct link to <span className="text-blue-400">"{selectedDocForEmail.name}"</span> will be sent to the recipient via professional email draft.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Recipient Email</label>
                  <input 
                    type="email" 
                    placeholder="partner@logistics.com"
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-4 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <button 
                  onClick={handleSendEmailLink}
                  disabled={!recipientEmail.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-paper-plane"></i>
                  Draft Email Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default memo(ArbCRM);
