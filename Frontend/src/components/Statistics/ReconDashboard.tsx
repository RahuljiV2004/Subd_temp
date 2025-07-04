
import { useState, useEffect } from 'react';
import { Shield, Search, AlertTriangle, Clock, Download, Code, Filter, Play, Globe, Server, MapPin, Activity, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Layout } from '../layout/Layout';
import toast from 'react-hot-toast';
import { startOfWeek, format } from "date-fns";
// Mock UI components
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/50 border  rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-400 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", variant = "default", size = "default", onClick, disabled }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white",
    outline: "border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300"
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Table = ({ children }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead>
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody>
    {children}
  </tbody>
);

const TableRow = ({ children, className = "" }) => (
  <tr className={`border-b transition-colors hover:bg-slate-700/50 ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`p-4 align-middle ${className}`}>
    {children}
  </td>
);

export default function ReconDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

const fetchData = async (scanId = null) => {
  try {
    setLoading(true);

    const url = scanId
      ? `http://localhost:5000/resultssubfinderchart?scan_id=${scanId}`
      : `http://localhost:5000/resultssubfinderchart`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    setData(Array.isArray(result) ? result : []);
    setLastUpdate(new Date());
    setError(null);
  } catch (err) {
    setError(err.message);
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};


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

const sortedTrendData = Array.isArray(trendData)
  ? [...trendData].sort(
      (a, b) =>
        new Date(a.scanned_at_clean).getTime() -
        new Date(b.scanned_at_clean).getTime()
    )
  : [];

// 👇 Group by week
const weeklyTrendData = Object.values(
  sortedTrendData.reduce((acc, curr) => {
    const date = new Date(curr.scanned_at_clean);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekKey = format(weekStart, "yyyy-MM-dd");

    if (!acc[weekKey]) {
      acc[weekKey] = {
        week: weekKey,
        subdomains: 0,
        count: 0,
      };
    }

    acc[weekKey].subdomains += curr.subdomains;
    acc[weekKey].count += 1;

    return acc;
  }, {} as Record<string, any>)
);

// Optional: average subdomains per week
const aggregatedTrendData = weeklyTrendData.map((item) => ({
  ...item,
  subdomains: Math.round(item.subdomains / item.count),
}));
  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Get unique domains for filter
  const uniqueDomains = [...new Set(data.map(item => {
    const subdomain = item.subdomain || '';
    const parts = subdomain.split('.');
    return parts.length > 2 ? parts.slice(-2).join('.') : subdomain;
  }))].filter(Boolean);

  // Filter data based on selected domain
  const filteredData = selectedDomain 
    ? data.filter(item => item.subdomain && item.subdomain.includes(selectedDomain))
    : data;

  // Calculate statistics
  const stats = {
    totalSubdomains: data.length,
    activeSubdomains: data.filter(item => item.httpx_status_code && item.httpx_status_code >= 200 && item.httpx_status_code < 400).length,
    withCertificates: data.filter(item => item.httpx_tls_probe_status).length,
    expiringCerts: data.filter(item => {
      if (!item.httpx_tls_not_after) return false;
      const expiryDate = new Date(item.httpx_tls_not_after);
      const now = new Date();
      const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 60 && daysUntilExpiry > 0;
    }).length
  };

  // Technology distribution
  const techDistribution = {};
  data.forEach(item => {
    if (item.httpx_tech && Array.isArray(item.httpx_tech)) {
      item.httpx_tech.forEach(tech => {
        techDistribution[tech] = (techDistribution[tech] || 0) + 1;
      });
    }
    if (item.httpx_webserver) {
      techDistribution[item.httpx_webserver] = (techDistribution[item.httpx_webserver] || 0) + 1;
    }
  });

  const topTechnologies = Object.entries(techDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([name, count], index) => ({
      name,
      count,
      color: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#06b6d4', '#22c55e', '#6366f1'
      ][index % 8]
    }));

  // Port distribution
  const portDistribution = {};
  data.forEach(item => {
    if (item.httpx_port) {
      const port = item.httpx_port.toString();
      portDistribution[port] = (portDistribution[port] || 0) + 1;
    }
  });

  const topPorts = Object.entries(portDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([port, count]) => ({ port, count }));

  // Status code distribution
  const statusDistribution = {};
  data.forEach(item => {
    if (item.httpx_status_code) {
      const status = item.httpx_status_code.toString();
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    }
  });

  // Certificate expiry warnings
  const certificateWarnings = data
    .filter(item => {
      if (!item.httpx_tls_not_after) return false;
      const expiryDate = new Date(item.httpx_tls_not_after);
      const now = new Date();
      const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    })
    .map(item => {
      const expiryDate = new Date(item.httpx_tls_not_after);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      return {
        subdomain: item.subdomain,
        expiry: item.httpx_tls_not_after,
        daysLeft: daysUntilExpiry
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const exportData = (format) => {
    const dataToExport = filteredData.map(item => ({
      subdomain: item.subdomain,
      ip: item.dnsx_a ? item.dnsx_a.join(', ') : '',
      httpx_status: item.httpx_status_code,
      httpx_title: item.httpx_title,
      httpx_tech: item.httpx_tech ? item.httpx_tech.join(', ') : '',
      webserver: item.httpx_webserver,
      cert_expiry: item.httpx_tls_not_after,
      cert_issuer: item.httpx_tls_issuer_cn
    }));

    if (format === 'csv') {
      const csv = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recon-results-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (error) {
    return (
      <Layout>
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-300">Error Loading Data</h3>
                <p className="text-red-400 mt-1">{error}</p>
                <Button onClick={fetchData} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Scan Insights
          </h1>
          <p className="text-slate-400 mt-2">
            {lastUpdate ? `Last updated: ${lastUpdate.toLocaleString()}` : 'Loading...'}
            {loading && <span className="ml-2 animate-pulse">🔄</span>}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>
         <Card className="w-full bg-slate-800/50 border-l-4 border-slate-700 border-blue-700 shadow-md hover:shadow-purple-500/20 transition">
  <CardHeader>
    <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient">
      Daily Scan Trends
    </CardTitle>
    <CardDescription className="text-slate-400 mt-1">
      Visual trend of subdomains and vulnerabilities detected
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="h-[300px] overflow-x-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
      <ResponsiveContainer width="100%" height="100%">
       <LineChart
  data={sortedTrendData}
  onClick={(e: any) => {
    if (e?.activePayload?.[0]?.payload?._id) {
      const selectedScanId = e.activePayload[0].payload._id;
      // toast.success(`Loading scan: ${selectedScanId.slice(0, 8)}...`);
      fetchData(selectedScanId); // your custom fetch
    }
  }}
>
  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />

  <XAxis
    dataKey="scanned_at_clean"
    stroke="#ffffff80"
    tickFormatter={(value) =>
      new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        // hour: "2-digit",
        // minute: "2-digit"
      })
    }
    tick={{ fill: "#ffffffa0", fontSize: 12 }}
    label={{
      value: "Scan Date",
      position: "insideBottomRight",
      offset: -5,
      fill: "#ffffffb0",
      fontSize: 14
    }}
  />

  <YAxis stroke="#ffffff80" />

  <Tooltip
    contentStyle={{
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px"
    }}
    labelStyle={{ color: "#fff" }}
    itemStyle={{ color: "#fff" }}
    formatter={(value: number, name: string) => [`${value}`, name]}
    // labelFormatter={(label: string) =>
    //   `Scanned At: ${new Date(label).toLocaleString("en-IN")}`
    // }
    labelFormatter={(label: string) => {
  // Remove timezone offset to prevent UTC normalization
  const cleaned = label.replace(/\+\d{2}:\d{2}$/, '');
  return `Scanned At: ${new Date(cleaned).toLocaleString("en-IN")}`;
}}


  />

  <Line
    type="monotone"
    dataKey="subdomains"
    stroke="#8884d8"
    strokeWidth={2}
    dot={{ fill: "#8884d8" }}
  />

  {/* <Line
    type="monotone"
    dataKey="vulnerabilities"
    stroke="#82ca9d"
    strokeWidth={2}
    dot={{ fill: "#82ca9d" }}
  /> */}
</LineChart>


      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Subdomains</CardTitle>
            <Globe className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSubdomains.toLocaleString()}</div>
            <p className="text-xs text-blue-400">Discovered subdomains</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Subdomains</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeSubdomains.toLocaleString()}</div>
            <p className="text-xs text-green-400">
              {stats.totalSubdomains > 0 ? Math.round((stats.activeSubdomains / stats.totalSubdomains) * 100) : 0}% response rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">TLS Certificates</CardTitle>
            <Shield className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.withCertificates}</div>
            <p className="text-xs text-cyan-400">SSL/TLS enabled</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Expiring Certificates</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.expiringCerts}</div>
            <p className="text-xs text-yellow-400">Within 60 days</p>
          </CardContent>
        </Card>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 
  {/* <Card className="bg-slate-800/50 border-l-4 border-lime-400 border-lime-700 shadow-md hover:shadow-lime-400/30 transition"> */}
<Card className="bg-slate-800/50 border-l-4 border-sky-400 shadow-md hover:shadow-sky-400/30 transition" >


  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-semibold text-blue-200">Total Subdomains</CardTitle>
    <Globe className="h-4 w-4 text-blue-300" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-white">{stats.totalSubdomains.toLocaleString()}</div>
    <p className="text-xs text-blue-300">Discovered subdomains</p>
  </CardContent>
</Card>



  <Card className="bg-slate-800/50 border-l-4 border-emerald-400 border-emerald-700 shadow-md hover:shadow-emerald-400/30 transition" >

    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-green-300">Active Subdomains</CardTitle>
      <Activity className="h-4 w-4 text-green-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{stats.activeSubdomains.toLocaleString()}</div>
      <p className="text-xs text-green-400">
        {stats.totalSubdomains > 0 ? Math.round((stats.activeSubdomains / stats.totalSubdomains) * 100) : 0}% response rate
      </p>
    </CardContent>
  </Card>

  <Card className="bg-slate-800/50 border-l-4 border-cyan-400 border-cyan-700 shadow-md hover:shadow-cyan-400/30 transition" >


    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-cyan-300">TLS Certificates</CardTitle>
      <Shield className="h-4 w-4 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{stats.withCertificates}</div>
      <p className="text-xs text-cyan-400">SSL/TLS enabled</p>
    </CardContent>
  </Card>

  {/* Expiring Certificates */}
  <Card className="bg-slate-800/50 border-l-4 border-yellow-500 border-slate-700 shadow-md hover:shadow-yellow-500/20 transition">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-yellow-300">Expiring Certificates</CardTitle>
      <Clock className="h-4 w-4 text-yellow-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{stats.expiringCerts}</div>
      <p className="text-xs text-yellow-400">Within 60 days</p>
    </CardContent>
  </Card>
</div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     

  {/* Technology Distribution */}
  <Card className="bg-slate-800/50 border-l-4 border-blue-500 border-slate-700 shadow-md hover:shadow-blue-500/20 transition">
    <CardHeader>
      <CardTitle className="text-lg font-bold flex items-center gap-2">
        <Code className="w-5 h-5 text-blue-400 drop-shadow" />
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
          Technology Distribution
        </span>
      </CardTitle>
      <CardDescription className="text-slate-400 mt-1">
        Detected technologies across subdomains
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {topTechnologies.map((tech, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow"
                style={{ backgroundColor: tech.color }}
              />
              <span className="text-slate-200 font-medium">{tech.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-slate-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: tech.color,
                    width: `${topTechnologies.length > 0
                      ? (tech.count / Math.max(...topTechnologies.map(t => t.count))) * 100
                      : 0}%`
                  }}
                />
              </div>
              <span className="text-slate-300 text-sm font-mono w-8 text-right">{tech.count}</span>
            </div>
          </div>
        ))}
        {topTechnologies.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No technology data available
          </div>
        )}
      </div>
    </CardContent>
  </Card>

  {/* Port Distribution */}
  <Card className="bg-slate-800/50 border-l-4 border-green-800 border-slate-700 shadow-md hover:shadow-green-500/20 transition">
    <CardHeader>
      <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400 bg-clip-text text-transparent animate-gradient">
        Port Distribution
      </CardTitle>
      <CardDescription className="text-slate-400 mt-1">
        Most common open ports
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {topPorts.map((port, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow" />
              <span className="text-slate-200 font-medium font-mono">Port {port.port}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-slate-600 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${topPorts.length > 0
                      ? (port.count / Math.max(...topPorts.map(p => p.count))) * 100
                      : 0}%`
                  }}
                />
              </div>
              <span className="text-slate-300 text-sm font-mono w-8 text-right">{port.count}</span>
            </div>
          </div>
        ))}
        {topPorts.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No port data available
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</div>

      

    
      {certificateWarnings.length > 0 && (
  // <Card className="bg-slate-800/50 border-l-4 border-yellow-400 shadow-md hover:shadow-yellow-500/10 transition">
  <Card className="bg-slate-800/50 border-l-4 border-blue-500 border-slate-700 shadow-md hover:shadow-blue-500/20 transition">
    <CardHeader>
      <CardTitle className="text-lg font-bold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />
        <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          Certificate Expiry Warnings
        </span>
      </CardTitle>
      <CardDescription className="text-slate-400 mt-1">
        Certificates expiring within 90 days
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {certificateWarnings.slice(0, 100).map((cert, index) => {
          const severityClass =
            cert.daysLeft <= 7
              ? 'bg-red-900 text-red-300 ring-red-500/30'
              : cert.daysLeft <= 30
              ? 'bg-yellow-900 text-yellow-300 ring-yellow-400/20'
              : 'bg-blue-900 text-blue-300 ring-blue-500/20';

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition"
            >
              <span className="text-blue-400 font-mono truncate max-w-[250px] sm:max-w-[300px]">{cert.subdomain}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-mono text-sm">
                  {new Date(cert.expiry).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ring-1 ${severityClass}`}
                >
                  {cert.daysLeft} days
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}

      <Card className="bg-slate-800/50 border-slate-700 border-l-4 border-gradient-to-b from-purple-500 to-pink-500">
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Subdomain Results
      </CardTitle>
      <CardDescription className="text-slate-400">
        {filteredData.length} subdomains found
      </CardDescription>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
      <Table className="table-fixed w-full">
        <TableHeader className="sticky top-0 bg-slate-800/70 backdrop-blur border-b border-slate-700 z-10">
          <TableRow>
            <TableHead className="text-slate-300 w-1/5">Subdomain</TableHead>
            <TableHead className="text-slate-300 w-1/6">IP Address</TableHead>
            <TableHead className="text-slate-300 w-1/12">Status</TableHead>
            <TableHead className="text-slate-300 w-1/5">Title</TableHead>
            <TableHead className="text-slate-300 w-1/5">Technologies</TableHead>
            <TableHead className="text-slate-300 w-1/12">TLS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.slice(0, 50).map((item, index) => (
            <TableRow key={index} className="border-slate-700 hover:bg-slate-700/50 transition">
              <TableCell className="text-blue-400 font-mono text-sm truncate max-w-[200px]">{item.subdomain}</TableCell>
              <TableCell className="text-slate-300 font-mono text-sm">
                {item.dnsx_a ? item.dnsx_a.slice(0, 2).join(', ') : 'N/A'}
              </TableCell>
              <TableCell>
                {item.httpx_status_code ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.httpx_status_code >= 200 && item.httpx_status_code < 300
                      ? 'bg-green-900 text-green-300'
                      : item.httpx_status_code >= 300 && item.httpx_status_code < 400
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {item.httpx_status_code}
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs">No response</span>
                )}
              </TableCell>
              <TableCell className="text-slate-300 text-sm max-w-[220px] truncate">
                {item.httpx_title || 'N/A'}
              </TableCell>
              <TableCell className="text-slate-300 text-sm truncate">
                {item.httpx_tech ? item.httpx_tech.slice(0, 2).join(', ') : 'N/A'}
              </TableCell>
              <TableCell>
                {item.httpx_tls_probe_status ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-slate-500">✗</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {filteredData.length > 50 && (
      <div className="mt-4 text-center text-slate-400 text-sm">
        Showing first 50 results of {filteredData.length} total
      </div>
    )}
  </CardContent>
</Card>

    </Layout>
  );
}