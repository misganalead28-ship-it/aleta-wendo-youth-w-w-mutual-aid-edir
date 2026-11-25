import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Upload,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { tr } from '../i18n/translations';
import { EdirRecordDoc } from '../types';

export const ImportRecordsModule: React.FC = () => {
  const { lang, currentUser, records, importEdirRecord } = useEdir();

  const [recordType, setRecordType] = useState<EdirRecordDoc['recordType']>('bylaw');
  const [code, setCode] = useState('');
  const [titleAm, setTitleAm] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summaryAm, setSummaryAm] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileSize, setAttachedFileSize] = useState('');
  const [attachedDataUrl, setAttachedDataUrl] = useState<string | undefined>(undefined);
  const [importedRowCount, setImportedRowCount] = useState<number | undefined>(undefined);

  const canImport = currentUser.role !== 'member' && currentUser.role !== 'auditor';

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFileName(file.name);
    setAttachedFileSize(formatBytes(file.size));

    const lower = file.name.toLowerCase();
    if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
      const textReader = new FileReader();
      textReader.onload = () => {
        if (typeof textReader.result === 'string') {
          const lines = textReader.result
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
          setImportedRowCount(Math.max(0, lines.length - 1));
          if (!contentEn.trim()) {
            setContentEn(lines.slice(0, 15).join('\n'));
          }
        }
      };
      textReader.readAsText(file);
    } else {
      setImportedRowCount(undefined);
    }

    const urlReader = new FileReader();
    urlReader.onload = () => {
      if (typeof urlReader.result === 'string') {
        setAttachedDataUrl(urlReader.result);
      }
    };
    urlReader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canImport) return;
    if (!titleEn.trim() && !titleAm.trim()) return;

    const finalTitleEn = titleEn.trim() || titleAm.trim();
    const finalTitleAm = titleAm.trim() || titleEn.trim();
    const finalSummaryEn =
      summaryEn.trim() || summaryAm.trim() || `Imported ${recordType.replace('_', ' ')} document.`;
    const finalSummaryAm = summaryAm.trim() || finalSummaryEn;

    importEdirRecord({
      recordType,
      code: code.trim() || `REC-${new Date().getFullYear()}-${records.length + 1}`,
      titleAm: finalTitleAm,
      titleEn: finalTitleEn,
      date,
      summaryAm: finalSummaryAm,
      summaryEn: finalSummaryEn,
      contentAm: contentEn.trim() || finalSummaryAm,
      contentEn: contentEn.trim() || finalSummaryEn,
      attachedFileName: attachedFileName || undefined,
      attachedFileSize: attachedFileSize || undefined,
      attachedDataUrl,
      importedRowCount,
    });

    setCode('');
    setTitleAm('');
    setTitleEn('');
    setSummaryAm('');
    setSummaryEn('');
    setContentEn('');
    setAttachedFileName('');
    setAttachedFileSize('');
    setAttachedDataUrl(undefined);
    setImportedRowCount(undefined);
  };

  const handleDownload = (doc: EdirRecordDoc) => {
    if (doc.attachedDataUrl && doc.attachedFileName) {
      const a = document.createElement('a');
      a.href = doc.attachedDataUrl;
      a.download = doc.attachedFileName;
      a.click();
      return;
    }
    const text = `${tr('orgFullName', lang)}\n${doc.code} — ${doc.titleEn}\n${doc.date}\n\n${doc.contentEn}`;
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am'
            ? 'የዕድሩን መዛግብት ኢንፖርት እና አታች ማድረጊያ'
            : 'Import & Attach Official Edir Records'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {lang === 'am'
            ? 'የዕድሩን ህገ ደንብ፣ ቃለ ጉባኤዎች፣ የፋይናንስ ሪፖርቶችን እና የአባላት ሰንጠረዦችን (PDF, CSV, Excel, ፎቶ) በመጫን በመዛግብት ክፍል ውስጥ ያደራጁ።'
            : 'Upload, import, and organize bylaws, assembly minutes, financial spreadsheets (CSV/Excel), and PDFs into the Edir Records repository.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Import Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-[#EEF1EE] pb-3">
            <FolderPlus className="w-4 h-4 text-[#0E4D34]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'አዲስ መዝገብ ወይም ፋይል አስገባ' : 'Attach / Import New Record'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'የመዝገብ ምድብ' : 'Record Category'}
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as EdirRecordDoc['recordType'])}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="bylaw">{lang === 'am' ? 'ህገ ደንብ (Bylaw)' : 'Bylaws (ህገ ደንብ)'}</option>
                <option value="minutes">
                  {lang === 'am' ? 'ቃለ ጉባኤ (Minutes)' : 'Meeting Minutes (ቃለ ጉባኤ)'}
                </option>
                <option value="financial_sheet">
                  {lang === 'am'
                    ? 'የፋይናንስ ሰንጠረዥ (CSV/Excel/PDF)'
                    : 'Financial Ledger / Spreadsheet'}
                </option>
                <option value="member_sheet">
                  {lang === 'am' ? 'የአባላት መዝገብ (Member Sheet)' : 'Member Roster Sheet'}
                </option>
                <option value="policy">{lang === 'am' ? 'መመሪያ (Policy)' : 'Committee Policy'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ቀን' : 'Document Date'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'መለያ ቁጥር / ኮድ' : 'Reference Code'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ቃለ ጉባኤ 2026-11 or FIN-2026-Q4"
                className="w-full px-3 py-2.5 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ርዕስ (በአማርኛ)' : 'Title (Amharic)'}
              </label>
              <input
                type="text"
                value={titleAm}
                onChange={(e) => setTitleAm(e.target.value)}
                placeholder="የህዳር 2019 የፋይናንስ መዝገብ"
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ርዕስ (English)' : 'Title (English)'}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="November 2026 Treasury & Dues Ledger"
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am' ? 'አጭር ማብራሪያ (አማርኛ)' : 'Short Summary (Amharic - Optional)'}
            </label>
            <input
              type="text"
              value={summaryAm}
              onChange={(e) => setSummaryAm(e.target.value)}
              placeholder="የገቢ፣ ወጪ እና የባንክ ሂሳብ መዝገብ..."
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am' ? 'አጭር ማብራሪያ (English)' : 'Short Description (English)'}
            </label>
            <input
              type="text"
              value={summaryEn}
              onChange={(e) => setSummaryEn(e.target.value)}
              placeholder="Summary of imported document or spreadsheet contents..."
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am'
                ? 'ፋይል ኢንፖርት / አታች ያድርጉ (PDF, CSV, Excel, Word, ፎቶ)'
                : 'Attach / Import File (PDF, CSV, Excel, Word, or Image)'}
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#CBD5D0] rounded-xl bg-[#F8FAF9] hover:border-[#0E4D34] cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-[#0E4D34] mb-1.5" />
              <span className="text-xs font-semibold text-[#0F172A] text-center">
                {attachedFileName
                  ? `${attachedFileName} (${attachedFileSize})`
                  : lang === 'am'
                  ? 'ፋይል ለመምረጥ እዚህ ይጫኑ (.pdf, .csv, .xlsx, .jpg)'
                  : 'Select file to import or attach (.pdf, .csv, .xlsx, .docx, .jpg)'}
              </span>
              {importedRowCount !== undefined && (
                <span className="text-[11px] font-mono text-[#16A34A] mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {importedRowCount} {lang === 'am' ? 'መስመሮች ተነበዋል' : 'CSV data rows parsed'}
                </span>
              )}
              <input
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,image/*"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am' ? 'ዝርዝር ይዘት / ማስታወሻ (አማራጭ)' : 'Document Notes / Extracted Text (Optional)'}
            </label>
            <textarea
              rows={3}
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              placeholder={
                lang === 'am'
                  ? 'የመዝገቡን ዋና ይዘት ወይም ማስታወሻ እዚህ ያስገቡ...'
                  : 'Paste meeting notes, bylaw articles, or remarks...'
              }
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={!canImport}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {lang === 'am' ? 'መዝገቡን ወደ ዕድሩ መዛግብት ጫን' : 'Import & Publish to Edir Records'}
          </button>
        </form>

        {/* Recently Imported & Repository Preview */}
        <section className="lg:col-span-6 bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'በመዛግብት ክፍል የተቀመጡ ሰነዶች' : 'Organized Repository Records'}
            </h3>
            <span className="text-xs font-mono text-[#64748B] tabular-nums">
              {records.length} {lang === 'am' ? 'መዛግብት' : 'records'}
            </span>
          </div>

          <div className="divide-y divide-[#EEF1EE]">
            {records.map((doc) => (
              <div key={doc.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="font-semibold text-[#0E4D34]">{doc.code}</span>
                    <span>·</span>
                    <span className="uppercase">{doc.recordType.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{doc.date}</span>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A]">
                    {lang === 'am' ? doc.titleAm : doc.titleEn}
                  </p>
                  <p className="text-xs text-[#475569] line-clamp-2">
                    {lang === 'am' ? doc.summaryAm : doc.summaryEn}
                  </p>
                  {doc.attachedFileName && (
                    <p className="text-xs font-mono text-[#0E4D34] inline-flex items-center gap-1.5 pt-0.5">
                      {doc.importedRowCount ? (
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>{doc.attachedFileName}</span>
                      {doc.importedRowCount ? (
                        <span className="text-[#B8821E]">({doc.importedRowCount} rows)</span>
                      ) : null}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E4D34] bg-[#EEF3F0] rounded-lg hover:bg-[#E1ECE6] whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  {lang === 'am' ? 'አውርድ' : 'Download'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
