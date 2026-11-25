import React, { useState } from 'react';
import { CheckCheck, MailOpen } from 'lucide-react';
import { useEdir } from '../context/EdirContext';

export const CommitteeMessages: React.FC = () => {
  const { lang, messages, markMessageRead, markAllMessagesRead } = useEdir();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'meetings' | 'payments'>('all');

  const filtered = messages.filter((m) => (filter === 'all' ? true : m.category === filter));
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {lang === 'am' ? 'ከኮሚቴ የሚላኩ መልዕክቶች እና ማሳወቂያዎች' : 'Committee Messages & Notifications'}
          </h2>
          <p className="text-sm text-[#475569] mt-0.5">
            {lang === 'am'
              ? 'ይፋዊ ማስታወቂያዎች፣ የስብሰባ ጥሪዎች እና የክፍያ ማሳሰቢያዎች'
              : 'Official announcements, assembly calls, and payment alerts from Edir leadership'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllMessagesRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0E4D34] bg-[#EEF3F0] rounded-xl hover:bg-[#E1ECE6] whitespace-nowrap shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            {lang === 'am' ? `ሁሉንም አንብቤያለሁ (${unreadCount})` : `Mark all read (${unreadCount})`}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EAEFEA] rounded-xl w-fit">
        {(
          [
            { id: 'all', am: 'ሁሉም', en: 'All' },
            { id: 'urgent', am: 'አስቸኳይ', en: 'Urgent' },
            { id: 'meetings', am: 'ስብሰባዎች', en: 'Meetings' },
            { id: 'payments', am: 'ክፍያዎች', en: 'Payments' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === tab.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569]'
            }`}
          >
            {lang === 'am' ? tab.am : tab.en}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="bg-white border border-[#DCE2DD] rounded-2xl divide-y divide-[#EEF1EE]">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            onClick={() => markMessageRead(msg.id)}
            className={`p-5 sm:p-6 transition-colors cursor-pointer ${
              !msg.read ? 'bg-[#F4F8F6]' : 'bg-white hover:bg-[#FAFBFB]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`font-bold uppercase ${
                    msg.category === 'urgent'
                      ? 'text-[#DC2626]'
                      : msg.category === 'payments'
                      ? 'text-[#D97706]'
                      : 'text-[#0E4D34]'
                  }`}
                >
                  {msg.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-[#475569]">
                  {lang === 'am' ? msg.senderAm : msg.senderEn}
                </span>
                {!msg.read && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#0E4D34]">
                      {lang === 'am' ? 'አዲስ' : 'NEW'}
                    </span>
                  </>
                )}
              </div>

              <span className="font-mono text-xs text-[#64748B] tabular-nums">{msg.date}</span>
            </div>

            <h3 className="text-base font-bold text-[#0F172A] mt-2">
              {lang === 'am' ? msg.titleAm : msg.titleEn}
            </h3>
            <p className="text-sm text-[#334155] mt-1 leading-relaxed">
              {lang === 'am' ? msg.bodyAm : msg.bodyEn}
            </p>

            {!msg.read && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E4D34]">
                  <MailOpen className="w-3.5 h-3.5" />
                  {lang === 'am' ? 'ተነቧል ብለህ ምልክት አድርግ' : 'Click to mark as read'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
