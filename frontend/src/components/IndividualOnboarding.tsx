import { useState } from "react";
import {
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createMember, uploadFile } from "../api";
import { useData } from "./data";

export function IndividualOnboarding() {
  const { chamas } = useData();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, temporaryPassword: string} | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    kraPin: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    nextOfKinName: "",
    nextOfKinRelation: "",
    nextOfKinPhone: "",
    chamaId: "",
    passportPhoto: "",
    idFront: "",
    idBack: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await createMember({
        chamaId: formData.chamaId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        role: "MEMBER",
        idNumber: formData.idNumber,
        kraPin: formData.kraPin,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        address: formData.address,
        nextOfKinName: formData.nextOfKinName,
        nextOfKinRelation: formData.nextOfKinRelation,
        nextOfKinPhone: formData.nextOfKinPhone,
        passportPhoto: formData.passportPhoto,
        idFront: formData.idFront,
        idBack: formData.idBack,
      });
      toast.success("Member successfully registered!");
      if (response.temporaryPassword) {
        setCreatedCredentials({
          email: formData.email,
          temporaryPassword: response.temporaryPassword
        });
      } else {
        navigate("/dashboard/members");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-blue/20 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-brand-primary p-6 text-white text-center">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <UserPlus size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">Member Created!</h3>
              <p className="text-white/80 text-sm mt-1">Please securely share these credentials.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1 font-medium">Email Address</div>
                <div className="text-brand-accent font-bold font-mono">{createdCredentials.email}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1 font-medium">Temporary Password</div>
                <div className="text-xl text-brand-blue font-black font-mono tracking-wider">{createdCredentials.temporaryPassword}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                <div className="mt-0.5">⚠️</div>
                <div>Make sure to copy this password now. It will not be shown again. The member will be required to change it on their first login.</div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setCreatedCredentials(null);
                  navigate("/dashboard/members");
                }}
                className="px-6 py-2 bg-brand-primary hover:bg-brand-blue text-white rounded-lg font-bold shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-blue/20 p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-brand-blue/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-accent tracking-tight flex items-center">
            <UserPlus className="mr-3 text-brand-blue" size={28} />
            Individual Onboarding
          </h2>
          <p className="text-sm font-medium text-brand-accent mt-1">
            Register a new member to the CHAMA platform and capture their basic
            profile.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Progress Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-brand-blue/20 p-5 sticky top-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Registration Progress
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {[
                "Basic Details",
                "Contact & Address",
                "Next of Kin",
                "KYC Documents",
                "Review & Submit",
              ].map((title, index) => {
                const stepNum = index + 1;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;

                return (
                  <div
                    key={stepNum}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white z-10 shadow-sm transition-colors ${isActive ? "border-brand-blue text-brand-blue" : isCompleted ? "border-brand-green bg-brand-green text-white" : "border-gray-200 text-gray-300"}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <span className="font-bold text-sm">{stepNum}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4
                        className={`text-sm font-bold transition-colors ${isActive ? "text-gray-800" : isCompleted ? "text-gray-600" : "text-gray-400"}`}
                      >
                        {title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-brand-blue/20 p-8">
            {step === 1 && (
              <div className="space-y-6 animation-fade-in">
                <h3 className="text-lg font-extrabold text-brand-blue border-b border-gray-100 pb-3 flex items-center">
                  <UserPlus size={18} className="mr-2" /> Basic Personal Details
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {(user?.role === "TCM_SUPER_ADMIN" || user?.role === "TCM_ADMIN") && (
                    <div className="space-y-2 col-span-2 bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10 mb-2">
                      <label className="text-xs font-bold text-brand-blue uppercase">
                        Assign to Chama
                      </label>
                      <select
                        value={formData.chamaId}
                        onChange={(e) =>
                          setFormData({ ...formData, chamaId: e.target.value })
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      >
                        <option value="">
                          Select a Chama (Required for Super Admin)
                        </option>
                        {chamas?.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="e.g. Job"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="e.g. Osindi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, idNumber: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="ID Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      KRA PIN
                    </label>
                    <input
                      type="text"
                      value={formData.kraPin}
                      onChange={(e) =>
                        setFormData({ ...formData, kraPin: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="e.g. A00..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      />
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animation-fade-in">
                <h3 className="text-lg font-extrabold text-brand-blue border-b border-gray-100 pb-3 flex items-center">
                  <Phone size={18} className="mr-2" /> Contact & Address
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Primary Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                        placeholder="+254 7XX XXX XXX"
                      />
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                        placeholder="job@example.com"
                      />
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Physical Address / Area
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="e.g. Westlands, Nairobi"
                    />
                  </div>
                  <div className="col-span-2 mt-4 bg-brand-green/5 border border-brand-green/20 rounded-xl p-4">
                    <p className="text-sm font-bold text-brand-green flex items-center">
                      <ShieldCheck size={16} className="mr-2" /> KYC Validation
                      Reminder
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Once onboarded, the member will be required to upload
                      their ID and Passport Photo via the portal, which will
                      appear in the KYC Validation Inbox.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animation-fade-in">
                <h3 className="text-lg font-extrabold text-brand-blue border-b border-gray-100 pb-3 flex items-center">
                  <Users size={18} className="mr-2" /> Next of Kin Details
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.nextOfKinName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nextOfKinName: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Relationship
                    </label>
                    <select
                      value={formData.nextOfKinRelation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nextOfKinRelation: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.nextOfKinPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nextOfKinPhone: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-colors"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animation-fade-in">
                <h3 className="text-lg font-extrabold text-brand-blue border-b border-gray-100 pb-3 flex items-center">
                  <ShieldCheck size={18} className="mr-2" /> KYC Documents
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please upload the mandatory KYC documents below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">Passport Photo (Mandatory)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        toast.success("Uploading passport photo...");
                        try {
                          const res = await uploadFile(file);
                          setFormData({ ...formData, passportPhoto: res.url });
                          toast.success("Passport photo uploaded");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to upload photo");
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                    {formData.passportPhoto && <span className="text-xs text-brand-green font-bold">✓ Uploaded</span>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">Front ID Image (Mandatory)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        toast.success("Uploading Front ID...");
                        try {
                          const res = await uploadFile(file);
                          setFormData({ ...formData, idFront: res.url });
                          toast.success("Front ID uploaded");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to upload Front ID");
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                    {formData.idFront && <span className="text-xs text-brand-green font-bold">✓ Uploaded</span>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-blue uppercase">Back ID Image (Mandatory)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        toast.success("Uploading Back ID...");
                        try {
                          const res = await uploadFile(file);
                          setFormData({ ...formData, idBack: res.url });
                          toast.success("Back ID uploaded");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to upload Back ID");
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                    {formData.idBack && <span className="text-xs text-brand-green font-bold">✓ Uploaded</span>}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animation-fade-in text-center py-10">
                <CheckCircle2
                  size={64}
                  className="mx-auto text-brand-green mb-4"
                />
                <h3 className="text-2xl font-extrabold text-brand-accent">
                  Ready to Register Member
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  The member's profile is ready. Upon submission, the system
                  will map default products (Share Capital & BOSA Savings) and
                  send a welcome SMS.
                </p>
              </div>
            )}

            {/* Form Navigation Controls */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setStep(step > 1 ? step - 1 : 1)}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-colors border ${step === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-brand-blue hover:bg-bg-app hover:border-brand-blue/30"}`}
                disabled={step === 1 || isSubmitting}
              >
                Previous Step
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => {
                  if (step === 1 && (user?.role === 'TCM_SUPER_ADMIN' || user?.role === 'TCM_ADMIN') && !formData.chamaId) {
                    toast.error('Please select a Chama to assign this member to.');
                    return;
                  }
                  if (step === 4) {
                    if (!formData.passportPhoto || !formData.idFront || !formData.idBack) {
                      toast.error("Please upload all mandatory KYC documents to proceed.");
                      return;
                    }
                  }
                  if (step < 5) {
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                className={`flex items-center px-8 py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-colors disabled:opacity-50 ${step === 5 ? "bg-brand-green hover:bg-green-600" : "bg-brand-blue hover:bg-blue-800"}`}
              >
                {isSubmitting
                  ? "Registering..."
                  : step === 5
                    ? "Complete Registration"
                    : "Next Step"}
                {step < 5 && <ArrowRight size={16} className="ml-2" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
