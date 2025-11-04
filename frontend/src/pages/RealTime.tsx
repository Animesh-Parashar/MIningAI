import { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Clock } from 'lucide-react';

interface Alert {
  id: string;
  timestamp: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export default function RealTime() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      location: 'Jharkhand Coal Mine - Sector 7',
      severity: 'high',
      message: 'Gas concentration exceeding safe levels detected',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      location: 'Odisha Iron Ore Mine - Block C',
      severity: 'medium',
      message: 'Equipment malfunction reported - Excavator #12',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      location: 'Chhattisgarh Coal Mine - Site 4',
      severity: 'low',
      message: 'Minor structural inspection required',
    },
  ]);

  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hours ago`;
    }
  };

  const acknowledgeAlert = () => {
    if (selectedAlert) {
      setAlerts(alerts.filter((a) => a.id !== selectedAlert));
      setSelectedAlert(null);
      setRecommendation('');
    }
  };

  const getRecommendation = () => {
    const alert = alerts.find((a) => a.id === selectedAlert);
    if (alert) {
      if (alert.message.includes('Gas')) {
        setRecommendation(
          'IMMEDIATE ACTION REQUIRED: Evacuate all personnel from affected sector. Activate ventilation systems. Deploy gas monitoring team. Halt all operations until gas levels normalize below 1.25% methane concentration.'
        );
      } else if (alert.message.includes('Equipment')) {
        setRecommendation(
          'RECOMMENDED ACTIONS: Isolate affected equipment. Dispatch maintenance crew for inspection. Review recent maintenance logs. Implement backup equipment if available. Ensure compliance with equipment safety protocols.'
        );
      } else {
        setRecommendation(
          'STANDARD PROTOCOL: Schedule inspection within 24 hours. Assign certified engineer for structural assessment. Document findings in safety log. Monitor area for any changes.'
        );
      }
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Live Mining Accident Monitoring</h1>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-[#00BFA5]" />
          Active Alerts Feed
        </h2>
        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedAlert === alert.id
                  ? 'border-[#00BFA5] bg-[#0D0D0D]'
                  : 'border-[#2A2A2A] hover:border-[#00BFA5]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`}
                    ></span>
                    <span className="text-xs font-semibold text-[#B0B0B0] uppercase">
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-[#B0B0B0] mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {alert.location}
                  </div>
                  <p className="text-white">{alert.message}</p>
                </div>
                <div className="flex items-center text-xs text-[#888888] ml-4">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimestamp(alert.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Real-Time Heatmap of Active Incidents
        </h2>
        <p className="text-sm text-[#B0B0B0] mb-4">
          Interactive map showing current hotspots across Indian mining regions
        </p>
        <div className="bg-[#1A1A1A] rounded-lg h-[500px] flex items-center justify-center border border-[#2A2A2A]">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-[#00BFA5] mx-auto mb-4" />
            <p className="text-[#B0B0B0]">Interactive map visualization</p>
            <p className="text-sm text-[#888888] mt-2">
              Displaying {alerts.length} active incidents
            </p>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div className="flex space-x-4">
          <button
            onClick={acknowledgeAlert}
            className="flex-1 bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors"
          >
            Acknowledge Alert
          </button>
          <button
            onClick={getRecommendation}
            className="flex-1 bg-[#1A1A1A] border border-[#00BFA5] text-[#00BFA5] px-6 py-3 rounded-lg font-medium hover:bg-[#00BFA5] hover:text-white transition-colors"
          >
            Recommend Actions
          </button>
        </div>
      )}

      {recommendation && (
        <div className="bg-[#1A1A1A] border border-[#00E676] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#00E676] mb-3">AI Recommendations</h3>
          <p className="text-[#E0E0E0] leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  );
}
