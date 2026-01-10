import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Terminal, 
  MessageSquare, 
  Cloud, 
  Battery, 
  Settings, 
  Bell, 
  Search,
  Grid,
  Wifi,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  WifiOff,
  Loader2,
  FileCode,
  FolderOpen,
  Plus,
  Save,
  X,
  AlertTriangle,
  Eye,
  Scan,
  Upload,
  Disc,
  Play,
  Mic,
  Lock,
  LogOut,
  Fingerprint,
  Command,
  Github,
  Code,
  GitPullRequest,
  PackagePlus,
  LayoutDashboard,
  FileText,
  RefreshCw
} from 'lucide-react';

// --- CONFIGURATION ---

// 1. Firebase Config
let firebaseConfig;
// @ts-ignore
if (typeof __firebase_config !== 'undefined') {
  // Canvas Environment
  // @ts-ignore
  firebaseConfig = JSON.parse(__firebase_config);
} else {
  // Local Development (Fill this in!)
  firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  };
}

// 2. Gemini API Keys
const API_KEY_GEMINI_TEXT = ""; 
const API_KEY_GEMINI_IMAGE = ""; 

// 3. App ID Sanitization
// @ts-ignore
const RAW_APP_ID = typeof __app_id !== 'undefined' ? __app_id : "gemini-os-v2";
const APP_ID = RAW_APP_ID.replace(/\//g, '_');

// --- FIREBASE INIT ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- TYPES ---
type ProcessingMode = 'LOCAL' | 'CLOUD' | 'HYBRID';

interface NotificationItem {
  id: string;
  app: string;
  title: string;
  content: string;
  timestamp: string; 
  processed: boolean;
  insight?: string;
  modeUsed?: ProcessingMode;
  smartReplies?: string[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isSystemAction?: boolean;
}

interface VirtualFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
}

interface MusicTrack {
  title: string;
  artist: string;
  vibe: string;
  coverArt: string | null;
}

interface MockRepo {
  name: string;
  language: string;
  stars: number;
}

interface SearchResult {
  type: 'FILE' | 'CONTACT' | 'MAIL' | 'APP';
  title: string;
  subtitle: string;
}

// --- MOCK DATA ---
const MOCK_REPOS: MockRepo[] = [
  { name: 'hyper-os-kernel', language: 'Rust', stars: 1240 },
  { name: 'gemini-neural-bridge', language: 'Python', stars: 856 },
  { name: 'react-quantum-ui', language: 'TypeScript', stars: 3402 },
];

const MOCK_NOTIFICATIONS = [
  { app: 'WhatsApp', title: 'Mom', content: 'Are you coming for dinner tonight? I am making lasagna.' },
  { app: 'Gmail', title: 'AWS Billing', content: 'Alert: Your budget has exceeded the threshold of $50.00.' },
  { app: 'System', title: 'Battery', content: 'Power saving mode enabled. Background activity restricted.' },
  { app: 'Calendar', title: 'Meeting', content: 'Sync with product team in 15 minutes.' },
];

const INITIAL_FILES: VirtualFile[] = [
  { id: '1', name: 'readme.txt', content: 'Welcome to Gemini OS V2.\nBackend: Firebase Firestore.\nYour data is now synced to the cloud.', language: 'plaintext' },
  { id: '2', name: 'config.json', content: '{\n  "theme": "dark",\n  "ai_level": "max"\n}', language: 'json' }
];

// --- HELPERS ---
const launchNativeApp = (appName: string) => {
  const schemaMap: Record<string, string> = {
    spotify: 'spotify://', twitter: 'twitter://', instagram: 'instagram://', maps: 'geo:0,0?q=',
    sms: 'sms:', tel: 'tel:', camera: 'camera:', mail: 'mailto:', whatsapp: 'whatsapp://'
  };
  const url = schemaMap[appName.toLowerCase()];
  if (!url) return { success: false, message: `No protocol handler for ${appName}` };
  try { window.location.href = url; return { success: true, message: `Launching ${appName}...` }; } 
  catch (e) { return { success: false, message: `Failed to launch ${appName}` }; }
};

const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000) => {
  const numChannels = 1; const bitsPerSample = 16; const byteRate = (sampleRate * numChannels * bitsPerSample) / 8; const blockAlign = (numChannels * bitsPerSample) / 8; const dataSize = pcmData.length; const buffer = new ArrayBuffer(44 + dataSize); const view = new DataView(buffer);
  const writeString = (view: DataView, offset: number, string: string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
  writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(view, 8, 'WAVE'); writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true); writeString(view, 36, 'data'); view.setUint32(40, dataSize, true); const pcmBytes = new Uint8Array(buffer, 44); pcmBytes.set(pcmData);
  return new Blob([buffer], { type: 'audio/wav' });
};

// --- GEMINI API HELPERS ---
const callGeminiText = async (prompt: string, systemInstruction: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY_GEMINI_TEXT}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (e) { console.error(e); return "System Uplink Offline."; }
};

const callGeminiVision = async (prompt: string, base64Image: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY_GEMINI_TEXT}`;
  const cleanBase64 = base64Image.split(',')[1] || base64Image;
  const payload = { contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: cleanBase64 } }] }] };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Vision Failure.";
  } catch (e) { return "Visual Cortex Malfunction."; }
};

const callGeminiImage = async (prompt: string): Promise<string | null> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY_GEMINI_IMAGE}`;
  const payload = { contents: [{ parts: [{ text: prompt + ", phone wallpaper, abstract, 4k, high quality" }] }], generationConfig: { responseModalities: ["IMAGE"] } };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    const b64 = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch (e) { return null; }
};

const callGeminiTTS = async (text: string): Promise<void> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY_GEMINI_TEXT}`;
  const payload = { contents: [{ parts: [{ text: text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) new Audio(URL.createObjectURL(pcmToWav(base64ToUint8Array(audioData), 24000))).play();
  } catch (e) { console.error(e); }
};

// --- COMPONENT ---
export default function App() {
  // --- AUTH & USER ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [bootSequence, setBootSequence] = useState(false);

  // --- DATA STATES ---
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  
  // --- SYSTEM STATES ---
  const [activeTab, setActiveTab] = useState<'HOME' | 'CHAT' | 'SETTINGS' | 'SEARCH' | 'GITHUB' | 'FILES' | 'TERMINAL' | 'VISION'>('HOME');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemLoad, setSystemLoad] = useState(15);
  const [wifiEnabled, setWifiEnabled] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isTilingMode, setIsTilingMode] = useState(false);

  // --- FEATURE STATES ---
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([{ type: 'output', content: 'Gemini Kernel v2.1 (Cloud-Linked)' }]);
  const [terminalInput, setTerminalInput] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorFilename, setEditorFilename] = useState("");
  const [isAiCoding, setIsAiCoding] = useState(false);
  const [lintError, setLintError] = useState<string | null>(null);
  const [visionInput, setVisionInput] = useState<string | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState("");
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeRepo, setActiveRepo] = useState<MockRepo>(MOCK_REPOS[0]);
  const [repoAnalysis, setRepoAnalysis] = useState("");
  const [isAnalyzingRepo, setIsAnalyzingRepo] = useState(false);
  const [prFeature, setPrFeature] = useState("");
  const [prDraft, setPrDraft] = useState("");
  const [isDraftingPr, setIsDraftingPr] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatThinking, setIsChatThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wallpaperPrompt, setWallpaperPrompt] = useState("");
  const [isGeneratingWallpaper, setIsGeneratingWallpaper] = useState(false);
  const [systemBriefing, setSystemBriefing] = useState("");
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [isScaffolding, setIsScaffolding] = useState(false);

  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
    // Determine Auth method based on environment
    const initAuth = async () => {
      // @ts-ignore
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        // @ts-ignore
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- FIRESTORE SYNC ---
  useEffect(() => {
    if (!user) return;

    // 1. Filesystem Sync
    const filesUnsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'filesystem'), (docSnap) => {
      if (docSnap.exists()) {
        setFiles(docSnap.data().files || []);
      } else {
        // Seed initial data if new user
        setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'filesystem'), { files: INITIAL_FILES });
        setFiles(INITIAL_FILES);
      }
    });

    // 2. Chat History Sync
    const chatUnsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'chat'), (docSnap) => {
      if (docSnap.exists()) {
        setChatMessages(docSnap.data().messages || []);
      } else {
        setChatMessages([{ role: 'model', text: 'Gateway v2.1 Online. Cloud storage active.' }]);
      }
    });

    // 3. Settings Sync
    const settingsUnsub = onSnapshot(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.wallpaper) setWallpaper(data.wallpaper);
      }
    });

    return () => {
      filesUnsub();
      chatUnsub();
      settingsUnsub();
    };
  }, [user]);

  // --- SAVE HELPERS ---
  const saveFilesToCloud = async (newFiles: VirtualFile[]) => {
    if (!user) return;
    setFiles(newFiles); // Optimistic update
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'filesystem'), { files: newFiles }, { merge: true });
  };

  const saveChatToCloud = async (newMessages: ChatMessage[]) => {
    if (!user) return;
    setChatMessages(newMessages);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'chat'), { messages: newMessages }, { merge: true });
  };

  const saveWallpaperToCloud = async (url: string) => {
    if (!user) return;
    setWallpaper(url);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'settings'), { wallpaper: url }, { merge: true });
  };

  // --- SYSTEM LOOP ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSystemLoad(prev => Math.max(5, Math.min(100, prev + (Math.random() * 6 - 3))));
    }, 1000);
    // Battery mock if API fails/unsupported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
      });
    }
    return () => clearInterval(timer);
  }, []);

  // --- SCROLL EFFECTS ---
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, activeTab, isTilingMode]);
  useEffect(() => { if (activeTab === 'TERMINAL' || isTilingMode) terminalRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalHistory, activeTab, isTilingMode]);

  // --- AUTH UI HANDLER ---
  // In a real app, this would trigger actual OAuth popup
  const handleAuthTrigger = async (_providerName: string) => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setBootSequence(true);
      setTimeout(() => {
        setBootSequence(false);
        setIsUnlocked(true);
      }, 2500);
    }, 1500);
  };

  const handleLogout = () => {
    setBootSequence(false);
    setIsUnlocked(false); 
  };

  // --- FEATURE HANDLERS ---
  
  // Chat / Agent
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    
    const newHistory = [...chatMessages, { role: 'user', text: userMsg } as ChatMessage];
    saveChatToCloud(newHistory);
    setIsChatThinking(true);

    const notifContext = notifications.slice(0, 3).map(n => `[${n.app}] ${n.content}`).join(", ");
    const systemState = `Wifi:${wifiEnabled}, Battery:${batteryLevel}%, Files:${files.length}`;
    const systemPrompt = `You are the Gemini OS Kernel. State: ${systemState}. Notifs: ${notifContext}. TOOLS: [[CMD:LAUNCH:app]], [[CMD:WIFI:toggle]], [[CMD:CLEAR]]. Concise.`;
    
    const response = await callGeminiText(userMsg, systemPrompt);
    let displayMsg = response;
    let actionLog = null;
    
    const cmdRegex = /\[\[CMD:(.*?):?(.*?)\]\]/;
    const match = response.match(cmdRegex);
    if (match) {
      const [fullTag, cmd, arg] = match;
      displayMsg = response.replace(fullTag, '').trim();
      if (cmd === 'LAUNCH') { const res = launchNativeApp(arg); actionLog = res.message; }
      else if (cmd === 'WIFI') { setWifiEnabled(p => !p); actionLog = "Toggling Uplink..."; }
      else if (cmd === 'CLEAR') { setNotifications([]); actionLog = "Buffer Cleared."; }
    }

    const finalHistory = [...newHistory, { role: 'model', text: displayMsg } as ChatMessage];
    if (actionLog) finalHistory.push({ role: 'model', text: `>> ${actionLog}`, isSystemAction: true });
    
    saveChatToCloud(finalHistory);
    setIsChatThinking(false);
    if (voiceMode && displayMsg) callGeminiTTS(displayMsg);
  };

  // Files
  const handleSmartSave = async () => {
    const res = await callGeminiText(`Lint this code:\n${editorContent}`, "Return 'ERROR: <reason>' or the clean code.");
    if (res.startsWith('ERROR')) { setLintError(res); return; }
    
    const clean = res.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '').trim();
    let newFiles = [...files];
    
    if (activeFileId) {
      newFiles = newFiles.map(f => f.id === activeFileId ? { ...f, content: clean, name: editorFilename } : f);
    } else {
      newFiles.push({ id: Date.now().toString(), name: editorFilename, content: clean, language: 'plaintext' });
    }
    
    await saveFilesToCloud(newFiles);
    setEditorOpen(false);
  };

  const handleScaffold = async () => {
    const goal = window.prompt("Project Idea?");
    if (!goal) return;
    setIsScaffolding(true);
    const res = await callGeminiText(`Scaffold project: ${goal}. JSON array {name, content}.`, "Expert Dev.");
    try {
      const scaffoldFiles = JSON.parse(res.replace(/```json|```/g, '').trim());
      const mapped = scaffoldFiles.map((f: any) => ({ id: Math.random().toString(), name: f.name, content: f.content, language: 'code' }));
      await saveFilesToCloud([...mapped, ...files]);
    } catch(e) { alert("Scaffold failed"); }
    setIsScaffolding(false);
  };

  const handleOpenFile = (file: VirtualFile) => { setActiveFileId(file.id); setEditorFilename(file.name); setEditorContent(file.content); setEditorOpen(true); setLintError(null); };
  const handleNewFile = () => { setActiveFileId(null); setEditorFilename("untitled.txt"); setEditorContent(""); setEditorOpen(true); setLintError(null); };
  const handleAiCodeAssist = async () => { setIsAiCoding(true); const res = await callGeminiText(`Complete code:\n${editorContent}`, "Dev assistant. Return ONLY code."); setEditorContent(res.replace(/```[\s\S]*?\n/g, '').replace(/```/g, '')); setIsAiCoding(false); };

  // Terminal
  const handleTerminalCommand = async () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalHistory(prev => [...prev, { type: 'input', content: cmd }]);
    setTerminalInput("");
    
    const args = cmd.split(' ');
    if (args[0] === 'ls') { setTerminalHistory(p => [...p, { type: 'output', content: files.map(f => f.name).join('  ') || '(empty)' }]); return; }
    if (args[0] === 'open' || args[0] === 'launch') { 
        const res = launchNativeApp(args[1]);
        setTerminalHistory(p => [...p, { type: 'output', content: res.message }]);
        return; 
    }
    
    const response = await callGeminiText(`Simulate terminal output for: "${cmd}". Filesystem: ${files.map(f=>f.name).join(',')}`, "You are /bin/bash.");
    setTerminalHistory(p => [...p, { type: 'output', content: response.replace(/```/g, '') }]);
  };

  // System
  const handleGenerateWallpaper = async () => { 
    if (!wallpaperPrompt) return; 
    setIsGeneratingWallpaper(true); 
    const url = await callGeminiImage(wallpaperPrompt); 
    if (url) saveWallpaperToCloud(url); 
    setIsGeneratingWallpaper(false); 
  };

  // Vision
  const handleVisionAnalyze = async () => { if (!visionInput) return; setIsVisionAnalyzing(true); const res = await callGeminiVision("Analyze this image.", visionInput); setVisionAnalysis(res); setIsVisionAnalyzing(false); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setVisionInput(r.result as string); r.readAsDataURL(f); } };
  const handleSimulateScreenScan = async () => { setIsVisionAnalyzing(true); setVisionInput(null); const res = await callGeminiText(`Describe screen state: ${activeTab}, Notifs: ${notifications.length}`, "Screen Reader."); setVisionAnalysis(res); setIsVisionAnalyzing(false); };

  // Music
  const handleGenerateMusic = async () => { 
    setIsGeneratingMusic(true); 
    try { 
      const meta = await callGeminiText("Invent a song track (JSON: title, artist, vibe)", "Music DJ"); 
      const track = JSON.parse(meta.replace(/```json|```/g, '').trim()); 
      const art = await callGeminiImage(`Cover for ${track.title} ${track.vibe}`); 
      setCurrentTrack({ ...track, coverArt: art }); 
    } catch(e) {} 
    setIsGeneratingMusic(false); 
  };

  // Search/Dev
  const handleSearch = async () => { if (!searchQuery) return; setIsSearching(true); const res = await callGeminiText("Generate search results JSON", `User: ${searchQuery}`); try { setSearchResults(JSON.parse(res.replace(/```json|```/g, '').trim())); } catch(e){} setIsSearching(false); };
  const handleAnalyzeRepo = async () => { setIsAnalyzingRepo(true); const res = await callGeminiText(`Analyze ${activeRepo.name}`, "Senior Engineer."); setRepoAnalysis(res); setIsAnalyzingRepo(false); };
  const handleCreatePR = async () => { setIsDraftingPr(true); const res = await callGeminiText(`PR for ${prFeature} in ${activeRepo.name}`, "Engineer."); setPrDraft(res); setIsDraftingPr(false); };
  const handleSimulateNotification = () => { const raw = MOCK_NOTIFICATIONS[Math.floor(Math.random()*MOCK_NOTIFICATIONS.length)]; setNotifications(p => [{...raw, id: Date.now().toString(), timestamp: new Date().toISOString(), processed: false}, ...p]); };
  const generateBriefing = async () => { setIsBriefingLoading(true); const res = await callGeminiText(`Stats: Load ${Math.round(systemLoad)}%`, "Greeting."); setSystemBriefing(res); setIsBriefingLoading(false); };
  const toggleListening = () => { setIsListening(p => !p); };

  // --- RENDER HELPERS ---
  const renderTerminalContent = () => (
    <div className="flex flex-col h-full bg-black/90 font-mono text-xs p-2 text-green-400">
      <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
        {terminalHistory.map((line, i) => (
          <div key={i} className={`${line.type === 'input' ? 'text-yellow-400' : 'text-green-400'} whitespace-pre-wrap`}>
            {line.type === 'input' ? '> ' : ''}{line.content}
          </div>
        ))}
        <div ref={terminalRef} />
      </div>
      <div className="flex items-center gap-2 p-2 border-t border-green-900/50 bg-black">
        <span className="text-green-600">$</span>
        <input 
          type="text" 
          value={terminalInput} 
          onChange={(e) => setTerminalInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleTerminalCommand()}
          className="flex-1 bg-transparent outline-none text-green-400 placeholder-green-900" 
          placeholder="Execute command..."
          autoFocus={activeTab === 'TERMINAL'}
        />
      </div>
    </div>
  );

  const renderFilesContent = () => (
    <div className="flex flex-col h-full bg-black/90 backdrop-blur-xl">
      {editorOpen ? (
        <div className="flex flex-col h-full animate-in zoom-in-95">
          <div className="flex justify-between items-center p-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FileText size={14} className="text-blue-400"/>
              <input value={editorFilename} onChange={(e) => setEditorFilename(e.target.value)} className="bg-transparent outline-none w-32"/>
            </div>
            <div className="flex gap-1">
              <button onClick={handleAiCodeAssist} disabled={isAiCoding} className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded transition-colors" title="AI Assist">
                {isAiCoding ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
              </button>
              <button onClick={handleSmartSave} className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors" title="Save & Lint">
                <Save size={14}/>
              </button>
              <button onClick={() => setEditorOpen(false)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Close">
                <X size={14}/>
              </button>
            </div>
          </div>
          {lintError && <div className="bg-red-900/50 text-red-200 text-[10px] p-2 border-b border-red-500/30 flex items-center gap-2"><AlertTriangle size={12}/> {lintError}</div>}
          <textarea 
            value={editorContent} 
            onChange={(e) => setEditorContent(e.target.value)} 
            className="flex-1 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-xs resize-none outline-none custom-scrollbar leading-relaxed"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-light text-white flex items-center gap-2"><FolderOpen size={20}/> Filesystem</h2>
             <div className="flex gap-2">
               <button onClick={handleScaffold} disabled={isScaffolding} className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600 hover:text-white transition-all">
                 {isScaffolding ? <Loader2 size={16} className="animate-spin"/> : <PackagePlus size={16}/>}
               </button>
               <button onClick={handleNewFile} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"><Plus size={16}/></button>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-3 overflow-y-auto content-start flex-1">
            {files.map(file => (
              <button key={file.id} onClick={() => handleOpenFile(file)} className="aspect-square bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group relative overflow-hidden">
                <div className={`p-3 rounded-full ${file.language === 'json' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  <FileCode size={20}/>
                </div>
                <span className="text-[10px] text-slate-400 truncate w-full px-2 text-center group-hover:text-white transition-colors">{file.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderChatContent = () => (
    <div className="flex flex-col h-full bg-transparent">
       <div className="flex-1 overflow-y-auto space-y-4 p-4 no-scrollbar fade-mask-y">
         {chatMessages.map((msg, idx) => (
           <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
             <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-lg ${
               msg.role === 'user' 
                 ? 'bg-purple-600 text-white rounded-tr-none' 
                 : msg.isSystemAction 
                   ? 'bg-emerald-900/30 text-emerald-400 font-mono border border-emerald-500/30 w-full'
                   : 'bg-white/10 text-slate-200 backdrop-blur-md border border-white/5 rounded-tl-none'
             }`}>
               {msg.role === 'model' && !msg.isSystemAction && <div className="mb-1 opacity-50 text-[9px] uppercase tracking-widest flex items-center gap-1"><Sparkles size={8}/> Gemini Core</div>}
               {msg.text}
             </div>
           </div>
         ))}
         {isChatThinking && (
           <div className="flex justify-start animate-in fade-in">
             <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"/>
               <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"/>
               <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"/>
             </div>
           </div>
         )}
         <div ref={chatEndRef} />
       </div>
       <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
         <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-1 pl-4 flex items-center gap-2 shadow-2xl">
           <input 
             value={chatInput} 
             onChange={(e) => setChatInput(e.target.value)} 
             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
             placeholder="Message Gemini..." 
             className="flex-1 bg-transparent outline-none text-white text-xs placeholder-slate-500"
           />
           <button onClick={() => setVoiceMode(!voiceMode)} className={`p-2 rounded-full transition-all ${voiceMode ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:bg-white/10'}`}>
             {voiceMode ? <Volume2 size={16}/> : <VolumeX size={16}/>}
           </button>
           <button onClick={toggleListening} className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-slate-400'}`}>
             <Mic size={16}/>
           </button>
           <button onClick={handleSendMessage} disabled={!chatInput.trim() || isChatThinking} className="p-2 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-500 transition-all disabled:opacity-50 disabled:scale-95">
             <Send size={16}/>
           </button>
         </div>
       </div>
    </div>
  );

  // --- RENDER: LOCK SCREEN ---
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked && !bootSequence) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 font-sans">
        <div className="relative w-full max-w-sm h-[800px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[url('[https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop)')] bg-cover opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          <div className="z-10 w-full px-8 text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div>
              <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-md border border-white/20"><Lock size={32} className="text-white"/></div>
              <h1 className="text-3xl font-light text-white mb-2 tracking-tight">Gemini OS</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">System Locked</p>
            </div>
            <div className="space-y-3 w-full">
              <button onClick={() => { handleAuthTrigger('google'); setTimeout(() => setIsUnlocked(true), 4000); }} disabled={authLoading} className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors disabled:opacity-50">{authLoading ? <Loader2 size={18} className="animate-spin"/> : <Command size={18}/>} Continue with Google</button>
              <button onClick={() => { handleAuthTrigger('github'); setTimeout(() => setIsUnlocked(true), 4000); }} disabled={authLoading} className="w-full bg-[#24292e] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#2f363d] transition-colors disabled:opacity-50 border border-white/10">{authLoading ? <Loader2 size={18} className="animate-spin"/> : <Github size={18}/>} Continue with GitHub</button>
            </div>
            <div className="text-[10px] text-slate-600 pt-8 flex items-center justify-center gap-2"><Fingerprint size={12}/> Biometric Secured</div>
          </div>
        </div>
      </div>
    );
  }

  if (bootSequence) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-emerald-500 font-mono text-xs p-8">
        <div className="w-full max-w-md space-y-1">
          <p>&gt; CONNECTING TO FIRESTORE... [OK]</p>
          <p>&gt; VERIFYING BIOMETRICS... [OK]</p>
          <p>&gt; DECRYPTING USER SPACE... [OK]</p>
          <p className="animate-pulse">&gt; LAUNCHING SHELL...</p>
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN OS UI ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 font-sans text-gray-100">
      <div className="relative w-full max-w-sm h-[800px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="h-8 w-full bg-transparent flex justify-between items-center px-6 pt-3 text-xs font-medium z-20 mix-blend-difference text-white">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-2">
            <span className={user ? "text-emerald-400" : "text-red-400"}>{user ? <Cloud size={12}/> : <WifiOff size={12}/>}</span>
            {wifiEnabled ? <Wifi size={14} /> : <WifiOff size={14} className="opacity-50"/>}
            <span>{batteryLevel}%</span>
            <Battery size={14} />
          </div>
        </div>
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20 pointer-events-none"></div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden relative bg-slate-900 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: wallpaper ? `url(${wallpaper})` : 'none' }}>
          {!wallpaper && <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black"/>}
          {wallpaper && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"/>}

          {/* TILING MODE RENDERER */}
          {isTilingMode ? (
            <div className="absolute inset-0 top-8 bottom-16 z-20 flex flex-col p-1 gap-1 animate-in zoom-in-95">
              <div className="flex-1 border border-white/10 rounded-lg overflow-hidden relative">
                {renderTerminalContent()}
                <div className="absolute top-1 right-1 text-[9px] bg-white/20 px-1 rounded text-white">TERM</div>
              </div>
              <div className="h-1/2 flex gap-1">
                <div className="flex-1 border border-white/10 rounded-lg overflow-hidden relative">
                  {renderFilesContent()}
                  <div className="absolute top-1 right-1 text-[9px] bg-white/20 px-1 rounded text-white">FILES</div>
                </div>
                <div className="flex-1 border border-white/10 rounded-lg overflow-hidden relative">
                  {renderChatContent()}
                  <div className="absolute top-1 right-1 text-[9px] bg-white/20 px-1 rounded text-white">CHAT</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* NORMAL TABS */}
              {activeTab === 'HOME' && (
                <div className="p-6 pt-12 flex flex-col h-full animate-in fade-in relative z-10">
                  <div className="mb-6">
                    <h1 className="text-4xl font-light tracking-tighter text-white drop-shadow-md">{currentTime.toLocaleDateString([], { weekday: 'long' })}</h1>
                    <div className="flex justify-between items-center">
                      <p className="text-slate-300 text-lg drop-shadow-sm">{currentTime.toLocaleDateString([], { month: 'long', day: 'numeric' })}</p>
                      <button onClick={generateBriefing} disabled={isBriefingLoading} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><RefreshCw size={16} className={`${isBriefingLoading ? 'animate-spin text-purple-400' : 'text-slate-300'}`}/></button>
                    </div>
                    {systemBriefing && <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-purple-200 animate-in slide-in-from-top-2"><span className="font-bold text-purple-400 mr-1">OS:</span> {systemBriefing}</div>}
                  </div>

                  {/* Music */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                        {currentTrack?.coverArt ? <img src={currentTrack.coverArt} className="w-full h-full object-cover"/> : <Disc size={20} className="text-slate-500 m-auto mt-3"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{currentTrack?.title || "Neural Audio"}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{currentTrack?.artist || "Idle"}</p>
                    </div>
                    <button onClick={handleGenerateMusic} disabled={isGeneratingMusic} className="p-2 bg-purple-600 rounded-full text-white">{isGeneratingMusic ? <Loader2 size={12} className="animate-spin"/> : <Play size={12}/>}</button>
                  </div>

                  {/* Notifs */}
                  <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white">{n.app}</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="text-xs text-slate-300">{n.insight || n.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 right-6">
                    <button onClick={handleSimulateNotification} className="p-3 bg-purple-600 rounded-full shadow-lg text-white hover:bg-purple-500 transition-colors"><Bell size={20}/></button>
                  </div>
                </div>
              )}

              {activeTab === 'TERMINAL' && <div className="flex flex-col h-full animate-in slide-in-from-bottom relative z-10">{renderTerminalContent()}</div>}
              {activeTab === 'FILES' && <div className="flex flex-col h-full animate-in zoom-in-95 relative z-10">{renderFilesContent()}</div>}
              {activeTab === 'CHAT' && <div className="flex flex-col h-full animate-in slide-in-from-right relative z-10 pt-8">{renderChatContent()}</div>}

              {activeTab === 'GITHUB' && (
                <div className="flex flex-col h-full animate-in slide-in-from-bottom relative z-10 bg-black/90 backdrop-blur-xl p-4 pt-12">
                  <h2 className="text-xl font-light text-white flex items-center gap-2 mb-4"><Github size={20}/>DevOps Center</h2>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
                      {MOCK_REPOS.map(repo => (
                        <button key={repo.name} onClick={() => setActiveRepo(repo)} className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${activeRepo.name === repo.name ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}>{repo.name}</button>
                      ))}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <section className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2"><h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Code size={14}/> Code Analysis</h3><button onClick={handleAnalyzeRepo} disabled={isAnalyzingRepo} className="text-xs bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-colors">{isAnalyzingRepo ? 'Scanning...' : 'Scan'}</button></div>
                      {repoAnalysis && <div className="bg-black/40 p-3 rounded-lg text-[10px] text-slate-300 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap border border-white/5">{repoAnalysis}</div>}
                    </section>
                    <section className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><GitPullRequest size={14}/> Auto-PR Agent</h3>
                      <div className="flex gap-2 mb-2"><input type="text" value={prFeature} onChange={(e) => setPrFeature(e.target.value)} placeholder="Feature..." className="flex-1 bg-black/40 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-purple-500"/><button onClick={handleCreatePR} disabled={isDraftingPr} className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded text-xs transition-colors">Gen</button></div>
                      {prDraft && <div className="bg-black/40 p-3 rounded-lg text-[10px] text-slate-300 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap border border-white/5">{prDraft}</div>}
                    </section>
                  </div>
                </div>
              )}

              {/* SETTINGS / SEARCH / VISION */}
              {['SETTINGS', 'SEARCH', 'VISION'].includes(activeTab) && (
                <div className="flex flex-col h-full items-center justify-center bg-black/90 backdrop-blur-xl relative z-10 text-slate-500 animate-in zoom-in-95">
                  {activeTab === 'SETTINGS' && (
                    <div className="w-full p-6 pt-12 space-y-4">
                      <h2 className="text-xl text-white mb-4">System Config</h2>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Account</h3>
                        <button onClick={handleLogout} className="w-full bg-red-900/30 text-red-200 py-3 rounded-xl border border-red-500/30 flex items-center justify-center gap-2 hover:bg-red-900/50 transition-all"><LogOut size={16}/> Disconnect Session</button>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Appearance</h3>
                        <div className="flex gap-2">
                          <input type="text" value={wallpaperPrompt} onChange={(e)=>setWallpaperPrompt(e.target.value)} placeholder="e.g. Cyberpunk" className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white"/>
                          <button onClick={handleGenerateWallpaper} disabled={isGeneratingWallpaper} className="bg-purple-600 text-white rounded px-3">{isGeneratingWallpaper?<Loader2 size={16} className="animate-spin"/>:<Sparkles size={16}/>}</button>
                        </div>
                        <button onClick={() => setWallpaper(null)} className="text-xs text-red-400 border border-red-900/50 px-3 py-2 rounded bg-red-900/20 w-full mt-2">Reset Wallpaper</button>
                      </div>
                    </div>
                  )}
                  {activeTab === 'SEARCH' && (
                    <div className="text-center w-full px-4">
                      <Search size={48} className="mx-auto mb-4 opacity-50"/>
                      <p>Universal Search Module</p>
                      <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSearch()} placeholder="Query..." className="mt-4 bg-white/10 border border-white/10 rounded px-4 py-2 text-white w-full max-w-xs"/>
                      {isSearching && <Loader2 size={24} className="animate-spin mx-auto mt-4 text-purple-400"/>}
                      <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((res, i) => (
                          <div key={i} className="bg-white/5 p-2 rounded text-left border border-white/5">
                            <div className="text-xs font-bold text-white">{res.title}</div>
                            <div className="text-[10px] text-slate-400">{res.subtitle}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === 'VISION' && (
                    <div className="flex flex-col items-center w-full p-6">
                      <div className="border-2 border-dashed border-white/20 rounded-2xl w-full h-64 flex items-center justify-center mb-4 relative overflow-hidden">
                        {visionInput ? <img src={visionInput} className="absolute inset-0 w-full h-full object-contain"/> : <Eye size={32} className="opacity-50"/>}
                      </div>
                      <div className="flex gap-2 w-full">
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white/10 p-3 rounded-xl text-white text-xs flex items-center justify-center gap-2"><Upload size={14}/> Upload</button>
                        <button onClick={handleSimulateScreenScan} className="flex-1 bg-white/10 p-3 rounded-xl text-white text-xs flex items-center justify-center gap-2"><Scan size={14}/> Scan</button>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload}/>
                      {visionInput && !isVisionAnalyzing && (
                          <button onClick={handleVisionAnalyze} className="w-full bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2"><Sparkles size={16}/> Analyze Visual</button>
                      )}
                      {visionAnalysis && <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 w-full h-32 overflow-y-auto">{visionAnalysis}</div>}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* BOTTOM NAV */}
        <div className="h-16 bg-black/95 border-t border-white/10 flex justify-around items-center px-1 z-30 overflow-x-auto no-scrollbar">
          <button onClick={() => setIsTilingMode(!isTilingMode)} className={`flex flex-col items-center gap-1 p-2 min-w-[50px] transition-colors ${isTilingMode ? 'text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}>
             <LayoutDashboard size={18} />
             <span className="text-[9px] font-medium">Layout</span>
          </button>
          {[
            { id: 'HOME', icon: Grid, label: 'Home' },
            { id: 'FILES', icon: FileCode, label: 'Files' },
            { id: 'TERMINAL', icon: Terminal, label: 'Term' },
            { id: 'GITHUB', icon: Github, label: 'Dev' },
            { id: 'VISION', icon: Eye, label: 'Vision' },
            { id: 'CHAT', icon: MessageSquare, label: 'Chat' },
            { id: 'SETTINGS', icon: Settings, label: 'Sys' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsTilingMode(false); }} 
              className={`flex flex-col items-center gap-1 p-2 min-w-[50px] transition-colors ${activeTab === tab.id && !isTilingMode ? 'text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}
            >
              <tab.icon size={18} /> 
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-30"></div>
      </div>
    </div>
  );
}
