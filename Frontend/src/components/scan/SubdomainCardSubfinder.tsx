import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Shield,
  Server,
  CircleDot,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import type { SubdomainSubfinder } from '../../types/subdomain';
import SubdomainDetailsSubfinder from './subdomainDetailsSubfinder';

// 🟢 For Subfinder card
interface SubdomainCardPropsSubfinder {
  subdomain: SubdomainSubfinder;
  onSelect: () => void;
}

export function SubdomainCardSubfinder({ subdomain, onSelect }: SubdomainCardPropsSubfinder) {
  const [showDetails, setShowDetails] = useState(false);

  // ✅ New: extract status codes from flat keys
  const getHTTPStatusCode = (key: 'httpx_status_code') => {
    return typeof subdomain[key] === 'number'
      ? subdomain[key]
      : parseInt(subdomain[key] as string, 10);
  };

  // ✅ New: SSL status comes from httpx_tls_probe_status or other cert info
  const hasValidSSL = subdomain.httpx_tls_probe_status === true;

  const getBorderColorClass = () => {
    const status = getHTTPStatusCode('httpx_status_code');
    if (status >= 200 && status < 300 && hasValidSSL) {
      return 'border-2 border-emerald-400';
    } else if ((status >= 300 && status < 400) || !hasValidSSL) {
      return 'border-2 border-yellow-400';
    } else {
      return 'border-2 border-red-500';
    }
  };

  const getSSLStatus = () =>
    hasValidSSL ? (
      <ShieldCheck className="text-green-500" size={16} />
    ) : (
      <ShieldX className="text-red-500" size={16} />
    );

  const getHTTPStatusIcon = () => {
    const status = getHTTPStatusCode('httpx_status_code');
    if (status >= 200 && status < 300)
      return <CircleDot className="text-green-500" size={16} />;
    if (status >= 300 && status < 400)
      return <CircleDot className="text-yellow-500" size={16} />;
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
          {/* Domain & Status */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 min-w-0">
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <Globe className="text-primary shrink-0" size={28} />
              <h3 className="text-lg font-mono text-primary tracking-wider truncate">
                {subdomain.subdomain}
              </h3>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary/70">HTTP</span>
                {getHTTPStatusIcon()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary/70">SSL</span>
                {getSSLStatus()}
              </div>
            </div>
          </div>

          {/* IP & SSL Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Server className="text-purple-400" size={16} />
                <span className="text-sm">IP Addresses</span>
              </div>
              <div className="flex flex-wrap gap-2 overflow-x-auto">
                {Array.isArray(subdomain.httpx_a) && subdomain.httpx_a.length > 0 && (
                  <>
                    <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 break-all">
                      {subdomain.httpx_a[0]}
                    </span>
                    {subdomain.httpx_a.length > 1 && (
                      <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        +{subdomain.httpx_a.length - 1} more
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Shield className="text-blue-400" size={16} />
                <span className="text-sm">SSL Validity</span>
              </div>
              <div className="flex items-center gap-2">
                {getSSLStatus()}
                <span className={`text-sm ${hasValidSSL ? 'text-green-300' : 'text-red-300'}`}>
                  {hasValidSSL ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showDetails && (
        <SubdomainDetailsSubfinder
          subdomain={subdomain}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

export default SubdomainCardSubfinder;
