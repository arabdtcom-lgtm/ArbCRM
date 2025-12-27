
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Lead, Shipment, LeadStatus, ShipmentStatus, DetailedCustomsStatus, ActivityLog, TelemetryPoint, ShipDoc } from '../types';
import { queryCrmData, generateDashboardBrief, parseLogisticsText } from '../services/geminiService';
import { OFFICIAL_SHIPPING_LINES } from '../constants';

// --- Optimized Sub-Components ---

const InteractiveStatusBadge = memo(({ status, onChange }: { status: LeadStatus, onChange: (s: LeadStatus) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getIcon = (s: LeadStatus) => {
    switch (s) {
      case 'New': return 'fa-plus-circle';
      case 'Contacted': return 'fa-headset';
      case 'Quoted': return 'fa-file-invoice-dollar';
      case 'Won': return 'fa-trophy';
      case 'Lost': return 'fa-times-circle';
      default: return 'fa-user-tag';
    }
  };

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Quoted', 'Won', 'Lost'];

  return (
    <div className="relative inline-block" ref={containerRef} onClick={e => e.stopPropagation()}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:brightness-125 active:scale-95 shadow-sm group ${getStyle(status)}`}
      >
        <i className={`fas ${getIcon(status)} transition-transform group-hover:scale-110`}></i>
        {status}
        <i className={`fas fa-chevron-down text-[8px] ml-1 transition-transform opacity-50 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-[#0f172a] border border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] overflow-hidden py-1.5 animate-scale-in backdrop-blur-xl">
          <div className="px-3 py-1.5 mb-1 border-b border-slate-800/50">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Update Lifecycle Stage</span>
          </div>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3 ${status === s ? 'text-blue-400 bg-blue-400/5' : 'text-slate-400'}`}
            >
              <i className={`fas ${getIcon(s)} w-4 text-center ${status === s ? 'text-blue-500' : 'text-slate-600'}`}></i>
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStyle = (s: ShipmentStatus) => {
    switch (s) {
      case 'Pending': return 'bg-orange-600/20 text-orange-500 border-orange-500/30';
      case 'In Transit': return 'bg-blue-600/20 text-blue-400 border-blue-400/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]';
      case 'At Sea': return 'bg-cyan-600/20 text-cyan-400 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]';
      case 'Customs': return 'bg-purple-600/20 text-purple-400 border-purple-400/30';
      case 'Delivered': return 'bg-green-600/20 text-green-400 border-green-400/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getIcon = (s: ShipmentStatus) => {
    switch (s) {
      case 'Pending': return 'fa-clock';
      case 'In Transit': return 'fa-truck-fast';
      case 'At Sea': return 'fa-ship';
      case 'Customs': return 'fa-file-shield';
      case 'Delivered': return 'fa-circle-check';
      default: return 'fa-box';
    }
  };

  const statuses: ShipmentStatus[] = ['Pending', 'In Transit', 'At Sea', 'Customs', 'Delivered'];

  return (
    <div className="relative" ref={containerRef} onClick={e => e.stopPropagation()}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 group shadow-sm ${getStyle(status)}`}
      >
        <span className="flex items-center gap-2">
          {(status === 'In Transit' || status === 'At Sea') && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
            </span>
          )}
          <i className={`fas ${getIcon(status)} transition-transform group-hover:rotate-12`}></i>
          {status}
        </span>
        <i className={`fas fa-chevron-down text-[8px] ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-scale-in backdrop-blur-xl">
          <div className="px-4 py-2 text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 mb-1">Set Global Status</div>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3 ${status === s ? 'text-blue-400 bg-blue-400/5' : 'text-slate-400'}`}
            >
              <i className={`fas ${getIcon(s)} w-4 text-center`}></i>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const MiniSparkline = memo(({ color }: { color: string }) => (
  <svg className="w-16 h-8 opacity-30" viewBox="0 0 100 40">
    <path d="M0,35 Q20,10 40,30 T80,5 T100,25" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
));

const ArbCRM: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Navigation State Persistence
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'shipments' | 'customs' | 'team'>(() => {
    return (localStorage.getItem('amz_active_tab') as any) || 'dashboard';
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [salesReps, setSalesReps] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [dashboardBrief, setDashboardBrief] = useState<string | null>(null);

  // Filters State Persistence
  const [cargoFilter, setCargoFilter] = useState<string>(() => localStorage.getItem('amz_filter_cargo') || 'All');
  const [salesFilter, setSalesFilter] = useState<string>(() => localStorage.getItem('amz_filter_sales') || 'All');
  const [directionFilter, setDirectionFilter] = useState<string>(() => localStorage.getItem('amz_filter_direction') || 'All');
  const [lineFilter, setLineFilter] = useState<string>(() => localStorage.getItem('amz_filter_line') || 'All');
  const [customsPriorityFilter, setCustomsPriorityFilter] = useState<'All' | 'Priority'>(() => (localStorage.getItem('amz_filter_customs_priority') as any) || 'All');

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isEditingShipment, setIsEditingShipment] = useState(false);
  const [editingShipmentValues, setEditingShipmentValues] = useState<Partial<Shipment>>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editingLeadValues, setEditingLeadValues] = useState<Partial<Lead>>({});
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [isAddingShipment, setIsAddingShipment] = useState(false);
  const [isAddingRep, setIsAddingRep] = useState(false);
  const [newRepName, setNewRepName] = useState('');

  // Smart Import Modal State
  const [isSmartImportOpen, setIsSmartImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Sync Navigation & Filter State to LocalStorage
  useEffect(() => { localStorage.setItem('amz_active_tab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('amz_filter_cargo', cargoFilter); }, [cargoFilter]);
  useEffect(() => { localStorage.setItem('amz_filter_sales', salesFilter); }, [salesFilter]);
  useEffect(() => { localStorage.setItem('amz_filter_direction', directionFilter); }, [directionFilter]);
  useEffect(() => { localStorage.setItem('amz_filter_line', lineFilter); }, [lineFilter]);
  useEffect(() => { localStorage.setItem('amz_filter_customs_priority', customsPriorityFilter); }, [customsPriorityFilter]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addActivity = useCallback((msg: string, type: ActivityLog['type'] = 'info') => {
    const newLog: ActivityLog = { id: Math.random().toString(), timestamp: new Date().toISOString(), message: msg, type };
    setActivities(prev => [newLog, ...prev].slice(0, 10));
  }, []);

  const getDemoDocs = (verifiedCount: number = 0): ShipDoc[] => [
    { id: '1', name: 'Bill of Lading', type: 'Core', status: verifiedCount > 0 ? 'Verified' : 'Pending', uploadDate: getTodayDate() },
    { id: '2', name: 'Commercial Invoice', type: 'Core', status: verifiedCount > 1 ? 'Verified' : 'Pending', uploadDate: getTodayDate() },
    { id: '3', name: 'Packing List', type: 'Core', status: verifiedCount > 2 ? 'Verified' : 'Missing', uploadDate: '-' },
    { id: '4', name: 'Certificate of Origin', type: 'Core', status: verifiedCount > 3 ? 'Verified' : 'Missing', uploadDate: '-' },
  ];

  useEffect(() => {
    const savedReps = JSON.parse(localStorage.getItem('amz_sales_reps') || '["C.MOSTAFA", "RASHA", "AYA", "YOUNS"]');
    setSalesReps(savedReps);

    let savedLeads = JSON.parse(localStorage.getItem('amz_leads') || '[]');
    let savedShipments = JSON.parse(localStorage.getItem('amz_shipments') || '[]');

    // Seed Demo Data if empty
    if (savedShipments.length === 0) {
      savedShipments = [
        {
          id: 'demo-1',
          trackingNumber: 'AMZ-9901',
          customerName: 'Global Trade Corp',
          bookingDate: getTodayDate(),
          bookingNumber: 'BK-77221',
          blNumber: 'MSCU-LON-001',
          shippingLine: 'MSC',
          shipmentMode: 'Sea',
          shipmentType: 'FCL',
          shipmentDirection: 'Export',
          containerType: 'Dry',
          containerSize: '40’',
          origin: 'Egypt',
          destination: 'Germany',
          pol: 'Alexandria',
          pod: 'Hamburg',
          cargoDescription: 'Industrial Machinery Components',
          loadingDate: getTodayDate(),
          shippingDate: getTodayDate(),
          eta: '2024-05-20',
          currentLocation: 'Med Sea',
          status: 'At Sea',
          salesRep: 'C.MOSTAFA',
          currency: 'USD',
          inlandFreight: 450,
          gensetCost: 0,
          officialReceipts: 120,
          overnightStay: 0,
          otherExpenses: 50,
          weightKg: 18500,
          documents: getDemoDocs(2),
          detailedCustomsStatus: 'Docs Received'
        },
        {
          id: 'demo-2',
          trackingNumber: 'AMZ-8854',
          customerName: 'Nile Logistics Ltd',
          bookingDate: getTodayDate(),
          bookingNumber: 'BK-99100',
          blNumber: 'CMA-ALX-442',
          shippingLine: 'CMA',
          shipmentMode: 'Sea',
          shipmentType: 'FCL',
          shipmentDirection: 'Export',
          containerType: 'Reefer',
          containerSize: '40’',
          origin: 'Egypt',
          destination: 'UAE',
          pol: 'Port Said',
          pod: 'Jebel Ali',
          cargoDescription: 'Frozen Strawberries - IQF',
          loadingDate: getTodayDate(),
          shippingDate: getTodayDate(),
          eta: '2024-05-10',
          currentLocation: 'Suez Canal',
          status: 'In Transit',
          salesRep: 'RASHA',
          currency: 'USD',
          inlandFreight: 600,
          gensetCost: 150,
          officialReceipts: 200,
          overnightStay: 0,
          otherExpenses: 0,
          weightKg: 22000,
          documents: getDemoDocs(4),
          detailedCustomsStatus: 'Released'
        }
      ];
      localStorage.setItem('amz_shipments', JSON.stringify(savedShipments));
    }

    if (savedLeads.length === 0) {
      savedLeads = [
        { id: 'l1', name: 'Mohamed Ahmed', phone: '0100223344', companyName: 'Nile Exports', cargoType: 'Dry', route: 'ALX -> HAM', status: 'Won', date: getTodayDate(), salesName: 'C.MOSTAFA', shipmentTrackingNumber: 'AMZ-9901' },
        { id: 'l2', name: 'Sara Kamel', phone: '0122334455', companyName: 'Kamel Fruits', cargoType: 'Refrigerated', route: 'PSD -> DXB', status: 'Won', date: getTodayDate(), salesName: 'RASHA', shipmentTrackingNumber: 'AMZ-8854' }
      ];
      localStorage.setItem('amz_leads', JSON.stringify(savedLeads));
    }
    
    setLeads(savedLeads);
    setShipments(savedShipments);

    const loadBrief = async () => {
      if (savedLeads.length || savedShipments.length) {
        try {
          const brief = await generateDashboardBrief({ leads: savedLeads, shipments: savedShipments });
          setDashboardBrief(brief);
        } catch (e) { console.error(e); }
      }
    };
    loadBrief();
  }, []);

  const syncData = useCallback((newL?: Lead[], newS?: Shipment[], newR?: string[]) => {
    if (newL) { localStorage.setItem('amz_leads', JSON.stringify(newL)); setLeads(newL); }
    if (newS) { localStorage.setItem('amz_shipments', JSON.stringify(newS)); setShipments(newS); }
    if (newR) { localStorage.setItem('amz_sales_reps', JSON.stringify(newR)); setSalesReps(newR); }
  }, []);

  const stats = useMemo(() => {
    const active = shipments.filter(s => s.status !== 'Delivered').length;
    const leadsWon = leads.filter(l => l.status === 'Won').length;
    const totalFreightValue = shipments.reduce((acc, s) => acc + (s.inlandFreight || 0), 0);
    return { active, leadsWon, total: shipments.length, revenue: totalFreightValue };
  }, [shipments, leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const cargoMatch = cargoFilter === 'All' || l.cargoType === cargoFilter;
      const salesMatch = salesFilter === 'All' || l.salesName === salesFilter;
      return cargoMatch && salesMatch;
    });
  }, [leads, cargoFilter, salesFilter]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const directionMatch = directionFilter === 'All' || s.shipmentDirection === directionFilter;
      const lineMatch = lineFilter === 'All' || s.shippingLine === lineFilter;
      const salesMatch = salesFilter === 'All' || s.salesRep === salesFilter;
      return directionMatch && lineMatch && salesMatch;
    });
  }, [shipments, directionFilter, lineFilter, salesFilter]);

  const filteredCustomsShipments = useMemo(() => {
    return filteredShipments.filter(s => {
      if (customsPriorityFilter === 'Priority') {
        return s.status === 'Customs' || s.detailedCustomsStatus !== 'Released' || s.documents?.some(d => d.status === 'Missing');
      }
      return true;
    });
  }, [filteredShipments, customsPriorityFilter]);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiThinking) return;
    setIsAiThinking(true);
    try {
      const response = await queryCrmData(aiQuery, { leads, shipments });
      setAiResponse(response);
    } catch (err) {
      setAiResponse("System conflict. Accessing data node failed.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const jumpToShipment = useCallback((trackingNumber: string) => {
    const target = shipments.find(s => s.trackingNumber === trackingNumber);
    if (target) {
      setActiveTab('shipments');
      setSelectedShipment(target);
      setSelectedLead(null);
    } else {
      showToast(`Vessel matching ${trackingNumber} not found in live manifest.`, 'error');
    }
  }, [shipments, showToast]);

  const handleUpdateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads(prev => {
      const next = prev.map(l => l.id === id ? { ...l, status } : l);
      localStorage.setItem('amz_leads', JSON.stringify(next));
      return next;
    });
    showToast(`Lead status updated to ${status.toUpperCase()}`);
    addActivity(`Record ${id} set to ${status}`, 'info');
  }, [showToast, addActivity]);

  const handleUpdateShipmentStatus = useCallback((id: string, status: ShipmentStatus) => {
    setShipments(prev => {
      const next = prev.map(s => s.id === id ? { ...s, status } : s);
      localStorage.setItem('amz_shipments', JSON.stringify(next));
      return next;
    });
    showToast('Freight Status Escalated');
    addActivity(`Shipment ${id} marked as ${status}`, 'success');
  }, [showToast, addActivity]);

  const handleUpdateDetailedCustomsStatus = useCallback((id: string, status: DetailedCustomsStatus) => {
    setShipments(prev => {
      const next = prev.map(s => s.id === id ? { ...s, detailedCustomsStatus: status } : s);
      localStorage.setItem('amz_shipments', JSON.stringify(next));
      return next;
    });
    showToast('Customs Detailed Status Updated');
    addActivity(`Shipment ${id} customs stage: ${status}`, 'info');
  }, [showToast, addActivity]);

  const toggleDocumentStatus = useCallback((shipmentId: string, docId: string) => {
    setShipments(prev => {
      const next = prev.map(s => {
        if (s.id !== shipmentId) return s;
        const docs = s.documents || [];
        const updatedDocs = docs.map(d => {
          if (d.id !== docId) return d;
          const statusMap: Record<string, ShipDoc['status']> = { 'Missing': 'Pending', 'Pending': 'Verified', 'Verified': 'Missing' };
          return { ...d, status: statusMap[d.status] };
        });
        return { ...s, documents: updatedDocs };
      });
      localStorage.setItem('amz_shipments', JSON.stringify(next));
      if (selectedShipment?.id === shipmentId) {
        setSelectedShipment(next.find(x => x.id === shipmentId) || null);
      }
      return next;
    });
  }, [selectedShipment]);

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = editingLeadValues as Lead;
    if (!leadData.salesName) leadData.salesName = salesReps[0] || 'ADMIN';

    if (isEditingLead) {
      const nextLeads = leads.map(l => l.id === leadData.id ? leadData : l);
      syncData(nextLeads);
      showToast('Lead Updated');
      setSelectedLead(leadData);
    } else {
      const newLead: Lead = {
        ...leadData,
        id: Date.now().toString(),
        date: getTodayDate(),
        status: 'New'
      };
      syncData([...leads, newLead]);
      showToast('Lead Registered');
    }
    setIsAddingLead(false);
    setIsEditingLead(false);
    setEditingLeadValues({});
  };

  const handleSaveShipment = (e: React.FormEvent) => {
    e.preventDefault();
    const shipmentData = editingShipmentValues as Shipment;
    
    if (!isEditingShipment) {
      shipmentData.documents = getDemoDocs(0);
    }

    if (isEditingShipment) {
      const nextShipments = shipments.map(s => s.id === shipmentData.id ? shipmentData : s);
      syncData(undefined, nextShipments);
      showToast('Shipment Manifest Updated');
      setSelectedShipment(shipmentData);
    } else {
      const newShipment: Shipment = {
        ...shipmentData,
        id: Date.now().toString(),
        status: 'Pending',
        detailedCustomsStatus: 'Not Started'
      };
      syncData(undefined, [...shipments, newShipment]);
      showToast('Shipment Dispatched');
    }
    setIsAddingShipment(false);
    setIsEditingShipment(false);
    setEditingShipmentValues({});
  };

  const handleSmartImport = async () => {
    if (!importText.trim() || isParsing) return;
    setIsParsing(true);
    try {
      const parsedData = await parseLogisticsText(importText, { 
        salesReps: salesReps 
      });
      
      setIsAddingShipment(true);
      setEditingShipmentValues({
        id: Date.now().toString(),
        trackingNumber: parsedData.trackingNumber || `AMZ-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: parsedData.customerName || '',
        blNumber: parsedData.blNumber || '',
        shippingLine: parsedData.shippingLine?.value || OFFICIAL_SHIPPING_LINES[0],
        origin: parsedData.origin || '',
        destination: parsedData.destination || '',
        cargoDescription: parsedData.cargoDescription || '',
        inlandFreight: parsedData.inlandFreight || 0,
        gensetCost: parsedData.gensetCost || 0,
        officialReceipts: parsedData.officialReceipts || 0,
        overnightStay: parsedData.overnightStay || 0,
        otherExpenses: parsedData.otherExpenses || 0,
        currency: parsedData.currency === 'EGP' ? 'EGP' : 'USD',
        status: 'Pending',
        detailedCustomsStatus: 'Not Started',
        shipmentMode: 'Sea',
        shipmentType: 'FCL',
        shipmentDirection: 'Export',
        containerType: 'Dry',
        containerSize: '40’',
        bookingDate: getTodayDate(),
        loadingDate: getTodayDate(),
        currentLocation: 'Warehouse',
        shippingDate: getTodayDate(),
        eta: parsedData.eta || '',
        salesRep: parsedData.salesRep || salesReps[0] || 'ADMIN',
        weightKg: parsedData.weightKg || 0
      });

      if (parsedData.shippingLine?.confidence < 0.5) {
        showToast(`Warning: AI unsure of Shipping Line (${parsedData.shippingLine.originalTextDetected})`, 'error');
      }

      setIsSmartImportOpen(false);
      setImportText('');
      showToast('AI Successfully Parsed Data', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to parse text. Using manual entry.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName.trim()) return;
    const name = newRepName.trim().toUpperCase();
    if (salesReps.includes(name)) {
      showToast('Asset already registered', 'error');
      return;
    }
    const nextReps = [...salesReps, name];
    syncData(undefined, undefined, nextReps);
    showToast('Human Asset Registered');
    setNewRepName('');
    setIsAddingRep(false);
    addActivity(`New Sales Asset Registered: ${name}`, 'success');
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'Pending': return 'fa-clock';
      case 'In Transit': return 'fa-truck-fast';
      case 'At Sea': return 'fa-ship';
      case 'Customs': return 'fa-file-shield';
      case 'Delivered': return 'fa-circle-check';
      default: return 'fa-box';
    }
  };

  const getDetailedCustomsStyle = (status: DetailedCustomsStatus) => {
    switch (status) {
      case 'Not Started': return 'bg-slate-800 text-slate-500 border-slate-700';
      case 'Docs Received': return 'bg-amber-900/20 text-amber-500 border-amber-500/30';
      case 'Declaration Filed': return 'bg-sky-900/20 text-sky-400 border-sky-400/30';
      case 'Inspection': return 'bg-purple-900/20 text-purple-400 border-purple-400/30';
      case 'Duty Paid': return 'bg-emerald-900/20 text-emerald-400 border-emerald-400/30';
      case 'Released': return 'bg-green-600/20 text-green-400 border-green-400/30';
      default: return 'bg-slate-800 text-slate-500 border-slate-700';
    }
  };

  const renderStatusTimeline = (currentStatus: ShipmentStatus) => {
    const steps: ShipmentStatus[] = ['Pending', 'In Transit', 'At Sea', 'Customs', 'Delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    return (
      <div className="flex justify-between items-center relative py-6 px-2">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800/50 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 via-blue-500 to-emerald-500 -translate-y-1/2 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
          style={{ width: `${(currentIndex / 4) * 100}%` }} 
        />
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  isCurrent 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-xl scale-125' 
                    : isCompleted 
                      ? 'bg-slate-800 border-blue-500 text-blue-400' 
                      : 'bg-slate-900 border-slate-700 text-slate-600'
                }`}
              >
                <i className={`fas ${getStatusIcon(step)} text-[12px]`}></i>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col md:flex-row font-inter antialiased overflow-hidden text-slate-300" dir="ltr">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-10 right-10 z-[200] bg-[#0f172a] text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 animate-slide-up border border-slate-800">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
            <i className={`fas ${notification.type === 'success' ? 'fa-check' : 'fa-times'}`}></i>
          </div>
          <span className="text-sm font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#020617] border-r border-slate-800 flex flex-col shrink-0 z-50">
        <div className="p-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <img src="https://raw.githubusercontent.com/StackBlitz/stackblitz-images/main/amazon-marine-logo.png" className="w-full h-full object-contain" alt="AMZ" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-widest uppercase leading-none">Amazon Marine</h1>
            <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] mt-2">Staff Terminal</p>
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-3">
          {[
            { id: 'dashboard', icon: 'fa-rocket', label: 'Operations HUB' },
            { id: 'leads', icon: 'fa-users', label: 'Lead Registry' },
            { id: 'shipments', icon: 'fa-ship', label: 'Live manifest' },
            { id: 'customs', icon: 'fa-file-shield', label: 'Customs Desk' },
            { id: 'team', icon: 'fa-id-badge', label: 'Human Assets' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] border border-blue-400/50' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6`}></i>
              <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-10 border-t border-slate-800/50">
          <button onClick={onClose} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-3 group">
            <i className="fas fa-power-off group-hover:rotate-90 transition-transform"></i>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 overflow-y-auto bg-[#020617] p-12 relative scrollbar-hide">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        {activeTab === 'dashboard' && (
          <div className="space-y-12 animate-fade-in relative z-10">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Fleet Command</h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Ops Node Active • {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </header>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-12 border border-slate-800 relative group overflow-hidden">
               <div className="flex items-center gap-5 mb-8">
                 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                   <i className="fas fa-brain text-white text-lg"></i>
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">Strategic Ops Intel</h3>
               </div>
               <p className="text-blue-100/70 text-2xl leading-relaxed italic font-medium max-w-4xl">
                 "{dashboardBrief || "Initializing neural operational analysis..."}"
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Live Manifest', val: stats.active, color: '#3b82f6', icon: 'fa-ship' },
                { label: 'Conversion rate', val: `${Math.round((stats.leadsWon / (leads.length || 1)) * 100)}%`, color: '#10b981', icon: 'fa-chart-line' },
                { label: 'Total Revenue', val: `$${stats.revenue.toLocaleString()}`, color: '#8b5cf6', icon: 'fa-dollar-sign' },
                { label: 'Ops Health', val: 'OPTIMAL', color: '#f59e0b', icon: 'fa-heartbeat' }
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-900/40 p-10 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-blue-600/20 transition-all">
                      <i className={`fas ${kpi.icon}`}></i>
                    </div>
                    <MiniSparkline color={kpi.color} />
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{kpi.label}</div>
                  <div className="text-4xl font-black text-white tracking-tighter">{kpi.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-8 animate-fade-in relative z-10">
            <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Prospect Registry</h2>
                    <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest">{filteredLeads.length} Active Records In Pipeline</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => { setIsAddingLead(true); setEditingLeadValues({ salesName: salesReps[0] }); }} className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                      Register Lead
                    </button>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-6 bg-[#020617]/50 p-6 rounded-2xl border border-slate-800">
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargo Class:</span>
                   <select value={cargoFilter} onChange={(e) => setCargoFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all">
                      <option value="All">All Types</option>
                      {['Dry', 'Refrigerated', 'Frozen', 'Hazardous'].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sales Rep:</span>
                   <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all">
                      <option value="All">All Assets</option>
                      {salesReps.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
               <table className="w-full text-left text-sm">
                  <thead className="bg-[#020617] text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-slate-800">
                     <tr>
                       <th className="px-10 py-8">Customer Entity</th>
                       <th className="px-10 py-8">Cargo & Route</th>
                       <th className="px-10 py-8">Shipment</th>
                       <th className="px-10 py-8">Lifecycle Position</th>
                       <th className="px-10 py-8 text-right">Ops</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {filteredLeads.map(l => (
                       <tr key={l.id} className="hover:bg-white/5 transition-all group cursor-pointer" onClick={() => setSelectedLead(l)}>
                          <td className="px-10 py-8">
                             <div className="font-black text-white group-hover:text-blue-400 transition-colors text-base">{l.name}</div>
                             <div className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-widest">{l.companyName || 'Private Asset'} • {l.salesName}</div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${l.cargoType === 'Hazardous' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                               {l.cargoType}
                             </div>
                             <div className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-widest">{l.route}</div>
                          </td>
                          <td className="px-10 py-8">
                             {l.shipmentTrackingNumber ? (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); jumpToShipment(l.shipmentTrackingNumber!); }}
                                 className="flex items-center gap-2 text-blue-400 font-mono font-black border-b border-blue-400/30 hover:text-blue-300 group/link"
                               >
                                 <i className="fas fa-link text-[8px] opacity-50 group-hover/link:opacity-100"></i>
                                 {l.shipmentTrackingNumber}
                               </button>
                             ) : null}
                          </td>
                          <td className="px-10 py-8">
                             <InteractiveStatusBadge status={l.status} onChange={(s) => handleUpdateLeadStatus(l.id, s)} />
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100">
                                <button onClick={(e) => { e.stopPropagation(); setSelectedLead(l); setIsEditingLead(true); setEditingLeadValues(l); }} className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"><i className="fas fa-pencil text-xs"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Purge?')) { syncData(leads.filter(x => x.id !== l.id)); showToast('Purged'); } }} className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"><i className="fas fa-trash-can text-xs"></i></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="space-y-8 animate-fade-in relative z-10">
            <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800">
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Fleet Manifest</h2>
                  <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest">{shipments.length} Active Shipments</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setIsSmartImportOpen(true)} className="bg-slate-800 text-slate-300 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">AI Import</button>
                  <button onClick={() => { setIsAddingShipment(true); setEditingShipmentValues({ salesRep: salesReps[0], currency: 'USD', inlandFreight: 0, gensetCost: 0, officialReceipts: 0, overnightStay: 0, otherExpenses: 0, documents: getDemoDocs(0) }); }} className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Dispatch Freight</button>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Direction:</span>
                   <select value={directionFilter} onChange={(e) => setDirectionFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all">
                      <option value="All">All Directions</option>
                      <option value="Export">Export</option>
                      <option value="Import">Import</option>
                   </select>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Shipping Line:</span>
                   <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all">
                      <option value="All">All Lines</option>
                      {OFFICIAL_SHIPPING_LINES.map(l => <option key={l} value={l}>{l}</option>)}
                   </select>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sales Rep:</span>
                   <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500 transition-all">
                      <option value="All">All Assets</option>
                      {salesReps.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                 </div>
            </div>

            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
               <table className="w-full text-left text-sm">
                  <thead className="bg-[#020617] text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-slate-800">
                     <tr>
                       <th className="px-10 py-8">Tracking / BL</th>
                       <th className="px-10 py-8">Customer & Line</th>
                       <th className="px-10 py-8">Ops Status</th>
                       <th className="px-10 py-8 text-right">Ops</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {filteredShipments.map(s => (
                       <tr key={s.id} className="hover:bg-white/5 transition-all group cursor-pointer" onClick={() => setSelectedShipment(s)}>
                          <td className="px-10 py-8">
                             <div className="font-mono font-black text-blue-400 group-hover:text-blue-300 transition-colors text-base">{s.trackingNumber}</div>
                             <div className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-widest">{s.blNumber || 'Awaiting BL'} • {s.shipmentDirection}</div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="font-black text-white text-sm">{s.customerName}</div>
                             <div className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-widest">{s.shippingLine}</div>
                          </td>
                          <td className="px-10 py-8">
                             <InteractiveShipmentStatusBadge status={s.status} onChange={(status) => handleUpdateShipmentStatus(s.id, status)} />
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100">
                                <button onClick={(e) => { e.stopPropagation(); setSelectedShipment(s); setIsEditingShipment(true); setEditingShipmentValues(s); }} className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all"><i className="fas fa-pencil text-xs"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete?')) { syncData(undefined, shipments.filter(x => x.id !== s.id)); showToast('Deleted'); } }} className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all"><i className="fas fa-trash-can text-xs"></i></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'customs' && (
          <div className="space-y-8 animate-fade-in relative z-10">
            <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-800">
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Customs Desk</h2>
                  <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest">Manage Brokerage & Declaration Workflow</p>
               </div>
            </div>

            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
               <table className="w-full text-left text-sm">
                  <thead className="bg-[#020617] text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-slate-800">
                     <tr>
                       <th className="px-10 py-8">Tracking / Broker</th>
                       <th className="px-10 py-8">Declaration Details</th>
                       <th className="px-10 py-8">Docs Status</th>
                       <th className="px-10 py-8">Clearance Stage</th>
                       <th className="px-10 py-8 text-right">Ops</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {filteredCustomsShipments.map(s => {
                       const docs = s.documents || [];
                       const verifiedCount = docs.filter(d => d.status === 'Verified').length;
                       return (
                        <tr key={s.id} className="hover:bg-white/5 transition-all group cursor-pointer" onClick={() => setSelectedShipment(s)}>
                            <td className="px-10 py-8">
                              <div className="font-mono font-black text-blue-400 text-sm">{s.trackingNumber}</div>
                              <div className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Broker: {s.customsBroker || 'Unassigned'}</div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="font-black text-white text-xs">#{s.customsDeclarationNumber || 'PENDING'}</div>
                              <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{s.pol || '---'} -> {s.pod || '---'}</div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all duration-500" 
                                    style={{ width: `${docs.length > 0 ? (verifiedCount/docs.length)*100 : 0}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{verifiedCount}/{docs.length}</span>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <select 
                                onClick={e => e.stopPropagation()}
                                value={s.detailedCustomsStatus || 'Not Started'} 
                                onChange={e => handleUpdateDetailedCustomsStatus(s.id, e.target.value as DetailedCustomsStatus)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border outline-none transition-all ${getDetailedCustomsStyle(s.detailedCustomsStatus || 'Not Started')}`}
                              >
                                {['Not Started', 'Docs Received', 'Declaration Filed', 'Inspection', 'Duty Paid', 'Released'].map(st => (
                                  <option key={st} value={st} className="bg-[#0f172a]">{st}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <button onClick={(e) => { e.stopPropagation(); setSelectedShipment(s); setIsEditingShipment(true); setEditingShipmentValues(s); }} className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                <i className="fas fa-file-pen text-xs"></i>
                              </button>
                            </td>
                        </tr>
                       );
                     })}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-12 animate-fade-in relative z-10">
            <header className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-slate-800">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Human Assets</h2>
              </div>
              <button onClick={() => setIsAddingRep(true)} className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 flex items-center gap-3">
                <i className="fas fa-user-plus"></i> Register Asset
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {salesReps.map((rep, idx) => (
                <div key={idx} className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500/30 transition-all group relative">
                   <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl text-blue-500 mb-6">
                      <i className="fas fa-id-badge"></i>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">{rep}</h3>
                    <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                       <div className="text-center">
                        <div className="text-[9px] text-slate-600 uppercase font-black">Active</div>
                        <div className="text-lg font-black text-white">{leads.filter(l => l.salesName === rep).length}</div>
                       </div>
                       <div className="text-center border-l border-slate-800">
                        <div className="text-[9px] text-slate-600 uppercase font-black">Won</div>
                        <div className="text-lg font-black text-emerald-500">{leads.filter(l => l.salesName === rep && l.status === 'Won').length}</div>
                       </div>
                    </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Lead Detail Modal */}
        {selectedLead && !isEditingLead && (
          <div className="fixed inset-0 z-[150] bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto" onClick={() => setSelectedLead(null)}>
             <div className="bg-[#0f172a] w-full max-w-4xl rounded-[3rem] border border-slate-800 p-12 relative my-auto shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-start mb-12">
                   <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center text-blue-500 text-4xl border border-slate-700">
                         <i className="fas fa-user-tie"></i>
                      </div>
                      <div>
                         <h3 className="text-4xl font-black text-white tracking-tighter mb-4">{selectedLead.name}</h3>
                         <div className="flex items-center gap-4">
                            <InteractiveStatusBadge status={selectedLead.status} onChange={s => handleUpdateLeadStatus(selectedLead.id, s)} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Registered: {selectedLead.date}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => { setIsEditingLead(true); setEditingLeadValues(selectedLead); }} className="w-14 h-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg"><i className="fas fa-pencil text-lg"></i></button>
                      <button onClick={() => setSelectedLead(null)} className="w-14 h-14 rounded-2xl bg-slate-800/50 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center"><i className="fas fa-times text-xl"></i></button>
                   </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                         <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Entity Context</h4>
                         <div className="space-y-5">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Company Entity</span>
                               <span className="text-slate-200 font-bold">{selectedLead.companyName || 'Private Asset'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                         <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Requirements & Routing</h4>
                         <div className="space-y-5">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cargo Class</span>
                               <span className="text-slate-200 font-bold">{selectedLead.cargoType}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Route</span>
                               <span className="text-slate-200 font-bold">{selectedLead.route}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="bg-blue-600/5 p-8 rounded-[2rem] border border-blue-500/20">
                         <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Linked Assets</h4>
                         <div className="space-y-4">
                            {selectedLead.shipmentTrackingNumber ? (
                              <button onClick={() => jumpToShipment(selectedLead.shipmentTrackingNumber!)} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
                                <span className="font-mono font-black text-blue-400">{selectedLead.shipmentTrackingNumber}</span>
                                <i className="fas fa-external-link-alt text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                              </button>
                            ) : <span className="text-slate-600 italic text-xs">No shipment linked.</span>}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Lead/Shipment Forms (Simplified versions based on existing logic) */}
        {(isAddingLead || isEditingLead) && (
          <div className="fixed inset-0 z-[180] bg-[#020617]/95 flex items-center justify-center p-6 backdrop-blur-xl overflow-y-auto">
            <div className="bg-[#0f172a] w-full max-w-2xl rounded-[3rem] border border-slate-800 p-12 shadow-2xl my-auto animate-scale-in">
              <header className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Lead Manifest</h3>
                <button onClick={() => { setIsAddingLead(false); setIsEditingLead(false); }}><i className="fas fa-times text-2xl"></i></button>
              </header>
              <form onSubmit={handleSaveLead} className="space-y-6">
                <input required value={editingLeadValues.name || ''} onChange={e => setEditingLeadValues({...editingLeadValues, name: e.target.value})} placeholder="Customer Name" className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white" />
                <input required value={editingLeadValues.phone || ''} onChange={e => setEditingLeadValues({...editingLeadValues, phone: e.target.value})} placeholder="Phone" className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white" />
                <select value={editingLeadValues.salesName || (salesReps[0] || '')} onChange={e => setEditingLeadValues({...editingLeadValues, salesName: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white">
                  {salesReps.map(r => <option key={r} value={r} className="bg-[#0f172a]">{r}</option>)}
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Submit Asset Entry</button>
              </form>
            </div>
          </div>
        )}

        {/* Shipment Detail View Modal (Full Details) */}
        {selectedShipment && !isEditingShipment && (
          <div className="fixed inset-0 z-[150] bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto" onClick={() => setSelectedShipment(null)}>
             <div className="bg-[#0f172a] w-full max-w-6xl rounded-[3rem] border border-slate-800 p-12 relative my-auto shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-start mb-12">
                   <div className="flex items-center gap-8">
                      <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-5xl shadow-2xl">
                         <i className={`fas ${getStatusIcon(selectedShipment.status)}`}></i>
                      </div>
                      <div>
                         <h3 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">{selectedShipment.trackingNumber}</h3>
                         <div className="flex flex-wrap items-center gap-6">
                            <span className="text-slate-500 font-black text-xs uppercase tracking-widest">Client: <span className="text-slate-200">{selectedShipment.customerName}</span></span>
                            <InteractiveShipmentStatusBadge status={selectedShipment.status} onChange={s => handleUpdateShipmentStatus(selectedShipment.id, s)} />
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => { setIsEditingShipment(true); setEditingShipmentValues(selectedShipment); }} className="w-14 h-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg"><i className="fas fa-pencil text-lg"></i></button>
                      <button onClick={() => setSelectedShipment(null)} className="w-14 h-14 rounded-2xl bg-slate-800/50 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center"><i className="fas fa-times text-xl"></i></button>
                   </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                   <div className="lg:col-span-3 space-y-8">
                      <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800">
                         <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-10">Freight Lifecycle Timeline</h4>
                         {renderStatusTimeline(selectedShipment.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                           <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                              <i className="fas fa-file-invoice text-blue-500"></i> Manifest Specs
                           </h4>
                           <div className="space-y-4 text-xs">
                              <div className="flex justify-between"><span className="text-slate-500">Line</span><span className="text-slate-200 font-black">{selectedShipment.shippingLine}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">B/L No.</span><span className="text-blue-400 font-mono font-black">{selectedShipment.blNumber}</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Weight</span><span className="text-emerald-400 font-black">{selectedShipment.weightKg} KG</span></div>
                              <div className="flex justify-between"><span className="text-slate-500">Equipment</span><span className="text-slate-200 font-bold">{selectedShipment.containerSize} {selectedShipment.containerType}</span></div>
                           </div>
                        </div>

                        {/* Inland Transportation Cost Details Section */}
                        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 border-l-4 border-l-emerald-500 shadow-xl">
                          <div className="flex justify-between items-center mb-8">
                            <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                                <i className="fas fa-money-bill-transfer"></i> Inland Transportation Cost Details
                            </h4>
                            <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-1">Total Inland Cost</span>
                              <span className="text-lg font-black text-emerald-400">
                                  {selectedShipment.currency === 'USD' ? '$' : 'EGP'}
                                  {((selectedShipment.inlandFreight || 0) + 
                                    (selectedShipment.gensetCost || 0) + 
                                    (selectedShipment.officialReceipts || 0) + 
                                    (selectedShipment.overnightStay || 0) + 
                                    (selectedShipment.otherExpenses || 0)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Inland Freight</span>
                                <span className="text-slate-200 font-black">{selectedShipment.inlandFreight?.toLocaleString() || '0'} {selectedShipment.currency}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Genset Cost</span>
                                <span className="text-slate-200 font-black">{selectedShipment.gensetCost?.toLocaleString() || '0'} {selectedShipment.currency}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Official Receipts Cost</span>
                                <span className="text-slate-200 font-black">{selectedShipment.officialReceipts?.toLocaleString() || '0'} {selectedShipment.currency}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Overnight Stay Cost</span>
                                <span className="text-slate-200 font-black">{selectedShipment.overnightStay?.toLocaleString() || '0'} {selectedShipment.currency}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs col-span-2 border-t border-slate-800 pt-2">
                                <span className="text-slate-500 font-bold">Other Expenses</span>
                                <span className="text-slate-200 font-black">{selectedShipment.otherExpenses?.toLocaleString() || '0'} {selectedShipment.currency}</span>
                              </div>
                          </div>
                        </div>
                      </div>

                      {/* Document Control Panel */}
                      <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-lg">
                        <div className="flex justify-between items-center mb-8">
                          <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cargo Document Control Board</h4>
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 animate-pulse">Operational Integrity Check</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {(selectedShipment.documents || []).map(doc => (
                             <button 
                                key={doc.id}
                                onClick={() => toggleDocumentStatus(selectedShipment.id, doc.id)}
                                className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center text-center gap-4 active:scale-95 group hover:shadow-xl ${
                                  doc.status === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                  doc.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/30' :
                                  'bg-slate-800/40 border-slate-700/50'
                                }`}
                             >
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
                                 doc.status === 'Verified' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                 doc.status === 'Pending' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                 'bg-slate-700 text-slate-400'
                               }`}>
                                 <i className={`fas ${doc.status === 'Verified' ? 'fa-check-double' : doc.status === 'Pending' ? 'fa-clock' : 'fa-file-circle-exclamation'}`}></i>
                               </div>
                               <div>
                                 <div className={`text-[10px] font-black uppercase tracking-tight leading-tight mb-1 ${doc.status === 'Verified' ? 'text-emerald-400' : 'text-slate-300'}`}>{doc.name}</div>
                                 <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-500' : 
                                    doc.status === 'Pending' ? 'bg-amber-500/20 text-amber-500' : 
                                    'bg-slate-900 text-slate-600'
                                 }`}>{doc.status}</div>
                               </div>
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="bg-blue-600/5 p-8 rounded-[2.5rem] border border-blue-500/20">
                         <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Cargo Detail</h4>
                         <p className="text-sm font-bold text-slate-200 leading-relaxed">{selectedShipment.cargoDescription}</p>
                      </div>
                      <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                         <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Logistics Intel</h4>
                         <div className="space-y-4 text-[10px] font-black uppercase">
                            <div className="flex flex-col gap-1">
                               <span className="text-slate-500">Route</span>
                               <span className="text-blue-400">{selectedShipment.origin} ➔ {selectedShipment.destination}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                               <span className="text-slate-500">ETA</span>
                               <span className="text-white">{selectedShipment.eta}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Shipment Modal (Create/Edit) */}
        {(isAddingShipment || isEditingShipment) && (
          <div className="fixed inset-0 z-[180] bg-[#020617]/95 flex items-center justify-center p-6 backdrop-blur-xl overflow-y-auto">
            <div className="bg-[#0f172a] w-full max-w-4xl rounded-[3rem] border border-slate-800 p-12 shadow-2xl my-auto animate-scale-in">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {isEditingShipment ? 'Edit Shipment Manifest' : 'Dispatch New Freight'}
                </h3>
                <button onClick={() => { setIsAddingShipment(false); setIsEditingShipment(false); }} className="text-slate-500 hover:text-white transition-colors"><i className="fas fa-times text-2xl"></i></button>
              </div>
              <form onSubmit={handleSaveShipment} className="space-y-8">
                {/* Standard Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Tracking Number</label>
                    <input required value={editingShipmentValues.trackingNumber || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, trackingNumber: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Customer Entity</label>
                    <input required value={editingShipmentValues.customerName || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, customerName: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Booking Date</label>
                    <input type="date" value={editingShipmentValues.bookingDate || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, bookingDate: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Booking Number</label>
                    <input value={editingShipmentValues.bookingNumber || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, bookingNumber: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none font-mono" />
                  </div>
                </div>

                {/* Inland Logistics & Financials */}
                <div className="border-t border-slate-800 pt-8 space-y-6">
                  <div className="flex items-center gap-3 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                    <i className="fas fa-truck-fast"></i> Inland Logistics & Financials
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Currency</label>
                      <select value={editingShipmentValues.currency || 'USD'} onChange={e => setEditingShipmentValues({...editingShipmentValues, currency: e.target.value as any})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white outline-none">
                        <option value="USD" className="bg-[#0f172a]">USD</option>
                        <option value="EGP" className="bg-[#0f172a]">EGP</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inland Freight</label>
                      <input type="number" value={editingShipmentValues.inlandFreight || 0} onChange={e => setEditingShipmentValues({...editingShipmentValues, inlandFreight: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Genset Cost</label>
                      <input type="number" value={editingShipmentValues.gensetCost || 0} onChange={e => setEditingShipmentValues({...editingShipmentValues, gensetCost: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Official Receipts Cost</label>
                      <input type="number" value={editingShipmentValues.officialReceipts || 0} onChange={e => setEditingShipmentValues({...editingShipmentValues, officialReceipts: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Overnight Stay Cost</label>
                      <input type="number" value={editingShipmentValues.overnightStay || 0} onChange={e => setEditingShipmentValues({...editingShipmentValues, overnightStay: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Other Expenses</label>
                      <input type="number" value={editingShipmentValues.otherExpenses || 0} onChange={e => setEditingShipmentValues({...editingShipmentValues, otherExpenses: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-white outline-none" />
                    </div>
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Origin</label>
                    <input value={editingShipmentValues.origin || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, origin: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Destination</label>
                    <input value={editingShipmentValues.destination || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, destination: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Weight (kg)</label>
                    <input type="number" value={editingShipmentValues.weightKg || 0} onChange={e => setEditingShipmentValues({...editingShipmentValues, weightKg: parseFloat(e.target.value)})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ETA</label>
                    <input type="date" value={editingShipmentValues.eta || ''} onChange={e => setEditingShipmentValues({...editingShipmentValues, eta: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cargo Description</label>
                    <textarea 
                      required
                      value={editingShipmentValues.cargoDescription || ''} 
                      onChange={e => setEditingShipmentValues({...editingShipmentValues, cargoDescription: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-white outline-none h-32 resize-none focus:border-blue-500 transition-all"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl active:scale-95">
                  {isEditingShipment ? 'Commit Manifest Update' : 'Initialize Shipment Workflow'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AI Parser Modal */}
        {isSmartImportOpen && (
          <div className="fixed inset-0 z-[180] bg-[#020617]/95 flex items-center justify-center p-6 backdrop-blur-xl">
             <div className="bg-[#0f172a] w-full max-w-2xl rounded-[3rem] border border-slate-800 p-12 shadow-2xl animate-scale-in">
                <textarea 
                   className="w-full h-64 bg-[#020617] border border-slate-800 rounded-3xl p-8 text-blue-400 font-mono text-sm outline-none mb-6"
                   placeholder="PASTE LOGISTICS TEXT STREAM HERE (Emails, Invoices, etc)..."
                   value={importText}
                   onChange={e => setImportText(e.target.value)}
                />
                <button onClick={handleSmartImport} disabled={isParsing} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest transition-all">
                  {isParsing ? 'ANALYZING...' : 'RUN AI PARSE'}
                </button>
                <button onClick={() => setIsSmartImportOpen(false)} className="w-full mt-4 text-[10px] text-slate-600 uppercase font-black">Cancel</button>
             </div>
          </div>
        )}

      </main>

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default memo(ArbCRM);
