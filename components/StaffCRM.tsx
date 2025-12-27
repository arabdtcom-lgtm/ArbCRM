
import React, { useState, useEffect } from 'react';
import { Lead, Shipment, LeadStatus, ShipmentStatus } from '../types';

const StaffCRM: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'shipments'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
  // Filters
  const [cargoFilter, setCargoFilter] = useState<string>('All');
  const [lineFilter, setLineFilter] = useState<string>('All');
  
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const officialShippingLines = [
    "Cosco", "B&G", "Hapag lloyd", "CMA", "SIDRA", "Maersk", "MSC", "ARKAS", 
    "OCEAN EXPRESS", "ZIM", "ONE", "ESL", "EGL", "ADMIRAL", "ESG", "YANG MING", 
    "MLH", "TARROS", "MEDKON", "OOCL", "TSA", "SEAGLORY EGYPT", "LAT"
  ];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const savedLeads = JSON.parse(localStorage.getItem('amz_leads') || '[]');
    const savedShipments = JSON.parse(localStorage.getItem('amz_shipments') || '[]');
    setLeads(savedLeads);
    setShipments(savedShipments);
  }, []);

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    const updated = leads.map(l => l.id === id ? { ...l, status } : l);
    setLeads(updated);
    localStorage.setItem('amz_leads', JSON.stringify(updated));
    showToast('تم تحديث حالة العميل');
  };

  const updateShipmentStatus = (id: string, status: ShipmentStatus) => {
    const updated = shipments.map(s => s.id === id ? { ...s, status } : s);
    setShipments(updated);
    localStorage.setItem('amz_shipments', JSON.stringify(updated));
    showToast(`تحديث حالة الشحنة: ${status}`);
  };

  const filteredLeads = leads.filter(l => {
    const cargoMatch = cargoFilter === 'All' || l.cargoType === cargoFilter;
    const lineMatch = lineFilter === 'All' || l.shippingLine === lineFilter;
    return cargoMatch && lineMatch;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col md:flex-row font-cairo text-right" dir="rtl">
      {notification && (
        <div className="fixed bottom-6 left-6 z-[120] bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <i className="fas fa-info-circle text-blue-400"></i>
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <span className="font-black">بوابة الموظف</span>
          <button onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'leads' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-users w-6"></i><span>طلباتي</span>
          </button>
          <button onClick={() => setActiveTab('shipments')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'shipments' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            <i className="fas fa-ship w-6"></i><span>تحديث الشحنات</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={onClose} className="w-full p-3 text-slate-400 hover:text-white flex items-center gap-3 font-bold text-xs uppercase">
            <i className="fas fa-sign-out-alt"></i><span>خروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
        <header className="mb-10">
          <h2 className="text-2xl font-black text-slate-900">مرحباً بك في لوحة عمليات الموظفين</h2>
          <p className="text-slate-500 text-sm">تابع طلبات العملاء وحدث حالات الشحنات لحظياً.</p>
        </header>

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">الخط الملاحي:</span>
                  <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold">
                    <option value="All">الكل</option>
                    {officialShippingLines.map(line => <option key={line} value={line}>{line}</option>)}
                  </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black">
                  <tr>
                    <th className="px-6 py-4">العميل</th>
                    <th className="px-6 py-4">الخط الملاحي</th>
                    <th className="px-6 py-4">البضاعة</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">تحديث</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{lead.name}</td>
                      <td className="px-6 py-4 font-bold text-blue-600">{lead.shippingLine || '---'}</td>
                      <td className="px-6 py-4 text-xs">{lead.cargoType}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px] font-bold">{lead.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)} className="bg-slate-100 border-none rounded text-[10px] p-1 font-bold">
                          <option value="New">جديد</option>
                          <option value="Contacted">قيد التواصل</option>
                          <option value="Won">تم التعاقد</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase">
                  <tr>
                    <th className="px-6 py-4">رقم التتبع</th>
                    <th className="px-6 py-4">الخط</th>
                    <th className="px-6 py-4">العميل</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">تحديث</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shipments.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{s.trackingNumber}</td>
                      <td className="px-6 py-4 font-bold">{s.shippingLine}</td>
                      <td className="px-6 py-4">{s.customerName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-[10px] font-bold">{s.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select value={s.status} onChange={(e) => updateShipmentStatus(s.id, e.target.value as ShipmentStatus)} className="bg-slate-100 border-none rounded text-[10px] p-1 font-bold">
                          <option value="In Transit">TRANSIT</option>
                          <option value="At Sea">AT SEA</option>
                          <option value="Customs">CUSTOMS</option>
                          <option value="Delivered">DELIVERED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffCRM;
