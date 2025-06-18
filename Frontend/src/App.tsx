import { useState, useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { DomainInput } from './components/scan/DomainInput'
import { SubdomainCard } from './components/scan/SubdomainCard'
import SubdomainDetails from './components/scan/SubdomainDetails'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Terminal } from './components/terminal/Terminal'
import { Terminal as TerminalIcon } from 'lucide-react'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [subdomains, setSubdomains] = useState<typeof mockSubdomains>([])
  const [selectedSubdomain, setSelectedSubdomain] = useState<typeof mockSubdomains[0] | null>(null)
  const [showTrends, setShowTrends] = useState(false)
const [logs, setLogs] = useState<string[]>([]);
const [showTerminal, setShowTerminal] = useState(false)

  useEffect(() => {
  fetch('http://localhost:5000/results')
    .then(res => res.json())
    .then(data => setSubdomains(data))
    .catch(err => console.error('Failed to fetch data:', err));
}, []);

 

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTerminal) {
        setShowTerminal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showTerminal]);

  // Prevent background scroll when terminal is open
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
  const handleScan = async (domain: string) => {
    setIsLoading(true);
    setSubdomains([]);
    setLogs([]); // Clear previous logs
    setShowTerminal(true); // Auto-open terminal when scan starts

    const eventSource = new EventSource(`http://localhost:5000/rescan/stream?domain=${encodeURIComponent(domain)}`);

    eventSource.onopen = () => {
      console.log("✅ SSE connection opened");
      setLogs(prev => [...prev, "Connection established to scan server"]);
    };

    eventSource.onmessage = (event) => {
      console.log("📨 Event received:", event.data); // DEBUG: show raw stream

      try {
        const parsed = JSON.parse(event.data);

        // Check if it's a log message with type field
        if (parsed?.type === 'log') {
          setLogs(prev => [...prev, parsed.message]);
        } 
        // Check if it's subdomain data (has domain field but no type field)
        else if (parsed?.domain && !parsed?.type) {
          setSubdomains(prev => [...prev, parsed]);
        }
        // If it has neither type nor domain, treat as unknown data
        else {
          console.warn("Unknown data format:", parsed);
          setLogs(prev => [...prev, `Unknown data: ${JSON.stringify(parsed)}`]);
        }
      } catch (err) {
        // If parsing fails, treat as plain text log
        console.warn("Failed to parse as JSON, treating as plain text:", event.data);
        setLogs(prev => [...prev, event.data]);
      }
    };

    eventSource.onerror = (err) => {
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
}, 60 * 60 * 1000); // 30 minutes in milliseconds

  };



  return (
    <Layout>
      <div className="space-y-8">
        <DomainInput onScan={handleScan} isLoading={isLoading} />
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
        {subdomains.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Scan Results</h2>
              <button
                onClick={() => setShowTrends(!showTrends)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {showTrends ? 'Hide Trends' : 'Show Trends'}
              </button>
            </div>

            {showTrends && (
              <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Scan Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="date" stroke="#ffffff80" />
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
              {subdomains.map((subdomain) => (
                <SubdomainCard
                  key={subdomain.name}
                  subdomain={subdomain}
                  onClick={() => setSelectedSubdomain(subdomain)}
                />
              ))}
            </div>
          </>
        )}

        {selectedSubdomain && (
          <SubdomainDetails
            subdomain={selectedSubdomain}
            isOpen={!!selectedSubdomain}
            onClose={() => setSelectedSubdomain(null)}
          />
        )}
      </div>
    </Layout>
  )
}

export default App
