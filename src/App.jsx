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
  Sparkles,
  QrCode,
  Settings,
  Users,
  Plus,
  Trash2,
  Save,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAHSW-E4-GcIJHncSSmBtgCasPXuAkeqeo",
  authDomain: "bukberti25.firebaseapp.com",
  projectId: "bukberti25",
  storageBucket: "bukberti25.firebasestorage.app",
  messagingSenderId: "276939369839",
  appId: "1:276939369839:web:5359f188745ba491fb4c9a",
  measurementId: "G-3ZS3QNDFCE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'bukberti25';

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
    activeWinner: null,
    quizData: {
      question: "Apa singkatan dari HTML?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Tool Multi Language", "Hidden Text Main Loop"],
      correctAnswer: 0
    }
  });
  
  const [guestName, setGuestName] = useState('');
  const [myParticipantData, setMyParticipantData] = useState(null);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [regError, setRegError] = useState('');

  // Admin Quiz Editor State
  const [quizEditor, setQuizEditor] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedId = localStorage.getItem(`${appId}_participant_id`);
      if (!savedId) setLoading(false);
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
      const myData = data.find(p => p.id === savedId || p.uid === user.uid);
      if (myData) {
        setMyParticipantData(myData);
        localStorage.setItem(`${appId}_participant_id`, myData.id);
        if (view === 'landing' || view === 'guest-reg') setView('guest-dash');
      }
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    const cleanName = guestName.trim();
    if (participants.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      setRegError('Nama sudah terdaftar!');
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'participants'), {
        uid: user.uid,
        name: cleanName,
        lotteryNumber: Math.floor(1000 + Math.random() * 9000),
        timestamp: serverTimestamp(),
        quizAnswer: null,
        message: '',
        role: 'guest'
      });
      localStorage.setItem(`${appId}_participant_id`, docRef.id);
      setView('guest-dash');
    } catch (err) { console.error(err); }
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

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4 font-mono">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <div className="text-emerald-500 animate-pulse tracking-widest uppercase text-xs">Syncing_Core...</div>
    </div>
  );

  // Views
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <Moon className="w-16 h-16 text-emerald-400 mx-auto drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Bukber<span className="text-emerald-500">.TI</span></h1>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Informatics Community 2024</p>
          </div>
          <div className="grid gap-3">
            <button onClick={() => setView('guest-reg')} className="px-6 py-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
              <User className="w-5 h-5" /> Registrasi Peserta
            </button>
            <button onClick={() => setView('admin-login')} className="px-6 py-4 bg-slate-900/50 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-800 transition-all font-mono text-xs">
              <Terminal className="w-4 h-4 inline mr-2" /> sudo admin_dash
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'guest-reg') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl">
           <h2 className="text-2xl font-bold text-white mb-6">Presensi Digital</h2>
           <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest ml-1">Nama_Lengkap</label>
                <input 
                  type="text" required value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`w-full bg-slate-950 border ${regError ? 'border-red-500' : 'border-slate-800'} p-4 rounded-2xl text-white focus:border-emerald-500 transition-all font-mono outline-none`}
                  placeholder="e.g. Fulan_TI"
                />
                {regError && <div className="text-red-500 text-[10px] font-bold uppercase">{regError}</div>}
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-emerald-500/10">Absen Sekarang</button>
              <button onClick={() => setView('landing')} className="w-full text-slate-600 text-xs font-mono uppercase tracking-widest">Kembali</button>
           </form>
        </div>
      </div>
    );
  }

  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-sm bg-black border border-emerald-900/50 p-10 rounded-3xl shadow-2xl">
          <div className="text-emerald-500 mb-8 border-b border-emerald-900/20 pb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Root_Access</span>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (adminCode === ADMIN_SECRET) setView('admin-dash');
            else setAdminError("ACCESS_DENIED");
          }} className="space-y-6">
            <input 
              type="password" autoFocus value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="w-full bg-transparent border-b border-emerald-900 text-emerald-400 py-2 outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
            {adminError && <div className="text-red-500 text-[10px]">{adminError}</div>}
            <button type="submit" className="w-full py-3 bg-emerald-500/10 border border-emerald-500 text-emerald-500 font-bold rounded-lg text-xs hover:bg-emerald-500 hover:text-black transition-all">DECRYPT</button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'admin-dash') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-end border-b border-slate-800 pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white italic tracking-tighter">BUKBER_ROOT_PANEL</h1>
              <p className="text-[10px] text-emerald-500 font-mono tracking-[0.5em] uppercase leading-none">Informatics Command Center</p>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setView('landing')} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:text-red-500 transition-all"><LogOut className="w-5 h-5"/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Phase & Quiz Editor */}
            <div className="lg:col-span-5 space-y-8">
              {/* Event Phase */}
              <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Settings className="w-4 h-4"/> Global_Phase</div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(EVENT_STATUS).map(status => (
                    <button 
                      key={status} onClick={() => updateEventStatus(status)}
                      className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase transition-all ${globalConfig.eventStatus === status ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-950 border border-slate-800 text-slate-600 hover:border-slate-600'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Quiz Editor */}
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
                             type="radio" 
                             name="correct" 
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
                </div>
              </div>
            </div>

            {/* Attendance & Stats */}
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
                          <th className="px-4 pb-2">Nomor</th>
                          <th className="px-4 pb-2">Status_Kuis</th>
                          <th className="px-4 pb-2">Pesan</th>
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
                               <td className="px-4 py-4 border-y border-slate-800 font-mono text-emerald-500 font-black">#{p.lotteryNumber}</td>
                               <td className="px-4 py-4 border-y border-slate-800">
                                  {hasAnswered ? (
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                      {isCorrect ? 'CORRECT' : 'WRONG'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-700 text-[9px] italic">NO_INPUT</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 rounded-r-2xl border-r border-y border-slate-800 text-slate-500 max-w-[150px] truncate italic">
                                  {p.message || "-"}
                                </td>
                            </tr>
                          );
                        })}
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

  // Guest Dash
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
         <button onClick={handleLogout} className="p-3 bg-slate-900 border border-slate-800 hover:text-red-500 transition-all rounded-xl"><LogOut className="w-4 h-4" /></button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 z-10 max-w-xl mx-auto w-full">
        {/* Modern Ticket */}
        <div className="relative mb-12 group">
           <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse"></div>
           <div className="relative bg-[#0a0f1e] border border-emerald-500/20 rounded-[3rem] p-10 shadow-2xl overflow-hidden w-80 md:w-96 text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
              <div className="mb-6 flex justify-between">
                <Moon className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase">Unimal_TI_2024</span>
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
              </div>
           </div>
        </div>

        {/* Dynamic Interaction Panel */}
        <div className="w-full space-y-4">
          {globalConfig.eventStatus === EVENT_STATUS.WAITING && (
            <div className="text-center space-y-2 py-10 bg-slate-900/20 border border-slate-800/50 rounded-[2rem] border-dashed">
               <div className="text-emerald-500/50 text-[10px] font-mono tracking-widest uppercase animate-pulse">Listening_for_events...</div>
               <p className="text-slate-600 text-sm italic">Mohon tunggu instruksi panitia</p>
            </div>
          )}

          {globalConfig.eventStatus === EVENT_STATUS.QUIZ && (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-700">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-2xl"><Trophy className="w-5 h-5 text-amber-500" /></div>
                  <div className="text-left">
                    <h2 className="font-black text-white uppercase tracking-tight leading-none">Live_Quiz</h2>
                    <p className="text-[9px] font-mono text-slate-500 uppercase mt-1">Select one correct answer</p>
                  </div>
               </div>
               
               <div className="space-y-4 text-left">
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
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-700">
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
            </div>
          )}
        </div>
      </main>

      <footer className="z-20 p-8 text-center text-[9px] font-mono text-slate-700 uppercase tracking-[0.4em]">
         TI_UNIMAL // CRYPTO_SESSION_STABLE // 2024
      </footer>
    </div>
  );
}