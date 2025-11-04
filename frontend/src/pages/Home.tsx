import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Database, AlertTriangle, MapPin, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Incident {
  id: number;
  date?: string;
  state?: string;
  cause_label?: string;
  created_at?: string;
}

export default function Home() {
  const navigate = useNavigate();

  const [showAlert, setShowAlert] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    topCause: "—",
    topState: "—",
    active: 0,
  });

  // 🧩 Fetch incidents and calculate stats
  const fetchStats = async () => {
    const { data, error } = await supabase.from("incidents").select("*");
    if (error || !data) return console.error("Error fetching incidents:", error);

    const total = data.length;

    // Count causes and states
    const causeCount: Record<string, number> = {};
    const stateCount: Record<string, number> = {};
    let recent = 0;

    const now = new Date();
    data.forEach((i) => {
      if (i.cause_label) causeCount[i.cause_label] = (causeCount[i.cause_label] || 0) + 1;
      if (i.state) stateCount[i.state] = (stateCount[i.state] || 0) + 1;
      if (i.created_at && now.getTime() - new Date(i.created_at).getTime() < 24 * 60 * 60 * 1000)
        recent++;
    });

    const topCause =
      Object.entries(causeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const topState =
      Object.entries(stateCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    setStats({
      total,
      topCause,
      topState,
      active: recent,
    });
  };

  // 🔴 Realtime subscription
  useEffect(() => {
    fetchStats(); // Initial load

    const channel = supabase
      .channel("public:incidents")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        async (payload) => {
          console.log("🆕 New Incident:", payload.new);
          setShowAlert(true);
          await fetchStats(); // Refresh stats
          setTimeout(() => setShowAlert(false), 4000); // Hide banner after 4s
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    { label: "Total Records", icon: Database, value: stats.total, color: "#00E676" },
    { label: "Top Cause", icon: AlertTriangle, value: stats.topCause, color: "#00BFA5" },
    { label: "High-Risk Region", icon: MapPin, value: stats.topState, color: "#00BFA5" },
    { label: "Active Alerts", icon: BellRing, value: stats.active, color: "#FF5252" },
  ];

  const navButtons = [
    { label: "Trends & Insights", path: "/trends" },
    { label: "Real-Time Monitor", path: "/realtime" },
    { label: "AI Reports", path: "/reports" },
    { label: "Digital Officer", path: "/chat" },
  ];

  return (
    <div className="space-y-12 relative">
      {/* 🔴 Animated Alert Banner */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 text-center font-semibold tracking-wide shadow-lg"
          >
            🚨 NEW INCIDENT REPORTED — Dashboard Updated
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-white mb-4">MineSafe AI</h1>
        <p className="text-xl text-[#B0B0B0] max-w-3xl mx-auto">
          AI-powered Mining Accident Analytics & Safety Monitoring Platform for DGMS India.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#00BFA5] transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stat.value || "—"}
              </div>
              <div className="text-sm text-[#B0B0B0]">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-12">
        {navButtons.map((button) => (
          <motion.button
            key={button.path}
            onClick={() => navigate(button.path)}
            whileHover={{ scale: 1.05 }}
            className="bg-[#00BFA5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors shadow-md"
          >
            {button.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
