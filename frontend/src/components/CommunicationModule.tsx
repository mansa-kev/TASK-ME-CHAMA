import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Send, Settings, Phone, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { 
  fetchCommunicationLogs, 
  createCommunicationLog, 
  fetchMessageTemplates, 
  createMessageTemplate, 
  updateMessageTemplate, 
  deleteMessageTemplate,
  fetchMembers
} from '../api';

export function CommunicationModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'messages' | 'sms' | 'email' | 'templates' | 'automation'>('messages');
  
  const [logs, setLogs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetchCommunicationLogs().catch(() => []),
      fetchMessageTemplates().catch(() => []),
      fetchMembers().catch(() => [])
    ]).then(([l, t, m]) => {
      setLogs(l || []);
      setTemplates(t || []);
      setMembers(m || []);
    });
  }, []);

  // state for SMS Compose
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsContent, setSmsContent] = useState('');
  const [smsTemplate, setSmsTemplate] = useState('');

  // state for Email Compose
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');

  // state for templates
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ id: '', name: '', type: 'SMS', content: '' });

  const handleSendSMS = async () => {
    if (!smsRecipient || !smsContent) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await createCommunicationLog({
        type: 'SMS',
        recipientId: smsRecipient,
        content: smsContent,
        status: 'PENDING',
        date: new Date().toISOString()
      });
      toast.success('SMS Queued for Sending');
      setSmsRecipient('');
      setSmsContent('');
      setSmsTemplate('');
    } catch (e) {
      toast.error('Failed to send SMS');
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipient || !emailSubject || !emailContent) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await createCommunicationLog({
        type: 'EMAIL',
        recipientId: emailRecipient,
        subject: emailSubject,
        content: emailContent,
        status: 'PENDING',
        date: new Date().toISOString()
      });
      toast.success('Email Queued for Sending');
      setEmailRecipient('');
      setEmailSubject('');
      setEmailContent('');
      setEmailTemplate('');
    } catch (e) {
      toast.error('Failed to send Email');
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (templateForm.id) {
        await updateMessageTemplate(templateForm.id, templateForm);
        toast.success('Template updated');
      } else {
        await createMessageTemplate({ ...templateForm, id: Date.now().toString() });
        toast.success('Template created');
      }
      setShowTemplateModal(false);
      const t = await fetchMessageTemplates().catch(() => []);
      setTemplates(t || []);
    } catch (e) {
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteMessageTemplate(id);
      toast.success('Template deleted');
      const t = await fetchMessageTemplates().catch(() => []);
      setTemplates(t || []);
    } catch (e) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <MessageSquare className="mr-2 sm:mr-3 text-brand-primary shrink-0" size={24} />
            Communication Hub
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage member SMS broadcasts, notifications, and automations.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0">
           <button onClick={() => setActiveTab('messages')} className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${activeTab === 'messages' ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Messages</button>
           <button onClick={() => setActiveTab('sms')} className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${activeTab === 'sms' ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Send SMS</button>
           <button onClick={() => setActiveTab('email')} className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${activeTab === 'email' ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Send Email</button>
           <button onClick={() => setActiveTab('templates')} className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${activeTab === 'templates' ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Templates</button>
           <button onClick={() => setActiveTab('automation')} className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${activeTab === 'automation' ? 'bg-brand-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Automation</button>
        </div>
      </div>

      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Sent</p>
              <p className="text-2xl font-extrabold text-brand-primary mt-1">{logs.filter(l => l.status === 'SENT').length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-extrabold text-brand-amber mt-1">{logs.filter(l => l.status === 'PENDING').length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Failed</p>
              <p className="text-2xl font-extrabold text-red-600 mt-1">{logs.filter(l => l.status === 'FAILED').length}</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] sm:text-xs uppercase text-gray-500 font-extrabold">
                    <th className="p-3 sm:p-4">Type</th>
                    <th className="p-3 sm:p-4">Recipient</th>
                    <th className="p-3 sm:p-4">Content</th>
                    <th className="p-3 sm:p-4">Status</th>
                    <th className="p-3 sm:p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {logs.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400">No communication logs found</td></tr>
                  ) : (
                    logs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 sm:p-4 font-bold text-gray-800">{log.type}</td>
                        <td className="p-3 sm:p-4 text-gray-600">{log.recipientId}</td>
                        <td className="p-3 sm:p-4 text-gray-700 truncate max-w-xs">{log.content}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status === 'SENT' ? 'bg-brand-green/20 text-brand-green' : log.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-brand-amber/20 text-brand-amber'}`}>{log.status}</span>
                        </td>
                        <td className="p-3 sm:p-4 text-gray-500 whitespace-nowrap">{new Date(log.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sms' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 max-w-2xl">
          <h3 className="font-extrabold text-base sm:text-lg text-brand-accent mb-4">Compose SMS</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Recipient</label>
              <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={smsRecipient} onChange={e => setSmsRecipient(e.target.value)}>
                <option value="">Select Member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.name || m.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Template</label>
              <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={smsTemplate} onChange={e => {
                setSmsTemplate(e.target.value);
                const t = templates.find(x => x.id === e.target.value);
                if (t) setSmsContent(t.content);
              }}>
                <option value="">No Template</option>
                {templates.filter(t => t.type === 'SMS').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Message</label>
              <textarea className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" rows={4} value={smsContent} onChange={e => setSmsContent(e.target.value)}></textarea>
              <div className="text-right text-[10px] sm:text-xs text-gray-500 mt-1">{smsContent.length} / 160 characters</div>
            </div>
            <button onClick={handleSendSMS} className="w-full sm:w-auto bg-brand-primary hover:bg-opacity-90 transition-colors text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl flex items-center justify-center shadow-sm">
              <Send size={16} className="mr-2 shrink-0" /> Send SMS
            </button>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 max-w-2xl">
          <h3 className="font-extrabold text-base sm:text-lg text-brand-accent mb-4">Compose Email</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Recipient</label>
              <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={emailRecipient} onChange={e => setEmailRecipient(e.target.value)}>
                <option value="">Select Member...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.name || m.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Subject</label>
              <input type="text" className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Template</label>
              <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={emailTemplate} onChange={e => {
                setEmailTemplate(e.target.value);
                const t = templates.find(x => x.id === e.target.value);
                if (t) setEmailContent(t.content);
              }}>
                <option value="">No Template</option>
                {templates.filter(t => t.type === 'EMAIL').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">Body</label>
              <textarea className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" rows={6} value={emailContent} onChange={e => setEmailContent(e.target.value)}></textarea>
            </div>
            <button onClick={handleSendEmail} className="w-full sm:w-auto bg-brand-primary hover:bg-opacity-90 transition-colors text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl flex items-center justify-center shadow-sm">
              <Send size={16} className="mr-2 shrink-0" /> Send Email
            </button>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-base sm:text-lg text-brand-accent">Message Templates</h3>
            <button onClick={() => { setTemplateForm({ id: '', name: '', type: 'SMS', content: '' }); setShowTemplateModal(true); }} className="bg-brand-primary hover:bg-opacity-90 transition-colors text-white text-xs sm:text-sm font-bold py-2 px-3.5 rounded-xl flex items-center shadow-sm">
              <Plus size={16} className="mr-1.5 shrink-0" /> New
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] sm:text-xs uppercase text-gray-500 font-extrabold">
                    <th className="p-3 sm:p-4">Name</th>
                    <th className="p-3 sm:p-4">Type</th>
                    <th className="p-3 sm:p-4">Preview</th>
                    <th className="p-3 sm:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {templates.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-gray-400">No templates found</td></tr>
                  ) : (
                    templates.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 sm:p-4 font-bold text-gray-800">{t.name}</td>
                        <td className="p-3 sm:p-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t.type}</span></td>
                        <td className="p-3 sm:p-4 text-gray-600 truncate max-w-xs">{t.content}</td>
                        <td className="p-3 sm:p-4 text-right whitespace-nowrap">
                          <button onClick={() => { setTemplateForm(t); setShowTemplateModal(true); }} className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg mr-1"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="font-extrabold text-base sm:text-lg text-brand-accent mb-4">Automation Rules</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { name: 'Loan Disbursement', event: 'Loan Disbursed', channel: 'SMS' },
              { name: 'Deposit Received', event: 'Payment Received', channel: 'SMS' },
              { name: 'Repayment Due', event: '3 Days Prior to Due Date', channel: 'SMS' },
              { name: 'Overdue Payment', event: '1 Day Past Due Date', channel: 'SMS' },
              { name: 'Meeting Reminder', event: '1 Day Prior to Meeting', channel: 'SMS' },
            ].map((rule, i) => (
              <div key={i} className="flex justify-between items-center p-3.5 sm:p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                <div className="pr-2">
                  <p className="font-bold text-xs sm:text-sm text-gray-800">{rule.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Trigger: {rule.event} &bull; Channel: {rule.channel}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} onChange={() => toast.success('Rule updated')} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h3 className="font-extrabold text-brand-accent text-base sm:text-lg mb-4">{templateForm.id ? 'Edit' : 'Create'} Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1">Name</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1">Type</label>
                <select className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" value={templateForm.type} onChange={e => setTemplateForm({...templateForm, type: e.target.value})}>
                  <option value="SMS">SMS</option>
                  <option value="EMAIL">EMAIL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1">Content</label>
                <textarea className="w-full border border-gray-200 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-primary bg-gray-50" rows={4} value={templateForm.content} onChange={e => setTemplateForm({...templateForm, content: e.target.value})} placeholder="Use {member_name}, {loan_balance}, etc." />
                <p className="text-[10px] text-gray-500 mt-1">Tags: {'{member_name}'}, {'{loan_balance}'}, {'{due_date}'}, {'{receipt_no}'}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowTemplateModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-xs sm:text-sm font-bold hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveTemplate} className="flex-1 bg-brand-primary text-white rounded-xl py-2 text-xs sm:text-sm font-bold shadow-md hover:bg-opacity-90">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
