import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, X, Activity } from 'lucide-react';
import { useData } from './data';

interface AIInsightsProps {
  isOpen?: boolean;
  onClose?: () => void;
  stats?: any;
}

export function AIInsights({ isOpen, onClose, stats: propStats }: AIInsightsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { stats: dataStats } = useData();
  
  const stats = propStats || dataStats;
  const show = isOpen !== undefined ? isOpen : isVisible;
  const handleClose = onClose || (() => setIsVisible(false));

  if (!show || !stats || (stats.totalSavings?.amount === 0 && stats.activeLoans?.amount === 0)) return null;

  return (
    <div className="bg-gradient-to-r from-brand-blue to-brand-blue/90 rounded-xl shadow-lg border border-brand-blue/30 overflow-hidden relative mb-6">
      <div className="absolute right-0 top-0 w-64 h-full bg-white/5 pointer-events-none transform skew-x-12 translate-x-10"></div>
      
      <div className="p-5 flex items-start">
        <div className="bg-white/10 p-2.5 rounded-lg mr-4 backdrop-blur-sm border border-white/10 shrink-0">
          <Sparkles className="text-brand-accent" size={24} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-white font-extrabold text-lg tracking-tight flex items-center">
              Gemini Portfolio Insights
              <span className="ml-3 bg-brand-accent/20 text-brand-accent text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-brand-accent/30 tracking-wider">
                Real-Time AI
              </span>
            </h3>
            <button 
              onClick={handleClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <p className="text-white/80 text-sm mb-4 leading-relaxed max-w-3xl">
            Based on the last 30 days of CHAMA activity, your liquidity ratio remains strong. Total pool stands at KES {stats.totalSavings.amount.toLocaleString()}.
          </p>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start">
                <AlertTriangle size={16} className={`${stats.arrears.amount > 0 ? 'text-amber-400' : 'text-emerald-400'} mt-0.5 mr-2 shrink-0`} />
                <div>
                   <h4 className="text-white text-xs font-bold uppercase mb-1">Arrears Analysis</h4>
                   <p className="text-white/70 text-xs leading-relaxed">
                     {stats.arrears.amount > 0 
                       ? `System detects KES ${stats.arrears.amount.toLocaleString()} in arrears. Recommended action: Send automated reminders to affected members.` 
                       : `Your group has a flawless repayment record. No outstanding arrears detected.`}
                   </p>
                </div>
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start">
                <TrendingUp size={16} className="text-brand-green mt-0.5 mr-2 shrink-0" />
                <div>
                   <h4 className="text-white text-xs font-bold uppercase mb-1">Opportunity</h4>
                   <p className="text-white/70 text-xs leading-relaxed">
                     Total unencumbered savings sit at KES {(stats.totalSavings.amount - stats.activeLoans.amount).toLocaleString()}. Consider launching a new loan product or fixed deposit promotional rate.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
