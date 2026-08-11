import { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, MessageSquare, AlertCircle, Clock, CheckCircle2, MoreVertical, Paperclip, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useData } from './data';
import { createSupportTicket, updateSupportTicket, fetchSupportTickets, fetchCommunicationLogs, createCommunicationLog } from '../api';

export function SupportModule() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Tickets');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ userId: '', subject: '', priority: 'MEDIUM', description: '' });

  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchSupportTickets().then(data => setSupportTickets(data || [])).catch(() => {});
    fetchCommunicationLogs().then(data => setLogs(data || [])).catch(() => {});
  }, []);
  
  const tickets = supportTickets.map((t: any) => ({
    id: t.id,
    displayId: t.id.slice(0, 8).toUpperCase(),
    member: t.userId,
    memberId: t.userId,
    issue: t.subject,
    priority: t.priority === 'HIGH' ? 'High' : t.priority === 'MEDIUM' ? 'Medium' : 'Low',
    status: t.status === 'OPEN' ? 'Open' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Resolved',
    time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString() : 'N/A'
  }));

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      setSupportTickets(supportTickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      await updateSupportTicket(ticketId, { status: newStatus });
      toast.success('Ticket updated');
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus === 'OPEN' ? 'Open' : newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Resolved' });
      }
    } catch (e) {
      toast.error('Failed to update ticket');
      fetchSupportTickets().then(data => setSupportTickets(data || []));
    }
  };

  const handleSendReply = async (type: 'SMS' | 'EMAIL') => {
    if (!replyText || !selectedTicket) return;
    try {
      const log = await createCommunicationLog({
        type,
        recipientId: selectedTicket.userId || selectedTicket.memberId || 'SYSTEM',
        subject: `Re: ${selectedTicket.subject || selectedTicket.issue}`,
        body: replyText,
        status: 'SENT'
      });
      setLogs([...logs, log]);
      setReplyText('');
      toast.success(type === 'SMS' ? 'Internal note added' : 'Reply sent');
    } catch (e) {
      toast.error('Failed to send reply');
    }
  };

  const handleCreateTicket = async () => {
    setIsSubmitting(true);
    try {
      const res = await createSupportTicket({
        ...formData,
        status: 'OPEN'
      });
      setSupportTickets(prev => [...prev, res]);
      toast.success('Ticket Created');
      setShowTicketModal(false);
      setFormData({ userId: '', subject: '', priority: 'MEDIUM', description: '' });
    } catch (err) {
      toast.error('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/20 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-blue/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <LifeBuoy className="mr-2.5 sm:mr-3 text-brand-blue shrink-0" size={24} />
            Member Support & CRM
          </h2>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
            Resolve member queries, track M-Pesa disputes, and monitor SLA compliance.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <button 
            onClick={() => setShowTicketModal(true)}
            className="w-full sm:w-auto flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-blue-800 px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <MessageSquare size={16} className="mr-2" /> New Ticket
          </button>
        </div>
      </div>

      {/* Analytics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Unresolved Tickets', count: tickets.filter(t => t.status !== 'Resolved').length, icon: AlertCircle, color: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/20' },
          { label: 'Avg. Resolution Time', count: '0 Hrs', icon: Clock, color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' },
          { label: 'Tickets Today', count: tickets.length, icon: MessageSquare, color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20' },
          { label: 'CSAT Score', count: '98%', icon: CheckCircle2, color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl shadow-sm border ${stat.border} p-3.5 sm:p-5 flex items-center gap-3`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} shrink-0`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-extrabold text-brand-accent">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Ticket List (Hidden on mobile if a ticket is currently selected to view) */}
        <div className={`w-full lg:flex-[2] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[520px] ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
          
          <div className="p-3.5 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-gray-50/50">
            <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
               {['All Tickets', 'Unassigned', 'My Tickets', 'Resolved'].map(filter => (
                 <button 
                   key={filter}
                   onClick={() => setActiveFilter(filter)}
                   className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activeFilter === filter ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200 bg-gray-100'}`}
                 >
                   {filter}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search tickets..." 
                  className="bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:border-brand-blue outline-none w-full sm:w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setSearchTerm(searchTerm ? '' : 'urgent')}
                className={`p-2 border rounded-xl transition-colors ${searchTerm === 'urgent' ? 'bg-brand-blue text-white border-brand-blue' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                title="Filter urgent"
              >
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr className="bg-[#F0F7FF] border-b border-[#E1EFFE] text-[10px] uppercase tracking-widest text-[#475569] font-extrabold">
                  <th className="p-3.5 sm:p-4">Ticket details</th>
                  <th className="p-3.5 sm:p-4">Customer</th>
                  <th className="p-3.5 sm:p-4">Priority</th>
                  <th className="p-3.5 sm:p-4">Status</th>
                  <th className="p-3.5 sm:p-4 text-right">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-gray-500 font-medium">
                      No support tickets found in this queue.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket, i) => (
                    <tr 
                      key={i} 
                      className={`hover:bg-brand-blue/5 transition-colors cursor-pointer group ${selectedTicket?.id === ticket.id ? 'bg-brand-blue/10' : ''}`} 
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="p-3.5 sm:p-4">
                        <span className="font-extrabold text-gray-800 text-xs sm:text-sm block group-hover:text-brand-blue transition-colors">{ticket.issue}</span>
                        <span className="text-[11px] text-gray-500 font-medium">#{ticket.displayId} • Opened {ticket.time}</span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                         <span className="font-bold text-gray-700 text-xs sm:text-sm block">{ticket.member}</span>
                         <span className="text-[10px] text-brand-blue font-bold tracking-wider">{ticket.memberId}</span>
                      </td>
                      <td className="p-3.5 sm:p-4">
                        {ticket.priority === 'High' && <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">High</span>}
                        {ticket.priority === 'Medium' && <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">Medium</span>}
                        {ticket.priority === 'Normal' && <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">Normal</span>}
                        {ticket.priority === 'Low' && <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">Low</span>}
                      </td>
                      <td className="p-3.5 sm:p-4">
                        {ticket.status === 'Open' && <span className="text-brand-primary font-extrabold text-xs flex items-center"><AlertCircle size={12} className="mr-1 shrink-0" /> Open</span>}
                        {ticket.status === 'In Progress' && <span className="text-brand-accent font-extrabold text-xs flex items-center"><Clock size={12} className="mr-1 shrink-0" /> In Progress</span>}
                        {ticket.status === 'Resolved' && <span className="text-brand-green font-extrabold text-xs flex items-center"><CheckCircle2 size={12} className="mr-1 shrink-0" /> Resolved</span>}
                      </td>
                      <td className="p-3.5 sm:p-4 text-right">
                         <div className="flex items-center justify-end">
                           {ticket.assignee && ticket.assignee !== 'Unassigned' ? (
                             <>
                               <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold mr-1.5">
                                 {typeof ticket.assignee === 'string' ? ticket.assignee.charAt(0) : '?'}
                               </div>
                               <span className="text-xs font-bold text-gray-600">{typeof ticket.assignee === 'string' ? ticket.assignee : 'Agent'}</span>
                             </>
                           ) : (
                             <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Unassigned</span>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="sm:hidden flex-1 divide-y divide-gray-100 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 font-medium">
                No support tickets found in this queue.
              </div>
            ) : (
              tickets.map((ticket, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 hover:bg-brand-blue/5 transition-colors cursor-pointer space-y-2.5 active:bg-gray-100 ${selectedTicket?.id === ticket.id ? 'bg-brand-blue/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-gray-900 text-xs leading-snug">{ticket.issue}</span>
                    {ticket.priority === 'High' && <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shrink-0">High</span>}
                    {ticket.priority === 'Medium' && <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shrink-0">Medium</span>}
                    {ticket.priority === 'Normal' && <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shrink-0">Normal</span>}
                    {ticket.priority === 'Low' && <span className="bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shrink-0">Low</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>{ticket.member} <strong className="text-brand-blue font-mono font-bold">({ticket.memberId})</strong></span>
                    <span>#{ticket.displayId}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                    {ticket.status === 'Open' && <span className="text-brand-primary font-extrabold text-[11px] flex items-center"><AlertCircle size={12} className="mr-1" /> Open</span>}
                    {ticket.status === 'In Progress' && <span className="text-brand-accent font-extrabold text-[11px] flex items-center"><Clock size={12} className="mr-1" /> In Progress</span>}
                    {ticket.status === 'Resolved' && <span className="text-brand-green font-extrabold text-[11px] flex items-center"><CheckCircle2 size={12} className="mr-1" /> Resolved</span>}
                    <span className="text-[10px] text-gray-400 font-medium">{ticket.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Quick Action / Ticket Preview Drawer (On mobile shown when a ticket is selected) */}
        <div className={`w-full lg:flex-1 lg:min-w-[360px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[520px] ${selectedTicket ? 'flex' : 'hidden lg:flex'}`}>
          {selectedTicket ? (
            <>
              {/* Top Bar with Mobile Back Button */}
              <div className="bg-brand-blue text-white p-4 flex justify-between items-center gap-2">
                 <div className="min-w-0">
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setSelectedTicket(null)}
                       className="lg:hidden p-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-bold mr-1"
                       title="Back to tickets"
                     >
                       ← Back
                     </button>
                     <h3 className="font-extrabold text-sm truncate">
                       #{selectedTicket.displayId}
                     </h3>
                   </div>
                   <p className="text-white/80 text-xs truncate mt-0.5">{selectedTicket.issue}</p>
                 </div>
                 <select 
                   value={selectedTicket.status === 'Open' ? 'OPEN' : selectedTicket.status === 'In Progress' ? 'IN_PROGRESS' : 'RESOLVED'}
                   onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                   className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none shrink-0"
                 >
                   <option value="OPEN" className="text-gray-900">Open</option>
                   <option value="IN_PROGRESS" className="text-gray-900">In Progress</option>
                   <option value="RESOLVED" className="text-gray-900">Resolved</option>
                 </select>
              </div>
              
              <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shrink-0">
                    {selectedTicket.member ? (typeof selectedTicket.member === 'string' ? selectedTicket.member.charAt(0) : '?') : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">{selectedTicket.member}</p>
                    <p className="text-[11px] text-brand-blue font-bold truncate">{selectedTicket.memberId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/dashboard/members/${selectedTicket.memberId}`)}
                  className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-xl hover:bg-brand-blue/20 transition-colors shrink-0"
                >
                  View Profile
                </button>
              </div>

              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5">
                 <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-xl p-3.5">
                   <p className="text-[11px] text-gray-500 mb-1 font-bold">{selectedTicket.time} • Reported Issue</p>
                   <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                     {selectedTicket.issue || 'Please assist urgently regarding member account transaction.'}
                   </p>
                 </div>
                 
                 <div className="flex items-center justify-center my-3">
                   <div className="h-px bg-gray-200 flex-1"></div>
                   <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Notes & History</span>
                   <div className="h-px bg-gray-200 flex-1"></div>
                 </div>
                 
                 {logs.filter(l => l.recipient === selectedTicket.memberId || (l.subject && l.subject.includes(selectedTicket.issue))).length === 0 ? (
                   <div className="text-center py-6 text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                     No previous replies yet. Type below to send an update.
                   </div>
                 ) : (
                   logs.filter(l => l.recipient === selectedTicket.memberId || (l.subject && l.subject.includes(selectedTicket.issue))).map((log, i) => (
                     <div key={i} className={`rounded-xl p-3 border text-xs ${log.type === 'SMS' ? 'border-amber-200 bg-amber-50/60' : 'border-gray-200 bg-gray-50'}`}>
                       <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <User size={12} className="text-gray-500 mr-1"/>
                            <p className="text-[11px] text-gray-700 font-bold">{log.type === 'SMS' ? 'Internal Note' : 'Reply to Member'}</p>
                          </div>
                          <span className="text-[10px] text-gray-400">{new Date(log.createdAt || Date.now()).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-xs text-gray-700 mt-1">
                         {log.content || log.body}
                       </p>
                     </div>
                   ))
                 )}
              </div>

              <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-white">
                 <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-blue transition-colors">
                   <input 
                     type="text" 
                     placeholder="Type a response or internal note..." 
                     className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 outline-none"
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         handleSendReply('EMAIL');
                       }
                     }}
                   />
                 </div>
                 <div className="flex justify-between items-center mt-2.5 gap-2">
                   <button 
                     onClick={() => handleSendReply('SMS')}
                     className="text-xs font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                   >
                     Add Note
                   </button>
                   <button 
                     onClick={() => handleSendReply('EMAIL')}
                     className="text-xs font-bold text-white bg-brand-blue px-4 py-1.5 rounded-xl hover:bg-blue-800 shadow-sm transition-colors"
                   >
                     Send Reply
                   </button>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare size={40} className="mb-3 text-gray-300" />
              <p className="text-xs sm:text-sm font-bold text-gray-600">Select a ticket</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Click on any ticket in the queue to inspect details, write responses, and update resolution status.</p>
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-brand-accent text-base">Create New Support Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg text-lg leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Customer / Member ID</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-brand-primary outline-none" placeholder="e.g. MEM-001 or Phone number" value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Issue Summary</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-brand-primary outline-none" placeholder="Brief issue description" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Priority</label>
                <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:border-brand-primary outline-none bg-white font-medium" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="NORMAL">Normal Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Details & Description</label>
                <textarea className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:border-brand-primary outline-none" rows={3} placeholder="Provide details regarding the inquiry or transaction dispute..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="flex gap-3 pt-3">
                <button onClick={() => setShowTicketModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button disabled={isSubmitting} onClick={handleCreateTicket} className="flex-1 bg-brand-blue hover:bg-blue-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
