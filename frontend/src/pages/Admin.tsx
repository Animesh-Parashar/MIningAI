import { useState } from 'react';
import { Upload, FileText, Database, CheckCircle } from 'lucide-react';

interface UploadedRecord {
  id: string;
  date: string;
  location: string;
  type: string;
  severity: string;
}

export default function Admin() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewRecords, setPreviewRecords] = useState<UploadedRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisComplete(false);

    const mockRecords: UploadedRecord[] = [
      {
        id: '1',
        date: '2025-10-15',
        location: 'Jharkhand - Sector 12',
        type: 'Machinery Failure',
        severity: 'Medium',
      },
      {
        id: '2',
        date: '2025-10-18',
        location: 'Odisha - Block A',
        type: 'Roof Fall',
        severity: 'High',
      },
      {
        id: '3',
        date: '2025-10-22',
        location: 'Chhattisgarh - Site 7',
        type: 'Gas Detection',
        severity: 'High',
      },
      {
        id: '4',
        date: '2025-10-25',
        location: 'West Bengal - Zone 3',
        type: 'Fire',
        severity: 'Medium',
      },
    ];

    setPreviewRecords(mockRecords);
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Upload New DGMS Data Records</h1>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-[#1A1A1A] border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging ? 'border-[#00BFA5] bg-[#0D0D0D]' : 'border-[#2A2A2A]'
        }`}
      >
        <Upload className="w-16 h-16 text-[#00BFA5] mx-auto mb-4" />
        <p className="text-white text-lg mb-2">
          Drag and drop your files here, or click to browse
        </p>
        <p className="text-[#888888] text-sm mb-4">Supported formats: PDF, CSV, JSON</p>
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.csv,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] cursor-pointer transition-colors"
        >
          Select File
        </label>
        {uploadedFile && (
          <div className="mt-4 flex items-center justify-center text-[#00E676]">
            <FileText className="w-5 h-5 mr-2" />
            <span>{uploadedFile.name}</span>
          </div>
        )}
      </div>

      {previewRecords.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Uploaded Records Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left py-3 px-4 text-[#B0B0B0] font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-[#B0B0B0] font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-[#B0B0B0] font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-[#B0B0B0] font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {previewRecords.map((record) => (
                  <tr key={record.id} className="border-b border-[#2A2A2A] hover:bg-[#0D0D0D]">
                    <td className="py-3 px-4 text-[#E0E0E0]">{record.date}</td>
                    <td className="py-3 px-4 text-[#E0E0E0]">{record.location}</td>
                    <td className="py-3 px-4 text-[#E0E0E0]">{record.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          record.severity === 'High'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {record.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewRecords.length > 0 && (
        <div className="text-center">
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || analysisComplete}
            className="bg-[#00BFA5] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <Database className="w-5 h-5 mr-2" />
            {isAnalyzing ? 'Running NLP Analysis...' : analysisComplete ? 'Analysis Complete' : 'Run NLP Analysis'}
          </button>
        </div>
      )}

      {analysisComplete && (
        <div className="bg-[#1A1A1A] border border-[#00E676] rounded-xl p-6">
          <div className="flex items-center text-[#00E676] mb-4">
            <CheckCircle className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Analysis Complete</h3>
          </div>
          <div className="space-y-2 text-[#E0E0E0]">
            <p>✓ Successfully processed 4 records</p>
            <p>✓ Extracted key entities and safety metrics</p>
            <p>✓ Classified incident types and severity levels</p>
            <p>✓ Updated database with new entries</p>
            <p>✓ Generated predictive risk indicators</p>
          </div>
        </div>
      )}

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Last Batch Processed</h3>
            <p className="text-[#888888]">150 Records (Updated Yesterday)</p>
          </div>
          <Database className="w-12 h-12 text-[#00BFA5]" />
        </div>
      </div>
    </div>
  );
}
