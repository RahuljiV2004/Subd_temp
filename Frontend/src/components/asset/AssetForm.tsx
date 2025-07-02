import { useState } from 'react';
import { Shield, Globe, Server, Link, Key, Eye, Save, Loader2 } from 'lucide-react';
import {toast} from 'react-hot-toast';

import { Layout } from '../layout/Layout';

export function CompanyAssets() {
  const [domains, setDomains] = useState('');
  const [ips, setIps] = useState('');
  const [endpoints, setEndpoints] = useState('');
  const [shodanKey, setShodanKey] = useState('');
  const [fofaKey, setFofaKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          domains: domains.split(',').map((d) => d.trim()),
          ips: ips.split(',').map((ip) => ip.trim()),
          endpoints: endpoints.split(',').map((e) => e.trim()),
          shodanKey,
          fofaKey
        }),
      });

      if (!response.ok) throw new Error('Failed to save assets');
      toast({
        title: "Success!",
        description: "Assets saved successfully",
      });
      setDomains('');
      setIps('');
      setEndpoints('');
      setShodanKey('');
      setFofaKey('');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save assets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Network Asset Manager
            </h1>
            <p className="text-slate-400 text-lg">
              Secure your digital infrastructure by managing domains, IPs, and endpoints
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Asset Information Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-300 flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6" />
                  Asset Information
                </h2>

                {/* Domains Input */}
                <div className="group">
                  <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                    <Globe className="w-4 h-4" />
                    Domains
                  </label>
                  <textarea
                    value={domains}
                    onChange={(e) => setDomains(e.target.value)}
                    placeholder="example.com, subdomain.example.org, another-domain.net"
                    rows={3}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                  />
                  <p className="text-xs text-slate-400 mt-2">Separate multiple domains with commas</p>
                </div>

                {/* IP Addresses Input */}
                <div className="group">
                  <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                    <Server className="w-4 h-4" />
                    IP Addresses
                  </label>
                  <textarea
                    value={ips}
                    onChange={(e) => setIps(e.target.value)}
                    placeholder="192.168.1.1, 10.0.0.1, 203.0.113.1"
                    rows={3}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                  />
                  <p className="text-xs text-slate-400 mt-2">IPv4 and IPv6 addresses supported</p>
                </div>

                {/* Endpoints Input */}
                <div className="group">
                  <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                    <Link className="w-4 h-4" />
                    API/Web Endpoints
                  </label>
                  <textarea
                    value={endpoints}
                    onChange={(e) => setEndpoints(e.target.value)}
                    placeholder="https://api.example.com/v1, https://example.com/admin, https://app.example.com"
                    rows={3}
                    className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                  />
                  <p className="text-xs text-slate-400 mt-2">Include full URLs with protocols</p>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="border-t border-slate-700/50 pt-8">
                <h2 className="text-2xl font-semibold text-purple-300 flex items-center gap-3 mb-6">
                  <Key className="w-6 h-6" />
                  API Configuration
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Shodan API Key */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                      <Eye className="w-4 h-4" />
                      Shodan API Key
                    </label>
                    <input
                      type="password"
                      value={shodanKey}
                      onChange={(e) => setShodanKey(e.target.value)}
                      placeholder="Enter your Shodan API key"
                      className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                    />
                    <p className="text-xs text-slate-400 mt-2">Used for network reconnaissance</p>
                  </div>

                  {/* FOFA API Key */}
                  <div className="group">
                    <label className="flex items-center gap-2 text-purple-200 font-medium mb-3">
                      <Shield className="w-4 h-4" />
                      FOFA API Key
                    </label>
                    <input
                      type="password"
                      value={fofaKey}
                      onChange={(e) => setFofaKey(e.target.value)}
                      placeholder="Enter your FOFA API key"
                      className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                    />
                    <p className="text-xs text-slate-400 mt-2">Used for threat intelligence</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Assets...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Assets
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

         
        </div>
    
    </Layout>
  );
}
