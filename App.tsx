
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
  Download,
  PlayCircle,
  BookOpen,
  Video,
  MessageSquare,
  Eraser,
  CheckCircle2
} from 'lucide-react';

// Production Logo URL
const LOGO_URL = "https://www.neptuneindia.com/wp-content/themes/neptune/images/logo.png";

const TRAINING_VIDEOS = [
  {
    id: 1,
    title: "PLC Troubleshooting Guide",
    thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
    duration: "12:45",
    category: "Hardware",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 2,
    title: "Panel Safety Protocols",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=400",
    duration: "08:20",
    category: "Safety",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 3,
    title: "HMI Configuration Steps",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    duration: "15:10",
    category: "Software",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

// --- Signature Pad Component ---
const SignaturePad: React.FC<{ label: string; onSave: (data: string) => void }> = ({ label, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onSave(canvas.toDataURL());
      }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onSave('');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 group print:hidden">
      <div className="relative w-full h-32 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg overflow-hidden cursor-crosshair group-hover:border-[#004a99]/40 transition-colors">
        <canvas
          ref={canvasRef}
          width={400}
          height={128}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-400 text-[10px] font-black uppercase tracking-widest">
            Sign Here
          </div>
        )}
      </div>
      <div className="flex justify-between w-full items-center">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        {hasSignature && (
          <button type="button" onClick={clear} className="text-red-500 flex items-center gap-1 text-[9px] font-black uppercase hover:text-red-600">
            <Eraser size={10} /> Clear
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'videos'>('form');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<typeof TRAINING_VIDEOS[0] | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
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
    if (!report.observations.trim()) {
      alert("Engineer's remarks are mandatory.");
      return;
    }
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
              <img src={LOGO_URL} alt="Neptune Systems Pvt. Ltd." className="h-8 object-contain" />
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
              className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-tighter ${activeTab === 'form' ? 'bg-white text-[#004a99] shadow-sm' : 'text-white/80'}`}
            >
              Report
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-tighter ${activeTab === 'preview' ? 'bg-white text-[#004a99] shadow-sm' : 'text-white/80'}`}
            >
              Preview
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-tighter ${activeTab === 'videos' ? 'bg-white text-[#004a99] shadow-sm' : 'text-white/80'} flex items-center gap-1`}
            >
              <Video size={10} /> Videos
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === 'form' && (
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
                        <input type="text" placeholder="Rating" value={item.rating} onChange={e => updateHardwareItem(item.id, 'rating', e.target.value)} className="input-field text-xs" />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="font-bold text-neutral-700 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <MessageSquare size={16} className="text-[#004a99]" /> Engineer's Remarks (Mandatory)
                </h3>
              </div>
              <div className="p-6">
                <textarea 
                  required
                  rows={4}
                  value={report.observations}
                  onChange={e => setReport({...report, observations: e.target.value})}
                  className="input-field resize-none"
                  placeholder="Mandatory field: Detailed observations, actions taken and recommendations..."
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Service Engineer">
                <input type="text" required value={report.engineerName} onChange={e => setReport({...report, engineerName: e.target.value})} className="input-field" placeholder="Full Name" />
              </FormField>
              <FormField label="Engineer Contact">
                <input type="tel" value={report.technicianMobile} onChange={e => setReport({...report, technicianMobile: e.target.value})} className="input-field" placeholder="Mobile No." />
              </FormField>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#004a99] hover:bg-[#003d7e] text-white py-5 rounded-xl font-black tracking-[0.2em] uppercase text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-50">
              {isSubmitting ? 'GENERATING REPORT...' : 'FINALIZE & PREVIEW REPORT'}
            </button>
          </form>
        )}

        {activeTab === 'preview' && (
          <ReportPreview data={report} onBack={() => setActiveTab('form')} />
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-neutral-800 text-sm uppercase tracking-widest flex items-center gap-2">
                    <PlayCircle size={18} className="text-[#004a99]" /> Engineer Training Library
                  </h3>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase mt-1">Official NSPL Technical Support Content</p>
                </div>
                <BookOpen size={20} className="text-neutral-200" />
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRAINING_VIDEOS.map((video) => (
                  <div key={video.id} className="group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-[#004a99] shadow-xl group-hover:scale-110 transition-transform">
                          <PlayCircle size={24} fill="currentColor" className="text-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded">{video.duration}</span>
                    </div>
                    <h4 className="mt-3 font-bold text-neutral-800 text-xs group-hover:text-[#004a99] transition-colors line-clamp-1 uppercase tracking-tight">{video.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="aspect-video bg-black">
              <iframe 
                src={selectedVideo.url} 
                className="w-full h-full"
                title={selectedVideo.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-6 bg-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-[#004a99] uppercase tracking-widest">{selectedVideo.category}</span>
                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mt-1">{selectedVideo.title}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Interface Modal */}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
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
        @media print {
          .print-hidden { display: none !important; }
          body { background: white !important; }
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
  const [custSig, setCustSig] = useState<string>('');
  const [engSig, setEngSig] = useState<string>('');

  const handleEmailReport = () => {
    const email = prompt("Enter email address to send report to:", "customercare@neptuneindia.com");
    if (!email) return;
    const subject = `Site Report: ${data.customerName} | REF: ${data.slNo}`;
    const body = `
NEPTUNE SYSTEMS PVT. LTD.
SITE INTERVENTION REPORT

REFERENCE: ${data.slNo}
DATE/TIME: ${data.date} ${data.time}

CUSTOMER: ${data.customerName}
CLIENT REP: ${data.clientName}

HARDWARE LOG:
${data.hardware.map(h => `- ${h.type}: ${h.make} ${h.model} (${h.rating})`).join('\n')}

ENGINEER'S REMARKS:
${data.observations}

STATUS: ${data.status}
ENGINEER: ${data.engineerName}
    `.trim();

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    <div className="flex flex-col items-center pb-20">
      <div ref={reportRef} className="bg-white shadow-2xl rounded-sm max-w-4xl w-full overflow-hidden border border-neutral-300 print:shadow-none print:border-none print:m-0">
        <div className="p-10 border-b-4 border-[#004a99]">
          <div className="flex justify-between items-start">
            <div className="flex gap-6 items-center">
              <img src={LOGO_URL} alt="Neptune Systems Pvt. Ltd." className="h-16 object-contain" />
              <div>
                <h1 className="text-4xl font-black text-[#004a99] leading-none tracking-tighter italic">NEPTUNE</h1>
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-500 mt-1">Systems Pvt. Ltd.</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-neutral-800 tracking-tight leading-none uppercase">Site Intervention Report</h2>
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
          </div>
        </div>

        <div className="p-10 space-y-10">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.hardware.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-black text-neutral-800 uppercase">{item.type}</td>
                      <td className="p-3 font-medium">{item.make} {item.model}</td>
                      <td className="p-3 font-bold text-neutral-500 italic">{item.rating}</td>
                      <td className="p-3 text-center font-black">{item.quantity}</td>
                    </tr>
                  ))}
                  {data.hardware.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-neutral-400 italic">No hardware logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="break-inside-avoid">
            <h4 className="text-[11px] font-black text-[#004a99] uppercase tracking-[0.2em] border-l-4 border-[#004a99] pl-3 py-1 mb-4">Engineer's Detailed Remarks</h4>
            <div className="p-6 border border-neutral-100 bg-neutral-50/50 rounded-xl">
              <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap font-medium">
                {data.observations || "No remarks provided."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
            {/* Customer Signature */}
            <div className="space-y-4">
              <SignaturePad label="Customer Seal & Signature" onSave={setCustSig} />
              <div className="hidden print:block border-b border-neutral-300 min-h-[80px] flex flex-col items-center justify-center text-center">
                {custSig ? (
                  <img src={custSig} alt="Customer Signature" className="max-h-24 object-contain" />
                ) : (
                  <div className="h-20" />
                )}
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-2">Customer Seal & Signature</p>
              </div>
            </div>

            {/* Engineer Signature */}
            <div className="space-y-4">
              <SignaturePad label="NSPL Field Engineer Signature" onSave={setEngSig} />
              <div className="hidden print:block border-b border-neutral-300 min-h-[80px] flex flex-col items-center justify-center text-center">
                {engSig ? (
                  <img src={engSig} alt="Engineer Signature" className="max-h-24 object-contain" />
                ) : (
                  <div className="h-20" />
                )}
                <div className="mt-2">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">NSPL Field Engineer</p>
                  <p className="text-[11px] font-bold text-neutral-900 mt-1">{data.engineerName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#004a99] text-white/70 px-10 py-8 text-[9px] text-center font-black tracking-[0.2em] leading-relaxed mt-10">
          NEPTUNE SYSTEMS PVT. LTD. | Plot No. 9, Sector-156, Noida, Uttar Pradesh-201301
          <br />
          Email: customercare@neptuneindia.com | URL: www.neptuneindia.com
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col sm:flex-row gap-4 print:hidden">
        <button type="button" onClick={onBack} className="flex items-center gap-2 bg-white text-neutral-800 px-6 py-4 rounded-2xl shadow-2xl border border-neutral-200 font-black text-xs hover:bg-neutral-50 transition-all hover:-translate-y-1 active:scale-95">
          <ChevronLeft size={16} /> EDIT REPORT
        </button>
        <button 
          type="button" 
          onClick={handleExportPDF} 
          disabled={!custSig || !engSig}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-4 rounded-2xl shadow-2xl font-black text-xs hover:bg-black transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
        >
          <Download size={16} /> {!custSig || !engSig ? 'SIGN TO SAVE PDF' : 'SAVE PDF'}
        </button>
        <button 
          type="button" 
          onClick={() => window.print()} 
          disabled={!custSig || !engSig}
          className="flex items-center gap-2 bg-[#004a99] text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-xs hover:bg-[#003d7e] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
        >
          <Printer size={16} /> PRINT
        </button>
      </div>
      
      {!custSig || !engSig ? (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl animate-bounce print:hidden">
          <AlertCircle size={18} className="text-amber-500" />
          <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Both signatures required before export</p>
        </div>
      ) : (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-green-50 border border-green-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl print:hidden">
          <CheckCircle2 size={18} className="text-green-500" />
          <p className="text-[10px] font-black text-green-800 uppercase tracking-widest">Ready for Export</p>
        </div>
      )}
    </div>
  );
};

export default App;
