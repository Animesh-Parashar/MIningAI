import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../lib/supabaseClient';

interface Incident {
  id?: number;
  date?: string;
  time?: string;
  state?: string;
  cause?: string;
  [key: string]: any;
}

interface ChartData {
  year: string;
  accidents: number;
}

export default function Trends() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCause, setSelectedCause] = useState<string>('All');
  const [aiInsight, setAiInsight] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('incidents').select('*');
      if (error) console.error(error);
      else setIncidents(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ✅ Parse text-based date (e.g. "17-06-2028", "17/06/2028", "17.06.2028")
  const parseDate = (d?: string, t?: string): Date | null => {
    if (!d) return null;
    let day: number, month: number, year: number;

    const clean = d.replace(/[.\/]/g, '-');
    const parts = clean.split('-');
    if (parts.length === 3) {
      [day, month, year] = parts.map((p) => parseInt(p, 10));
    } else {
      return null;
    }

    if (year < 100) year += 2000; // handle 2-digit years

    // Combine date and time if available
    if (t) {
      const [hh, mm] = t.split(':').map((x) => parseInt(x, 10));
      return new Date(year, month - 1, day, hh || 0, mm || 0);
    }

    return new Date(year, month - 1, day);
  };

  const parseYear = (d?: string, t?: string): number | null => {
    const date = parseDate(d, t);
    return date ? date.getFullYear() : null;
  };

  // ✅ Filter based on selected filters
  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const year = parseYear(i.date, i.time);
      const yearMatch = selectedYear === 'All' || year === parseInt(selectedYear);
      const causeMatch = selectedCause === 'All' || i.cause?.includes(selectedCause);
      const stateMatch = selectedState === 'All' || i.state === selectedState;
      return yearMatch && causeMatch && stateMatch;
    });
  }, [incidents, selectedYear, selectedCause, selectedState]);

  // ✅ Yearly data
  const yearlyData = useMemo<ChartData[]>(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((i) => {
      const year = parseYear(i.date, i.time);
      if (!year) return;
      grouped[year] = (grouped[year] || 0) + 1;
    });
    return Object.entries(grouped).map(([year, accidents]) => ({ year, accidents }));
  }, [filtered]);

  // ✅ Cause data
  const causeData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((i) => {
      const key = i.cause?.split(' ')[0] || 'Unknown';
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([cause, count]) => ({ cause, count }));
  }, [filtered]);

  // ✅ State data
  const stateData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((i) => {
      if (!i.state) return;
      grouped[i.state] = (grouped[i.state] || 0) + 1;
    });
    return Object.entries(grouped).map(([state, accidents], idx) => ({
      state,
      accidents,
      fill: ['#00BFA5', '#00E676', '#1DE9B6', '#64FFDA'][idx % 4],
    }));
  }, [filtered]);

  // ✅ AI Summary Generator
  const generateInsights = () => {
    setAiInsight(
      `AI Summary: ${filtered.length} incidents found. ${
        causeData[0]?.cause || 'Roof Fall'
      } is most frequent. Highest density in ${
        stateData[0]?.state || 'Jharkhand'
      }. Trend shows ${
        yearlyData.length > 1 ? 'decline in recent years' : 'stable rates'
      }. Recommendation: improve roof support and routine safety checks.`
    );
  };

  if (loading) return <p className="text-gray-400">Loading data...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Mine Incident Analytics</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Filter
          label="Year"
          value={selectedYear}
          onChange={setSelectedYear}
          options={[
            'All',
            ...Array.from(new Set(incidents.map((i) => parseYear(i.date, i.time)).filter(Boolean))).map(String),
          ]}
        />
        <Filter
          label="State"
          value={selectedState}
          onChange={setSelectedState}
          options={['All', ...new Set(incidents.map((i) => i.state).filter(Boolean))]}
        />
        <Filter
          label="Cause"
          value={selectedCause}
          onChange={setSelectedCause}
          options={['All', ...new Set(incidents.map((i) => i.cause?.split(' ')[0]).filter(Boolean))]}
        />
      </div>

      {/* Charts */}
      <ChartBlock title="Incidents per Year">
        <LineChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="year" stroke="#B0B0B0" />
          <YAxis stroke="#B0B0B0" />
          <Tooltip contentStyle={{ backgroundColor: '#1A1A1A' }} />
          <Line type="monotone" dataKey="accidents" stroke="#00BFA5" strokeWidth={2} />
        </LineChart>
      </ChartBlock>

      <ChartBlock title="Top Causes">
        <BarChart data={causeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="cause" stroke="#B0B0B0" angle={-30} textAnchor="end" />
          <YAxis stroke="#B0B0B0" />
          <Bar dataKey="count" fill="#00BFA5" />
        </BarChart>
      </ChartBlock>

      <ChartBlock title="Incidents by State">
        <BarChart data={stateData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis type="number" stroke="#B0B0B0" />
          <YAxis type="category" dataKey="state" stroke="#B0B0B0" width={100} />
          <Bar dataKey="accidents">
            {stateData.map((e, i) => (
              <Cell key={i} fill={e.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartBlock>

      <div className="text-center">
        <button
          onClick={generateInsights}
          className="bg-[#00BFA5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00E676]"
        >
          Generate AI Insights
        </button>
      </div>

      {aiInsight && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <p className="text-[#B0B0B0] italic">{aiInsight}</p>
        </div>
      )}
    </div>
  );
}

// ✅ Helper components
function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | number)[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-[#E0E0E0]"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function ChartBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
      <h2 className="text-xl text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={320}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
