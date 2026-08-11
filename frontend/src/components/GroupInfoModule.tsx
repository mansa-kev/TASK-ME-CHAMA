import { Users, FileText, Info, Calendar, Shield, MapPin, Building, Smartphone, FileCheck, HeartHandshake } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchOfficialsSettings, fetchChamaBylaws, fetchOfficialsMembers } from '../api';
import { MemberChamaDesk } from './MemberChamaDesk';
import toast from 'react-hot-toast';

export function GroupInfoModule() {
  const [activeTab, setActiveTab] = useState<'profile' | 'rules' | 'officials_desk'>('profile');
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [officials, setOfficials] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const settings = await fetchOfficialsSettings();
        setGroupDetails(settings || {});
        
        const officialsData = await fetchOfficialsMembers();
        setOfficials(Array.isArray(officialsData) ? officialsData.filter((m: any) => m.role && m.role !== 'MEMBER') : []);
        
        const bylaws = await fetchChamaBylaws();
        setRules(bylaws?.rules || []);
      } catch (error) {
        console.error('Failed to fetch group info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading group information...</div>;
  }

  if (!groupDetails) {
    return <div className="p-8 text-center text-gray-500">No group information available.</div>;
  }

  const details = {
    name: groupDetails.name || 'Group Profile',
    registration: groupDetails.registration || 'N/A',
    founded: groupDetails.formationDate ? new Date(groupDetails.formationDate).getFullYear().toString() : 'N/A',
    meetingFrequency: groupDetails.meetingFrequency || 'Not Set',
    nextMeeting: groupDetails.nextMeeting || 'Not scheduled',
    county: groupDetails.county || 'Not Set',
    phone: groupDetails.phone || 'Not Set'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animation-fade-in">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 w-full absolute top-0 left-0"></div>
        <div className="p-6 pt-16 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-28 h-28 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-gray-50 text-gray-400 flex items-center justify-center">
              <Building className="w-12 h-12" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <FileCheck className="w-3 h-3" /> Registered Chama
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{details.name}</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Empowering members through collective growth.</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-3.5 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Invite Code:</span>
              <span className="text-sm font-black text-gray-900 font-mono tracking-widest">{details.registration}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(details.registration);
                  toast.success('Invite code copied!');
                }}
                className="ml-2 text-brand-primary hover:text-brand-primary-dark transition-colors"
                title="Copy Invite Code"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 px-3 sm:px-6 overflow-x-auto gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'profile' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Group Profile
          </button>
          <button 
            onClick={() => setActiveTab('officials_desk')}
            className={`px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeTab === 'officials_desk' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            <HeartHandshake className="w-4 h-4 text-brand-accent" />
            Officials & Leaders Desk
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-4 sm:px-6 py-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'rules' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            Constitution & Rules
          </button>
        </div>
      </div>

      {activeTab === 'officials_desk' && (
        <MemberChamaDesk />
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Chama Details</h2>
                <button
                  onClick={() => setActiveTab('officials_desk')}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  Contact Officials →
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registration</p>
                    <p className="font-medium text-gray-900">{details.registration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Formed</p>
                    <p className="font-medium text-gray-900">{details.founded}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</p>
                    <p className="font-medium text-gray-900">{details.county}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meeting Freq</p>
                    <p className="font-medium text-gray-900">{details.meetingFrequency}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 border-t border-gray-100 mt-2 bg-white">
                <div className="bg-brand-primary/5 rounded-xl p-5 border border-brand-primary/10 flex items-center justify-between mt-6">
                  <div>
                    <h4 className="font-bold text-gray-900">Next Scheduled Meeting</h4>
                    <p className="text-sm text-gray-600 mt-1">{details.nextMeeting}</p>
                  </div>
                  <div>
                    <button 
                      onClick={() => {
                        const eventDate = new Date();
                        eventDate.setMonth(eventDate.getMonth() + 1);
                        eventDate.setDate(15);
                        eventDate.setHours(10, 0, 0, 0);
                        const endDate = new Date(eventDate);
                        endDate.setHours(12, 0, 0, 0);
                        
                        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
                        
                        const icsContent = [
                          'BEGIN:VCALENDAR',
                          'VERSION:2.0',
                          'BEGIN:VEVENT',
                          `DTSTART:${formatDate(eventDate)}`,
                          `DTEND:${formatDate(endDate)}`,
                          `SUMMARY:${details.name} Monthly Meeting`,
                          `DESCRIPTION:Regular monthly meeting for ${details.name}`,
                          'END:VEVENT',
                          'END:VCALENDAR'
                        ].join('\r\n');
                        
                        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'meeting.ics';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Calendar event downloaded');
                      }}
                      className="px-5 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg hover:bg-brand-primary-dark transition-colors">
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  Group Officials
                </h2>
                <button
                  onClick={() => setActiveTab('officials_desk')}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  Reach Out
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {officials.length > 0 ? officials.map((official, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-extrabold text-sm shrink-0">
                        {official.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{official.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider bg-brand-accent/10 px-2 py-0.5 rounded">
                            {official.role === 'CHAMA_ADMIN' ? 'Admin' : official.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    {official.phone && (
                      <a 
                        href={`tel:${official.phone}`} 
                        className="p-2 rounded-lg bg-gray-100 hover:bg-brand-primary hover:text-white text-gray-700 transition-colors"
                        title="Call Official"
                      >
                        <Smartphone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500">No officials found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Group Constitution</h2>
              <p className="text-xs sm:text-sm text-gray-500">Agreed rules and regulations governing the Chama.</p>
            </div>
          </div>

          <div className="space-y-4">
            {rules.length > 0 ? rules.map((rule: string, idx: number) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray-700 leading-relaxed font-medium pt-1 text-xs sm:text-sm">
                  {rule}
                </p>
              </div>
            )) : (
              <div className="p-4 text-center text-gray-500">No group constitution rules found.</div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
            <button 
              onClick={() => {
                const constitutionText = `GROUP CONSTITUTION\n\n${rules.map((r: string, i: number) => `${i+1}. ${r}`).join('\n\n')}`;
                const blob = new Blob([constitutionText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Group_Constitution.txt`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Constitution downloaded');
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-sm text-xs sm:text-sm">
              <FileText className="w-4 h-4" /> Download Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

