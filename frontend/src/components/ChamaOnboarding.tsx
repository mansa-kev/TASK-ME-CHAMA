import { useState } from 'react';
import { Building, Users, CheckCircle2, ArrowRight, FileText, Settings, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { createChama } from '../api';

export function ChamaOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    formationDate: '',
    phone: '',
    county: 'Nairobi',
    meetingFrequency: 'Monthly',
    standardContribution: '',
    lateFine: '',
    missedFine: '',
    roscaEnabled: false
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createChama({
        name: formData.name,
        registration: formData.registration,
        formationDate: formData.formationDate,
        phone: formData.phone,
        county: formData.county,
        meetingFrequency: formData.meetingFrequency,
        standardContribution: formData.standardContribution ? parseFloat(formData.standardContribution) : 0,
        lateFine: formData.lateFine ? parseFloat(formData.lateFine) : 0,
        missedFine: formData.missedFine ? parseFloat(formData.missedFine) : 0,
        roscaEnabled: formData.roscaEnabled
      });
      toast.success('Chama registered successfully!');
      navigate('/dashboard/chamas');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register Chama');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <Building className="mr-3 text-brand-primary" size={28} />
            Chama (Group) Onboarding
          </h2>
          <p className="text-sm font-medium text-brand-accent mt-1">
            Register a new Chama, define its leadership structure, and configure group bylaws.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        
        {/* Progress Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 p-5 sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Registration Progress</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {['Group Profile', 'Leadership Roster', 'Bylaws & Settings', 'Review & Submit'].map((title, index) => {
                const stepNum = index + 1;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;
                
                return (
                  <div key={stepNum} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white z-10 shadow-sm transition-colors ${isActive ? 'border-brand-primary text-brand-primary' : isCompleted ? 'border-brand-green bg-brand-green text-white' : 'border-gray-200 text-gray-300'}`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-bold text-sm">{stepNum}</span>}
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-sm font-bold transition-colors ${isActive ? 'text-gray-800' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{title}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 p-8">
            
            {step === 1 && (
              <div className="space-y-6 animation-fade-in">
                <h3 className="text-lg font-extrabold text-brand-primary border-b border-gray-100 pb-3 flex items-center">
                  <FileText size={18} className="mr-2" /> Basic Group Profile
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Registered Group Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors" placeholder="e.g. Upendo Self Help Group" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Registration Number</label>
                    <input type="text" value={formData.registration} onChange={e => setFormData({...formData, registration: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors" placeholder="Reg Cert No." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Formation Date</label>
                    <input type="date" value={formData.formationDate} onChange={e => setFormData({...formData, formationDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Group Primary Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors" placeholder="+254 7XX XXX XXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">County / Region</label>
                    <select value={formData.county} onChange={e => setFormData({...formData, county: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors">
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animation-fade-in">
                <h3 className="text-lg font-extrabold text-brand-primary border-b border-gray-100 pb-3 flex items-center">
                  <Users size={18} className="mr-2" /> Leadership Roster
                </h3>
                
                <p className="text-sm text-gray-500 mb-4">Search for existing members to assign them to leadership roles for this Chama.</p>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                     <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Chairperson</label>
                     <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Search Member ID or Name..." />
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                     <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Treasurer</label>
                     <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Search Member ID or Name..." />
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                     <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Secretary</label>
                     <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-primary outline-none" placeholder="Search Member ID or Name..." />
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6 animation-fade-in">
                 <h3 className="text-lg font-extrabold text-brand-primary border-b border-gray-100 pb-3 flex items-center">
                  <Settings size={18} className="mr-2" /> Group Bylaws & Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Meeting Frequency</label>
                    <select value={formData.meetingFrequency} onChange={e => setFormData({...formData, meetingFrequency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors">
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Standard Contribution (KES)</label>
                    <input type="number" value={formData.standardContribution} onChange={e => setFormData({...formData, standardContribution: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary outline-none" placeholder="e.g. 1000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Late Meeting Fine (KES)</label>
                    <input type="number" value={formData.lateFine} onChange={e => setFormData({...formData, lateFine: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary outline-none" placeholder="e.g. 200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-primary uppercase">Missed Meeting Fine (KES)</label>
                    <input type="number" value={formData.missedFine} onChange={e => setFormData({...formData, missedFine: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-primary outline-none" placeholder="e.g. 500" />
                  </div>
                  <div className="col-span-2 mt-2">
                    <label className="flex items-center p-4 border border-brand-green/30 bg-brand-green/5 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={formData.roscaEnabled} onChange={e => setFormData({...formData, roscaEnabled: e.target.checked})} className="w-5 h-5 text-brand-green rounded" />
                      <div className="ml-3">
                        <p className="text-sm font-bold text-gray-800">Enable Merry-Go-Round (ROSCA) Module</p>
                        <p className="text-xs text-gray-500">Activates the automated payout rotation schedule for this group.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animation-fade-in text-center py-10">
                 <ShieldAlert size={64} className="mx-auto text-brand-accent mb-4" />
                 <h3 className="text-2xl font-extrabold text-brand-accent">Final Verification</h3>
                 <p className="text-sm text-gray-500 max-w-md mx-auto">
                   Creating a new Chama will automatically instantiate an aggregate general ledger account for their pool. An SMS will be dispatched to the Chairperson, Secretary, and Treasurer.
                 </p>
              </div>
            )}

            {/* Form Navigation Controls */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
              <button 
                onClick={() => setStep(step > 1 ? step - 1 : 1)}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-colors border ${step === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-brand-primary hover:bg-brand-primary/5 hover:border-brand-primary/30'}`}
                disabled={step === 1 || isSubmitting}
              >
                Previous Step
              </button>
              
              <button 
                disabled={isSubmitting}
                onClick={() => {
                  if (step < 4) {
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                className={`flex items-center px-8 py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-colors disabled:opacity-50 ${step === 4 ? 'bg-brand-green hover:bg-green-600' : 'bg-brand-primary hover:bg-brand-primary-dark'}`}
              >
                {isSubmitting ? 'Registering...' : step === 4 ? 'Register Chama' : 'Continue'} 
                {step < 4 && <ArrowRight size={16} className="ml-2" />}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
