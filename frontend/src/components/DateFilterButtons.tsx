import React from 'react';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface DateFilterButtonsProps {
  activeFilter: string;
  onChange: (filter: string) => void;
}

export function DateFilterButtons({ activeFilter, onChange }: DateFilterButtonsProps) {
  const filters = ['Today', 'This Week', 'This Month', 'This Year', 'YTD'];

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
       <div className="pl-3 pr-2 border-r border-gray-200 text-gray-400">
         <Calendar size={16} />
       </div>
       {filters.map(filter => (
         <button
           key={filter}
           onClick={() => {
             onChange(filter);
             toast.success(`Data filtered by: ${filter}`);
           }}
           className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
             activeFilter === filter 
               ? 'bg-brand-primary text-white shadow-sm' 
               : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
           }`}
         >
           {filter}
         </button>
       ))}
    </div>
  );
}
