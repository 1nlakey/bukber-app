import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
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
  serverTimestamp,
  getDocs,
  where
} from 'firebase/firestore';
import { 
  Code, 
  Terminal, 
  Moon, 
  User, 
  Trophy, 
  MessageSquare, 
  LogOut, 
  CheckCircle,
  Zap,
  Sparkles,
  QrCode,
  Settings,
  Users,
  Plus,
  Trash2,
  Save,
<<<<<<< HEAD
=======
  XCircle,
>>>>>>> parent of 187637f (push update)
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
<<<<<<< HEAD
  RotateCcw,
  MessageCircle,
  Clock
} from 'lucide-react';

const getEnv = (key, fallback = "") => {
  try {
    return import.meta.env[key] || fallback;
  } catch (e) {
=======
  LogIn
} from 'lucide-react';

/**
 * PENTING:
 * Di lingkungan lokal (Vite), gunakan: import.meta.env.VITE_FIREBASE_API_KEY
 * Namun, untuk kompatibilitas pratinjau ini, saya menambahkan fallback string kosong.
 * Pastikan saat deploy ke Vercel, variabel ini sudah terisi di Dashboard Vercel.
 */

const getEnv = (key, fallback = "") => {
  try {
    // Mencoba mengakses variabel lingkungan standar Vite
    return import.meta.env[key] || fallback;
  } catch (e) {
    // Fallback jika import.meta tidak tersedia di environment tertentu
>>>>>>> parent of 187637f (push update)
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

<<<<<<< HEAD
=======
// Inisialisasi Firebase hanya jika API Key tersedia
>>>>>>> parent of 187637f (push update)
let app, auth, db;
const hasConfig = !!firebaseConfig.apiKey;

if (hasConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

<<<<<<< HEAD
const appId = getEnv('VITE_APP_ID', 'bukber-ti-2024');
const ADMIN_SECRET = getEnv('VITE_ADMIN_SECRET', 'admin123'); 
=======
const appId = getEnv('VITE_APP_ID', 'bukberti25');
const ADMIN_SECRET = getEnv('VITE_ADMIN_SECRET', "BUKBER_ROOT_ACCESS"); 
>>>>>>> parent of 187637f (push update)

const EVENT_STATUS = {
  WAITING: 'waiting',
  QUIZ: 'quiz',
  MESSAGES: 'messages',
  FINISHED: 'finished'
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [globalConfig, setGlobalConfig] = useState({ 
    eventStatus: EVENT_STATUS.WAITING,
    activeWinner: null,
    quizData: {
      question: "Apa singkatan dari HTML?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Tool Multi Language", "Hidden Text Main Loop"],
      correctAnswer: 0
    }
  });
  
  const [guestName, setGuestName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [myParticipantData, setMyParticipantData] = useState(null);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [regError, setRegError] = useState('');
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [showCode, setShowCode] = useState(false);
<<<<<<< HEAD
  const [localMessage, setLocalMessage] = useState('');
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [showStatusToast, setShowStatusToast] = useState(false);
  
  // Custom Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
=======
>>>>>>> parent of 187637f (push update)

  const [quizEditor, setQuizEditor] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  // Efek untuk menangani jika Config Firebase kosong (saat baru pertama buka di preview)
  useEffect(() => {
    if (!hasConfig) {
      setLoading(false);
      return;
    }
<<<<<<< HEAD

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
=======
>>>>>>> parent of 187637f (push update)

    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
<<<<<<< HEAD
      if (!localStorage.getItem(`${appId}_participant_id`)) setLoading(false);
=======
      const savedId = localStorage.getItem(`${appId}_participant_id`);
      if (!savedId) setLoading(false);
>>>>>>> parent of 187637f (push update)
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'participants'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(data);
      
      const savedId = localStorage.getItem(`${appId}_participant_id`);
      if (savedId) {
        const myData = data.find(p => p.id === savedId);
        if (myData) {
          setMyParticipantData(myData);
<<<<<<< HEAD
          // Hanya update localMessage jika belum pernah diedit di sesi ini atau data baru masuk
          if (!localMessage && myData.message) setLocalMessage(myData.message);
          if (view === 'landing' || view === 'guest-reg') setView('guest-dash');
=======
          if (view === 'landing' || view === 'guest-reg' || view === 'guest-login') {
            setView('guest-dash');
          }
        } else {
          localStorage.removeItem(`${appId}_participant_id`);
>>>>>>> parent of 187637f (push update)
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !db) return;
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main');
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalConfig(data);
        if (data.quizData) setQuizEditor(data.quizData);
      }
<<<<<<< HEAD
    }, (error) => console.error("Config error:", error));
    return () => unsubscribe();
  }, [user]);

  const saveMessage = async () => {
    const savedId = localStorage.getItem(`${appId}_participant_id`);
    if (!savedId || !db || !user) return;
    
    setIsSavingMessage(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'participants', savedId);
      await updateDoc(docRef, {
        message: localMessage,
        lastUpdated: serverTimestamp()
      });
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    } catch (err) {
      console.error("Save message failed:", err);
    }
    setIsSavingMessage(false);
=======
    }, (error) => console.error("Config fetch error:", error));
    return () => unsubscribe();
  }, [user]);

  const generateAccessCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
>>>>>>> parent of 187637f (push update)
  };

  const handleRegisterOrLogin = async (e) => {
    e.preventDefault();
    if (!db) return;
    setRegError('');
    const cleanName = guestName.trim();
    
    const existingParticipant = participants.find(p => p.name.toLowerCase() === cleanName.toLowerCase());

    if (existingParticipant && !isAlreadyRegistered) {
      setIsAlreadyRegistered(true);
<<<<<<< HEAD
      setRegError('Identitas ditemukan. Masukkan kode akses.');
=======
      setRegError('Nama ini sudah terdaftar. Masukkan kode akses Anda untuk melanjutkan.');
>>>>>>> parent of 187637f (push update)
      return;
    }

    if (isAlreadyRegistered) {
      if (existingParticipant?.accessCode === loginCode.trim()) {
        localStorage.setItem(`${appId}_participant_id`, existingParticipant.id);
        setView('guest-dash');
      } else {
        setRegError('Kode akses salah. Silakan coba lagi.');
      }
      return;
    }

    setLoading(true);
    try {
      const accessCode = generateAccessCode();
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'participants'), {
        uid: user.uid,
        name: cleanName,
        accessCode: accessCode,
        lotteryNumber: Math.floor(1000 + Math.random() * 9000),
        timestamp: serverTimestamp(),
        quizAnswer: null,
        message: '',
        role: 'guest'
      });
      localStorage.setItem(`${appId}_participant_id`, docRef.id);
      setView('guest-dash');
    } catch (err) { 
<<<<<<< HEAD
      setRegError('Gagal mendaftar. Coba lagi.');
=======
      console.error(err); 
      setRegError('Terjadi kesalahan koneksi.');
>>>>>>> parent of 187637f (push update)
    }
    setLoading(false);
  };

<<<<<<< HEAD
  const deleteParticipant = async () => {
    if (!db || !deleteModal.id) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', deleteModal.id));
      setDeleteModal({ isOpen: false, id: null, name: '' });
    } catch (err) {
      console.error("Delete failed:", err);
    }
=======
  const handleLogout = () => {
    localStorage.removeItem(`${appId}_participant_id`);
    setMyParticipantData(null);
    setGuestName('');
    setLoginCode('');
    setIsAlreadyRegistered(false);
    setView('landing');
  };

  const saveQuizConfig = async () => {
    if (!db) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), {
      ...globalConfig,
      quizData: quizEditor
    }, { merge: true });
>>>>>>> parent of 187637f (push update)
  };

  const updateEventStatus = async (status) => {
    if (!db) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), {
      ...globalConfig,
      eventStatus: status
    }, { merge: true });
  };

<<<<<<< HEAD
  const handleLogout = () => {
    localStorage.removeItem(`${appId}_participant_id`);
    setMyParticipantData(null);
    setGuestName('');
    setLoginCode('');
    setIsAlreadyRegistered(false);
    setView('landing');
  };

  // Modern Popup Dialog
  const CustomConfirmModal = () => {
    if (!deleteModal.isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl scale-in-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Hapus Data?</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Menghapus <span className="text-white font-bold">{deleteModal.name}</span> bersifat permanen dan tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
              className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all uppercase text-[10px] tracking-widest"
            >
              Batal
            </button>
            <button 
              onClick={deleteParticipant}
              className="flex-1 py-4 bg-red-500 text-slate-950 font-black rounded-2xl hover:bg-red-400 transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <div className="text-emerald-500 animate-pulse tracking-[0.3em] uppercase text-[10px] font-mono">Syncing_Data...</div>
    </div>
  );
=======
  const submitQuiz = async (idx) => {
    if (!myParticipantData || !db) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', myParticipantData.id), {
      quizAnswer: idx
    });
  };

  if (!hasConfig) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Konfigurasi Firebase Belum Ada</h1>
        <p className="text-slate-400 text-sm max-w-md">
          Aplikasi ini memerlukan Environment Variables (VITE_FIREBASE_API_KEY, dll) untuk berfungsi. 
          Silakan tambahkan variabel tersebut di lingkungan pengembangan Anda atau di dashboard Vercel.
        </p>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4 font-mono">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <div className="text-emerald-500 animate-pulse tracking-widest uppercase text-xs">Syncing_Core...</div>
    </div>
  );

  // ... (Sisa logika tampilan tetap sama seperti sebelumnya)
  // [Kode UI disingkat untuk efisiensi, namun fungsionalitas tetap sama]
>>>>>>> parent of 187637f (push update)

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
<<<<<<< HEAD
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full"></div>
        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <div className="space-y-4">
            <Moon className="w-16 h-16 text-emerald-400 mx-auto drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse" />
            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Bukber<span className="text-emerald-500">.TI</span></h1>
              <p className="text-slate-600 font-mono text-[9px] uppercase tracking-[0.5em]">Informatics Community 2024</p>
            </div>
          </div>
          <div className="grid gap-4 pt-4">
            <button onClick={() => setView('guest-reg')} className="px-8 py-5 bg-emerald-500 text-slate-950 font-black rounded-[2rem] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
              <Plus size={20} /> MULAI SEKARANG
            </button>
            <button onClick={() => setView('admin-login')} className="text-slate-700 hover:text-emerald-500/50 transition-all font-mono text-[9px] uppercase tracking-widest">
               Access_Admin_Panel
=======
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <Moon className="w-16 h-16 text-emerald-400 mx-auto drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Bukber<span className="text-emerald-500">.TI</span></h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Informatics Community 2024</p>
          </div>
          <div className="grid gap-3">
            <button onClick={() => setView('guest-reg')} className="px-6 py-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Masuk / Daftar
            </button>
            <button onClick={() => setView('admin-login')} className="px-6 py-4 bg-transparent text-slate-600 rounded-2xl hover:text-slate-400 transition-all font-mono text-[10px] uppercase tracking-widest">
              <Terminal className="w-3 h-3 inline mr-2" /> sudo admin_dash
>>>>>>> parent of 187637f (push update)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'guest-reg') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
<<<<<<< HEAD
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl">
           <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{isAlreadyRegistered ? 'Verifikasi' : 'Registrasi'}</h2>
           <p className="text-slate-500 text-xs mb-10 leading-relaxed">
             {isAlreadyRegistered ? 'Masukkan kode akses unik Anda untuk melanjutkan.' : 'Daftarkan nama Anda untuk mendapatkan nomor undian Bukber.'}
           </p>
           <form onSubmit={handleRegisterOrLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest ml-1">Identity_Name</label>
=======
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl">
           <h2 className="text-2xl font-bold text-white mb-2">{isAlreadyRegistered ? 'Verifikasi Akses' : 'Daftar Peserta'}</h2>
           <p className="text-slate-500 text-xs mb-8">
             {isAlreadyRegistered 
               ? 'Identitas ditemukan. Masukkan kode akses unik Anda.' 
               : 'Silakan isi nama lengkap untuk mendapatkan nomor undian.'}
           </p>
           <form onSubmit={handleRegisterOrLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest ml-1">Nama_Lengkap</label>
>>>>>>> parent of 187637f (push update)
                <input 
                  type="text" required value={guestName}
                  disabled={isAlreadyRegistered}
                  onChange={(e) => setGuestName(e.target.value)}
<<<<<<< HEAD
                  className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white focus:border-emerald-500 transition-all font-mono outline-none disabled:opacity-50"
                  placeholder="e.g. Fulan_Informatika"
=======
                  className={`w-full bg-slate-950 border ${regError && !isAlreadyRegistered ? 'border-red-500' : 'border-slate-800'} p-4 rounded-2xl text-white focus:border-emerald-500 transition-all font-mono outline-none ${isAlreadyRegistered ? 'opacity-50' : ''}`}
                  placeholder="e.g. Fulan_TI"
>>>>>>> parent of 187637f (push update)
                />
              </div>

              {isAlreadyRegistered && (
<<<<<<< HEAD
                <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
=======
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
>>>>>>> parent of 187637f (push update)
                  <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest ml-1">Access_Code</label>
                  <div className="relative">
                    <input 
                      type={showCode ? "text" : "password"} 
                      required 
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value)}
<<<<<<< HEAD
                      className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white focus:border-emerald-500 transition-all font-mono outline-none tracking-[0.8em] text-center text-xl"
                      placeholder="••••••"
                      maxLength={6}
                    />
                    <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      {showCode ? <EyeOff size={20} /> : <Eye size={20} />}
=======
                      className={`w-full bg-slate-950 border ${regError ? 'border-red-500' : 'border-slate-800'} p-4 rounded-2xl text-white focus:border-emerald-500 transition-all font-mono outline-none tracking-[0.5em] text-center`}
                      placeholder="••••••"
                      maxLength={6}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
>>>>>>> parent of 187637f (push update)
                    </button>
                  </div>
                </div>
              )}

<<<<<<< HEAD
              {regError && <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">{regError}</div>}

              <button type="submit" className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-all">
                {isAlreadyRegistered ? 'KONFIRMASI' : 'DAFTAR SEKARANG'}
              </button>
              
              <button type="button" onClick={() => { setIsAlreadyRegistered(false); setView('landing'); }} className="w-full text-slate-600 text-[9px] font-mono uppercase tracking-widest">
                KEMBALI
=======
              {regError && (
                <div className="flex gap-2 items-start bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-red-500 text-[10px] font-bold uppercase leading-tight">{regError}</div>
                </div>
              )}

              <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:scale-[1.02] transition-transform">
                {isAlreadyRegistered ? 'Verifikasi & Masuk' : 'Dapatkan Nomor Undian'}
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setIsAlreadyRegistered(false);
                  setRegError('');
                  setView('landing');
                }} 
                className="w-full text-slate-600 text-xs font-mono uppercase tracking-widest"
              >
                Batal
>>>>>>> parent of 187637f (push update)
              </button>
           </form>
        </div>
      </div>
    );
  }

  if (view === 'admin-login') {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-black border border-emerald-900/30 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10 space-y-4">
            <Terminal className="text-emerald-500" size={32} />
            <h2 className="text-emerald-500 text-xs font-mono font-bold tracking-[0.4em] uppercase">Security_Gateway</h2>
=======
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-sm bg-black border border-emerald-900/50 p-10 rounded-3xl shadow-2xl">
          <div className="text-emerald-500 mb-8 border-b border-emerald-900/20 pb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Root_Access</span>
>>>>>>> parent of 187637f (push update)
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminCode === ADMIN_SECRET) setView('admin-dash');
            else setAdminError("INVALID_CREDENTIALS");
          }} className="space-y-8">
            <input 
              type="password" autoFocus value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
<<<<<<< HEAD
              className="w-full bg-transparent border-b-2 border-emerald-900/50 text-emerald-400 py-3 outline-none focus:border-emerald-500 text-center tracking-[1em] text-2xl transition-all"
              placeholder="••••••"
            />
            {adminError && <div className="text-red-500 text-[9px] font-mono text-center uppercase tracking-widest">{adminError}</div>}
            <button type="submit" className="w-full py-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 font-black rounded-2xl text-[10px] tracking-[0.3em] hover:bg-emerald-500 hover:text-black transition-all">EXECUTE_LOGIN</button>
            <button type="button" onClick={() => setView('landing')} className="w-full text-slate-700 text-[9px] uppercase tracking-widest">Abort</button>
=======
              className="w-full bg-transparent border-b border-emerald-900 text-emerald-400 py-2 outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
            {adminError && <div className="text-red-500 text-[10px]">{adminError}</div>}
            <button type="submit" className="w-full py-3 bg-emerald-500/10 border border-emerald-500 text-emerald-500 font-bold rounded-lg text-xs hover:bg-emerald-500 hover:text-black transition-all">DECRYPT</button>
            <button type="button" onClick={() => setView('landing')} className="w-full text-slate-700 text-[9px] uppercase tracking-widest">Exit</button>
>>>>>>> parent of 187637f (push update)
          </form>
        </div>
      </div>
    );
  }

  if (view === 'admin-dash') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-6 md:p-12">
<<<<<<< HEAD
        <CustomConfirmModal />
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-10 gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Admin_Command</h1>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                <p className="text-[10px] text-emerald-500 font-mono tracking-[0.4em] uppercase">Core_System_Online</p>
              </div>
            </div>
            <button onClick={handleLogout} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all flex items-center gap-2 font-bold text-xs">
              <LogOut size={16}/> EXIT_PANEL
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-slate-900/30 border border-slate-800 p-10 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  <Settings size={18} className="text-emerald-500"/> Event_Phase
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.values(EVENT_STATUS).map(status => (
                    <button 
                      key={status} onClick={() => updateEventStatus(status)}
                      className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${globalConfig.eventStatus === status ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' : 'bg-slate-950 border border-slate-800 text-slate-600 hover:border-slate-500'}`}
                    >
                      {status.replace('_', ' ')}
=======
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-slate-800 pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white italic tracking-tighter">BUKBER_ROOT_PANEL</h1>
              <p className="text-[10px] text-emerald-500 font-mono tracking-[0.5em] uppercase leading-none">Informatics Command Center</p>
            </div>
            <div className="flex gap-4">
               <button onClick={handleLogout} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-red-500 transition-all"><LogOut className="w-5 h-5"/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Settings className="w-4 h-4"/> Global_Phase</div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(EVENT_STATUS).map(status => (
                    <button 
                      key={status} onClick={() => updateEventStatus(status)}
                      className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase transition-all ${globalConfig.eventStatus === status ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border border-slate-800 text-slate-600 hover:border-slate-600'}`}
                    >
                      {status}
>>>>>>> parent of 187637f (push update)
                    </button>
                  ))}
                </div>
              </div>

<<<<<<< HEAD
              <div className="bg-slate-900/30 border border-slate-800 p-10 rounded-[3rem] space-y-6">
                <div className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  <MessageCircle size={18} className="text-cyan-500"/> Message_Feed
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {participants.filter(p => p.message).length > 0 ? (
                    participants.filter(p => p.message).map(p => (
                      <div key={p.id} className="bg-slate-950/80 border border-slate-800 p-5 rounded-[2rem] animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black text-emerald-500 uppercase">{p.name}</span>
                           <span className="text-[8px] font-mono text-slate-700">#{p.lotteryNumber}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">"{p.message}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center opacity-20">
                      <MessageSquare size={40} className="mx-auto mb-2" />
                      <span className="text-[9px] font-mono uppercase tracking-widest">Empty_Inbox</span>
                    </div>
                  )}
=======
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Code className="w-4 h-4"/> Quiz_Engine</div>
                  <button onClick={saveQuizConfig} className="px-4 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg hover:scale-105 transition-all">UPDATE_LIVE</button>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-600 uppercase">Pertanyaan_Utama</label>
                      <input 
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500"
                        value={quizEditor.question}
                        onChange={(e) => setQuizEditor({...quizEditor, question: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-mono text-slate-600 uppercase">Opsi_Jawaban</label>
                      {quizEditor.options.map((opt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input 
                             type="radio" name="correct" 
                             checked={quizEditor.correctAnswer === i} 
                             onChange={() => setQuizEditor({...quizEditor, correctAnswer: i})}
                             className="accent-emerald-500 w-4 h-4"
                          />
                          <input 
                            className={`flex-1 bg-slate-950 border p-3 rounded-xl text-xs outline-none transition-all ${quizEditor.correctAnswer === i ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-800'}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...quizEditor.options];
                              newOpts[i] = e.target.value;
                              setQuizEditor({...quizEditor, options: newOpts});
                            }}
                          />
                        </div>
                      ))}
                   </div>
>>>>>>> parent of 187637f (push update)
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="lg:col-span-8">
              <div className="bg-slate-900/30 border border-slate-800 p-10 rounded-[3rem] h-full flex flex-col">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]"><Users size={20} className="text-emerald-500"/> Active_Participants</div>
                   <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-5 py-2 rounded-full border border-emerald-500/20">{participants.length} ASSETS</div>
                </div>
                <div className="overflow-x-auto flex-1">
                   <table className="w-full text-left text-xs border-separate border-spacing-y-4">
                      <thead>
                        <tr className="text-slate-600 font-mono text-[9px] uppercase tracking-widest">
                          <th className="px-6 pb-4">Participant</th>
                          <th className="px-6 pb-4">Auth_Code</th>
                          <th className="px-6 pb-4">Lottery_ID</th>
                          <th className="px-6 pb-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(p => (
                          <tr key={p.id} className="bg-slate-950/60 hover:bg-slate-900 transition-all group">
                               <td className="px-6 py-6 rounded-l-[1.5rem] border-l border-y border-slate-800">
                                  <div className="font-black text-white uppercase tracking-tight">{p.name}</div>
                                  <div className="text-[8px] text-slate-600 font-mono uppercase mt-1">ID_{p.id.substring(0,6)}</div>
                               </td>
                               <td className="px-6 py-6 border-y border-slate-800 font-mono text-slate-400">{p.accessCode}</td>
                               <td className="px-6 py-6 border-y border-slate-800 font-mono text-emerald-500 font-black text-lg">#{p.lotteryNumber}</td>
                               <td className="px-6 py-6 rounded-r-[1.5rem] border-r border-y border-slate-800 text-center">
                                  <button 
                                    onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: p.name })}
                                    className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <Trash2 size={18}/>
                                  </button>
                                </td>
                          </tr>
                        ))}
=======
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Users className="w-4 h-4"/> Participant_List</div>
                   <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/20">{participants.length} ASSETS_CONNECTED</div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-xs border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-600 font-mono text-[9px] uppercase tracking-widest">
                          <th className="px-4 pb-2">Peserta</th>
                          <th className="px-4 pb-2">Kode</th>
                          <th className="px-4 pb-2">Nomor</th>
                          <th className="px-4 pb-2">Status_Kuis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map(p => {
                          const isCorrect = p.quizAnswer === globalConfig.quizData?.correctAnswer;
                          const hasAnswered = p.quizAnswer !== null && p.quizAnswer !== undefined;
                          return (
                            <tr key={p.id} className="bg-slate-950/50 hover:bg-slate-900 transition-colors group">
                               <td className="px-4 py-4 rounded-l-2xl border-l border-y border-slate-800 group-hover:border-emerald-500/30">
                                  <div className="font-bold text-white uppercase">{p.name}</div>
                                  <div className="text-[8px] text-slate-600 font-mono">{p.id.substring(0,8)}</div>
                               </td>
                               <td className="px-4 py-4 border-y border-slate-800 font-mono text-slate-400">{p.accessCode}</td>
                               <td className="px-4 py-4 border-y border-slate-800 font-mono text-emerald-500 font-black">#{p.lotteryNumber}</td>
                               <td className="px-4 py-4 rounded-r-2xl border-r border-y border-slate-800">
                                  {hasAnswered ? (
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                      {isCorrect ? 'CORRECT' : 'WRONG'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-700 text-[9px] italic">NO_INPUT</span>
                                  )}
                                </td>
                            </tr>
                          );
                        })}
>>>>>>> parent of 187637f (push update)
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // Dashboard Peserta
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative font-sans overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,#064e3b22,transparent)]"></div>
      
      <header className="z-20 bg-slate-950/60 backdrop-blur-3xl border-b border-slate-800/50 p-6 px-8 md:px-12 flex justify-between items-center">
         <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 transform -rotate-6"><User size={24} className="text-slate-950" /></div>
           <div className="space-y-1">
              <div className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-[0.3em] font-bold">Session_Live</div>
              <div className="font-black text-lg text-white uppercase tracking-tight">{myParticipantData?.name}</div>
           </div>
         </div>
         <button onClick={handleLogout} className="p-4 bg-slate-900 border border-slate-800 hover:text-red-500 transition-all rounded-[1.5rem] shadow-xl">
            <LogOut size={20} />
         </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-8 z-10 max-w-2xl mx-auto w-full pb-32">
        {/* Tiket Nomor Undian */}
        <div className="relative mb-16 group w-full max-w-sm">
           <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse group-hover:bg-emerald-500/20 transition-all duration-700"></div>
           <div className="relative bg-[#0a0f1e] border border-emerald-500/20 rounded-[3.5rem] p-12 shadow-2xl overflow-hidden text-center transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"></div>
              <div className="mb-10 flex justify-between items-center">
                <Moon className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-full">
                  <Key size={14} className="text-emerald-500" />
                  <span className="text-xs font-mono text-white tracking-widest">
                    {showCode ? myParticipantData?.accessCode : "••••••"}
                  </span>
                  <button onClick={() => setShowCode(!showCode)} className="text-slate-500 hover:text-white transition-colors">
                    {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-10">
                 <div className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.4em]">Ticket_Number</div>
                 <div className="text-8xl font-black italic tracking-tighter text-white font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {myParticipantData?.lotteryNumber || '----'}
                 </div>
              </div>
              <div className="py-8 border-y border-slate-800/50 border-dashed">
                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-emerald-500 text-[11px] font-black uppercase tracking-widest">
                   <CheckCircle size={14}/> ENTRY_VERIFIED
                 </div>
              </div>
              <div className="mt-10 flex justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                <QrCode size={80} className="text-white" />
=======
  // View untuk user dashboard
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#064e3b,transparent)] opacity-40"></div>
      
      <header className="z-20 bg-slate-950/40 backdrop-blur-xl border-b border-slate-800/50 p-6 flex justify-between items-center px-10">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transform rotate-3"><User className="w-5 h-5 text-slate-950" /></div>
           <div>
              <div className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-widest leading-none mb-1">Session_Active</div>
              <div className="font-bold text-sm text-white uppercase">{myParticipantData?.name || guestName}</div>
           </div>
         </div>
         <button onClick={handleLogout} className="p-3 bg-slate-900 border border-slate-800 hover:text-red-500 transition-all rounded-xl group relative">
            <LogOut className="w-4 h-4" />
         </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 max-w-xl mx-auto w-full">
        <div className="relative mb-12 group">
           <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse"></div>
           <div className="relative bg-[#0a0f1e] border border-emerald-500/20 rounded-[3rem] p-10 shadow-2xl overflow-hidden w-80 md:w-96 text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
              <div className="mb-6 flex justify-between items-center">
                <Moon className="w-4 h-4 text-emerald-500" />
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">
                  <Key className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-mono text-white tracking-widest">
                    {showCode ? myParticipantData?.accessCode : "••••••"}
                  </span>
                  <button onClick={() => setShowCode(!showCode)} className="text-slate-500 hover:text-white">
                    {showCode ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1 mb-8">
                 <div className="text-[10px] font-mono text-slate-500 uppercase">Access_Number</div>
                 <div className="text-7xl font-black italic tracking-tighter text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {myParticipantData?.lotteryNumber || '----'}
                 </div>
              </div>
              <div className="py-6 border-y border-slate-800 border-dashed space-y-2">
                 <div className="text-[10px] font-mono text-slate-600 uppercase">Status</div>
                 <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase">
                   <CheckCircle className="w-3 h-3"/> Entry_Verified
                 </div>
              </div>
              <div className="mt-8 flex justify-center opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                <QrCode className="w-16 h-16 text-white" />
>>>>>>> parent of 187637f (push update)
              </div>
           </div>
        </div>

<<<<<<< HEAD
        <div className="w-full space-y-8">
          {globalConfig.eventStatus === EVENT_STATUS.WAITING && (
            <div className="text-center space-y-4 py-16 bg-slate-900/10 border border-slate-800/40 rounded-[3rem] border-dashed">
               <div className="text-emerald-500/30 text-[11px] font-mono tracking-[0.5em] uppercase animate-pulse font-bold">Listening_to_server...</div>
               <p className="text-slate-600 text-sm font-medium">Harap tenang, acara akan segera dimulai.</p>
            </div>
          )}

          {globalConfig.eventStatus === EVENT_STATUS.MESSAGES && (
            <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-500"><MessageSquare size={24} /></div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">Kesan_Bukber</h2>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Share your thoughts with everyone</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                 <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 h-44 outline-none focus:border-cyan-500 transition-all text-sm font-mono placeholder:text-slate-700 text-white resize-none shadow-inner"
                    placeholder="Tulis pesan atau kesanmu di sini..."
                    value={localMessage}
                    onChange={(e) => setLocalMessage(e.target.value)}
                 />
                 
                 <div className="flex flex-col gap-4">
                   <button 
                    onClick={saveMessage}
                    disabled={isSavingMessage}
                    className="w-full py-5 bg-cyan-500 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/10 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isSavingMessage ? (
                       <div className="w-6 h-6 border-3 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                     ) : (
                       <><Save size={20} /> SIMPAN PESAN</>
                     )}
                   </button>
                   
                   {showStatusToast && (
                     <div className="text-center text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] animate-bounce">
                       SUCCESS_SYNCED_TO_FEED
                     </div>
                   )}
                 </div>

                 <div className="pt-10 border-t border-slate-800 mt-10">
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-2">
                         <MessageCircle size={14} /> Global_Feed
                       </span>
                       <span className="text-[9px] font-mono text-slate-800">CONNECTED_LIVE</span>
                    </div>
                    <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                       {participants.filter(p => p.message && p.id !== myParticipantData?.id).length > 0 ? (
                         participants.filter(p => p.message && p.id !== myParticipantData?.id).map(p => (
                           <div key={p.id} className="bg-slate-950/50 border border-slate-800/50 p-6 rounded-[2rem] hover:border-slate-700 transition-all">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-black text-cyan-500 uppercase tracking-tight">{p.name}</span>
                                <Clock size={12} className="text-slate-700" />
                             </div>
                             <p className="text-xs text-slate-400 leading-relaxed italic font-light">"{p.message}"</p>
                           </div>
                         ))
                       ) : (
                         <div className="py-10 text-center text-[9px] font-mono text-slate-800 uppercase tracking-widest italic">
                           Waiting_for_other_messages...
                         </div>
                       )}
                    </div>
                 </div>
               </div>
=======
        <div className="w-full space-y-4">
          {globalConfig.eventStatus === EVENT_STATUS.WAITING && (
            <div className="text-center space-y-2 py-10 bg-slate-900/20 border border-slate-800/50 rounded-[2rem] border-dashed">
               <div className="text-emerald-500/50 text-[10px] font-mono tracking-widest uppercase animate-pulse">Listening_for_events...</div>
               <p className="text-slate-600 text-sm italic">Mohon tunggu instruksi panitia</p>
            </div>
          )}

          {globalConfig.eventStatus === EVENT_STATUS.QUIZ && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-700 text-left">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-2xl"><Trophy className="w-5 h-5 text-amber-500" /></div>
                  <div>
                    <h2 className="font-black text-white uppercase tracking-tight leading-none">Live_Quiz</h2>
                    <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">Select one correct answer</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white mb-6">
                    {globalConfig.quizData?.question || "Memuat pertanyaan..."}
                  </div>
                  {myParticipantData?.quizAnswer !== null && myParticipantData?.quizAnswer !== undefined ? (
                    <div className="text-center py-10 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                       <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                       <p className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Jawaban_Terkirim</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                       {globalConfig.quizData?.options.map((opt, i) => (
                          <button 
                            key={i} onClick={() => submitQuiz(i)}
                            className="w-full p-5 bg-slate-950/50 border border-slate-800 hover:border-emerald-500 text-left rounded-2xl text-xs font-bold transition-all group flex justify-between items-center"
                          >
                            <span>{opt}</span>
                            <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          )}

          {globalConfig.eventStatus === EVENT_STATUS.MESSAGES && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-700 text-left">
               <div className="flex items-center gap-3 mb-8 text-cyan-500">
                  <MessageSquare className="w-5 h-5" />
                  <h2 className="font-black uppercase tracking-tight">Kesan_Ramadhan</h2>
               </div>
               <textarea 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 h-32 mb-6 outline-none focus:border-cyan-500 transition-all text-sm font-mono placeholder:text-slate-700"
                  placeholder="Ketik pesan atau harapanmu..."
                  value={myParticipantData?.message || ""}
                  onChange={(e) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', myParticipantData.id), { message: e.target.value })}
               />
               <div className="text-center text-[10px] font-mono text-cyan-900 tracking-widest uppercase">Data_Auto_Syncing...</div>
>>>>>>> parent of 187637f (push update)
            </div>
          )}
        </div>
      </main>

<<<<<<< HEAD
      <footer className="z-20 p-10 text-center text-[10px] font-mono text-slate-800 uppercase tracking-[0.5em] mt-auto">
         INF_UNIMAL // ENCRYPTED_STABLE // 2024
=======
      <footer className="z-20 p-8 text-center text-[9px] font-mono text-slate-700 uppercase tracking-[0.4em]">
         TI_UNIMAL // CRYPTO_SESSION_STABLE // 2024
>>>>>>> parent of 187637f (push update)
      </footer>
    </div>
  );
}