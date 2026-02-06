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
  deleteDoc,
  serverTimestamp
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
  QrCode,
  Settings,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Send
} from 'lucide-react';

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'bukber-ti-2024';
const ADMIN_SECRET = "BUKBER_ROOT_ACCESS"; 

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
  
  // State perbaikan untuk form pesan
  const [tempMessage, setTempMessage] = useState('');
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);

  const [quizEditor, setQuizEditor] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInAnonymously(auth);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'participants'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(data);
      
      const savedId = localStorage.getItem(`${appId}_participant_id`);
      if (savedId) {
        const myData = data.find(p => p.id === savedId);
        if (myData) {
          setMyParticipantData(myData);
          if (view === 'landing' || view === 'guest-reg') setView('guest-dash');
        }
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, view]);

  useEffect(() => {
    if (!user) return;
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main');
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalConfig(data);
        if (data.quizData) setQuizEditor(data.quizData);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleRegisterOrLogin = async (e) => {
    e.preventDefault();
    setRegError('');
    const cleanName = guestName.trim();
    const existingParticipant = participants.find(p => p.name.toLowerCase() === cleanName.toLowerCase());

    if (existingParticipant && !isAlreadyRegistered) {
      setIsAlreadyRegistered(true);
      setRegError('Nama sudah terdaftar. Masukkan kode akses.');
      return;
    }

    if (isAlreadyRegistered) {
      if (existingParticipant.accessCode === loginCode.trim()) {
        localStorage.setItem(`${appId}_participant_id`, existingParticipant.id);
        setMyParticipantData(existingParticipant);
        setView('guest-dash');
      } else {
        setRegError('Kode akses salah.');
      }
      return;
    }

    setLoading(true);
    try {
      const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
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
      setRegError('Koneksi bermasalah.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(`${appId}_participant_id`);
    setMyParticipantData(null);
    setView('landing');
  };

  const saveQuizConfig = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), {
      ...globalConfig,
      quizData: quizEditor
    }, { merge: true });
  };

  const updateEventStatus = async (status) => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), {
      ...globalConfig,
      eventStatus: status
    }, { merge: true });
  };

  const submitQuiz = async (idx) => {
    if (!myParticipantData) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', myParticipantData.id), {
      quizAnswer: idx
    });
  };

  const submitMessage = async () => {
    if (!myParticipantData || isMessageSubmitting || !tempMessage.trim()) return;
    setIsMessageSubmitting(true);
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', myParticipantData.id), {
        message: tempMessage
      });
    } catch (e) {
      console.error(e);
    }
    setIsMessageSubmitting(false);
  };

  const deleteParticipant = async (id) => {
    if (!window.confirm("Hapus data peserta ini?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'participants', id));
  };

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono text-emerald-500">LOADING_CORE...</div>;

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <Moon className="w-16 h-16 text-emerald-400 mb-6" />
        <h1 className="text-4xl font-black italic mb-8 uppercase tracking-tighter text-white">Bukber<span className="text-emerald-500">.TI</span></h1>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => setView('guest-reg')} className="py-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl">Masuk / Daftar</button>
          <button onClick={() => setView('admin-login')} className="text-slate-600 font-mono text-[10px] uppercase">Admin Access</button>
        </div>
      </div>
    );
  }

  if (view === 'guest-reg') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
           <h2 className="text-2xl font-bold text-white mb-6">{isAlreadyRegistered ? 'Verifikasi Akses' : 'Daftar Peserta'}</h2>
           <form onSubmit={handleRegisterOrLogin} className="space-y-6">
              <input 
                type="text" required value={guestName} disabled={isAlreadyRegistered}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:border-emerald-500"
                placeholder="Nama Lengkap"
              />
              {isAlreadyRegistered && (
                <input 
                  type="password" required value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white text-center tracking-widest outline-none focus:border-emerald-500"
                  placeholder="KODE AKSES"
                />
              )}
              {regError && <p className="text-red-500 text-xs font-mono">{regError}</p>}
              <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase">Lanjutkan</button>
              <button type="button" onClick={() => setView('landing')} className="w-full text-slate-600 text-xs uppercase">Batal</button>
           </form>
        </div>
      </div>
    );
  }

  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-sm bg-black border border-emerald-900/50 p-10 rounded-3xl">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminCode === ADMIN_SECRET) setView('admin-dash');
            else setAdminError("ACCESS_DENIED");
          }} className="space-y-6">
            <input 
              type="password" autoFocus value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="w-full bg-transparent border-b border-emerald-900 text-emerald-400 py-2 outline-none"
              placeholder="Admin Code"
            />
            {adminError && <div className="text-red-500 text-[10px]">{adminError}</div>}
            <button type="submit" className="w-full py-3 border border-emerald-500 text-emerald-500 font-bold rounded-lg hover:bg-emerald-500 hover:text-black">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'admin-dash') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-300 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-6">
            <h1 className="text-2xl font-black text-white italic">ADMIN_PANEL</h1>
            <button onClick={() => setView('landing')} className="p-2 bg-slate-900 rounded-lg"><LogOut size={18}/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Event Control</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(EVENT_STATUS).map(s => (
                  <button 
                    key={s} onClick={() => updateEventStatus(s)}
                    className={`py-2 text-[10px] font-bold uppercase rounded-lg border ${globalConfig.eventStatus === s ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent border-slate-800'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Stats</h3>
              <div className="text-3xl font-black text-emerald-500">{participants.length} <span className="text-[10px] text-slate-500 font-normal">PESERTA</span></div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/50 border-b border-slate-800 uppercase text-slate-500 font-mono">
                <tr>
                  <th className="p-4">Nama</th>
                  <th className="p-4">Nomor</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <tr key={p.id} className="border-b border-slate-800/50">
                    <td className="p-4 font-bold text-white">{p.name} <span className="text-[10px] text-slate-600 ml-2">({p.accessCode})</span></td>
                    <td className="p-4 font-mono text-emerald-500">#{p.lotteryNumber}</td>
                    <td className="p-4">
                      <button onClick={() => deleteParticipant(p.id)} className="text-slate-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center p-6 relative">
      <header className="w-full max-w-xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold text-xs transform rotate-6 italic">TI</div>
          <span className="font-bold text-sm uppercase tracking-tighter">{myParticipantData?.name}</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 transition-all"><LogOut size={18}/></button>
      </header>

      <div className="bg-slate-900/50 border border-emerald-500/20 p-10 rounded-[3rem] w-full max-w-sm text-center mb-10 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Lucky Number</p>
        <h2 className="text-7xl font-black italic text-white mb-6 font-mono">{myParticipantData?.lotteryNumber || '----'}</h2>
        <div className="flex justify-center gap-2 items-center bg-slate-950/50 p-2 rounded-xl">
           <span className="text-[9px] font-mono text-slate-500">CODE:</span>
           <span className="text-xs font-mono font-bold tracking-widest">{showCode ? myParticipantData?.accessCode : '••••••'}</span>
           <button onClick={() => setShowCode(!showCode)} className="text-slate-600 hover:text-white ml-2">
             {showCode ? <EyeOff size={14}/> : <Eye size={14}/>}
           </button>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        {globalConfig.eventStatus === EVENT_STATUS.QUIZ && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <h3 className="text-amber-500 font-black uppercase text-xs mb-6 flex items-center gap-2"><Trophy size={14}/> LIVE_QUIZ</h3>
            {myParticipantData?.quizAnswer !== null ? (
               <div className="text-emerald-500 text-xs font-mono bg-emerald-500/10 p-4 rounded-xl text-center">Jawaban Berhasil Disimpan</div>
            ) : (
               <div className="space-y-3">
                  <p className="text-sm font-bold text-white mb-4 italic">"{globalConfig.quizData.question}"</p>
                  {globalConfig.quizData.options.map((opt, i) => (
                    <button key={i} onClick={() => submitQuiz(i)} className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left rounded-xl text-xs font-bold transition-all uppercase">{opt}</button>
                  ))}
               </div>
            )}
          </div>
        )}

        {globalConfig.eventStatus === EVENT_STATUS.MESSAGES && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <h3 className="text-cyan-500 font-black uppercase text-xs mb-6 flex items-center gap-2"><MessageSquare size={14}/> PESAN & HARAPAN</h3>
            <textarea 
              value={tempMessage} 
              onChange={(e) => setTempMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-4 h-32 rounded-2xl text-sm outline-none focus:border-cyan-500 mb-4 font-mono text-white resize-none"
              placeholder="Tulis kesan atau pesanmu..."
            />
            <button 
              onClick={submitMessage}
              disabled={isMessageSubmitting || !tempMessage.trim()}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs transition-all ${isMessageSubmitting ? 'bg-slate-800 text-slate-500' : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'}`}
            >
              {isMessageSubmitting ? <div className="w-4 h-4 border-2 border-t-white rounded-full animate-spin"></div> : <><Send size={14}/> Kirim Pesan</>}
            </button>
            {myParticipantData?.message && !isMessageSubmitting && (
              <p className="text-[9px] text-emerald-500 font-mono text-center mt-3 uppercase tracking-widest">Pesan terakhir telah terkirim</p>
            )}
          </div>
        )}

        {globalConfig.eventStatus === EVENT_STATUS.WAITING && (
          <div className="text-center py-10 border border-slate-800 border-dashed rounded-3xl opacity-50">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Menunggu instruksi panitia...</p>
          </div>
        )}
      </div>

      <footer className="mt-auto py-10 text-[9px] font-mono text-slate-700 tracking-[0.5em] uppercase">Bukber TI Unimal 2024</footer>
    </div>
  );
}