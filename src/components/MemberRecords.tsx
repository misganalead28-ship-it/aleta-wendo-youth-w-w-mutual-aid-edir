import React, { useState } from 'react';
import { BookOpen, Download, Eye, FileSpreadsheet, Paperclip, Search } from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { tr } from '../i18n/translations';
import { EdirRecordDoc } from '../types';

type FilterKind = 'all' | EdirRecordDoc['recordType'];

export const MemberRecords: React.FC = () => {
  const { lang, records } = useEdir();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterKind>('all');
  const [openDoc, setOpenDoc] = useState<EdirRecordDoc | null>(null);

  const filtered = records.filter((doc) => {
    if (typeFilter !== 'all' && doc.recordType !== typeFilter) return false;
    const q = search.toLowerCase();
    if (
      q &&
      !doc.titleEn.toLowerCase().includes(q) &&
      !doc.titleAm.includes(search) &&
      !doc.summaryEn.toLowerCase().includes(q) &&
      !doc.code.toLowerCase().includes(q) &&
      !(doc.attachedFileName || '').toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  const handleDownload = (doc: EdirRecordDoc) => {
    if (doc.attachedDataUrl && doc.attachedFileName) {
      const a = document.createElement('a');
      a.href = doc.attachedDataUrl;
      a.download = doc.attachedFileName;
      a.click();
      return;
    }
    const content = `${tr('orgFullName', lang)}\n${doc.code} — ${
      lang === 'am' ? doc.titleAm : doc.titleEn
    }\nDate: ${doc.date} | Author: ${doc.author}\n\n${
      lang === 'am' ? doc.contentAm : doc.contentEn
    }`;
    const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.id}_${doc.recordType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryLabel = (t: EdirRecordDoc['recordType']) => {
    const map: Record<EdirRecordDoc['recordType'], { am: string; en: string }> = {
      bylaw: { am: 'መተዳደሪያ ደንብ', en: 'Bylaw' },
      minutes: { am: 'ቃለ ጉባኤ', en: 'Minutes' },
      policy: { am: 'መመሪያ', en: 'Policy' },
      financial_sheet: { am: 'የፋይናንስ ሰንጠረዥ', en: 'Financial Sheet' },
      member_sheet: { am: 'የአባላት መዝገብ', en: 'Member Sheet' },
    };
    return lang === 'am' ? map[t].am : map[t].en;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am'
            ? 'የዕድሩ መዛግብት፣ መተዳደሪያ ደንብ እና ቃለ ጉባኤዎች'
            : 'Edir Records, Bylaws (መተዳደሪያ ደንብ) & Meeting Minutes'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {lang === 'am'
            ? 'የዕድሩን ህገ ደንብ፣ የጸደቁ ቃለ ጉባኤዎችን እና በኮሚቴ የተጫኑ መዛግብትን በቀላሉ ይፈልጉ እና ያንብቡ።'
            : 'Browse, search, read, and download official bylaws, approved minutes, and imported Edir records.'}
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-[#DCE2DD] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr('searchPlaceholder', lang)}
            className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D34]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EAEFEA] rounded-lg">
          {(
            [
              { id: 'all', am: 'ሁሉም', en: 'All' },
              { id: 'bylaw', am: 'ህገ ደንብ', en: 'Bylaws' },
              { id: 'minutes', am: 'ቃለ ጉባኤ', en: 'Minutes' },
              { id: 'financial_sheet', am: 'ፋይናንስ', en: 'Financial' },
              { id: 'member_sheet', am: 'አባላት', en: 'Members' },
              { id: 'policy', am: 'መመሪያ', en: 'Policies' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                typeFilter === tab.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569]'
              }`}
            >
              {lang === 'am' ? tab.am : tab.en}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <article
            key={doc.id}
            className="bg-white border border-[#DCE2DD] rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-[#64748B]">
                <span className="font-semibold text-[#0E4D34]">
                  {doc.code} · {categoryLabel(doc.recordType)}
                </span>
                <span className="font-mono tabular-nums">{doc.date}</span>
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {lang === 'am' ? doc.titleAm : doc.titleEn}
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed">
                {lang === 'am' ? doc.summaryAm : doc.summaryEn}
              </p>

              {doc.attachedFileName && (
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0E4D34] pt-1">
                  {doc.importedRowCount ? (
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="font-mono truncate max-w-[230px]">{doc.attachedFileName}</span>
                  {doc.attachedFileSize && (
                    <span className="text-[#64748B]">({doc.attachedFileSize})</span>
                  )}
                  {doc.importedRowCount ? (
                    <span className="text-[#B8821E] font-mono">
                      · {doc.importedRowCount} {lang === 'am' ? 'መስመሮች' : 'rows'}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EEF1EE] flex items-center justify-between gap-2">
              <span className="text-xs text-[#64748B] truncate">{doc.author}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setOpenDoc(doc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {lang === 'am' ? 'ሙሉውን አንብብ' : 'Read Full'}
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] border border-[#D4DBD7] rounded-lg hover:bg-[#F4F6F5]"
                >
                  <Download className="w-3.5 h-3.5" />
                  {lang === 'am' ? 'አውርድ' : 'Download'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Full Record Reader Modal */}
      {openDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4DBD7] rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#EEF1EE] pb-3">
              <div>
                <p className="text-xs font-semibold text-[#B8821E]">
                  {openDoc.code} · {categoryLabel(openDoc.recordType)}
                </p>
                <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
                  {lang === 'am' ? openDoc.titleAm : openDoc.titleEn}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {openDoc.date} · {openDoc.author}
                </p>
              </div>
              <button
                onClick={() => setOpenDoc(null)}
                className="px-3 py-1.5 text-xs font-medium border border-[#D4DBD7] rounded-lg"
              >
                {tr('close', lang)}
              </button>
            </div>

            {openDoc.attachedFileName && (
              <div className="p-3 bg-[#F3F8F5] border border-[#BBD4C6] rounded-xl flex items-center justify-between gap-3 text-xs">
                <span className="font-mono font-semibold text-[#0E4D34] truncate">
                  {openDoc.attachedFileName}
                  {openDoc.attachedFileSize ? ` (${openDoc.attachedFileSize})` : ''}
                </span>
                <button
                  onClick={() => handleDownload(openDoc)}
                  className="font-semibold text-[#0E4D34] hover:underline whitespace-nowrap"
                >
                  {lang === 'am' ? 'ፋይሉን አውርድ' : 'Download Attachment'}
                </button>
              </div>
            )}

            <div className="text-sm text-[#1E293B] whitespace-pre-line leading-relaxed bg-[#F8FAF9] p-4 rounded-xl border border-[#E2E6E3]">
              {lang === 'am' ? openDoc.contentAm : openDoc.contentEn}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDownload(openDoc)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {lang === 'am' ? 'ቅጂውን አውርድ' : 'Download Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
