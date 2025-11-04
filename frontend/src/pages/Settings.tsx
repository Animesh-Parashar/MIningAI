import { useState } from 'react';
import { Moon, RefreshCw, Key } from 'lucide-react';

export default function Settings() {
  const [monitoringFrequency, setMonitoringFrequency] = useState('Hourly');
  const [apiKey, setApiKey] = useState('');
  const [isRetraining, setIsRetraining] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      alert('NLP Model retrained successfully with latest data.');
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Platform Settings</h1>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Agent Monitoring Frequency</h3>
        <p className="text-[#888888] text-sm mb-4">
          Configure how often the AI agent checks for new data and updates
        </p>
        <div className="flex space-x-4">
          {['Hourly', 'Daily', 'Weekly'].map((option) => (
            <button
              key={option}
              onClick={() => setMonitoringFrequency(option)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                monitoringFrequency === option
                  ? 'bg-[#00BFA5] text-white'
                  : 'bg-[#0D0D0D] border border-[#2A2A2A] text-[#E0E0E0] hover:border-[#00BFA5]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2 text-[#00BFA5]" />
          Configure API Keys & Model Settings
        </h3>
        <p className="text-[#888888] text-sm mb-4">
          Manage API keys for external services and AI model configurations
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#B0B0B0] mb-2">
              GeminiAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:border-[#00BFA5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B0B0B0] mb-2">
              AI Model Version
            </label>
            <select className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#E0E0E0] focus:outline-none focus:border-[#00BFA5]">
              <option>gemini-2.5-pro</option>
              <option>emini</option>
              <option>GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#B0B0B0] mb-2">
              Temperature
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              defaultValue="0.7"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[#888888] mt-1">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          <button className="w-full bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors">
            Save Configuration
          </button>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">NLP Model Training</h3>
        <p className="text-[#888888] text-sm mb-4">
          Retrain the Natural Language Processing model with the latest accident data to improve
          accuracy and predictions
        </p>
        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining Model...' : 'Retrain NLP Model'}
        </button>

        {isRetraining && (
          <div className="mt-4 p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg">
            <p className="text-[#E0E0E0] text-sm">
              Training in progress... This may take several minutes.
            </p>
            <div className="mt-2 bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
              <div className="bg-[#00BFA5] h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
            <span className="text-[#B0B0B0]">Platform Version</span>
            <span className="text-white font-medium">v2.1.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
            <span className="text-[#B0B0B0]">Database Size</span>
            <span className="text-white font-medium">2.4 GB</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
            <span className="text-[#B0B0B0]">Total Records</span>
            <span className="text-white font-medium">300+</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#B0B0B0]">Last Updated</span>
            <span className="text-white font-medium">2025-10-31</span>
          </div>
        </div>
      </div>
    </div>
  );
}
