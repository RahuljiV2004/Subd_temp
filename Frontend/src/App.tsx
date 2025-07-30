import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import  ReconDashboard  from './components/Statistics/ReconDashboard'
import { Layout } from './components/layout/Layout'
import { DomainInput } from './components/scan/DomainInput'
import { SubdomainCard } from './components/scan/SubdomainCard'
import  {HeroSection } from './components/HeroSection'
import SubdomainDetails from './components/scan/SubdomainDetails'
import DashboardLayout from './components/layout/DashboardLayout'
import { Toaster } from 'react-hot-toast';
import SubdomainDetailsSubfinder from './components/scan/subdomainDetailsSubfinder'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Terminal } from './components/terminal/Terminal'
import { Terminal as TerminalIcon } from 'lucide-react'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import type { SubdomainKnockpy } from './types/subdomain'
import type { SubdomainSubfinder } from './types/subdomain'
import { CompanyAssets } from './components/asset/AssetForm'
import Dash from "./pages/dashboard";
import { mockSubdomains, mockTrendData } from './types/subdomain'
import VerifyOtp from './components/auth/verify-otp'
import { EventSourcePolyfill } from 'event-source-polyfill';
import Swal from 'sweetalert2';
import { SubdomainCardSubfinder } from './components/scan/SubdomainCardSubfinder'
import { VerificationSuccess } from './components/auth/VerificationPage'
import { Navbar } from './components/layout/Navbar'
function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  // const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [knockpySubdomains, setKnockpySubdomains] = useState<Subdomain[]>([]);
const [subfinderSubdomains, setSubfinderSubdomains] = useState<SubdomainSubfinder[]>([]);
  // const [selectedSubdomain, setSelectedSubdomain] = useState<Subdomain | null>(null)
  const [selectedSubdomain, setSelectedSubdomain] = useState<SubdomainKnockpy | SubdomainSubfinder | null>(null);

  const [showTrends, setShowTrends] = useState(false)
  const [logs, setLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false)
// const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const [selectedTool, setSelectedTool] = useState(() => {
    return localStorage.getItem('selectedTool') || 'knockpy';
  });

    // Save to localStorage whenever tool changes
  useEffect(() => {
    localStorage.setItem('selectedTool', selectedTool);
  }, [selectedTool]);

useEffect(() => {
  console.log("🔍 useEffect triggered, selectedTool:", selectedTool);

  // Clear previous data first
  setKnockpySubdomains([]);
  setSubfinderSubdomains([]);

  if (selectedTool === "knockpy") {
    console.log("📡 Fetching knockpy data...");
    fetch('http://localhost:5000/results', {
      credentials: 'include'  // ✅ include cookies/JWT
    })
      .then(res => res.json())
      .then(data => setKnockpySubdomains(data))
      .catch(err => console.error('Failed to fetch knockpy data:', err));
  } else if (selectedTool === "subfinder") {
    console.log("📡 Fetching subfinder data...");
    fetch('http://localhost:5000/resultssubfinder', {
      credentials: 'include'  // ✅ include cookies/JWT
    })
      .then(res => res.json())
      .then(data => setSubfinderSubdomains(data))
      .catch(err => console.error('Failed to fetch subfinder data:', err));
  }
}, [selectedTool]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTerminal) {
        setShowTerminal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showTerminal]);

  useEffect(() => {
    if (showTerminal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showTerminal]);
  const [searchTerm, setSearchTerm] = useState('');
const [trendData, setTrendData] = useState([]);
const [trendLoading, setTrendLoading] = useState(false);

useEffect(() => {
  const fetchTrends = async () => {
    try {
      setTrendLoading(true);
      const res = await fetch("http://localhost:5000/scan-trends", {
        credentials: "include",
      });
      const data = await res.json();
      setTrendData(data);
    } catch (err) {
      console.error("Error fetching scan trends", err);
    } finally {
      setTrendLoading(false);
    }
  };

  fetchTrends();


}, []);


const handleScan = async (domain: string, tool: string) => {
  setIsLoading(true);
  // setSubdomains([]);
  setLogs([]);
  setShowTerminal(true);
  setSelectedTool(tool);

  if (tool === "knockpy") {
    setKnockpySubdomains([]);
    // ✅ Use SSE
    const eventSource = new EventSourcePolyfill(
      `http://localhost:5000/rescan/stream?domain=${encodeURIComponent(domain)}`,
      {
        withCredentials: true,
        heartbeatTimeout: 1200000
      }
    );

    eventSource.onopen = () => {
      console.log("✅ SSE connection opened");
      setLogs(prev => [...prev, "Connection established to scan server"]);
    };

    eventSource.onmessage = (event) => {
      console.log("📨 Event received:", event.data);
      try {
        const parsed = JSON.parse(event.data);
        if (parsed?.type === 'log') {
          setLogs(prev => [...prev, parsed.message]);
        } else if (parsed?.domain && !parsed?.type) {
          setKnockpySubdomains(prev => [...prev, parsed as SubdomainKnockpy]);
        } else {
          console.warn("Unknown data format:", parsed);
          setLogs(prev => [...prev, `Unknown data: ${JSON.stringify(parsed)}`]);
        }
      } catch (err) {
        console.warn("Failed to parse as JSON, treating as plain text:", event.data);
        setLogs(prev => [...prev, event.data]);
      }
    };

    eventSource.onerror = (err) => {
      if (err && err.status === 403) {
      
        Swal.fire({
          icon: 'error',
          title: 'Access Forbidden',
          text: 'Please scan only your organisation subdomains.',
          background: '#000',
          color: '#fff',
          confirmButtonText: 'Got it!',
          confirmButtonColor: 'green',
          customClass: { confirmButton: 'custom-confirm-button' },
           popup: 'z-[10000]' // <-- Add high z-index
        });
      }
      console.error("❌ SSE stream error:", err);
      setLogs(prev => [...prev, "❌ Connection error occurred"]);
      eventSource.close();
      setIsLoading(false);
    };

    setTimeout(() => {
      console.log("⏱️ Stream timeout reached, closing connection.");
      setLogs(prev => [...prev, "⏱️ Scan timeout reached - connection closed"]);
      eventSource.close();
      setIsLoading(false);
    },10* 60 * 60 * 1000);
} 

  else if (tool === "subfinder") {
  setSubfinderSubdomains([]); 

  const eventSource = new EventSourcePolyfill(
    `http://localhost:5000/rescan/stream_subfinder_dnsx_httpx?domain=${encodeURIComponent(domain)}`,
    {
      withCredentials: true,
      heartbeatTimeout: 120000000
    }
  );

  eventSource.onopen = () => {
    console.log("✅ SSE connection opened");
    setLogs(prev => [...prev, "Connection established to scan server"]);
  };

  eventSource.onmessage = (event) => {
  console.log("📨 Event received:", event.data);
  try {
    // ✅ Strip SSE prefix if present
    let rawData = event.data;
    if (rawData.startsWith('data: ')) {
      rawData = rawData.substring(6); // Remove "data: " prefix
    }
    
    const parsed = JSON.parse(rawData);
    
    // Simple debug - just check what we're dealing with
    if (parsed && typeof parsed === 'object') {
      console.log("DEBUG: Object keys:", Object.keys(parsed));
    }

    // Handle control messages first
    if (parsed?.type === 'log') {
      setLogs(prev => [...prev, parsed.message]);
    } 
    else if (parsed?.type === 'done') {
      setLogs(prev => [...prev, "✅ Scan finished!"]);
    } 
    else if (parsed?.type === 'error') {
      setLogs(prev => [...prev, `❌ ${parsed.message}`]);
    }
    // ✅ Process subdomain results (check for subdomain property)
    else if (parsed && parsed.subdomain) {
      console.log("✅ Processing subdomain:", parsed.subdomain);
      setSubfinderSubdomains(prev => [...prev, parsed as SubdomainSubfinder]);
    }
    // Only log unknown formats for actual unknown data
    else {
      console.warn("Unknown data format:", parsed);
      setLogs(prev => [...prev, `Unknown data: ${JSON.stringify(parsed)}`]);
    }
  } catch (err) {
    console.warn("Failed to parse as JSON, treating as plain text:", event.data);
    setLogs(prev => [...prev, event.data]);
  }
};

  eventSource.onerror = (err) => {
    if (err && err.status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'Access Forbidden',
        text: 'Please scan only your organisation subdomains.',
        background: '#000',
        color: '#fff',
        confirmButtonText: 'Got it!',
        confirmButtonColor: 'green',
        customClass: { confirmButton: 'custom-confirm-button' }
      });
    }
    console.error("❌ SSE stream error:", err);
    setLogs(prev => [...prev, "❌ Connection error occurred"]);
    eventSource.close();
    setIsLoading(false);
  };

  setTimeout(() => {
    console.log("⏱️ Stream timeout reached, closing connection.");
    setLogs(prev => [...prev, "⏱️ Scan timeout reached - connection closed"]);
    eventSource.close();
    setIsLoading(false);
  }, 10 * 60 * 60 * 1000);
}

  else {
    console.error("Unknown tool:", tool);
    setLogs(prev => [...prev, `❌ Unknown tool: ${tool}`]);
    setIsLoading(false);
  }
};


  return (
    <Layout>
      <HeroSection />

      <div className="space-y-8">
        {/* <DomainInput onScan={handleScan} isLoading={isLoading} /> */}
         <DomainInput 
        onScan={handleScan}
        isLoading={isLoading} // your loading state
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
      />
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 rounded-lg transition-colors border border-green-700"
          >
            <TerminalIcon size={18} />
            <span>{showTerminal ? 'Hide Terminal' : 'Show Terminal'}</span>
            {logs.length > 0 && (
              <span className="bg-green-500 text-black px-2 py-1 rounded-full text-xs">
                {logs.length}
              </span>
            )}
          </button>
        </div>
        <Terminal
          logs={logs}
          isOpen={showTerminal}
          onClose={() => setShowTerminal(false)}
          onMinimize={() => setShowTerminal(false)}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  
</div>
<div className="w-full flex justify-center mt-8">
  <div className="relative w-full sm:w-2/3 md:w-1/2">
    <input
      type="text"
      placeholder="Search subdomains..."
      className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm text-white bg-white/5 placeholder-white/40 shadow-[inset_0_0_0.5px_rgba(255,255,255,0.2)] backdrop-blur-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
    />
    
    {/* Search Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 104 10.5a6.5 6.5 0 0013 0z"
      />
    </svg>
  </div>
</div>


        {/* {subdomains.length > 0 && ( */}
         {(selectedTool === "subfinder" ? subfinderSubdomains?.length : knockpySubdomains?.length) > 0 && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Scan Results</h2>
              {/* <button
                onClick={() => setShowTrends(!showTrends)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {showTrends ? 'Hide Trends' : 'Show Trends'}
              </button> */}
            </div>

            {showTrends && (
  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-4">Daily Scan Trends</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
  <LineChart data={trendData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
    
    <XAxis
      dataKey="_id"
      stroke="#ffffff80"
      tick={{ fill: '#ffffffa0', fontSize: 12 }}
      label={{
        value: 'Scan_ID',
        position: 'insideBottomRight',
        offset: -5,
        fill: '#ffffffb0',
        fontSize: 14,
      }}
    />

    <YAxis stroke="#ffffff80" />
    
    <Tooltip
      contentStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
      }}
    />
    
    <Line
      type="monotone"
      dataKey="subdomains"
      stroke="#8884d8"
      strokeWidth={2}
      dot={{ fill: '#8884d8' }}
    />
    
    <Line
      type="monotone"
      dataKey="vulnerabilities"
      stroke="#82ca9d"
      strokeWidth={2}
      dot={{ fill: '#82ca9d' }}
    />
  </LineChart>
</ResponsiveContainer>

    </div>
  </div>
)}


           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 
  {(selectedTool === "subfinder" ? subfinderSubdomains : knockpySubdomains).filter(sub => (selectedTool === "subfinder" ? sub.subdomain : sub.domain).toLowerCase().includes(searchTerm)).map(
    subdomain =>
                selectedTool === "subfinder" ? (
                  <SubdomainCardSubfinder
                    key={subdomain.subdomain}
                    subdomain={subdomain}
                    onSelect={() => setSelectedSubdomain(subdomain)}
                  />
                ) : (
                  <SubdomainCard
                    key={subdomain.domain}
                    subdomain={subdomain}
                    onClick={() => setSelectedSubdomain(subdomain)}
                  />
                )
              )}
              {(selectedTool === "subfinder" ? subfinderSubdomains : knockpySubdomains)
  .filter(sub => (selectedTool === "subfinder" ? sub.subdomain : sub.domain).toLowerCase().includes(searchTerm))
  .length === 0 && (
    <div className="text-white text-center col-span-full">
      No subdomains found.
    </div>
)}

</div>


          </>
        )}

      
{selectedSubdomain && (
  selectedTool === "subfinder" ? (
    <SubdomainDetailsSubfinder
      subdomain={selectedSubdomain as SubdomainSubfinder}
      onClose={() => setSelectedSubdomain(null)}
    />
  ) : (
    <SubdomainDetails
      subdomain={selectedSubdomain as SubdomainKnockpy}
      onClose={() => setSelectedSubdomain(null)}
    />
  )
)}

      </div>
    </Layout>
  );
}

function App() {
  return (
   <>
   <Toaster position="top-right" reverseOrder={false} />
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/verification-success" element={<ProtectedRoute><VerificationSuccess /></ProtectedRoute>} />
          {/* <Route path="/dashboard" element={<ProtectedRoute><Dash /></ProtectedRoute>} /> */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ReconDashboard />
              </ProtectedRoute>
            }
          />
          
  <Route path="/assets" element={<ProtectedRoute><CompanyAssets /></ProtectedRoute>} />


          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
    </>
 
  );
}

export default App;
