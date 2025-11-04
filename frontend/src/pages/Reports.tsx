import { useState, useEffect } from "react";
import { FileText, Download, Calendar, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Report {
  id: number;
  report_name: string;
  generated_at: string;
  year: number;
  content: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportPreview, setReportPreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 🔹 Fetch existing reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/reports");
        const json = await res.json();
        if (json.ok) setReports(json.reports || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  // 🧠 Generate new yearly report
  const generateYearlyReport = async () => {
    setIsGenerating(true);
    setReportPreview("");

    try {
      const res = await fetch("http://localhost:4000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "yearly" }),
      });

      const json = await res.json();
      if (json.ok) {
        setReportPreview(json.out.summary);
        if (json.out.report) {
          setReports((prev) =>
            json.cached
              ? prev
              : [json.out.report, ...prev.filter((r) => r.id !== json.out.report.id)]
          );
        }
      } else {
        setReportPreview("Error: Could not generate report.");
      }
    } catch (err) {
      console.error("Report generation failed:", err);
      setReportPreview("Error: Report generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 📥 Download text file
  const downloadReport = (content: string, name: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Yearly Safety Reports</h1>

      {/* ✅ Only one button */}
      <div className="flex justify-center">
        <button
          onClick={generateYearlyReport}
          disabled={isGenerating}
          className="bg-[#00BFA5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Yearly Report...</span>
            </>
          ) : (
            <span>Generate Yearly Report</span>
          )}
        </button>
      </div>

      {/* 🧾 Report Preview */}
      {reportPreview && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#00BFA5]" />
            Report Preview
          </h2>
          <div className="prose prose-invert max-w-none text-[#E0E0E0]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {reportPreview}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 📄 Download */}
      {reportPreview && (
        <div className="text-center">
          <button
            onClick={() => downloadReport(reportPreview, "Yearly_Safety_Report")}
            className="bg-[#1A1A1A] border border-[#00BFA5] text-[#00BFA5] px-8 py-3 rounded-lg font-medium hover:bg-[#00BFA5] hover:text-white transition-colors inline-flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Report (TXT)
          </button>
        </div>
      )}

      {/* 🗂 Past Reports */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Past Yearly Reports</h2>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-[#888] text-sm">No reports generated yet.</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg hover:border-[#00BFA5] transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8 text-[#00BFA5]" />
                  <div>
                    <p className="text-white font-medium">{report.report_name}</p>
                    <div className="flex items-center text-sm text-[#888888] mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Generated on{" "}
                      {new Date(report.generated_at).toLocaleDateString()} (
                      {report.year})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReportPreview(report.content)}
                  className="text-[#00BFA5] hover:text-[#00E676] transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
