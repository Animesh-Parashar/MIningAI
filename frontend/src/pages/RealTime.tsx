import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, MapPin, Clock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ⚙️ Supabase Setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Incident {
  id: number;
  date?: string;
  time?: string;
  state?: string;
  cause_label?: string;
  mineral?: string;
  casualties?: number;
  injured?: number;
  created_at?: string;
}

export default function RealTime() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);
  const [liveActive, setLiveActive] = useState<boolean>(false);

  // 🔥 Realtime listener
  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error) setIncidents(data || []);
    };
    fetchIncidents();

    const channel = supabase
      .channel("public:incidents")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "incidents" },
        (payload) => {
          const newIncident = payload.new as Incident;
          console.log("🟢 New incident:", newIncident);

          // Highlight + LIVE animation
          setLiveActive(true);
          setTimeout(() => setLiveActive(false), 2500);
          setIncidents((prev) => [newIncident, ...prev]);
          setHighlightedIds((prev) => [...prev, newIncident.id]);

          // Remove highlight after 2s
          setTimeout(() => {
            setHighlightedIds((prev) =>
              prev.filter((id) => id !== newIncident.id)
            );
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverity = (i: Incident): "high" | "medium" | "low" => {
    const c = i.casualties || 0;
    const inj = i.injured || 0;
    if (c > 5 || inj > 15) return "high";
    if (c > 0 || inj > 0) return "medium";
    return "low";
  };

  const getSeverityColor = (s: string) =>
    s === "high"
      ? "bg-red-500"
      : s === "medium"
      ? "bg-orange-500"
      : "bg-yellow-500";

  const formatTimestamp = (i: Incident) => {
    const base = i.created_at;
    if (!base) return "Just now";
    const diff = Date.now() - new Date(base).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const acknowledgeIncident = () => {
    if (selectedIncident) {
      setIncidents((prev) => prev.filter((i) => i.id !== selectedIncident));
      setSelectedIncident(null);
      setRecommendation("");
    }
  };

  const getRecommendation = () => {
    const i = incidents.find((x) => x.id === selectedIncident);
    if (!i) return;
    const cause = i.cause_label?.toLowerCase() || "";
    const mineral = i.mineral?.toLowerCase() || "";

    if (cause.includes("gas"))
      setRecommendation(
        "⚠️ GAS ALERT: Evacuate, activate ventilation, deploy sensors."
      );
    else if (cause.includes("equipment"))
      setRecommendation("🔧 Check machinery, isolate faulty equipment.");
    else if (cause.includes("blast"))
      setRecommendation("💥 Verify blast safety zone and logs immediately.");
    else if (mineral.includes("coal"))
      setRecommendation("🔥 Inspect for spontaneous combustion risk.");
    else
      setRecommendation("✅ Standard safety inspection and report required.");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <h1 className="text-3xl font-bold text-white">
          Real-Time Mining Incident Feed
        </h1>
        {liveActive && (
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping mr-2" />
            <span className="text-red-400 text-sm font-medium">LIVE</span>
          </motion.div>
        )}
      </div>

      {/* Feed */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-[#00BFA5]" />
          Recent Incidents
        </h2>

        <div className="space-y-3 max-h-[340px] overflow-y-auto">
          <AnimatePresence>
            {incidents.map((incident) => {
              const severity = getSeverity(incident);
              const highlight = highlightedIds.includes(incident.id);

              return (
                <motion.div
                  key={incident.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    boxShadow: highlight
                      ? "0 0 25px rgba(0, 255, 128, 0.6)"
                      : "0 0 0 rgba(0,0,0,0)",
                    borderColor: highlight ? "#00E676" : "#2A2A2A",
                    backgroundColor: highlight
                      ? "rgba(0,255,128,0.05)"
                      : "rgba(13,13,13,0.4)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 12,
                    duration: 0.4,
                  }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-lg border cursor-pointer backdrop-blur-sm transition-all ${
                    selectedIncident === incident.id
                      ? "border-[#00BFA5] bg-[#0D0D0D]/60"
                      : "border-[#2A2A2A] hover:border-[#00BFA5]"
                  } hover:shadow-lg hover:shadow-[#00BFA550]`}
                  onClick={() => setSelectedIncident(incident.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`w-2 h-2 rounded-full ${getSeverityColor(
                            severity
                          )}`}
                        ></span>
                        <span className="text-xs font-semibold text-[#B0B0B0] uppercase tracking-wide">
                          {severity}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-[#B0B0B0] mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {incident.state || "Unknown State"}
                      </div>
                      <p className="text-white text-sm font-medium">
                        {incident.cause_label || "No cause specified"}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-[#888] ml-4">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(incident)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Real-Time Heatmap of Active Incidents
        </h2>
        <div className="bg-[#1A1A1A] rounded-lg h-[400px] flex items-center justify-center border border-[#2A2A2A] shadow-inner">
          <div className="text-center">
            <Activity className="w-14 h-14 text-[#00BFA5] mx-auto mb-4" />
            <p className="text-[#B0B0B0]">
              Displaying {incidents.length} active incidents
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      {selectedIncident && (
        <div className="flex space-x-4">
          <button
            onClick={acknowledgeIncident}
            className="flex-1 bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-all"
          >
            Acknowledge Incident
          </button>
          <button
            onClick={getRecommendation}
            className="flex-1 bg-[#1A1A1A] border border-[#00BFA5] text-[#00BFA5] px-6 py-3 rounded-lg font-medium hover:bg-[#00BFA5] hover:text-white transition-all"
          >
            Recommend Actions
          </button>
        </div>
      )}

      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1A1A] border border-[#00E676] rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-[#00E676] mb-3">
            AI Recommendation
          </h3>
          <p className="text-[#E0E0E0] leading-relaxed">{recommendation}</p>
        </motion.div>
      )}
    </div>
  );
}
