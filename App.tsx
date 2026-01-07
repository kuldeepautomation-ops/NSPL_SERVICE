
import React, { useState, useRef, useEffect } from 'react';
import { ComponentType, HardwareItem, ServiceReport } from './types';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Settings, 
  Activity, 
  FileText, 
  Printer, 
  ChevronLeft,
  Camera,
  X,
  AlertCircle,
  Mail,
  Download
} from 'lucide-react';

// Production Logo URL
const LOGO_URL = "https://www.neptuneindia.com/wp-content/themes/neptune/images/logo.png";

const COMMON_RATINGS = [
  "2A", "4A", "6A", "10A", "16A", "20A", "25A", "32A", "40A", "63A", "80A", "100A", "125A", "160A", "200A", "250A", "400A", "630A", "800A", "1000A", "1250A", "1600A", "2000A", "2500A", "3200A", "4000A",
  "230V AC", "415V AC", "110V AC", "24V DC", "48V DC", "110V DC",
  "50 Hz", "60 Hz",
  "10kA", "15kA", "25kA", "35kA", "50kA"
];

const App: React.FC = () => {
  const [report, setReport] = useState<ServiceReport & { photos: string[]; panelId?: string }>({
    slNo: `NSPL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    complaintNo: '',
    customerName: '',
    clientName: '',
    clientMobile: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    product: 'Main LT Panel',
    natureOfFault: '',
    hardware: [],
    observations: '',
    environment: 'Normal',
    voltageLL: '415',
    voltageLN: '230',
    operationMode: 'Auto',
    status: 'Open',
    engineerName: '',
    technicianMobile: '',
    customerContact: '',
    feedbackRating: 'Good',
    photos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Request location for grounding metadata if needed (optional for hosting)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check browser permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.7); // Compressed for hosting storage
        setReport(prev => ({ ...prev, photos: [...prev.photos, imageData] }));
        stopCamera();
      }
    }
  };

  const removePhoto = (index: number) => {
    setReport(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addHardwareItem = () => {
    const newItem: HardwareItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: ComponentType.MCB,
      make: '',
      model: '',
      rating: '',
      quantity: 1,
      condition: 'Good'
    };
    setReport(prev => ({ ...prev, hardware: [...prev.hardware, newItem] }));
  };

  const removeHardwareItem = (id: string) => {
    setReport(prev => ({
      ...prev,
      hardware: prev.hardware.filter(item => item.id !== id)
    }));
  };

  const updateHardwareItem = (id: string, field: keyof HardwareItem, value: any) => {
    setReport(prev => ({
      ...prev,
      hardware: prev.hardware.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (report.status === 'Closed' && !report.feedbackRating) {
      setFeedbackError(true);
      document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setFeedbackError(false);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveTab('preview');
      window.scrollTo(0, 0);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-20 font-sans selection:bg-[#004a99] selection:text-white">
      <nav className="bg-[#004a99] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded shadow-sm">
              <img src={LOGO_URL} alt="NSPL" className="h-8 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black leading-none italic tracking-tighter">NEPTUNE</h1>
              <p className="text-[10px] font-medium tracking-widest uppercase opacity-80">Systems Pvt. Ltd.</p>
            </div>
          </div>
          <div className="flex bg-[#003d7e] p-1 rounded-lg">
            <button 
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'form' ? 'bg-white text-[#004a99] shadow-sm' : 'text-white/80'}`}
            >
              EDIT
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-[#004a99] shadow-sm' : 'text-white/80'}`}
            >
              PREVIEW
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="font-bold text-neutral-700 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <FileText size={16} className="text-[#004a99]" /> Site Details
                </h3>
                <span className="text-[10px] font-black text-neutral-400 bg-neutral-100 px-2 py-1 rounded">REF: {report.slNo}</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Complaint No">
                  <input type="text" value={report.complaintNo} onChange={e => setReport({...report, complaintNo: e.target.value})} className="input-field" placeholder="CN-2025-XXXX" />
                </FormField>
                <FormField label="Date">
                  <input type="date" value={report.date} onChange={e => setReport({...report, date: e.target.value})} className="input-field" />
                </FormField>
                <FormField label="Time">
                  <input type="time" value={report.time} onChange={e => setReport({...report, time: e.target.value})} className="input-field" />
                </FormField>
                <div className="md:col-span-3">
                  <FormField label="Company / Customer Name">
                    <input type="text" required value={report.customerName} onChange={e => setReport({...report, customerName: e.target.value})} className="input-field" placeholder="M/S. Customer Name" />
                  </FormField>
                </div>
                <FormField label="Representative Name">
                  <input type="text" value={report.clientName} onChange={e => setReport({...report, clientName: e.target.value})} className="input-field" placeholder="Contact Person" />
                </FormField>
                <FormField label="Representative Mobile">
                  <input type="tel" value={report.clientMobile} onChange={e => setReport({...report, clientMobile: e.target.value})} className="input-field" placeholder="10 Digit Mobile" />
                </FormField>
                <FormField label="Panel ID / Tag">
                  <input type="text" value={report.panelId} onChange={e => setReport({...report, panelId: e.target.value})} className="input-field" placeholder="e.g. PCC-01" />
                </FormField>
                <div className="md:col-span-3">
                  <FormField label="Site Address">
                    <input type="text" value={report.location} onChange={e => setReport({...report, location: e.target.value})} className="input-field" placeholder="Full Site Address" />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-700 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <Activity size={16} className="text-[#004a99]" /> Fault & Conditions
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <FormField label="Nature of Fault">
                  <textarea rows={2} value={report.natureOfFault} onChange={e => setReport({...report, natureOfFault: e.target.value})} className="input-field resize-none" placeholder="Describe the issue reported by the customer..." />
                </FormField>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Environment</label>
                    <div className="flex flex-wrap gap-2">
                      {['Normal', 'Humid', 'Corrosive', 'Dusty'].map(env => (
                        <button key={env} type="button" onClick={() => setReport({...report, environment: env as any})} className={`btn-chip ${report.environment === env ? 'active' : ''}`}>{env}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Operation Mode</label>
                    <div className="flex flex-wrap gap-2">
                      {['Manual', 'Auto', 'Remote'].map(mode => (
                        <button key={mode} type="button" onClick={() => setReport({...report, operationMode: mode as any})} className={`btn-chip ${report.operationMode === mode ? 'active' : ''}`}>{mode}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                  <FormField label="Voltage (L-L) VAC" icon={<Zap size={14} className="text-yellow-500" />}>
                    <input type="text" value={report.voltageLL} onChange={e => setReport({...report, voltageLL: e.target.value})} className="input-field" placeholder="415" />
                  </FormField>
                  <FormField label="Voltage (L-N) VAC" icon={<Zap size={14} className="text-yellow-500" />}>
                    <input type="text" value={report.voltageLN} onChange={e => setReport({...report, voltageLN: e.target.value})} className="input-field" placeholder="230" />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="font-bold text-neutral-700 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <Settings size={16} className="text-[#004a99]" /> Hardware Inventory
                </h3>
                <button type="button" onClick={addHardwareItem} className="text-[10px] font-black bg-[#004a99] text-white px-4 py-2 rounded-lg hover:bg-[#003d7e] transition-colors shadow-sm uppercase">
                  Add Item
                </button>
              </div>
              <div className="p-4 space-y-4">
                {report.hardware.map((item) => (
                  <div key={item.id} className="p-4 border border-neutral-100 rounded-xl relative bg-neutral-50/40 group hover:border-[#004a99]/30 transition-colors">
                    <button type="button" onClick={() => removeHardwareItem(item.id)} className="absolute top-3 right-3 text-neutral-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField label="Type">
                        <select value={item.type} onChange={e => updateHardwareItem(item.id, 'type', e.target.value)} className="input-field text-xs">
                          {Object.values(ComponentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Make">
                        <input type="text" placeholder="Make" value={item.make} onChange={e => updateHardwareItem(item.id, 'make', e.target.value)} className="input-field text-xs" />
                      </FormField>
                      <FormField label="Model">
                        <input type="text" placeholder="Model" value={item.model} onChange={e => updateHardwareItem(item.id, 'model', e.target.value)} className="input-field text-xs" />
                      </FormField>
                      <FormField label="Rating">
                        <input list={`ratings-${item.id}`} type="text" placeholder="Rating" value={item.rating} onChange={e => updateHardwareItem(item.id, 'rating', e.target.value)} className="input-field text-xs" />
                        <datalist id={`ratings-${item.id}`}>
                          {COMMON_RATINGS.map(rate => <option key={rate} value={rate} />)}
                        </datalist>
                      </FormField>
                    </div>
                  </div>
                ))}
                {report.hardware.length === 0 && <div className="text-center py-8 text-neutral-400 text-xs italic bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">No components logged yet. Click 'Add Item' to begin.</div>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="font-bold text-neutral-700 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <Camera size={16} className="text-[#004a99]" /> Site Evidence
                </h3>
                <button type="button" onClick={startCamera} className="text-[10px] font-black bg-[#004a99] text-white px-4 py-2 rounded-lg hover:bg-[#003d7e] flex items-center gap-2 shadow-sm transition-colors uppercase">
                  <Camera size={14} /> Open Camera
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {report.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 group shadow-sm">
                      <img src={photo} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={startCamera} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 hover:text-[#004a99] hover:border-[#004a99]/50 transition-all group bg-neutral-50/50">
                    <Plus size={28} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase mt-2 tracking-widest">Add Photo</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-700 text-sm uppercase tracking-wide">Observations & Recommendations</h3>
              </div>
              <div className="p-6">
                <textarea 
                  rows={5}
                  value={report.observations}
                  onChange={e => setReport({...report, observations: e.target.value})}
                  className="w-full p-4 rounded-xl border border-neutral-200 outline-none focus:border-[#004a99] text-sm leading-relaxed bg-neutral-50/30 focus:bg-white transition-all"
                  placeholder="Record all actions taken, findings, and technical recommendations for the client..."
                />
              </div>
            </div>

            <div id="feedback-section" className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Service Engineer">
                <input type="text" required value={report.engineerName} onChange={e => setReport({...report, engineerName: e.target.value})} className="input-field" placeholder="Full Name" />
              </FormField>
              <FormField label="Engineer Contact">
                <input type="tel" value={report.technicianMobile} onChange={e => setReport({...report, technicianMobile: e.target.value})} className="input-field" placeholder="Mobile No." />
              </FormField>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                <FormField label="Intervention Status">
                  <div className="flex gap-4">
                    {['Open', 'Closed'].map(s => (
                      <button key={s} type="button" onClick={() => setReport({...report, status: s as any})} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest border rounded-xl transition-all ${report.status === s ? 'bg-[#004a99] text-white border-[#004a99] shadow-md scale-[1.02]' : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-300'}`}>{s}</button>
                    ))}
                  </div>
                </FormField>
                
                <FormField label="Customer Feedback">
                  <div className="relative">
                    <select 
                      value={report.feedbackRating || ''} 
                      onChange={e => {
                        setReport({...report, feedbackRating: e.target.value as any});
                        setFeedbackError(false);
                      }} 
                      className={`input-field text-xs transition-colors pr-10 appearance-none ${feedbackError ? 'border-red-500 bg-red-50 animate-shake' : ''}`}
                    >
                      <option value="" disabled>Select Rating</option>
                      {['Excellence', 'Very Good', 'Good', 'Average', 'Below Average'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {feedbackError && <span className="absolute -bottom-5 right-0 text-[9px] font-black text-red-500 uppercase tracking-tighter">Required for Closed Status</span>}
                  </div>
                </FormField>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#004a99] hover:bg-[#003d7e] text-white py-5 rounded-xl font-black tracking-[0.2em] uppercase text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-50">
              {isSubmitting ? 'GENERATING REPORT...' : 'FINALIZE & PREVIEW REPORT'}
            </button>
          </form>
        ) : (
          <ReportPreview data={report} onBack={() => setActiveTab('form')} />
        )}
      </main>

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button type="button" onClick={stopCamera} className="absolute top-6 right-6 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors shadow-2xl"><X size={28} /></button>
          <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="mt-12 flex items-center gap-12">
            <button type="button" onClick={takePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-neutral-800 active:scale-90 transition-all shadow-2xl">
              <div className="w-12 h-12 bg-white rounded-full border-4 border-[#004a99]" />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }
        .input-field {
          width: 100%;
          padding: 0.75rem 1.25rem;
          border-radius: 0.85rem;
          border: 1px solid #e5e7eb;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.875rem;
          background: #fff;
        }
        .input-field:focus {
          border-color: #004a99;
          box-shadow: 0 0 0 4px rgba(0, 74, 153, 0.1);
        }
        .btn-chip {
          padding: 0.5rem 1.25rem;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          color: #9ca3af;
          background: white;
          transition: all 0.2s;
        }
        .btn-chip.active {
          background: #004a99;
          color: white;
          border-color: #004a99;
          box-shadow: 0 4px 6px -1px rgba(0, 74, 153, 0.2);
        }
        @media print {
          .print-hidden { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .min-h-screen { height: auto !important; min-height: unset !important; }
        }
      `}</style>
    </div>
  );
};

const FormField: React.FC<{ label: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="w-full">
    <label className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 ml-1">
      {icon} {label}
    </label>
    {children}
  </div>
);

const ReportPreview: React.FC<{ data: ServiceReport & { photos: string[]; panelId?: string }, onBack: () => void }> = ({ data, onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleEmailReport = () => {
    const email = prompt("Enter email address to send report to:", "customercare@neptuneindia.com");
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    const subject = `Site Report: ${data.customerName} | REF: ${data.slNo}`;
    const body = `
NEPTUNE SYSTEMS PVT. LTD.
SITE INTERVENTION REPORT

REFERENCE: ${data.slNo}
DATE/TIME: ${data.date} ${data.time}

CUSTOMER: ${data.customerName}
ADDRESS: ${data.location}
CLIENT REP: ${data.clientName} (${data.clientMobile})
PANEL ID: ${data.panelId || 'N/A'}

FAULT: ${data.natureOfFault}

ACTION TAKEN:
${data.observations}

STATUS: ${data.status}
ENGINEER: ${data.engineerName} (${data.technicianMobile})
    `.trim();

    window.location.href = `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    const opt = {
      margin: 0.2,
      filename: `NSPL_Report_${data.slNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    window.html2pdf().set(opt).from(reportRef.current).save();
  };

  return (
    <div className="flex flex-col items-center animate-fadeInUp">
      <div ref={reportRef} className="bg-white shadow-2xl rounded-sm max-w-4xl w-full overflow-hidden border border-neutral-300 print:shadow-none print:border-none print:m-0">
        <div className="p-10 border-b-4 border-[#004a99]">
          <div className="flex justify-between items-start">
            <div className="flex gap-6 items-center">
              <img src={LOGO_URL} alt="NSPL" className="h-16 object-contain" />
              <div>
                <h1 className="text-4xl font-black text-[#004a99] leading-none tracking-tighter italic">NEPTUNE</h1>
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-500 mt-1">Systems Pvt. Ltd.</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-neutral-800 tracking-tight leading-none uppercase">Site Intervention Report</h2>
              <p className="text-[10px] font-bold text-neutral-400 mt-2">ISO 9001:2015 CERTIFIED COMPANY</p>
              <div className="mt-2 text-[11px] font-black text-[#004a99] uppercase tracking-widest bg-[#004a99]/5 px-3 py-1 rounded-full inline-block">REF: {data.slNo}</div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-y-6 text-xs border-t-2 border-neutral-100 pt-8">
            <div className="space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Date</p><p className="font-bold text-neutral-800 text-sm">{data.date}</p></div>
            <div className="space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Time In</p><p className="font-bold text-neutral-800 text-sm">{data.time}</p></div>
            <div className="space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Status</p><p className={`font-black uppercase tracking-tighter ${data.status === 'Closed' ? 'text-green-600' : 'text-red-500'}`}>{data.status}</p></div>
            <div className="space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Complaint No</p><p className="font-bold text-neutral-800 text-sm">{data.complaintNo || '---'}</p></div>
            
            <div className="col-span-2 space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Customer Name</p><p className="font-black text-neutral-900 text-base">{data.customerName}</p></div>
            <div className="col-span-2 space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Site Location</p><p className="font-semibold text-neutral-700 leading-tight">{data.location}</p></div>
            
            <div className="col-span-1 space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Client Contact</p><p className="font-bold text-neutral-800">{data.clientName || '---'}</p></div>
            <div className="col-span-1 space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Mobile No</p><p className="font-bold text-neutral-800">{data.clientMobile || '---'}</p></div>
            <div className="col-span-2 space-y-1"><p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Equipment/Product</p><p className="font-black text-neutral-800 uppercase tracking-tight italic decoration-2 underline decoration-[#004a99]/20">{data.product} {data.panelId ? `(TAG: ${data.panelId})` : ''}</p></div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.2em] border-l-4 border-[#004a99] pl-3 py-1">Technical Parameters</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100"><p className="text-[9px] text-neutral-400 uppercase font-black mb-1">Environment</p><p className="font-bold">{data.environment}</p></div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100"><p className="text-[9px] text-neutral-400 uppercase font-black mb-1">Op. Mode</p><p className="font-bold">{data.operationMode}</p></div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100"><p className="text-[9px] text-neutral-400 uppercase font-black mb-1">Voltage (L-L)</p><p className="font-bold">{data.voltageLL} VAC</p></div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100"><p className="text-[9px] text-neutral-400 uppercase font-black mb-1">Voltage (L-N)</p><p className="font-bold">{data.voltageLN} VAC</p></div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.2em] border-l-4 border-[#004a99] pl-3 py-1">Initial Fault</h4>
              <div className="p-5 bg-red-50/50 border-2 border-dashed border-red-100 rounded-xl text-sm italic font-medium text-red-900 leading-relaxed min-h-[100px] flex items-center justify-center text-center">
                "{data.natureOfFault || "No specific fault logged."}"
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.2em] border-l-4 border-[#004a99] pl-3 py-1 mb-5">Hardware Component Log</h4>
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <table className="w-full text-[11px] leading-tight">
                <thead className="bg-neutral-800 text-white font-black uppercase tracking-widest">
                  <tr>
                    <th className="p-3 text-left">Component</th>
                    <th className="p-3 text-left">Make / Model</th>
                    <th className="p-3 text-left">Rating</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Cond.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.hardware.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-black text-neutral-800 uppercase">{item.type}</td>
                      <td className="p-3 font-medium">{item.make} {item.model}</td>
                      <td className="p-3 font-bold text-neutral-500 italic">{item.rating}</td>
                      <td className="p-3 text-center font-black">{item.quantity}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${item.condition === 'Good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.condition}</span></td>
                    </tr>
                  ))}
                  {data.hardware.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-neutral-300 font-bold uppercase tracking-widest italic">Inventory list is empty</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {data.photos.length > 0 && (
            <div className="break-before-page">
              <h4 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.2em] border-l-4 border-[#004a99] pl-3 py-1 mb-5">Photographic Evidence</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {data.photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-neutral-100 rounded-2xl border-4 border-neutral-50 shadow-sm overflow-hidden hover:scale-[1.02] transition-transform">
                    <img src={photo} alt={`Site evidence ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.2em] border-l-4 border-[#004a99] pl-3 py-1 mb-5">Actions Taken & Technical Notes</h4>
            <div className="p-8 border-2 border-neutral-100 rounded-2xl bg-neutral-50/20 text-sm leading-relaxed whitespace-pre-wrap font-medium text-neutral-800 min-h-[150px] shadow-inner">
              {data.observations || "No field observations recorded for this visit."}
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-2">Service Quality Assurance</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black italic tracking-widest">RATING: <span className="text-yellow-400 uppercase underline decoration-4 underline-offset-8">{data.feedbackRating}</span></p>
              </div>
            </div>
            <div className="h-px w-24 bg-white/10 md:h-12 md:w-px hidden md:block"></div>
            <div className="text-center md:text-right">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Customer Satisfaction Verified</p>
              <p className="text-sm font-black text-[#004a99] mt-1 italic">NSPL FIELD SERVICE DIVISION</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 pt-16">
            <div className="text-center space-y-3">
              <div className="h-20 w-full flex items-end justify-center">
                <div className="w-56 border-b-2 border-dashed border-neutral-400"></div>
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Customer / Client Seal</p>
                <p className="text-sm font-black text-neutral-900 mt-2 uppercase tracking-tighter">{data.clientName || data.customerName}</p>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="h-20 w-full flex items-end justify-center font-serif text-3xl font-light italic text-neutral-300">
                {data.engineerName.split(' ')[0]}
              </div>
              <div className="w-full border-b-2 border-dashed border-neutral-400"></div>
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">NSPL Field Engineer</p>
                <p className="text-sm font-black text-neutral-900 mt-2 uppercase tracking-tighter">{data.engineerName}</p>
                <p className="text-[10px] font-bold text-neutral-500">MOB: {data.technicianMobile}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#004a99] text-white/70 px-10 py-8 text-[9px] text-center font-black tracking-[0.2em] leading-relaxed">
          NEPTUNE SYSTEMS PVT. LTD. | Plot No. 9, Sector-156, Noida, Uttar Pradesh-201301
          <br />
          Email: customercare@neptuneindia.com | URL: www.neptuneindia.com
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col sm:flex-row gap-4 print:hidden">
        <button type="button" onClick={onBack} className="flex items-center gap-2 bg-white text-neutral-800 px-6 py-4 rounded-2xl shadow-2xl border border-neutral-200 font-black text-xs hover:bg-neutral-50 transition-all hover:-translate-y-1 active:scale-95">
          <ChevronLeft size={16} /> EDIT REPORT
        </button>
        <button type="button" onClick={handleEmailReport} className="flex items-center gap-2 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl font-black text-xs hover:bg-green-700 transition-all hover:-translate-y-1 active:scale-95">
          <Mail size={16} /> SEND EMAIL
        </button>
        <button type="button" onClick={handleExportPDF} className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-4 rounded-2xl shadow-2xl font-black text-xs hover:bg-black transition-all hover:-translate-y-1 active:scale-95">
          <Download size={16} /> SAVE PDF
        </button>
        <button type="button" onClick={() => window.print()} className="flex items-center gap-2 bg-[#004a99] text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-xs hover:bg-[#003d7e] transition-all hover:-translate-y-1 active:scale-95">
          <Printer size={16} /> PRINT
        </button>
      </div>
    </div>
  );
};

export default App;
