import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, User, Banknote, Layers, Wallet } from 'lucide-react';
import { quickSearch } from '../api';

export function QuickSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ Members: [], Loans: [], Chamas: [], Accounts: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ Members: [], Loans: [], Chamas: [], Accounts: [] });
      return;
    }
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    if (query.trim().length === 0) {
      setResults({ Members: [], Loans: [], Chamas: [], Accounts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await quickSearch(query);
        setResults(res || { Members: [], Loans: [], Chamas: [], Accounts: [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const flatResults = [
    ...(results.Members || []).map((r: any) => ({ ...r, type: 'Members' })),
    ...(results.Loans || []).map((r: any) => ({ ...r, type: 'Loans' })),
    ...(results.Chamas || []).map((r: any) => ({ ...r, type: 'Chamas' })),
    ...(results.Accounts || []).map((r: any) => ({ ...r, type: 'Accounts' }))
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex]);

  const handleSelect = (item: any) => {
    onClose();
    if (item.type === 'Members') {
      navigate(`/dashboard/members/${item.id}`);
    } else if (item.type === 'Loans') {
      navigate(`/dashboard/loans/${item.id}`);
    } else if (item.type === 'Chamas') {
      navigate(`/dashboard/chamas/${item.id}`);
    } else if (item.type === 'Accounts') {
      navigate(`/dashboard/accounts/${item.id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="relative border-b border-gray-200">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Members, Loans, Chamas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 text-gray-800 outline-none text-lg focus:bg-gray-50 transition-colors"
          />
          <button 
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {loading && <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>}
          
          {!loading && flatResults.length === 0 && query.length > 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">No results found for "{query}"</div>
          )}

          {!loading && (
            <div className="space-y-4">
              {['Members', 'Loans', 'Chamas', 'Accounts'].map((type) => {
                const typeResults = flatResults.filter(r => r.type === type);
                if (typeResults.length === 0) return null;

                const getIcon = (type: string) => {
                  switch(type) {
                    case 'Members': return <User size={16} className="mr-2 text-brand-primary" />;
                    case 'Loans': return <Banknote size={16} className="mr-2 text-brand-green" />;
                    case 'Chamas': return <Layers size={16} className="mr-2 text-brand-accent" />;
                    case 'Accounts': return <Wallet size={16} className="mr-2 text-brand-blue" />;
                    default: return <Search size={16} className="mr-2" />;
                  }
                };

                return (
                  <div key={type}>
                    <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{type}</h3>
                    <div className="space-y-1">
                      {typeResults.map((item) => {
                        const index = flatResults.indexOf(item);
                        const isSelected = index === selectedIndex;
                        
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-brand-primary/10 border border-brand-primary/20' : 'hover:bg-gray-50 border border-transparent'}`}
                          >
                            {getIcon(type)}
                            <div>
                              <div className="text-sm font-bold text-gray-800">{item.name || item.id}</div>
                              <div className="text-xs text-gray-500">{item.description || item.status || `ID: ${item.id}`}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!loading && query.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                <Search size={32} className="mb-3 opacity-20" />
                <p>Type something to search across the system.</p>
                <div className="flex gap-2 mt-4 text-xs opacity-60">
                   <span className="px-2 py-1 bg-gray-100 rounded">↑↓ to navigate</span>
                   <span className="px-2 py-1 bg-gray-100 rounded">Enter to select</span>
                   <span className="px-2 py-1 bg-gray-100 rounded">Esc to close</span>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
