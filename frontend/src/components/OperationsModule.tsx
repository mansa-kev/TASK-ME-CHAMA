import { useState, useEffect } from 'react';
import { Layers, CheckCircle2, Clock, XCircle, ChevronRight, DollarSign, Plus, LayoutGrid, List, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  fetchOperationsTasks, 
  createOperationsTask,
  updateOperationsTaskStatus,
  deleteOperationsTask,
  createPayment,
  fetchLoans, 
  approveLoan,
  rejectLoan,
  fetchWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal,
  fetchCommissions,
  fetchPayroll,
  createPayrollRecord,
  deletePayrollRecord,
  fetchMembers,
  fetchStaffPerformance
} from '../api';

export function OperationsModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tasks' | 'approvals' | 'commissions' | 'field' | 'payroll'>('tasks');
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'MEDIUM', dueDate: '' });
  
  useEffect(() => {
    Promise.all([
      fetchOperationsTasks().catch(() => []),
      fetchLoans().catch(() => []),
      fetchWithdrawalRequests().catch(() => []),
      fetchCommissions().catch(() => []),
      fetchPayroll().catch(() => []),
      fetchMembers().catch(() => []),
      fetchStaffPerformance().catch(() => [])
    ]).then(([t, l, w, c, p, m, s]) => {
      setTasks(t || []);
      setLoans(l || []);
      setWithdrawals(w || []);
      setCommissions(c || []);
      setPayroll(p || []);
      setMembers(m || []);
      setStaffPerformance(s || []);
    });
  }, []);

  const handleSaveTask = async () => {
    if (!taskForm.title || !taskForm.assignee) {
      toast.error('Title and Assignee are required');
      return;
    }
    try {
      await createOperationsTask({ ...taskForm, status: 'To Do' });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignee: '', priority: 'MEDIUM', dueDate: '' });
      const t = await fetchOperationsTasks().catch(() => []);
      setTasks(t || []);
    } catch (e) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await updateOperationsTask(taskId, { status: newStatus });
      toast.success('Task moved');
    } catch (e) {
      toast.error('Failed to move task');
      // Revert if error
      const t = await fetchOperationsTasks().catch(() => []);
      setTasks(t || []);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteOperationsTask(id);
        toast.success('Task deleted');
        setTasks(tasks.filter(t => t.id !== id));
      } catch (e) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleDeletePayroll = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deletePayrollRecord(id);
        toast.success('Record deleted');
        setPayroll(payroll.filter(p => p.id !== id));
      } catch (e) {
        toast.error('Failed to delete record');
      }
    }
  };

  const priorityColors = { 
    HIGH: 'bg-red-100 text-red-600', 
    MEDIUM: 'bg-brand-amber/20 text-brand-amber', 
    LOW: 'bg-brand-green/20 text-brand-green' 
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-4">
        <div className="relative z-10 w-full md:w-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <Layers className="mr-3 text-brand-primary shrink-0" size={28} />
            Operations Module
          </h2>
        </div>
        <div className="relative z-10 flex overflow-x-auto whitespace-nowrap w-full md:w-auto gap-2 pb-2 main-scrollbar">
           <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shrink-0 ${activeTab === 'tasks' ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tasks</button>
           <button onClick={() => setActiveTab('approvals')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shrink-0 ${activeTab === 'approvals' ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Approvals</button>
           <button onClick={() => setActiveTab('commissions')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shrink-0 ${activeTab === 'commissions' ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Commissions</button>
           <button onClick={() => setActiveTab('field')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shrink-0 ${activeTab === 'field' ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Field Officers</button>
           <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shrink-0 ${activeTab === 'payroll' ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>HR Payroll</button>
        </div>
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex space-x-2">
              <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md ${viewMode === 'kanban' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-500 hover:bg-gray-100'}`}><LayoutGrid size={20}/></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-500 hover:bg-gray-100'}`}><List size={20}/></button>
            </div>
            <button onClick={() => setShowTaskModal(true)} className="bg-brand-primary hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-xl flex items-center transition-colors">
              <Plus size={16} className="mr-2" /> Add Task
            </button>
          </div>

          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['To Do', 'In Progress', 'Completed'].map(col => (
                <div 
                  key={col} 
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[500px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData('taskId');
                    if (taskId) handleUpdateTaskStatus(taskId, col);
                  }}
                >
                  <h3 className="font-extrabold text-brand-accent mb-4 px-2">{col}</h3>
                  <div className="space-y-4">
                    {tasks.filter(t => (t.status || 'To Do') === col).map((t, i) => (
                      <div 
                        key={t.id || i} 
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('taskId', t.id)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing relative"
                      >
                        <button onClick={() => handleDeleteTask(t.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        <div className="flex justify-between items-start mb-2 pr-6">
                          <h4 className="font-bold text-sm text-gray-800">{t.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${(priorityColors as any)[t.priority || 'MEDIUM']}`}>{t.priority || 'MEDIUM'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{t.description}</p>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-t border-gray-100 pt-3">
                          <span>{t.assignee}</span>
                          <span className="text-brand-primary">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-extrabold">
                      <th className="p-4">Title</th>
                      <th className="p-4">Assignee</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-bold">{t.title}</td>
                        <td className="p-4 text-sm">{t.assignee}</td>
                        <td className="p-4"><span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${(priorityColors as any)[t.priority || 'MEDIUM']}`}>{t.priority || 'MEDIUM'}</span></td>
                        <td className="p-4">
                          <select 
                             className="bg-transparent text-sm font-bold border-none outline-none cursor-pointer"
                             value={t.status || 'To Do'}
                             onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteTask(t.id)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Tasks */}
              <div className="md:hidden flex flex-col divide-y divide-gray-100">
                {tasks.map((t, i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold">{t.title}</h4>
                        <div className="text-xs text-gray-500 mt-1">Assignee: {t.assignee}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${(priorityColors as any)[t.priority || 'MEDIUM']}`}>{t.priority || 'MEDIUM'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <select 
                         className="bg-gray-50 border border-gray-200 rounded text-xs font-bold px-2 py-1 outline-none"
                         value={t.status || 'To Do'}
                         onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</span>
                        <button onClick={() => handleDeleteTask(t.id)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-extrabold text-brand-accent mb-4">Pending Approvals</h3>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-extrabold">
                  <th className="p-4">Type</th>
                  <th className="p-4">Submitted By</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.filter(l => l.status === 'PENDING_APPROVAL').map((l, i) => (
                  <tr key={`l-${i}`} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold">Loan Application</td>
                    <td className="p-4 text-sm">{l.memberId}</td>
                    <td className="p-4 text-sm">Amount: KES {l.amount?.toLocaleString()}</td>
                    <td className="p-4 text-sm">{new Date(l.dateApplied || Date.now()).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={async () => {
                        try { await approveLoan(l.id); toast.success('Approved'); setLoans(loans.filter(x => x.id !== l.id)); }
                        catch { toast.error('Failed to approve'); }
                      }} className="bg-brand-green hover:bg-opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-lg mr-2 transition-colors">Approve</button>
                      <button onClick={async () => {
                        try { await rejectLoan(l.id); toast.error('Rejected'); setLoans(loans.filter(x => x.id !== l.id)); }
                        catch { toast.error('Failed to reject'); }
                      }} className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                    </td>
                  </tr>
                ))}
                {withdrawals.filter(w => w.status === 'PENDING').map((w, i) => (
                  <tr key={`w-${i}`} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold">Withdrawal Request</td>
                    <td className="p-4 text-sm">{w.memberId}</td>
                    <td className="p-4 text-sm">Amount: KES {w.amount?.toLocaleString()}</td>
                    <td className="p-4 text-sm">{new Date(w.requestDate || Date.now()).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={async () => {
                        try { await approveWithdrawal(w.id); toast.success('Approved'); setWithdrawals(withdrawals.filter(x => x.id !== w.id)); }
                        catch { toast.error('Failed to approve'); }
                      }} className="bg-brand-green hover:bg-opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-lg mr-2 transition-colors">Approve</button>
                      <button onClick={async () => {
                        try { await rejectWithdrawal(w.id); toast.error('Rejected'); setWithdrawals(withdrawals.filter(x => x.id !== w.id)); }
                        catch { toast.error('Failed to reject'); }
                      }} className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Cards for Approvals */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {loans.filter(l => l.status === 'PENDING_APPROVAL').map((l, i) => (
              <div key={`l-mob-${i}`} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary">Loan Application</h4>
                    <div className="text-xs text-gray-500 mt-1">By: {l.memberId}</div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(l.dateApplied || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-extrabold text-gray-800">
                  Amount: KES {l.amount?.toLocaleString()}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={async () => {
                    try { await approveLoan(l.id); toast.success('Approved'); setLoans(loans.filter(x => x.id !== l.id)); }
                    catch { toast.error('Failed to approve'); }
                  }} className="flex-1 bg-brand-green hover:bg-opacity-90 text-white text-xs font-bold py-2 rounded-lg transition-colors">Approve</button>
                  <button onClick={async () => {
                    try { await rejectLoan(l.id); toast.error('Rejected'); setLoans(loans.filter(x => x.id !== l.id)); }
                    catch { toast.error('Failed to reject'); }
                  }} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold py-2 rounded-lg transition-colors">Reject</button>
                </div>
              </div>
            ))}
            {withdrawals.filter(w => w.status === 'PENDING').map((w, i) => (
              <div key={`w-mob-${i}`} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-brand-accent">Withdrawal Request</h4>
                    <div className="text-xs text-gray-500 mt-1">By: {w.memberId}</div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(w.requestDate || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-extrabold text-gray-800">
                  Amount: KES {w.amount?.toLocaleString()}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={async () => {
                    try { await approveWithdrawal(w.id); toast.success('Approved'); setWithdrawals(withdrawals.filter(x => x.id !== w.id)); }
                    catch { toast.error('Failed to approve'); }
                  }} className="flex-1 bg-brand-green hover:bg-opacity-90 text-white text-xs font-bold py-2 rounded-lg transition-colors">Approve</button>
                  <button onClick={async () => {
                    try { await rejectWithdrawal(w.id); toast.error('Rejected'); setWithdrawals(withdrawals.filter(x => x.id !== w.id)); }
                    catch { toast.error('Failed to reject'); }
                  }} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold py-2 rounded-lg transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Commissions</p>
              <p className="text-2xl font-extrabold text-brand-primary">KES {commissions.reduce((s, c) => s + (c.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Paid</p>
              <p className="text-2xl font-extrabold text-brand-green">KES {commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + (c.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Pending</p>
              <p className="text-2xl font-extrabold text-brand-amber">KES {commissions.filter(c => c.status === 'PENDING').reduce((s, c) => s + (c.amount || 0), 0).toLocaleString()}</p>
            </div>
          </div>
          {commissions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={commissions.slice(0, 10)}>
                   <XAxis dataKey="agentName" />
                   <YAxis />
                   <Tooltip />
                   <Bar dataKey="amount" fill="#0f3d3e" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-extrabold">
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Period</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissions.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold">{c.agentName}</td>
                    <td className="p-4 text-sm">{c.type}</td>
                    <td className="p-4 text-sm">{c.period || 'Current'}</td>
                    <td className="p-4 text-sm font-bold text-right">KES {c.amount?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${c.status === 'PAID' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-amber/20 text-brand-amber'}`}>{c.status || 'PENDING'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'field' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-extrabold">
                <th className="p-4">Officer Name</th>
                <th className="p-4">Region</th>
                <th className="p-4 text-center">Registrations</th>
                <th className="p-4 text-right">Collections</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffPerformance.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-bold">{f.name}</td>
                  <td className="p-4 text-sm">{f.region}</td>
                  <td className="p-4 text-sm text-center font-bold">{f.reg}</td>
                  <td className="p-4 text-sm font-bold text-right">KES {f.coll.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-bold ${f.score > 90 ? 'text-brand-green' : f.score > 70 ? 'text-brand-amber' : 'text-red-500'}`}>{f.score}%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${f.score > 90 ? 'bg-brand-green' : f.score > 70 ? 'bg-brand-amber' : 'bg-red-500'}`} style={{ width: `${f.score}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${f.status === 'Active' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-amber/20 text-brand-amber'}`}>{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Gross</p>
              <p className="text-2xl font-extrabold text-brand-primary">KES {payroll.reduce((s, p) => s + (p.basicSalary || 0) + (p.allowances || 0), 0).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase">Total Deductions</p>
              <p className="text-2xl font-extrabold text-red-600">KES {payroll.reduce((s, p) => s + (p.paye || 0) + (p.nssf || 0) + (p.nhif || 0), 0).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Total Net Pay</p>
                <p className="text-2xl font-extrabold text-brand-green">KES {payroll.reduce((s, p) => s + (p.netPay || 0), 0).toLocaleString()}</p>
              </div>
              <button onClick={async () => {
                if (confirm('Are you sure you want to run payroll?')) {
                  toast.loading('Processing payroll...');
                  try {
                    const totalNet = payroll.reduce((s, p) => s + (p.netPay || 0), 0);
                    
                    // Create Payroll Records for each employee
                    for (const p of payroll) {
                      await createPayrollRecord({
                        employeeId: p.employeeId || 'EMP-001',
                        employeeName: p.employeeName,
                        basicSalary: p.basicSalary || 0,
                        allowances: p.allowances || 0,
                        deductions: (p.paye || 0) + (p.nssf || 0) + (p.nhif || 0),
                        netPay: p.netPay || 0,
                        status: 'PAID',
                        paymentDate: new Date().toISOString()
                      });
                    }

                    // Log the total payment
                    await createPayment({
                      receiptNo: `PAYROLL-${Date.now()}`,
                      amount: totalNet,
                      type: 'OUTBOUND',
                      status: 'COMPLETED',
                      narration: 'Staff Payroll Disbursement'
                    });
                    toast.dismiss();
                    toast.success('Payroll processed successfully');
                  } catch (e) {
                    toast.dismiss();
                    toast.error('Failed to process payroll');
                  }
                }
              }} className="bg-brand-primary hover:bg-opacity-90 transition-colors text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm">Run Payroll</button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-extrabold">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Basic Salary</th>
                  <th className="p-4 text-right">Allowances</th>
                  <th className="p-4 text-right">Deductions</th>
                  <th className="p-4 text-right">Net Pay</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold">{p.employeeName}</td>
                    <td className="p-4 text-sm">{p.role}</td>
                    <td className="p-4 text-sm text-right">KES {p.basicSalary?.toLocaleString()}</td>
                    <td className="p-4 text-sm text-right">KES {p.allowances?.toLocaleString()}</td>
                    <td className="p-4 text-sm text-right text-red-500">KES {((p.paye || 0) + (p.nssf || 0) + (p.nhif || 0)).toLocaleString()}</td>
                    <td className="p-4 text-sm font-bold text-brand-green text-right">KES {p.netPay?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${p.status === 'PAID' ? 'bg-brand-green/20 text-brand-green' : 'bg-gray-100 text-gray-600'}`}>{p.status || 'PENDING'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeletePayroll(p.id)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h3 className="font-extrabold text-brand-accent text-lg mb-4">Add Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-brand-primary" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Assignee</label>
                <input type="text" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-brand-primary" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Priority</label>
                <select className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-brand-primary" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Due Date</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-brand-primary" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-brand-primary" rows={3} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowTaskModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 font-bold hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveTask} className="flex-1 bg-brand-primary text-white rounded-lg py-2 font-bold shadow-md hover:bg-opacity-90">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
