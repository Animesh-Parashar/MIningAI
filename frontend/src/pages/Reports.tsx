import { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

interface Report {
  id: string;
  report_name: string;
  generated_at: string;
  type: string;
}

export default function Reports() {
  const [reportPreview, setReportPreview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const recentReports: Report[] = [
    {
      id: '1',
      report_name: 'Weekly Safety Audit - Week 43',
      generated_at: '2025-10-28',
      type: 'weekly',
    },
    {
      id: '2',
      report_name: 'Monthly Safety Audit - October 2025',
      generated_at: '2025-10-01',
      type: 'monthly',
    },
    {
      id: '3',
      report_name: 'Weekly Safety Audit - Week 42',
      generated_at: '2025-10-21',
      type: 'weekly',
    },
  ];

  const generateReport = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const preview = `
=== ${type.toUpperCase()} SAFETY AUDIT REPORT ===
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
Total incidents analyzed: ${type === 'weekly' ? '12' : '48'}
Critical alerts: ${type === 'weekly' ? '2' : '7'}
Medium priority: ${type === 'weekly' ? '5' : '18'}
Low priority: ${type === 'weekly' ? '5' : '23'}

KEY FINDINGS:
• Machinery failure incidents decreased by 15% compared to previous ${type}
• Gas detection systems triggered 8 preventive evacuations
• Jharkhand region shows 22% improvement in safety compliance
• Underground coal mines recorded zero major incidents this ${type}

RISK ASSESSMENT:
High Risk Areas: 3 sites identified requiring immediate attention
Medium Risk Areas: 7 sites under enhanced monitoring
Compliance Rate: 94.5% across all monitored facilities

RECOMMENDATIONS:
1. Increase frequency of equipment maintenance checks in high-risk zones
2. Deploy additional gas monitoring sensors in underground operations
3. Conduct safety training refresher for 12 identified personnel
4. Upgrade ventilation systems in 3 critical sectors

AI PREDICTIVE INSIGHTS:
Based on current trends, expect 18% reduction in incidents over next ${type} if recommended actions are implemented.
      `.trim();

      setReportPreview(preview);
      setIsGenerating(false);
    }, 1500);
  };

  const downloadReport = () => {
    alert('Report download initiated. In production, this would generate a PDF/DOCX file.');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Automated Safety Audit Reports</h1>

      <div className="flex space-x-4">
        <button
          onClick={() => generateReport('weekly')}
          disabled={isGenerating}
          className="flex-1 bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Weekly Report'}
        </button>
        <button
          onClick={() => generateReport('monthly')}
          disabled={isGenerating}
          className="flex-1 bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Monthly Report'}
        </button>
      </div>

      {reportPreview && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#00BFA5]" />
            Report Preview
          </h2>
          <pre className="text-sm text-[#E0E0E0] whitespace-pre-wrap font-mono leading-relaxed">
            {reportPreview}
          </pre>
        </div>
      )}

      {reportPreview && (
        <div className="text-center">
          <button
            onClick={downloadReport}
            className="bg-[#1A1A1A] border border-[#00BFA5] text-[#00BFA5] px-8 py-3 rounded-lg font-medium hover:bg-[#00BFA5] hover:text-white transition-colors inline-flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Report (PDF / DOCX)
          </button>
        </div>
      )}

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {recentReports.map((report) => (
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
                    Generated on {report.generated_at}
                  </div>
                </div>
              </div>
              <button className="text-[#00BFA5] hover:text-[#00E676] transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
