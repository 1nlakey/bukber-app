import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  Terminal, 
  Moon, 
  User, 
  MessageSquare, 
  LogOut, 
  QrCode,
  Settings,
  Users,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Key,
  MessageCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Cpu,
  Ticket,
  AlertCircle
} from 'lucide-react';

// --- CONFIGURATION ---
const getEnv = (key, fallback = "") => {
  try {
    return import.meta.env[key] || fallback;
  } catch (e) {
    return fallback;
  }
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

const appId = getEnv('VITE_APP_ID', 'bukberti25');
const ADMIN_SECRET = getEnv('VITE_ADMIN_SECRET', "BUKBER_ROOT_ACCESS"); 

const EVENT_STATUS = {
  WAITING: 'waiting',
  QUIZ: 'quiz',
  MESSAGES: 'messages',
  FINISHED: 'finished'
};

// Initialize Firebase
let app, auth, db;
if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [globalConfig, setGlobalConfig] = useState({ 
    eventStatus: EVENT_STATUS.WAITING
  });
  
  const [guestName, setGuestName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [myParticipantData, setMyParticipantData] = useState(null);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [regError, setRegError] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [localMessage, setLocalMessage] = useState('');
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  // Auth & Init
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        // @ts-ignore
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          // @ts-ignore
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Failure:", err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Jika sudah ada ID di local storage, jangan matikan loading sampai data sinkron
      if (!localStorage.getItem(`${appId}_participant_id`)) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Data
  useEffect(() => {
    if (!user || !db) return;

    const pRef = collection(db, 'artifacts', appId, 'public', 'data', 'participants');
    const q = query(pRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(data);
      
      const savedId = localStorage.getItem(`${appId}_participant_id`);
      if (savedId) {
        const myData = data.find(p => p.id === savedId);
        if (myData) {
          setMyParticipantData(myData);
          if (myData.message && !localMessage) setLocalMessage(myData.message);
          if (view === 'landing' || view === 'guest-reg') setView('guest-dash');
        }
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore sync error:", err);
      setLoading(false);
    });

    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main');
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) setGlobalConfig(docSnap.data());
    });

    return () => {
      unsubscribe();
      unsubConfig();
    };
  }, [user]);

  // Handle Logic
  const handleRegisterOrLogin = async (e) => {
    if (e) e.preventDefault();
    if (!db || !user || isProcessing) return;
    
    setRegError('');
    const cleanName = guestName.trim();
    
    if (cleanName.length < 3) {
      setRegError("Nama minimal 3 karakter.");
      return;
    }

    setIsProcessing(true);

    try {
      // Cari partisipan dengan nama yang sama (case insensitive)
      const existing = participants.find(p => p.name.toLowerCase() === cleanName.toLowerCase());

      if (existing && !isAlreadyRegistered) {
        setIsAlreadyRegistered(true);
        setRegError('Nama terdeteksi. Silakan masukkan kode akses.');
        setIsProcessing(false);
        return;
      }

      if (isAlreadyRegistered) {
        if (!loginCode) {
          setRegError("Masukkan kode akses 6 digit.");
          setIsProcessing(false);
          return;
        }
        
        if (existing && existing.accessCode === loginCode.trim()) {
          localStorage.setItem(`${appId}_participant_id`, existing.id);
          setMyParticipantData(existing);
          setView('guest-dash');
        } else {
          setRegError("Kode akses tidak valid.");
        }
        setIsProcessing(false);
        return;
      }

      // Generate New Ticket
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      const lotteryID = `TI-${Math.floor(1000 + Math.random() * 8999)}`;
      
      const newParticipant = {
        uid: user.uid,
        name: cleanName,
        accessCode,
        lotteryNumber: lotteryID,
        timestamp: serverTimestamp(),
        message: '',
        role: 'guest'
      };

      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'participants'), newParticipant);
      localStorage.setItem(`${appId}_participant_id`, docRef.id);
      // View akan pindah otomatis via useEffect onSnapshot
      
    } catch (err) {
      console.error("Registration Error:", err);
      setRegError("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`${appId}_participant_id`);
    setMyParticipantData(null);
    setGuestName('');
    setLoginCode('');
    setIsAlreadyRegistered(false);
    setView('landing');
  };

  const saveMessage = async () => {
    if (!myParticipantData || !db || isSavingMessage) return;
    setIsSavingMessage(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', myParticipantData.id);
      await updateDoc(docRef, { message: localMessage, lastUpdated: serverTimestamp() });
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMessage(false);
    }
  };

  // --- UI Layouts ---

  const BackgroundOrnaments = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-emerald-500 font-mono text-[10px] tracking-widest animate-pulse uppercase">Syncing_Core...</p>
    </div>
  );

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative">
        <BackgroundOrnaments />
        <div className="relative z-10 text-center space-y-12">
          <div className="space-y-4 animate-in zoom-in-90 duration-700">
            <Moon className="w-16 h-16 text-emerald-400 mx-auto drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h1 className="text-5xl font-black italic tracking-tighter">BUKBER<span className="text-emerald-500">.TI</span></h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Informatics Community Event</p>
          </div>
          <button 
            onClick={() => setView('guest-reg')}
            className="group relative px-10 py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
          >
            <div className="relative flex items-center gap-3">
              <Ticket size={20} /> <span className="uppercase tracking-widest">Dapatkan Tiket</span>
            </div>
          </button>
          <button onClick={() => setView('admin-login')} className="block mx-auto text-slate-700 hover:text-emerald-500 text-[9px] font-mono tracking-widest uppercase transition-colors italic">
            &gt; System_Access
          </button>
        </div>
      </div>
    );
  }

  if (view === 'guest-reg') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative">
        <BackgroundOrnaments />
        <div className="w-full max-w-md bg-slate-900/40 border border-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              {isAlreadyRegistered ? <Key size={20} /> : <User size={20} />}
            </div>
            <h2 className="text-xl font-black text-white uppercase italic">{isAlreadyRegistered ? 'Verifikasi' : 'Registrasi'}</h2>
          </div>

          <form onSubmit={handleRegisterOrLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Username</label>
              <input 
                type="text"
                value={guestName}
                disabled={isAlreadyRegistered || isProcessing}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-black/40 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-mono disabled:opacity-50"
                placeholder="Masukkan Nama..."
              />
            </div>

            {isAlreadyRegistered && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Passcode</label>
                <div className="relative">
                  <input 
                    type={showCode ? "text" : "password"}
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    maxLength={6}
                    className="w-full bg-black/40 border border-slate-800 p-4 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-mono tracking-[0.5em] text-center text-xl"
                    placeholder="••••••"
                  />
                  <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {regError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold uppercase tracking-tight">
                <AlertCircle size={14} /> {regError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <> {isAlreadyRegistered ? 'Akses Masuk' : 'Generate Tiket'} <ChevronRight size={18} /> </>
              )}
            </button>

            <button 
              type="button" 
              onClick={() => { setIsAlreadyRegistered(false); setView('landing'); }}
              className="w-full text-slate-500 text-[9px] font-mono uppercase tracking-widest hover:text-white transition-colors"
            >
              &lt; Batal
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'guest-dash') {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden">
        <BackgroundOrnaments />
        
        <header className="z-20 bg-black/40 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <User size={20} />
            </div>
            <div>
              <div className="text-[8px] text-emerald-500 font-mono tracking-widest uppercase">Member_Active</div>
              <div className="font-bold uppercase tracking-tight truncate max-w-[120px]">{myParticipantData?.name}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 rounded-xl transition-all">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 p-6 flex flex-col items-center z-10 max-w-lg mx-auto w-full pb-20">
          {/* TICKET CARD */}
          <div className="w-full mb-10 group animate-in slide-in-from-bottom-8 duration-1000">
             <div className="bg-emerald-500 p-8 rounded-t-[2rem] text-slate-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Moon size={80} /></div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Bukber.TI</h3>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">Ramadhan 1445H</p>
                  </div>
                  <Sparkles size={18} />
                </div>
                <div className="text-center py-4">
                   <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60 mb-1">Lottery_Number</p>
                   <h1 className="text-6xl font-black italic tracking-tighter font-mono">{myParticipantData?.lotteryNumber}</h1>
                </div>
             </div>
             <div className="bg-emerald-500 h-4 flex items-center px-4 relative">
                <div className="absolute left-0 w-4 h-8 bg-[#020617] rounded-full -translate-x-1/2"></div>
                <div className="absolute right-0 w-4 h-8 bg-[#020617] rounded-full translate-x-1/2"></div>
                <div className="w-full border-t-2 border-dashed border-slate-950/20"></div>
             </div>
             <div className="bg-emerald-600 p-8 rounded-b-[2rem] flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 bg-slate-950/20 px-4 py-2 rounded-full border border-white/10 text-slate-950 font-mono text-xs font-bold">
                   <Key size={14} /> {showCode ? myParticipantData?.accessCode : "••••••"}
                   <button onClick={() => setShowCode(!showCode)}>{showCode ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                </div>
                <div className="flex justify-between w-full opacity-40">
                   <QrCode size={24} />
                   <p className="text-[8px] font-mono">NODE_UID: {myParticipantData?.id.substring(0,8)}</p>
                </div>
             </div>
          </div>

          {/* INTERACTIVE AREA */}
          <div className="w-full space-y-6">
            {globalConfig.eventStatus === EVENT_STATUS.WAITING && (
              <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2rem] text-center space-y-3">
                 <Clock className="mx-auto text-emerald-500 animate-pulse" />
                 <h4 className="text-xs font-black uppercase tracking-widest italic">Menunggu Interaksi</h4>
                 <p className="text-slate-500 text-[10px] leading-relaxed">Harap standby. Admin akan mengaktifkan fitur pesan atau kuis sebentar lagi.</p>
              </div>
            )}

            {globalConfig.eventStatus === EVENT_STATUS.MESSAGES && (
              <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem] space-y-6">
                 <div className="flex items-center gap-3">
                   <MessageSquare className="text-blue-400" size={18} />
                   <h4 className="text-sm font-black uppercase italic">Kesan & Pesan</h4>
                 </div>
                 <textarea 
                   className="w-full bg-black/40 border border-slate-800 rounded-2xl p-4 h-32 outline-none focus:border-blue-500 transition-all text-sm font-mono placeholder:text-slate-700"
                   placeholder="Bagaimana perasaanmu hari ini?..."
                   value={localMessage}
                   onChange={(e) => setLocalMessage(e.target.value)}
                 />
                 <button 
                   onClick={saveMessage}
                   disabled={isSavingMessage}
                   className="w-full py-4 bg-blue-500 text-slate-950 font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                   {isSavingMessage ? <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div> : <><Save size={16}/> Update Kesan</>}
                 </button>
                 {showStatusToast && <p className="text-center text-[9px] text-emerald-500 font-mono animate-pulse">Status: Synced_To_Database</p>}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Admin Dashboard (Sederhana)
  if (view === 'admin-dash') {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6 relative">
        <BackgroundOrnaments />
        <div className="max-w-4xl mx-auto relative z-10 space-y-10">
           <div className="flex justify-between items-end border-b border-white/5 pb-6">
              <div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">Admin_Panel</h1>
                <p className="text-[10px] text-emerald-500 font-mono tracking-widest">Control_Unit_Active</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold uppercase">Exit</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Event_Status</h3>
                 <div className="grid gap-2">
                    {Object.values(EVENT_STATUS).map(s => (
                      <button 
                        key={s}
                        onClick={async () => {
                           await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), { eventStatus: s }, { merge: true });
                        }}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${globalConfig.eventStatus === s ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-black/20 border-slate-800 text-slate-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Node_List ({participants.length})</h3>
                 <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {participants.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                        <div className="text-[10px] font-mono"><span className="text-emerald-500">{p.lotteryNumber}</span> - {p.name}</div>
                        <button onClick={async () => {
                           if(confirm(`Hapus ${p.name}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', p.id));
                        }} className="text-red-500 hover:scale-110"><Trash2 size={14}/></button>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Admin Login
  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative">
        <BackgroundOrnaments />
        <div className="w-full max-w-sm bg-slate-900/40 border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-2xl relative z-10 text-center">
           <Terminal className="mx-auto text-emerald-500 mb-6" size={32} />
           <form onSubmit={(e) => {
              e.preventDefault();
              if (adminCode === ADMIN_SECRET) setView('admin-dash');
              else setAdminError("Invalid_Key");
           }} className="space-y-6">
              <input 
                type="password" value={adminCode} autoFocus
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full bg-transparent border-b border-emerald-500/30 text-emerald-500 py-2 text-center text-xl outline-none focus:border-emerald-500 transition-all tracking-[0.5em]"
                placeholder="••••"
              />
              {adminError && <p className="text-red-500 text-[10px] font-mono">{adminError}</p>}
              <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-xl uppercase tracking-widest">Unlock_System</button>
              <button type="button" onClick={() => setView('landing')} className="text-slate-600 text-[10px] font-mono uppercase">Abort</button>
           </form>
        </div>
      </div>
    );
  }

  return null;
}