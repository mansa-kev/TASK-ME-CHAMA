import { User, Shield, Phone, Mail, MapPin, FileText, CheckCircle2, AlertCircle, Lock, Bell, Settings, Camera, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch, getUser, uploadFile, updateMemberKycAdmin, changePassword } from '../api';
import toast from 'react-hot-toast';

export function MemberProfileModule() {
  const user = getUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // KYC Modal State
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycForm, setKycForm] = useState({
    idNumber: '',
    kraPin: '',
    phone: '',
    address: '',
    nextOfKinName: '',
    nextOfKinRelation: 'Spouse',
    nextOfKinPhone: '',
    profilePicture: '',
    passportPhoto: '',
    idFront: '',
    idBack: ''
  });
  const [savingKyc, setSavingKyc] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: false });

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('/members/me');
      setProfile(data);
      setKycForm({
        idNumber: data.idNumber || '',
        kraPin: data.kraPin || '',
        phone: data.phone || '',
        address: data.address || '',
        nextOfKinName: data.nextOfKinName || '',
        nextOfKinRelation: data.nextOfKinRelation || '',
        nextOfKinPhone: data.nextOfKinPhone || '',
        profilePicture: data.profilePicture || '',
        passportPhoto: data.passportPhoto || '',
        idFront: data.idFront || '',
        idBack: data.idBack || ''
      });
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePicture' | 'passportPhoto' | 'idFront' | 'idBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const toastId = toast.loading('Uploading file...');
      try {
        const uploadRes = await uploadFile(file);
        setKycForm(prev => ({ ...prev, [field]: uploadRes.url }));
        toast.success('File uploaded successfully', { id: toastId });
      } catch (error) {
        toast.error('Failed to upload file', { id: toastId });
      }
    }
  };

  const handleKycSubmit = async () => {
    setSavingKyc(true);
    try {
      const payload = {
        ...kycForm,
      };
      
      await updateMemberKycAdmin('me', payload);
      toast.success('KYC details updated successfully');
      setShowKycModal(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update KYC details');
    } finally {
      setSavingKyc(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await changePassword({ password, notifications });
      setPassword('');
      toast.success('Account settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  const memberInfo = profile?.user || user;
  const isKycComplete = !!memberInfo?.idNumber && !!memberInfo?.kraPin;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animation-fade-in">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-brand-primary to-brand-primary-dark w-full absolute top-0 left-0"></div>
        <div className="p-6 pt-16 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg flex flex-col items-center justify-center shrink-0 relative cursor-pointer" onClick={() => setShowKycModal(true)}>
              {memberInfo?.passportPhoto || memberInfo?.profilePicture ? (
                <img src={memberInfo.passportPhoto || memberInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(memberInfo?.name || 'Member')}&background=0D8BD9&color=fff&size=200`} 
                    alt="Avatar Placeholder" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-center p-2">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] font-bold text-white leading-tight">Add Passport<br/>Photo</span>
                  </div>
                </>
              )}
            </div>
            
            {!profile?.user?.profilePicture && (
               <div className="absolute left-[110%] top-0 md:top-1/2 md:-translate-y-1/2 w-52 bg-brand-primary text-white text-xs p-3 rounded-xl shadow-xl z-50 md:block hidden animate-bounce shadow-brand-primary/30">
                 <div className="font-extrabold mb-1 flex items-center gap-1"><AlertCircle size={14}/> Action Required</div>
                 Click here to add your passport photo and ID documents (front & back).
                 <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-3 h-3 bg-brand-primary rotate-45"></div>
               </div>
            )}

            {!isKycComplete && (
               <div className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1.5 animate-pulse shadow-md border-2 border-white" title="Missing KYC Details">
                 <AlertCircle className="w-4 h-4" />
               </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900">{memberInfo?.name}</h1>
            <p className="text-gray-500 font-medium">{memberInfo?.email}</p>
          </div>
          <div className="flex gap-3 mb-2">
            <button onClick={() => setShowKycModal(true)} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-dark transition-colors shadow-sm">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-accent" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-900">
                  {memberInfo?.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {memberInfo?.phone || '+254 --- --- ---'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {memberInfo?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-900">
                  {memberInfo?.role === 'MEMBER' ? 'Chama Member' : memberInfo?.role}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Physical Address</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {memberInfo?.address || 'Not Provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-accent" />
              Account Settings
            </h3>
            
            <div className="space-y-6">
              {/* Security */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400"/> Security & Password</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Change Password</label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input 
                      type="password" 
                      placeholder="Enter new secure password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none" 
                    />
                    <button 
                      onClick={handleSaveSettings}
                      disabled={!password || savingSettings}
                      className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400"/> Notification Preferences</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.email} 
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary" 
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.sms} 
                      onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary" 
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">SMS Alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.push} 
                      onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary" 
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Push Notifications (Browser)</span>
                  </label>
                  
                  <div className="pt-2">
                    <button 
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="text-xs sm:text-sm font-bold text-brand-accent hover:underline"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Danger Zone</h4>
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">Withdraw from Chama</h5>
                    <p className="text-xs text-gray-500 mt-1">Request to exit the group. Subject to admin approval and clearance of any outstanding loans.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to request withdrawal from the Chama? This process will require admin approval.')) {
                        toast.success('Withdrawal request submitted to administrators.');
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-bold hover:bg-red-200 transition-colors shrink-0"
                  >
                    Request Exit
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Col - KYC Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 h-full">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-accent" />
              KYC & Verification
            </h3>

            {isKycComplete ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-700 text-xs sm:text-sm">Fully Verified Member</h4>
                  <p className="text-[11px] sm:text-xs text-emerald-600/80 mt-0.5">Your identity documents and statutory records have been validated.</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 text-xs sm:text-sm">Verification Required</h4>
                  <p className="text-[11px] sm:text-xs text-amber-700 mt-0.5">Submit your National ID and KRA PIN to access full loan facilities.</p>
                </div>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">National ID</label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-900">
                  <span>{memberInfo?.idNumber || 'Not Provided'}</span>
                  {memberInfo?.idNumber && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">KRA PIN</label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-900">
                  <span>{memberInfo?.kraPin || 'Not Provided'}</span>
                  {memberInfo?.kraPin && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Next of Kin</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-900">
                  {memberInfo?.nextOfKinName || 'Not Provided'}
                </div>
              </div>
              
              <button 
                onClick={() => setShowKycModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors text-xs sm:text-sm shadow-md"
              >
                <FileText className="w-4 h-4" />
                {isKycComplete ? 'Update KYC Documents' : 'Submit KYC Details'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Update Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animation-fade-in p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">Update KYC Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">Please provide accurate information for verification.</p>
              </div>
              <button onClick={() => setShowKycModal(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">National ID Number</label>
                  <input 
                    type="text" 
                    value={kycForm.idNumber}
                    onChange={(e) => setKycForm({...kycForm, idNumber: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">KRA PIN</label>
                  <input 
                    type="text" 
                    value={kycForm.kraPin}
                    onChange={(e) => setKycForm({...kycForm, kraPin: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={kycForm.phone}
                    onChange={(e) => setKycForm({...kycForm, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Physical Address</label>
                  <input 
                    type="text" 
                    value={kycForm.address}
                    onChange={(e) => setKycForm({...kycForm, address: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none" 
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5">Documents & Media</h4>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-brand-accent"/> Passport Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'passportPhoto')}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 outline-none" 
                    />
                    {kycForm.passportPhoto && (
                       kycForm.passportPhoto.startsWith('http') 
                        ? <img src={kycForm.passportPhoto} alt="Passport Preview" className="mt-2 h-14 w-14 object-cover rounded-full border border-gray-200" />
                        : <div className="mt-1 text-xs text-brand-primary font-bold">Document attached</div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-brand-accent"/> ID Document (Front)</label>
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'idFront')}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 outline-none" 
                      />
                      {kycForm.idFront && (
                         kycForm.idFront.startsWith('http') && !kycForm.idFront.endsWith('.pdf')
                          ? <img src={kycForm.idFront} alt="ID Front Preview" className="mt-2 h-14 w-auto object-cover rounded-lg border border-gray-200" />
                          : <div className="mt-1 text-xs text-brand-primary font-bold">Document attached</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-brand-accent"/> ID Document (Back)</label>
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'idBack')}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 outline-none" 
                      />
                      {kycForm.idBack && (
                         kycForm.idBack.startsWith('http') && !kycForm.idBack.endsWith('.pdf')
                          ? <img src={kycForm.idBack} alt="ID Back Preview" className="mt-2 h-14 w-auto object-cover rounded-lg border border-gray-200" />
                          : <div className="mt-1 text-xs text-brand-primary font-bold">Document attached</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5">Next of Kin Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={kycForm.nextOfKinName}
                      onChange={(e) => setKycForm({...kycForm, nextOfKinName: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Relationship</label>
                    <select
                      value={kycForm.nextOfKinRelation}
                      onChange={(e) => setKycForm({...kycForm, nextOfKinRelation: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none bg-white"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={kycForm.nextOfKinPhone}
                      onChange={(e) => setKycForm({...kycForm, nextOfKinPhone: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-primary outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setShowKycModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleKycSubmit}
                disabled={savingKyc}
                className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-brand-primary-dark transition-colors shadow-md disabled:opacity-50"
              >
                {savingKyc ? 'Saving...' : 'Save & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
