import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Server, CheckCircle2, AlertCircle, XCircle, CircleDot, ShieldCheck, ShieldAlert, ShieldX, Link } from 'lucide-react';
import type { Subdomain } from '../../types/subdomain';
import SubdomainDetails from './SubdomainDetails';

interface SubdomainCardProps {
  subdomain: Subdomain;
  onSelect: () => void;
}

export function SubdomainCard({ subdomain, onSelect }: SubdomainCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getBorderColorClass = () => {
    const statuses = [subdomain.http?.[0], subdomain.https?.[0]];
    const hasValidSSL = subdomain.cert?.[0];

    if (statuses.every(code => code >= 200 && code < 300) && hasValidSSL) {
      return 'border-2 border-emerald-400';
    } else if (statuses.some(code => code >= 300 && code < 400) || !hasValidSSL) {
      return 'border-2 border-yellow-400';
    } else {
      return 'border-2 border-red-500';
    }
  };

  const getSSLStatus = (status: boolean) => {
    return status ? <ShieldCheck className="text-green-500" size={16} /> : <ShieldX className="text-red-500" size={16} />;
  };

  const getHTTPStatus = (http: [number, string, null]) => {
    const status = http[0];
    if (status >= 200 && status < 300) return <CircleDot className="text-green-500" size={16} />;
    if (status >= 300 && status < 400) return <CircleDot className="text-yellow-500" size={16} />;
    return <CircleDot className="text-red-500" size={16} />;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card shadow-sm bg-black/50 hover:bg-black/60 whitespace-normal overflow-hidden backdrop-blur-sm ${getBorderColorClass()}`}
        onClick={() => {
          setShowDetails(true);
          onSelect();
        }}
      >
        <div className="p-6 space-y-6">
          {/* Domain and Status Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 min-w-0">
            {/* Domain Info */}
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <Globe className="text-primary shrink-0" size={28} />
              <h3 className="text-lg font-mono text-primary tracking-wider truncate">
                {subdomain.domain}
              </h3>
            </div>

            {/* HTTP/HTTPS Status */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary/70">HTTP</span>
                {getHTTPStatus(subdomain.http)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary/70">HTTPS</span>
                {getHTTPStatus(subdomain.https)}
              </div>
            </div>
          </div>
          
          {/* IP and SSL Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IP Addresses */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Server className="text-purple-400" size={16} />
                <span className="text-sm">IP Addresses</span>
              </div>
              <div className="flex flex-wrap gap-2 overflow-x-auto">
                {subdomain.ip.length > 0 && (
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 break-all">
                    {subdomain.ip[0]}
                  </span>
                )}
                {subdomain.ip.length > 1 && (
                  <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    +{subdomain.ip.length - 1} more
                  </span>
                )}
              </div>
            </div>

            {/* SSL Status */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Shield className="text-blue-400" size={16} />
                <span className="text-sm">SSL Status</span>
              </div>
              <div className="flex items-center gap-2">
                {getSSLStatus(subdomain.cert?.[0])}
                <span className={`text-sm ${subdomain.cert?.[0] ? 'text-green-300' : 'text-red-300'}`}>
                  {subdomain.cert?.[0] ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showDetails && (
        <SubdomainDetails
          subdomain={subdomain}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}