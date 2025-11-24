import React, { useState } from 'react';
import { MOCK_ATMS } from '../constants';
import { ATM, ATMStatus } from '../types';
import { MapPin, Navigation, ThumbsUp, X } from 'lucide-react';
import { Button } from './Button';

export const MapView: React.FC = () => {
  const [selectedATM, setSelectedATM] = useState<ATM | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'HAS_MONEY' | 'ONLINE'>('ALL');

  const filteredATMs = MOCK_ATMS.filter(atm => {
    if (filter === 'HAS_MONEY') return atm.status === ATMStatus.HAS_MONEY;
    if (filter === 'ONLINE') return atm.status !== ATMStatus.OFFLINE;
    return true;
  });

  const getPinColor = (status: ATMStatus) => {
    switch (status) {
      case ATMStatus.HAS_MONEY: return 'bg-teal-500'; // Teal for money
      case ATMStatus.ONLINE: return 'bg-yellow-500'; // Yellow for online
      case ATMStatus.NO_MONEY: return 'bg-orange-500';
      case ATMStatus.OFFLINE: return 'bg-red-600'; // Red for offline/error
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-100 overflow-hidden">
      {/* Map Simulation Container */}
      <div className="absolute inset-0 bg-gray-50 w-full h-full overflow-hidden">
        {/* Mock Map Grid Lines */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        
        {/* Mock Map Streets (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <path d="M0,100 Q200,150 400,100 T800,300" stroke="gray" strokeWidth="20" fill="none" />
            <path d="M300,0 L350,800" stroke="gray" strokeWidth="15" fill="none" />
            <path d="M100,500 L700,500" stroke="gray" strokeWidth="12" fill="none" />
            <circle cx="400" cy="300" r="100" fill="#f0f9ff" />
        </svg>

        {/* User Location Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-xl relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm whitespace-nowrap text-indigo-800">Você</div>
        </div>

        {/* ATM Pins */}
        {filteredATMs.map((atm) => (
          <button
            key={atm.id}
            onClick={() => setSelectedATM(atm)}
            className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110 z-20`}
            style={{ 
                left: `${atm.lng}%`, 
                top: `${atm.lat}%` 
            }}
          >
            <div className={`w-10 h-10 rounded-full ${getPinColor(atm.status)} border-4 border-white shadow-lg flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">ATM</span>
            </div>
            {/* Tooltip-ish label */}
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold shadow text-gray-700 whitespace-nowrap">
                {atm.bank}
            </div>
          </button>
        ))}
      </div>

      {/* Top Filter Bar - Increased top spacing from top-4 to top-10 */}
      <div className="absolute top-10 left-4 right-4 z-30 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>
            Todos
        </button>
        <button 
            onClick={() => setFilter('HAS_MONEY')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'HAS_MONEY' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700'}`}>
            Tem Dinheiro 💵
        </button>
        <button 
            onClick={() => setFilter('ONLINE')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${filter === 'ONLINE' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700'}`}>
            Sistema Online 🟢
        </button>
      </div>

      {/* Selected ATM Bottom Sheet */}
      {selectedATM && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-40 p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedATM.name}</h2>
                    <p className="text-gray-500 text-sm">{selectedATM.address}</p>
                </div>
                <button onClick={() => setSelectedATM(null)} className="p-2 bg-gray-100 rounded-full">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                    ${selectedATM.status === ATMStatus.HAS_MONEY ? 'bg-teal-100 text-teal-700' : 
                      selectedATM.status === ATMStatus.OFFLINE ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selectedATM.status === ATMStatus.HAS_MONEY && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                    {selectedATM.status}
                </div>
                <div className="text-sm text-gray-500">
                    {selectedATM.distance} • Atualizado {selectedATM.lastUpdated}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="primary">
                    <Navigation size={18} />
                    Ir agora
                </Button>
                <Button variant="outline">
                    <ThumbsUp size={18} />
                    Validar
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};