import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
} from "recharts";
import { supabase } from "../lib/supabaseClient";

// ---------- Constants ----------
const CHART_COLORS = [
  "#00BFA5",
  "#00E676",
  "#FFD740",
  "#FF5252",
  "#40C4FF",
  "#1DE9B6",
  "#64FFDA",
  "#FFAB40",
  "#FF8A80",
  "#8C9EFF",
];
const PIE_LABEL_THRESHOLD = 0.05;
const CHART_BLOCK_HEIGHT = 400;

// ---------- Types ----------
interface Incident {
  id?: number;
  date?: string;
  time?: string;
  state?: string;
  cause_label?: string;
  casualties?: number;
  injured?: number;
  mineral?: string;
  [key: string]: any;
}

interface FilterValues {
  year: string;
  state: string;
  cause_label: string;
  mineral: string;
}

interface FilterOptions {
  years: string[];
  states: string[];
  causes: string[];
  minerals: string[];
}

// ---------- Utilities ----------
// ✅ Handles "yy-mm-dd" date format (e.g. "25-03-15")
const parseDate = (d?: string, t?: string): Date | null => {
  if (!d) return null;
  const clean = d.replace(/[.\/]/g, "-").trim();
  const parts = clean.split("-");
  if (parts.length !== 3) return null;

  // Interpret as yy-mm-dd (two-digit year)
  let [yy, mm, dd] = parts.map((x) => parseInt(x, 10));
  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;

  // Convert to full year (assuming 20xx)
  const year = yy < 100 ? 2000 + yy : yy;

  if (t) {
    const [hh, mins] = t.split(":").map((x) => parseInt(x, 10));
    return new Date(year, mm - 1, dd, hh || 0, mins || 0);
  }
  return new Date(year, mm - 1, dd);
};

const parseYear = (d?: string, t?: string): number | null => {
  const date = parseDate(d, t);
  return date ? date.getFullYear() : null;
};

// ---------- Data Hooks ----------
function useIncidentData() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    year: "All",
    state: "All",
    cause_label: "All",
    mineral: "All",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("incidents").select("*");
      if (error) console.error("Supabase fetch error:", error);
      else setIncidents(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filterOptions = useMemo((): FilterOptions => {
    const years = new Set<string>(),
      states = new Set<string>(),
      causes = new Set<string>(),
      minerals = new Set<string>();

    incidents.forEach((i) => {
      const year = parseYear(i.date, i.time);
      if (year) years.add(String(year));
      if (i.state) states.add(i.state);
      if (i.cause_label) causes.add(i.cause_label);
      if (i.mineral) minerals.add(i.mineral);
    });

    return {
      years: ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))],
      states: ["All", ...Array.from(states).sort()],
      causes: ["All", ...Array.from(causes).sort()],
      minerals: ["All", ...Array.from(minerals).sort()],
    };
  }, [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const year = parseYear(i.date, i.time);
      const yearMatch = filters.year === "All" || year === parseInt(filters.year);
      const causeMatch =
        filters.cause_label === "All" || i.cause_label === filters.cause_label;
      const stateMatch = filters.state === "All" || i.state === filters.state;
      const mineralMatch =
        filters.mineral === "All" || i.mineral === filters.mineral;
      return yearMatch && causeMatch && stateMatch && mineralMatch;
    });
  }, [incidents, filters]);

  return { loading, filtered, filterOptions, filters, setFilters };
}

function useChartData(filtered: Incident[]) {
  const yearlyData = useMemo(() => {
    const grouped: Record<
      string,
      { accidents: number; casualties: number; injured: number }
    > = {};
    filtered.forEach((i) => {
      const year = parseYear(i.date, i.time);
      if (!year) return;
      if (!grouped[year])
        grouped[year] = { accidents: 0, casualties: 0, injured: 0 };
      grouped[year].accidents++;
      grouped[year].casualties += i.casualties || 0;
      grouped[year].injured += i.injured || 0;
    });
    return Object.entries(grouped)
      .map(([year, vals]) => ({ year, ...vals }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [filtered]);

  const causeData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((i) => {
      const key = i.cause_label || "Unknown";
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const stateData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((i) => {
      if (i.state) grouped[i.state] = (grouped[i.state] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([state, accidents], idx) => ({
        state,
        accidents,
        fill: CHART_COLORS[idx % CHART_COLORS.length],
      }))
      .sort((a, b) => b.accidents - a.accidents);
  }, [filtered]);

  const mineralData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filtered.forEach((i) => {
      const key = i.mineral || "Unknown";
      grouped[key] = (grouped[key] || 0) + 1;
    });
    const sorted = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (sorted.length > 10) {
      const top = sorted.slice(0, 10);
      const other = sorted.slice(10).reduce((sum, i) => sum + i.value, 0);
      if (other > 0) top.push({ name: "Other", value: other });
      return top;
    }
    return sorted;
  }, [filtered]);

  return { yearlyData, causeData, stateData, mineralData };
}

// ---------- Main Component ----------
export default function Trends() {
  const [aiInsight, setAiInsight] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { loading, filtered, filterOptions, filters, setFilters } =
    useIncidentData();
  const { yearlyData, causeData, stateData, mineralData } =
    useChartData(filtered);

  const handleFilterChange = (key: keyof FilterValues, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const generateInsights = async () => {
    setIsAnalyzing(true);
    setAiInsight("");

    const totalIncidents = filtered.length;
    const totalCasualties = filtered.reduce(
      (sum, i) => sum + (i.casualties || 0),
      0
    );
    const totalInjuries = filtered.reduce(
      (sum, i) => sum + (i.injured || 0),
      0
    );

    const topCauses = causeData.slice(0, 3).map((c) => c.cause);
    const topStates = stateData.slice(0, 3).map((s) => s.state);
    const topMinerals = mineralData.slice(0, 3).map((m) => m.name);
    const years = yearlyData.map((y) => y.year);

    const summary = {
      totalIncidents,
      totalCasualties,
      totalInjuries,
      topCauses,
      topStates,
      topMinerals,
      years,
      filters,
    };

    try {
      const res = await fetch("http://localhost:4000/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const result = await res.json();
      if (result.ok)
        setAiInsight(result.out?.summary || "AI analysis complete.");
      else throw new Error(result.error || "AI summary failed");
    } catch (err: any) {
      console.error("AI Insights Error:", err);
      setAiInsight("Error: Could not generate AI insights.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading)
    return <p className="text-gray-400 text-center p-8">Loading data...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">
        Mine Incident Analytics Dashboard
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["year", "state", "cause_label", "mineral"] as (keyof FilterValues)[]).map(
          (f) => (
            <Filter
              key={f}
              label={f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              value={filters[f]}
              onChange={(val) => handleFilterChange(f, val)}
              options={filterOptions[
                f === "cause_label" ? "causes" : `${f}s`
              ] as string[]}
            />
          )
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartBlock title="Incidents, Casualties & Injuries per Year">
          <LineChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="year" stroke="#B0B0B0" />
            <YAxis stroke="#B0B0B0" />
            <Tooltip contentStyle={{ backgroundColor: "#1A1A1A" }} />
            <Legend />
            <Line dataKey="accidents" stroke="#00BFA5" strokeWidth={2} />
            <Line dataKey="casualties" stroke="#FF5252" strokeWidth={2} />
            <Line dataKey="injured" stroke="#FFD740" strokeWidth={2} />
          </LineChart>
        </ChartBlock>

        <ChartBlock title="Top Causes">
          <BarChart data={causeData.slice(0, 15)} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="cause"
              stroke="#B0B0B0"
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#B0B0B0" />
            <Tooltip contentStyle={{ backgroundColor: "#1A1A1A" }} />
            <Bar dataKey="count" fill="#00BFA5" />
          </BarChart>
        </ChartBlock>

        <ChartBlock title="Incidents by State">
          <BarChart
            data={stateData.slice(0, 15)}
            layout="vertical"
            margin={{ left: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis type="number" stroke="#B0B0B0" />
            <YAxis
              type="category"
              dataKey="state"
              stroke="#B0B0B0"
              width={100}
            />
            <Tooltip contentStyle={{ backgroundColor: "#1A1A1A" }} />
            <Bar dataKey="accidents">
              {stateData.slice(0, 15).map((e, i) => (
                <Cell key={i} fill={e.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartBlock>

        <ChartBlock title="Incidents by Mineral">
          <PieChart>
            <Pie
              data={mineralData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              labelLine={false}
              label={CustomPieChartLabel}
            >
              {mineralData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1A1A1A" }} />
            <Legend />
          </PieChart>
        </ChartBlock>
      </div>

      {/* AI Summary */}
      <div className="text-center pt-4">
        <button
          onClick={generateInsights}
          disabled={isAnalyzing}
          className="bg-[#00BFA5] text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-[#00E676]"
        >
          {isAnalyzing ? "Analyzing..." : "Generate AI Insights"}
        </button>
      </div>

      {aiInsight && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <p className="text-[#B0B0B0] italic leading-relaxed text-center">
            {aiInsight}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Helper Components ----------
function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-[#E0E0E0] focus:ring-2 focus:ring-[#00BFA5] focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function ChartBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
      <h2 className="text-xl text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={CHART_BLOCK_HEIGHT}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const RADIAN = Math.PI / 180;
const CustomPieChartLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < PIE_LABEL_THRESHOLD) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <Text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </Text>
  );
};
