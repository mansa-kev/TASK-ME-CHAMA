import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Send, Megaphone, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { postOfficialsNotice, removeOfficialsNotice, fetchOfficialsNotices, fetchOfficialsBroadcasts, fetchCommunicationLogs, createCommunicationLog } from '../../api';

export function OfficialsCommunication() {
  const [activeTab, setActiveTab] = useState<'broadcasts' | 'notices'>('broadcasts');
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchCommunicationLogs().then(data => {
      if (Array.isArray(data)) setBroadcastHistory(data);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 pb-28 sm:pb-12 animation-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Communication Center</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage broadcasts and notice board announcements</p>
      </div>

      <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`shrink-0 flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'broadcasts' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Send className="w-4 h-4 mr-2" />
          Broadcasts (SMS/Email)
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`shrink-0 flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'notices' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Notice Board
        </button>
      </div>

      {activeTab === 'broadcasts' && <BroadcastsTab broadcastHistory={broadcastHistory} />}
      {activeTab === 'notices' && <NoticesTab />}
    </div>
  );
}

function BroadcastsTab({ broadcastHistory }: { broadcastHistory: any[] }) {
  const [messageType, setMessageType] = useState<'SMS' | 'Email'>('SMS');
  const [audience, setAudience] = useState('All Members');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    createCommunicationLog({
      type: 'BROADCAST',
      messageType,
      audience,
      subject: messageType === 'Email' ? subject : undefined,
      message
    }).then(() => {
      toast.success(`${messageType} broadcast sent to ${audience}!`);
      setMessage('');
      setSubject('');
    }).catch(() => {
      toast.error('Failed to send broadcast');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-brand-primary" />
            New Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setMessageType('SMS')}
                    className={`flex-1 py-2 px-3 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      messageType === 'SMS' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageType('Email')}
                    className={`flex-1 py-2 px-3 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      messageType === 'Email' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="w-4 h-4 mr-2" /> Email
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2.5 border"
                >
                  <option>All Members</option>
                  <option>Defaulters Only</option>
                  <option>Board Members</option>
                  <option>Active Loan Holders</option>
                </select>
              </div>
            </div>

            {messageType === 'Email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2.5 border"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type your ${messageType} message here...`}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2.5 border resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {message.length} characters
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold flex items-center hover:bg-brand-primary/90 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            Recent Broadcasts
          </h2>
          <div className="space-y-4">
            {broadcastHistory.map((item) => (
              <div key={item.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    item.type === 'SMS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(item.createdAt || item.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">To: {item.recipientId || item.audience}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{item.body || item.message}</p>
                <p className="text-xs text-gray-400 mt-2">Sent by System</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function NoticesTab() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notices, setNotices] = useState<any[]>([]);

  const loadNotices = () => {
    fetchOfficialsNotices().then(data => {
      if (Array.isArray(data)) setNotices(data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postOfficialsNotice({ title, content });
      toast.success('Notice posted!');
      loadNotices();
      setTitle('');
      setContent('');
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to post notice');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeOfficialsNotice(id);
      setNotices(notices.filter(n => n.id !== id));
      toast.success('Notice removed');
    } catch (e) {
      toast.error('Failed to remove notice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Active Notices</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-accent text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-brand-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Notice
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-md font-bold text-gray-900 mb-4">Create New Notice</h3>
          <form className="space-y-4" onSubmit={handlePostNotice}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2.5 border" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2.5 border resize-none" required></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50">Cancel</button>
              <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-primary/90">Post Notice</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900">{notice.title}</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                {notice.status || 'Active'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{notice.content}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(notice.createdAt || notice.date).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <UserIcon className="w-3.5 h-3.5 mr-1" />
                  {notice.author || 'Admin'}
                </span>
              </div>
              <button onClick={() => handleRemove(notice.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
