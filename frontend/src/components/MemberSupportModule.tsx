import { LifeBuoy, MessageSquare, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch, getUser, createSupportTicket } from '../api';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  category?: string;
  description?: string;
  createdAt?: string;
  userId?: string;
  lastUpdate?: string;
}

export function MemberSupportModule() {
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [category, setCategory] = useState('Payment/Deposit Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const currentUser = getUser();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/supportTickets');
      // Filter by current user if backend doesn't
      const userTickets = currentUser ? data.filter((t: Ticket) => t.userId === currentUser.id) : data;
      setMyTickets(userTickets);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmitTicket = async () => {
    if (!subject || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createSupportTicket({
        subject,
        category,
        description,
        status: 'Open'
      });
      toast.success('Ticket submitted successfully');
      setShowNewTicketModal(false);
      setSubject('');
      setDescription('');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to submit ticket');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animation-fade-in pb-28 sm:pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5 sm:gap-3">
            <LifeBuoy className="text-brand-accent w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
            Support Center
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Need help? Open a ticket and our admins will assist you.</p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <button 
            onClick={() => setShowNewTicketModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-md hover:bg-brand-primary-dark transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">My Support Tickets</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
             <div className="p-12 text-center text-gray-500">Loading tickets...</div>
          ) : myTickets.map((ticket, idx) => (
            <div key={idx} className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer group flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-extrabold text-gray-900 group-hover:text-brand-primary transition-colors text-sm sm:text-base">{ticket.subject}</h4>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    {ticket.id ? (ticket.id.length > 8 ? ticket.id.slice(0, 8) : ticket.id) : `TKT-${idx}`}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{ticket.description || ticket.lastUpdate || 'No description provided.'}</p>
                <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Opened {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'recently'}</p>
              </div>
              <div className="self-start sm:self-center shrink-0">
                {ticket.status === 'Open' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    In Progress
                  </span>
                )}
                {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
                {ticket.status !== 'Open' && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {ticket.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {!loading && myTickets.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <LifeBuoy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">You don't have any support tickets yet.</p>
            </div>
          )}
        </div>
      </div>

      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animation-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-lg">Create Support Ticket</h3>
              <button onClick={() => setShowNewTicketModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Issue Category</label>
                <select 
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Payment/Deposit Issue</option>
                  <option>Loan Inquiry</option>
                  <option>Account/KYC Update</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Subject</label>
                <input 
                  type="text" 
                  placeholder="Brief summary of the issue" 
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Details</label>
                <textarea 
                  rows={4} 
                  placeholder="Provide as much detail as possible..." 
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setShowNewTicketModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitTicket}
                  className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary-dark transition-colors shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
