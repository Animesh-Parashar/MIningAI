import { useNavigate } from 'react-router-dom';
import { Database, AlertTriangle, MapPin, BellRing } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Records', icon: Database, value: '300+', color: '#00E676' },
    { label: 'Top Cause', icon: AlertTriangle, value: 'Machinery Failure', color: '#00BFA5' },
    { label: 'High-Risk Region', icon: MapPin, value: 'Jharkhand', color: '#00BFA5' },
    { label: 'Active Alerts', icon: BellRing, value: '3', color: '#00BFA5' },
  ];

  const navButtons = [
    { label: 'Trends & Insights', path: '/trends' },
    { label: 'Real-Time Monitor', path: '/realtime' },
    { label: 'AI Reports', path: '/reports' },
    { label: 'Digital Officer', path: '/chat' },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-white mb-4">MineSafe AI</h1>
        <p className="text-xl text-[#B0B0B0] max-w-3xl mx-auto">
          AI-powered Mining Accident Analytics & Safety Monitoring Platform for DGMS India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#00BFA5] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-[#B0B0B0]">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-12">
        {navButtons.map((button) => (
          <button
            key={button.path}
            onClick={() => navigate(button.path)}
            className="bg-[#00BFA5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
