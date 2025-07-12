
import { useEffect,useState } from 'react';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRef } from 'react';
import { RefreshCw } from "lucide-react";
import FFUFResultSection from './DirectoryTree';
import PDFDownloadButton from './PDFDownloadButton'
import SubfinderPDFDownloadButton from './PDFDownloadSubfinder';
import { 
  X, 
  Globe, 
  Shield, 
  Server, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Circle, 
  CircleDot, 
  CircleDashed 
} from 'lucide-react';
import { ShieldCheck, Link2, Info, Wrench, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { SubdomainSubfinder} from '../../types/subdomain';

interface SubdomainDetailsSubfinderProps {
  subdomain: SubdomainSubfinder;
  onClose: () => void;
}
  const latitude = 51.5074;
  const longitude = -0.1278;

  
export default function SubdomainDetails({ subdomain, onClose }: SubdomainDetailsSubfinderProps) {
  // ✅ Put your own Mapbox Access Token here
   const [isOpen, setIsOpen] = useState(false);
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  mapboxgl.accessToken = 'pk.eyJ1IjoicmFodWwxMjM0amkiLCJhIjoiY20xdXFyOWloMDNxbTJqczdwMGYxbDRqeiJ9.vyf3dcUVhcM8a5R_K5VC-A';
  
  // Dynamic border color based on risk:
  const borderColor =
    alert.risk === "Low" ? "border-green-500" :
    alert.risk === "Medium" ? "border-yellow-500" :
    alert.risk === "High" ? "border-red-500" : "border-gray-500";
  
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle2 className="text-green-500" size={20} />;
    if (status >= 300 && status < 400) return <AlertCircle className="text-yellow-500" size={20} />;
    return <XCircle className="text-red-500" size={20} />;
  };



  const getSSLStatus = () => {
    if (subdomain.cert?.[0]) {
      return (
        <span className="flex items-center gap-1">
          <Shield className="text-green-500" size={16} />
          <span className="text-green-500">Secure</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1">
        <Shield className="text-red-500" size={16} />
        <span className="text-red-500">Insecure</span>
      </span>
    );
  };
  const [loading, setLoading] = useState(false);
  const [dirBruteLoading, setDirBruteLoading] = useState(false);
  const [ffufResults, setFfufResults] = useState<string[]>([]);

const handleDirBruteClick = async () => {
  setDirBruteLoading(true);
  try {
    const response = await fetch("http://localhost:5000/api/scan_ffuf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subdomain: subdomain.subdomain,
        wordlist: "common.txt",
      }),
    });

    const data = await response.json();
    console.log("FFUF scan response:", data);
    setFfufResults(data.ffuf?.results || []);
  } catch (error) {
    console.error("Directory Bruteforce Error:", error);
  } finally {
    setDirBruteLoading(false);
  }
};

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/scan_subdomain_subfinder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         body: JSON.stringify({ subdomain: subdomain.subdomain }),
      });

      const data = await response.json();
      setPorts(data.nmap.open_ports)
      console.log("Scan response:", data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  
const getStatusBadge = (status?: number | null) => {
  if (typeof status !== "number" || isNaN(status)) {
    return (
      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300 border border-zinc-500 shadow-inner">
        N/A
      </span>
    );
  }

  let color: "green" | "yellow" | "red" = "red";

  if (status >= 200 && status < 300) {
    color = "green";
  } else if (status >= 300 && status < 400) {
    color = "yellow";
  }

  const colors = {
    green: "bg-emerald-600 text-emerald-100 border-emerald-500",
    yellow: "bg-yellow-500 text-yellow-50 border-yellow-400",
    red: "bg-rose-600 text-rose-100 border-rose-500",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border shadow-inner ${colors[color]}`}
    >
      {status}
    </span>
  );
};


  const [ports, setPorts] = useState(subdomain.nmap?.open_ports || []);

  // ✅ On mount: if no open_ports, fetch once from DB
  useEffect(() => {
    if (!subdomain.nmap?.open_ports?.length) {
      fetchPorts();
    } else {
      // If you open another card with data, reset local state to prop
      setPorts(subdomain.nmap.open_ports);
    }
  }, [subdomain]);
  useEffect(() => {
  if (!subdomain.ffuf?.results?.length) {
    fetchFfufResults();
  } else {
    // If another subdomain card is opened, reset local state
    setFfufResults(subdomain.ffuf.results);
  }
}, [subdomain]);


const fetchFfufResults = async () => {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/getFfuf_subfinder?subdomain=${subdomain.subdomain}`);
    const data = await res.json();
    setFfufResults(data.ffuf?.results || []);
  } catch (err) {
    console.error("Error fetching FFUF results:", err);
  }
};


  const fetchPorts = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/getPorts_subfinder?subdomain=${subdomain.subdomain}`);
      const data = await res.json();
      setPorts(data.open_ports || []);
    } catch (err) {
      console.error("Error fetching ports:", err);
    }
  };
 

  const [refreshing, setRefreshing] = useState(false);

const refreshPorts = async () => {
  setRefreshing(true);
  try {
    await fetchPorts(); // or your fetch logic
  } catch (err) {
    console.error("Error refreshing:", err);
  } finally {
    setRefreshing(false);
  }
};



const [location, setLocation] = useState(null);
const [expandedAlerts, setExpandedAlerts] = useState({});
  // ✅ Fetch Lat/Lng from first IP
  useEffect(() => {
    const firstIP = subdomain.dnsx_a?.[0];
    if (firstIP) {
      const getLatLngFromIP = async (ip: string) => {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    const lat = data.lat;
    const lng = data.lon; // Note: ip-api uses 'lon' not 'lng'
    setLocation({ lat, lng });
  } catch (error) {
    console.error("Error fetching location:", error);
  }
};

      getLatLngFromIP(firstIP);
    }
  }, [subdomain]);

    // ✅ Initialize Map when location is available
  useEffect(() => {
    if (location && mapContainer.current && !mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [location.lng, location.lat],
        zoom: 8,
      });

      // ✅ Add marker
      new mapboxgl.Marker().setLngLat([location.lng, location.lat]).addTo(mapInstance.current);
    }
  }, [location]);

  

  return (
    <div className="modal-overlay " onClick={onClose}>
      <div className="modal-panel " onClick={e => e.stopPropagation()}>
        
<div className="modal-header flex items-center justify-between gap-4">
  {/* Domain name and Visit button group */}
  <div className="flex items-center gap-4 flex-grow overflow-hidden">
    <h2 className="modal-title font-mono text-2xl tracking-wider truncate">
      <span className="text-primary-70">&gt;</span> {subdomain.subdomain}
    </h2>
    <a
      href={`http://${subdomain.subdomain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-base px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/20 transition shrink-0"
    >
      Visit
    </a>
  </div>

  {/* Action buttons */}
  <div className="flex items-center gap-2 shrink-0">
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-base px-4 py-1.5 rounded-full border text-indigo-400 transition shrink-0
        ${loading 
          ? "bg-indigo-500/30 border-indigo-500/50 cursor-not-allowed" 
          : "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20"
        }`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Running...
        </span>
      ) : (
        "Run Nmap"
      )}
    </button>
      {/* Directory Bruteforce Button */}
  <button
    onClick={handleDirBruteClick}
    disabled={dirBruteLoading}
    className={`text-base px-4 py-1.5 rounded-full border text-green-500 transition shrink-0
      ${dirBruteLoading 
        ? "bg-green-500/30 border-green-500/50 cursor-not-allowed" 
        : "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
      }`}
  >
    {dirBruteLoading ? (
      <span className="flex items-center gap-2">
        <svg
          className="animate-spin h-4 w-4 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        Scanning...
      </span>
    ) : (
      "Directory Bruteforce"
    )}
  </button>
    

    <SubfinderPDFDownloadButton subdomain={subdomain} />
  </div>

  {/* Close button */}
  <button className="modal-close shrink-0" onClick={onClose}>
    <X size={24} />
  </button>
</div>

  

        <div className="modal-content">

          <div className="modal-section">
            {/* <h3 className="modal-section-title text-green-500 text-xl font-bold">Basic Information</h3> */}
            <h3 className="modal-section-title text-green-500 text-xl font-bold ">
  &gt;&gt; Basic Information
</h3>


            <div className="modal-section-content">
              <div className="grid grid-cols-2 gap-4">
                <div className="modal-grid-item">
                  {/* <div className="modal-grid-label">Domain</div> */}
                  <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Domain</div>

                  <div className="modal-grid-value text-primary flex items-center gap-2">
                    <Globe className="text-primary-50" size={16} />
                    {subdomain.subdomain}
                  </div>
                </div>
                <div className="modal-grid-item">
                  {/* <div className="modal-grid-label">IP Addresses</div> */}
                  <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">IP Address</div>
                    
                  <div className="modal-grid-value text-primary flex flex-wrap gap-2">
                   {/* {subdomain.httpx_a?.length > 0 ? (
                subdomain.httpx_a.map((ip, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full text-xs cursor-pointer"
                    
                  >
                    {ip}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No IPs found</span>
              )} */}
              {Array.isArray(subdomain.dnsx_a) && subdomain.dnsx_a.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {subdomain.dnsx_a.map((ip, index) => (
      <span
        key={index}
        className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 break-all"
      >
        {ip}
      </span>
    ))}
  </div>
) : (
  <span className="text-xs text-red-400 italic">No IPs found</span>
)}

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-section">
      <h3 className="modal-section-title text-green-500 text-xl font-bold">&gt;&gt; IP-Based Location</h3>
      <div className="modal-section-content">
        <div className="modal-grid-item">
          <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Location</div>
          {/* ✅ Container with reduced height */}
          <div
            ref={mapContainer}
            className="rounded border border-[#00FFFF] overflow-hidden"
            style={{ height: "200px", width: "100%" }}
          />
        </div>
      </div>
    </div>

   <div className="modal-section">
      <h3 className="modal-section-title text-green-500 text-xl font-bold">
        &gt;&gt; Open Ports
      </h3>

      <div className="modal-section-content">
        <div className="grid grid-cols-2 gap-4">
          <div className="modal-grid-item col-span-2">
            <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">
              Ports
            </div>

            <div className="modal-grid-value text-primary flex flex-wrap gap-2">
              {ports.length > 0 ? (
                ports.map((port) => (
                  <span
                    key={port}
                    className="px-2 py-1 bg-[#00FFFF]/10 border border-[#00FFFF] rounded text-[#00FFFF] text-sm"
                  >
                    {port}
                  </span>
                ))
              ) : (
                <span className="text-primary-50">
                  No Open Ports found
                </span>
              )}
            </div>

            
          </div>
        </div>
      </div>
    </div>
          <div className="modal-section">
            <h3 className="modal-section-title text-green-500 text-xl font-bold">&gt;&gt; HTTP Status</h3>
            <div className="modal-section-content">
              <div className="grid grid-cols-2 gap-4">
                <div className="modal-grid-item">
                  <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">HTTP Status</div>
                  <div className="modal-grid-value text-primary flex items-center gap-2">
                    {getStatusIcon(subdomain.httpx_status_code)}
                    {getStatusBadge(subdomain.httpx_status_code)}
                    <span className="text-primary-50">{subdomain.httpx_webserver}</span>
                  </div>
                </div>
                <div className="modal-grid-item">
                  {/* <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">HTTPS Status</div> */}
                  {/* <div className="modal-grid-label text-xl font-mono bg-black text-green-500 p-2 rounded">HTTPS Status</div> */}
                  <div className="modal-grid-label text-[#BF40BF] text-lg font-mono ">
  HTTPS Status
</div>

                  <div className="modal-grid-value text-primary flex items-center gap-2">
                    {getStatusIcon(subdomain.httpx_status_code)}
                    {getStatusBadge(subdomain.httpx_status_code)}
                    <span className="text-primary-50">{subdomain.https?.[2]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
           
<h3 className="modal-section-title text-green-500 text-xl font-bold">
  &gt;&gt; DNSX Information
</h3>

<div className="modal-section-content">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Host */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Host</div>
      <div className="modal-grid-value text-primary">{subdomain.dnsx_host || 'N/A'}</div>
    </div>

    {/* Status Code */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Status Code</div>
      <div className="modal-grid-value text-primary">{subdomain.dnsx_status_code || 'N/A'}</div>
    </div>

    {/* TTL */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">TTL</div>
      <div className="modal-grid-value text-primary">{subdomain.dnsx_ttl ?? 'N/A'}</div>
    </div>

    {/* Resolvers */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Resolvers</div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(subdomain.dnsx_resolver) && subdomain.dnsx_resolver.length > 0 ? (
          subdomain.dnsx_resolver.map((resolver, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full text-xs"
            >
              {resolver}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

    {/* A Records */}
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">A Records</div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(subdomain.dnsx_a) && subdomain.dnsx_a.length > 0 ? (
          subdomain.dnsx_a.map((ip, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-full text-xs"
            >
              {ip}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

    {/* Raw DNS Lines */}
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Raw DNS Lines</div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(subdomain.dnsx_all) && subdomain.dnsx_all.length > 0 ? (
          subdomain.dnsx_all.map((line, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-pink-500/20 text-pink-200 border border-pink-500/30 rounded-full text-xs"
            >
              {line}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

    {/* Query ID & Rcode */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Query ID</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_raw_resp?.Id ?? 'N/A'}
      </div>
    </div>

    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Rcode</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_raw_resp?.Rcode ?? 'N/A'}
      </div>
    </div>

    {/* Opcode */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Opcode</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_raw_resp?.Opcode ?? 'N/A'}
      </div>
    </div>

    {/* Response Received */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Response</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_raw_resp?.Response ? 'Yes' : 'No'}
      </div>
    </div>

    {/* Recursion Available */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Recursion Available</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_raw_resp?.RecursionAvailable ? 'Yes' : 'No'}
      </div>
    </div>

    {/* Authoritative */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Authoritative</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_raw_resp?.Authoritative ? 'Yes' : 'No'}
      </div>
    </div>

    {/* Answer Section */}
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Answer Section</div>
      <div className="modal-grid-value text-primary flex flex-col gap-1">
        {Array.isArray(subdomain.dnsx_raw_resp?.Answer) && subdomain.dnsx_raw_resp.Answer.length > 0 ? (
          subdomain.dnsx_raw_resp.Answer.map((ans, idx) => (
            <div key={idx} className="text-sm bg-blue-500/10 p-2 rounded-md border border-blue-500/20">
              <div><span className="font-bold">Name:</span> {ans.Hdr?.Name || 'N/A'}</div>
              <div><span className="font-bold">Type:</span> {ans.Hdr?.Rrtype || 'N/A'}</div>
              <div><span className="font-bold">TTL:</span> {ans.Hdr?.Ttl || 'N/A'}</div>
              <div><span className="font-bold">A:</span> {ans.A || 'N/A'}</div>
            </div>
          ))
        ) : (
          <span className="text-gray-400 text-sm">No Answers</span>
        )}
      </div>
    </div>

    {/* Timestamp */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Timestamp</div>
      <div className="modal-grid-value text-primary">
        {subdomain.dnsx_timestamp || 'N/A'}
      </div>
    </div>

  </div>
</div>
<div className="modal-section">
  <br/>
  <h3 className="modal-section-title text-green-500 text-xl font-bold">
  &gt;&gt; TLS Certificate Information
</h3>

<div className="modal-section-content">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* Host */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Host</div>
      <div className="modal-grid-value text-primary">{subdomain.httpx_tls_host || 'N/A'}</div>
    </div>

    {/* Page Title */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Page Title</div>
      <div className="modal-grid-value text-primary">{subdomain.httpx_title || 'N/A'}</div>
    </div>

    {/* Port */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Port</div>
      <div className="modal-grid-value text-primary">{subdomain.httpx_tls_port || 'N/A'}</div>
    </div>

    {/* Web Server */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Web Server</div>
      <div className="modal-grid-value text-primary">{subdomain.httpx_webserver || 'N/A'}</div>
    </div>

    {/* Technologies */}
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Technologies</div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(subdomain.httpx_tech) && subdomain.httpx_tech.length > 0 ? (
          subdomain.httpx_tech.map((tech, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-full text-xs"
            >
              {tech}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

    {/* Wildcard Certificate */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Wildcard Certificate</div>
      <div className="modal-grid-value text-primary">
        {String(subdomain.httpx_tls_wildcard_certificate) === 'true' ? 'Yes' : 'No'}
      </div>
    </div>

    {/* Subject CN */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Subject CN</div>
      <div className="modal-grid-value text-primary">{subdomain.httpx_tls_subject_cn || 'N/A'}</div>
    </div>

    {/* Subject Alt Names */}
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Subject Alt Names</div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(subdomain.httpx_tls_subject_an) && subdomain.httpx_tls_subject_an.length > 0 ? (
          subdomain.httpx_tls_subject_an.map((an, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-full text-xs"
            >
              {an}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

    {/* Issuer CN */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Issuer CN</div>
      <div className="modal-grid-value text-primary">{subdomain.httpx_tls_issuer_cn || 'N/A'}</div>
    </div>

    {/* Issuer Org */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Issuer Org</div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(subdomain.httpx_tls_issuer_org) && subdomain.httpx_tls_issuer_org.length > 0 ? (
          subdomain.httpx_tls_issuer_org.map((org, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-full text-xs"
            >
              {org}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

    {/* Validity Period */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Valid From</div>
      <div className="modal-grid-value text-primary">
        {subdomain.httpx_tls_not_before || 'N/A'}
      </div>
    </div>

    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Valid To</div>
      <div className="modal-grid-value text-primary">
        {subdomain.httpx_tls_not_after || 'N/A'}
      </div>
    </div>

    {/* TLS Version */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">TLS Version</div>
      <div className="modal-grid-value text-primary">
        {subdomain.httpx_tls_tls_version || 'N/A'}
      </div>
    </div>

    {/* Cipher */}
    <div className="modal-grid-item">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Cipher</div>
      <div className="modal-grid-value text-primary">
        {subdomain.httpx_tls_cipher || 'N/A'}
      </div>
    </div>

    {/* Fingerprint Hashes */}
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">Fingerprint Hashes</div>
      <div className="modal-grid-value text-primary flex flex-col gap-1">
        {subdomain.httpx_tls_fingerprint_hash ? (
          <>
            <div><span className="font-bold">MD5:</span> {subdomain.httpx_tls_fingerprint_hash.md5 || 'N/A'}</div>
            <div><span className="font-bold">SHA1:</span> {subdomain.httpx_tls_fingerprint_hash.sha1 || 'N/A'}</div>
            <div><span className="font-bold">SHA256:</span> {subdomain.httpx_tls_fingerprint_hash.sha256 || 'N/A'}</div>
          </>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>

  </div>
</div>

{/* <div className="modal-section">
  <br />
  <h3 className="modal-section-title text-green-500 text-xl font-bold">
    &gt;&gt; Directory Bruteforce Results (FFUF)
  </h3>

  <div className="modal-section-content">
    <div className="modal-grid-item md:col-span-2">
      <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">
        FFUF Matches
      </div>
      <div className="modal-grid-value text-primary flex flex-wrap gap-2">
        {Array.isArray(ffufResults) && ffufResults.length > 0 ? (
          ffufResults.map((line, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs border
                ${
                  line.includes("200")
                    ? "bg-green-500/20 text-green-200 border-green-500/30"
                    : line.includes("301")
                    ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
                    : "bg-gray-500/20 text-gray-200 border-gray-500/30"
                }`}
            >
              {line}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )}
      </div>
    </div>
  </div>
</div> */}
<FFUFResultSection
  ffufResults={ffufResults}
  baseUrl={`https://${subdomain.subdomain}`}
/>

<div className="modal-section">
  <br />
  <h3 className="modal-section-title text-green-500 text-xl font-bold">
    &gt;&gt; Identified CVEs
  </h3>

  <div className="modal-section-content">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="modal-grid-item md:col-span-2">
        <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">CVEs</div>
        <div className="modal-grid-value flex flex-wrap gap-2 relative">
          {Array.isArray(subdomain.cohere_cves) && subdomain.cohere_cves.length > 0 ? (
            subdomain.cohere_cves.map((cve, idx) => {
              const severity = cve.severity?.toLowerCase();
              let borderColor = "border-gray-500";
              let textColor = "text-gray-300";
              let bgColor = "bg-gray-500/10";

              if (severity === "high") {
                borderColor = "border-red-500";
                textColor = "text-red-300";
                bgColor = "bg-red-500/10";
              } else if (severity === "medium") {
                borderColor = "border-yellow-500";
                textColor = "text-yellow-300";
                bgColor = "bg-yellow-500/10";
              } else if (severity === "low") {
                borderColor = "border-green-500";
                textColor = "text-green-300";
                bgColor = "bg-green-500/10";
              }

              return (
                <div key={idx} className="relative group">
  <a
    href={`https://nvd.nist.gov/vuln/detail/${cve.cve}`}
    target="_blank"
    rel="noopener noreferrer"
    className={`px-3 py-1 ${bgColor} ${textColor} ${borderColor} border rounded-full text-xs cursor-pointer hover:underline`}
  >
    {cve.cve}
  </a>
  <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-zinc-800 text-zinc-100 text-xs p-3 rounded-md shadow-lg transition-all">
    {cve.desc}
  </div>
</div>

              );
            })
          ) : (
            <span className="text-gray-400 text-sm">N/A</span>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
<div className="modal-section">
  <h3 className="modal-section-title text-green-500 text-xl font-bold">
    &gt;&gt; Risk Scoring
  </h3>
  <div className="modal-section-content">
    <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-xl space-y-3">

      {/* Risk Score Line */}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-green-500">*</span>
        <span>Risk Score:</span>
        <span className={`px-2 py-0.5 rounded text-black font-bold text-xs
          ${subdomain.risk_score >= 8 ? 'bg-red-500' :
            subdomain.risk_score >= 5 ? 'bg-yellow-400' :
            'bg-green-400'}`}>
          {subdomain.risk_score ?? "N/A"}
        </span>
      </div>

      {/* Reason */}
      <div className="flex items-start gap-2">
        <span className="text-green-500">*</span>
        <span>
          Reason: <span className="text-cyan-300">{subdomain.risk_reason || "Not provided"}</span>
        </span>
      </div>

      {/* Suggestions */}
      <div className="flex items-start gap-2">
        <span className="text-green-500">*</span>
        <div>
          Suggestions:
          <ul className="list-disc list-inside ml-4 mt-1 text-pink-300 space-y-1">
            {subdomain.risk_suggestions?.length > 0 ? (
              subdomain.risk_suggestions.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))
            ) : (
              <li>No suggestions available.</li>
            )}
          </ul>
        </div>
      </div>

    </div>
  </div>
</div>


</div>


        </div>
      </div>
    </div>
  );
}