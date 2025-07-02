import { Navbar } from "../components/layout/Navbar";
import VulnerabilityHeatmap from "../components/Statistics/Heatmap";

export default function Dash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white">
      <Navbar />
      <main className="pt-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
        <VulnerabilityHeatmap />
        {/* You can add charts, tables, and other widgets below */}
      </main>
    </div>
  );
}
