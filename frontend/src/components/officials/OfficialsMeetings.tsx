import { usePrompt } from '../common/PromptProvider';
import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Vote, Plus, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  fetchOfficialsMeetings, createOfficialsMeeting, fetchOfficialsMinutes, fetchOfficialsPolls, 
  downloadOfficialsMinute, createOfficialsPoll, fetchPollDetails, sendMeetingReminder
} from '../../api';

export function OfficialsMeetings() {
  const showPrompt = usePrompt();

  const [activeTab, setActiveTab] = useState<'calendar' | 'minutes' | 'voting'>('calendar');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [minutes, setMinutes] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', location: '', attendees: '' });

  const loadMeetings = async () => {
    fetchOfficialsMeetings().then(data => {
      if (Array.isArray(data)) setMeetings(data);
    }).catch(console.error);
  };

  const loadMinutes = () => {
    fetchOfficialsMinutes().then(data => {
      if (Array.isArray(data)) setMinutes(data);
    }).catch(console.error);
  };

  const loadPolls = () => {
    fetchOfficialsPolls().then(data => {
      if (Array.isArray(data)) setPolls(data);
    }).catch(console.error);
  };

  useEffect(() => {
    loadMeetings();
    loadMinutes();
    loadPolls();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createOfficialsMeeting({
      title: formData.title,
      date: formData.date,
      location: formData.location,
      attendees: parseInt(formData.attendees) || 0,
      status: 'upcoming'
    }).then(() => {
      toast.success('Meeting scheduled successfully');
      setIsModalOpen(false);
      loadMeetings();
    }).catch(() => toast.error('Failed to schedule meeting'));
  };

  return (
    <div className="space-y-6 pb-28 sm:pb-12 animation-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meetings & Governance</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Schedule group meetings, download minutes, and manage voting.</p>
        </div>
        <div className="w-full sm:w-auto">
          {activeTab === 'calendar' && (
            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors text-xs sm:text-sm shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </button>
          )}
          {activeTab === 'minutes' && (
            <button onClick={async () => {
              const template = `MEETING MINUTES TEMPLATE\n\nDate: ${new Date().toLocaleDateString()}\nTime: \nLocation: \n\nATTENDEES:\n- \n- \n\nAGENDA:\n1. \n2. \n\nDISCUSSION:\n- \n\nACTION ITEMS:\n- \n`;
              const blob = new Blob([template], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Meeting_Minutes_Template.txt`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Template downloaded');
            }} className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors text-xs sm:text-sm shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Draft Minutes
            </button>
          )}
          {activeTab === 'voting' && (
            <button onClick={async () => {
              const question = await showPrompt('Enter poll question:');
              if (question) {
                createOfficialsPoll({ question }).then(() => {
                  toast.success('Poll created successfully! Notifications sent to members.');
                  loadPolls();
                }).catch(() => toast.error('Failed to create poll'));
              }
            }} className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-colors text-xs sm:text-sm shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Poll
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`shrink-0 flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${activeTab === 'calendar' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('minutes')}
          className={`shrink-0 flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${activeTab === 'minutes' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Minutes & Agendas
        </button>
        <button
          onClick={() => setActiveTab('voting')}
          className={`shrink-0 flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${activeTab === 'voting' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <Vote className="w-4 h-4 mr-2" />
          Voting & Resolutions
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'calendar' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
            <div className="space-y-3 sm:space-y-4">
              {meetings.map(meeting => (
                <div key={meeting.id} className="p-4 border border-gray-100 rounded-xl hover:border-brand-primary/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(meeting.date).toLocaleString()}</div>
                      <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {meeting.location}</div>
                      <div className="flex items-center"><Users className="w-4 h-4 mr-1" /> {meeting.attendees} expected</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      setFormData({ title: meeting.title, date: meeting.date, location: meeting.location, attendees: meeting.attendees });
                      setIsModalOpen(true);
                    }} className="px-3 py-1.5 text-brand-primary border border-brand-primary rounded-lg font-medium hover:bg-brand-primary/5 transition-colors">Edit</button>
                    <button onClick={async () => {
                      sendMeetingReminder(meeting.id).then(() => {
                        toast.success('Reminder sent to all attendees');
                      }).catch(() => toast.error('Failed to send reminder'));
                    }} className="px-3 py-1.5 text-white bg-brand-primary rounded-lg font-medium hover:bg-opacity-90 transition-colors">Send Reminder</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'minutes' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-brand-primary mb-4">Meeting Minutes</h2>
            <div className="divide-y divide-gray-100">
              {minutes.map(minute => (
                <div key={minute.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{minute.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Date: {minute.date} • By: {minute.author}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${minute.status === 'approved' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-amber/10 text-brand-amber'}`}>
                      {minute.status.toUpperCase()}
                    </span>
                    <button onClick={async () => {
                      downloadOfficialsMinute(minute.id).then((blob: any) => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${minute.title.replace(/\s+/g, '_')}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Document downloaded');
                      }).catch(() => toast.error('Failed to download document'));
                    }} className="text-brand-primary hover:underline text-sm font-medium">View Document</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'voting' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-brand-primary mb-4">Active & Past Polls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.map(poll => {
                const total = poll.yes + poll.no + poll.abstain;
                const yesPercent = total > 0 ? Math.round((poll.yes / total) * 100) : 0;
                
                return (
                  <div key={poll.id} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{poll.question}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full whitespace-nowrap ${poll.status === 'active' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-600'}`}>
                        {poll.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center text-brand-green font-medium"><CheckCircle className="w-4 h-4 mr-1" /> Yes ({poll.yes})</span>
                          <span>{yesPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-brand-green h-2 rounded-full" style={{ width: `${yesPercent}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span className="flex items-center text-red-500"><XCircle className="w-4 h-4 mr-1" /> No ({poll.no})</span>
                        <span>Abstain: {poll.abstain}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                      <span className="text-gray-500">Ends: {poll.endDate}</span>
                      <button onClick={async () => {
                        fetchPollDetails(poll.id).then(details => {
                           toast(`Voting Record: ${details.yes} Yes, ${details.no} No, ${details.abstain} Abstain. Status: ${details.status.toUpperCase()}`, { icon: '📊', duration: 5000 });
                        }).catch(() => toast.error('Failed to fetch details'));
                      }} className="text-brand-primary font-medium hover:underline">View Details</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Schedule Meeting</h2>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location / Link</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Attendees</label>
                <input required type="number" value={formData.attendees} onChange={e => setFormData({...formData, attendees: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
