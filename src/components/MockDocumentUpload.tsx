import React, { useState } from 'react';
import { FileText, Upload } from 'lucide-react';

interface MockDocumentUploadProps {
  inputId: string;
  prompt: string;
  detail: string;
  accept?: string;
  onFilesAdded: (files: File[]) => void;
}

export const MockDocumentUpload: React.FC<MockDocumentUploadProps> = ({
  inputId,
  prompt,
  detail,
  accept = '.pdf,.jpg,.jpeg,.png,.txt,text/plain',
  onFilesAdded,
}) => {
  const [sampleError, setSampleError] = useState('');

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length) onFilesAdded(files);
    event.target.value = '';
  };

  const handleSampleEvidence = async () => {
    setSampleError('');
    try {
      const response = await fetch('/mock-documents/demo-identity-evidence.txt');
      if (!response.ok) throw new Error('Sample file is unavailable.');
      const sampleFile = new File([await response.blob()], 'demo-identity-evidence.txt', { type: 'text/plain' });
      onFilesAdded([sampleFile]);
    } catch {
      setSampleError('Could not load the demo file. Use the file picker instead.');
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-[#002D72] hover:bg-blue-50/40">
        <Upload className="mb-1 h-5 w-5 text-[#002D72]" />
        <span className="text-xs font-bold text-slate-800">{prompt}</span>
        <span className="mt-0.5 text-[10px] text-slate-500">{detail} · TXT demo supported</span>
        <input id={inputId} data-testid={inputId} type="file" accept={accept} multiple className="sr-only" onChange={handleFileSelection} />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] text-slate-500"><FileText className="h-3.5 w-3.5" />Demo evidence contains no personal data.</p>
        <div className="flex items-center gap-2">
          <a href="/mock-documents/demo-identity-evidence.txt" download className="text-[10px] font-semibold text-[#002D72] hover:underline">Download sample</a>
          <button type="button" onClick={handleSampleEvidence} className="border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:border-[#002D72] hover:text-[#002D72]">Attach demo file</button>
        </div>
      </div>
      {sampleError && <p role="alert" className="text-[10px] text-rose-700">{sampleError}</p>}
    </div>
  );
};