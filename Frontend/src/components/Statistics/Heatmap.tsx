import {
  BarChart as BarIcon,
  ShieldCheck,
  Users,
  Timer,
  AlertTriangle,
  Clock,
  Shield,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

// ===== Dummy Data =====
const stats = [
  { name: "Total Scans", value: 128, icon: <BarIcon className="w-5 h-5" /> },
  { name: "Vulnerabilities Found", value: 87, icon: <ShieldCheck className="w-5 h-5" /> },
  { name: "Active Users", value: 42, icon: <Users className="w-5 h-5" /> },
];

const scanTrendData = [
  { date: 'Jun 1', scans: 10 },
  { date: 'Jun 2', scans: 20 },
  { date: 'Jun 3', scans: 15 },
  { date: 'Jun 4', scans: 25 },
  { date: 'Jun 5', scans: 30 },
];

const categoryDistribution = [
  { name: 'SQLi', critical: 4, high: 10, medium: 6, low: 2 },
  { name: 'XSS', critical: 2, high: 6, medium: 5, low: 3 },
  { name: 'CSRF', critical: 1, high: 3, medium: 4, low: 1 },
];

const alerts = [
  {
    type: 'cert_expired',
    domain: 'example.com',
    severity: 'critical',
    message: 'SSL certificate has expired',
    daysLeft: -2,
    details: 'Users may receive trust warnings when visiting the site.',
  },
  {
    type: 'high_vuln',
    domain: 'api.internal',
    severity: 'high',
    message: 'Outdated library with RCE found',
    details: 'Library xyz 1.2.3 vulnerable to CVE-2024-1234.',
  },
  {
    type: 'cert_expiring',
    domain: 'mail.example.com',
    severity: 'medium',
    message: 'Certificate will expire soon',
    daysLeft: 12,
    details: 'Renew before expiry to avoid downtime.',
  },
];

// ===== Main Component =====
export default function Dashboard() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cert_expired':
      case 'cert_expiring':
        return <Shield className="h-4 w-4" />;
      case 'high_vuln':
        return <AlertTriangle className="h-4 w-4" />;
      case 'dns_critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;
  const expiredCerts = alerts.filter(a => a.type === 'cert_expired').length;
  const expiringSoon = alerts.filter(a => a.type === 'cert_expiring').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white pb-20">
      <div className="pt-8 px-6">
        <h1 className="text-4xl font-bold mb-4">Security Dashboard</h1>
        <p className="text-gray-400 mb-6">Live insights on scan metrics and critical issues.</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-gradient-to-r from-purple-700 to-purple-900 border border-purple-600 rounded-xl p-5 shadow-md hover:shadow-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-full">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Scan Trends */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">📈 Scan Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer>
                  <LineChart data={scanTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="scans" stroke="#60A5FA" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerability Categories */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">🧪 Vulnerability Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer>
                  <BarChart data={categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="critical" stackId="a" fill="#DC2626" />
                    <Bar dataKey="high" stackId="a" fill="#EA580C" />
                    <Bar dataKey="medium" stackId="a" fill="#EAB308" />
                    <Bar dataKey="low" stackId="a" fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts Overview */}
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
              <div className="text-sm text-red-300">Critical Issues</div>
            </div>
            <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{highCount}</div>
              <div className="text-sm text-orange-300">High Priority</div>
            </div>
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{expiredCerts}</div>
              <div className="text-sm text-red-300">Expired Certificates</div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{expiringSoon}</div>
              <div className="text-sm text-yellow-300">Expiring Soon</div>
            </div>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Critical Security Issues Requiring Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts
                .sort((a, b) => {
                  const order = { critical: 0, high: 1, medium: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .slice(0, 10)
                .map((alert, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <div className="text-red-400 mt-1">
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{alert.domain}</span>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-300 mb-2">{alert.message}</div>
                        <div className="text-xs text-slate-400">{alert.details}</div>
                        {alert.daysLeft !== undefined && (
                          <div className="text-xs text-yellow-400 mt-1">
                            {alert.daysLeft > 0 ? `${alert.daysLeft} days remaining` : 'EXPIRED'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
