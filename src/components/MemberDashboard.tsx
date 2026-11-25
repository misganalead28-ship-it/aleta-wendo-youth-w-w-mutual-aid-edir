import React from 'react';
import {
  ArrowRight,
  Award,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FilePlus2,
  Globe2,
  Mail,
  MapPin,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { BENEFIT_RULES } from '../data/seedData';
import { tr } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';

export const MemberDashboard: React.FC = () => {
  const { lang, currentUser, meetings, messages, setActiveTab } = useEdir();

  const totalPending =
    currentUser.monthlyDueBalance +
    currentUser.penaltyBalance +
    currentUser.specialDueBalance;

  const liveMeeting = meetings.find((m) => m.status === 'live') || meetings[0];
  const recentMessages = messages.slice(0, 3);
  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const paymentStatusLabel =
    currentUser.penaltyBalance > 0
      ? tr('statusPenalty', lang)
      : totalPending > 0
      ? tr('statusDue', lang)
      : tr('statusPaid', lang);

  const paymentStatusColor =
    currentUser.penaltyBalance > 0
      ? 'text-[#DC2626]'
      : totalPending > 0
      ? 'text-[#D97706]'
      : 'text-[#16A34A]';

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Shortcuts Card */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <MemberAvatar
              src={currentUser.photoUrl}
              name={lang === 'am' ? currentUser.fullNameAm : currentUser.fullNameEn}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
                <span className="font-mono font-semibold text-[#0E4D34]">{currentUser.id}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  {currentUser.residenceType === 'out_of_town' ? (
                    <Globe2 className="w-3.5 h-3.5 text-[#0E4D34]" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-[#B8821E]" />
                  )}
                  {currentUser.city}, {currentUser.country}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#0E4D34]">
                  {currentUser.residenceType === 'out_of_town'
                    ? tr('statusOutOfTown', lang)
                    : tr('statusLocal', lang)}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
                {lang === 'am'
                  ? `ሰላም፣ ${currentUser.fullNameAm}`
                  : `Welcome, ${currentUser.fullNameEn}`}
              </h1>
              <p className="text-sm text-[#475569] mt-0.5">
                {currentUser.residenceType === 'out_of_town'
                  ? lang === 'am'
                    ? 'ከአለታ ወንዶ ውጪ ነዋሪ ስለሆኑ በአካል ስብሰባ መገኘት አይጠበቅብዎትም (በራስ-ሰር ነፃ ነዎት)።'
                    : 'Registered outside Aleta Wondo — physical meeting attendance is not required for you.'
                  : lang === 'am'
                  ? 'የአባልነት ሂሳብዎን ይክፈሉ፣ ጥያቄ ያቅርቡ ወይም በስብሰባ ቦታ QR አቴንዳንስ ይመዝገቡ።'
                  : 'Manage your contributions, submit Edir requests, or scan meeting QR attendance.'}
              </p>
            </div>
          </div>

          {/* Quick-Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('payments')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] transition-colors whitespace-nowrap min-h-[44px]"
            >
              <CreditCard className="w-4 h-4" />
              {lang === 'am' ? 'ክፍያ እና ደረሰኝ ላክ' : 'Pay & Attach Receipt'}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-[#0F172A] bg-[#F8FAF9] border border-[#D4DBD7] rounded-xl hover:bg-[#EEF3F0] transition-colors whitespace-nowrap min-h-[44px]"
            >
              <FilePlus2 className="w-4 h-4 text-[#0E4D34]" />
              {lang === 'am' ? 'ጥያቄ አቅርብ' : 'Submit Request'}
            </button>
            <button
              onClick={() => setActiveTab('qr_scanner')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-[#854D0E] bg-[#FDF8EE] border border-[#E5C98B] rounded-xl hover:bg-[#FAF0D7] transition-colors whitespace-nowrap min-h-[44px]"
            >
              <QrCode className="w-4 h-4" />
              {lang === 'am' ? 'QR ስካነር ክፈት' : 'QR Scanner'}
            </button>
          </div>
        </div>
      </section>

      {/* 4 Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Membership & Payment Status */}
        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'የአባልነት እና ክፍያ ሁኔታ' : 'Membership & Payment Status'}</span>
            <ShieldCheck className="w-4 h-4 text-[#0E4D34]" />
          </div>
          <div className="mt-3">
            <p className={`text-lg font-bold ${paymentStatusColor}`}>{paymentStatusLabel}</p>
            <p className="text-xs text-[#475569] mt-1">
              {lang === 'am' ? 'የመጨረሻ የተከፈለ ወር፡' : 'Last Paid Month:'}{' '}
              <span className="font-mono font-medium text-[#0F172A]">
                {currentUser.lastPaidMonth}
              </span>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('digital_id')}
            className="mt-4 pt-3 border-t border-[#EEF1EE] inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E4D34] hover:underline"
          >
            <Award className="w-3.5 h-3.5" />
            {lang === 'am' ? 'ዲጂታል መታወቂያ እይ' : 'View Digital Member ID'}
          </button>
        </div>

        {/* Card 2: Total Paid vs Pending Balance */}
        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'ጠቅላላ የተከፈለ እና ቀሪ ሂሳብ' : 'Total Paid vs. Pending Balance'}</span>
            <CreditCard className="w-4 h-4 text-[#B8821E]" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#64748B]">{lang === 'am' ? 'ቀሪ ክፍያ' : 'Pending'}:</span>
              <span className="text-xl font-bold font-mono tabular-nums text-[#0F172A]">
                {totalPending.toLocaleString()} {tr('etb', lang)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#64748B]">{lang === 'am' ? 'እስካሁን የተከፈለ' : 'Total Paid'}:</span>
              <span className="text-sm font-semibold font-mono tabular-nums text-[#16A34A]">
                {currentUser.totalPaidEtb.toLocaleString()} {tr('etb', lang)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('payments')}
            className="mt-4 pt-3 border-t border-[#EEF1EE] inline-flex items-center justify-between w-full text-xs font-semibold text-[#0E4D34] hover:underline"
          >
            <span>
              {currentUser.penaltyBalance > 0
                ? `${currentUser.penaltyBalance} ${tr('etb', lang)} ${
                    lang === 'am' ? 'ቅጣት አለበት' : 'penalty included'
                  }`
                : lang === 'am'
                ? 'ዝርዝር ይመልከቱ'
                : 'View dues breakdown'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Upcoming Meeting */}
        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'ቀጣይ ስብሰባ' : 'Upcoming Meeting'}</span>
            <CalendarClock className="w-4 h-4 text-[#0E4D34]" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold text-[#0F172A] line-clamp-2">
              {lang === 'am' ? liveMeeting.titleAm : liveMeeting.titleEn}
            </p>
            <p className="text-xs font-mono text-[#475569] mt-1 tabular-nums">
              {liveMeeting.date} · {liveMeeting.time}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('qr_scanner')}
            className="mt-4 pt-3 border-t border-[#EEF1EE] inline-flex items-center justify-between w-full text-xs font-semibold text-[#0E4D34] hover:underline"
          >
            <span>
              {currentUser.residenceType === 'out_of_town'
                ? lang === 'am'
                  ? 'ከስብሰባ ነፃ ነዎት'
                  : 'Exempt (Out-of-Town)'
                : lang === 'am'
                ? 'በQR አቴንዳንስ ይመዝገቡ'
                : 'Open QR Check-In'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Recent Committee Messages */}
        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'የኮሚቴ መልዕክቶች' : 'Committee Messages'}</span>
            <Mail className="w-4 h-4 text-[#0E4D34]" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold font-mono tabular-nums text-[#0F172A]">
              {unreadMessagesCount}{' '}
              <span className="text-sm font-sans font-medium text-[#475569]">
                {lang === 'am' ? 'ያልተነበቡ መልዕክቶች' : 'unread alerts'}
              </span>
            </p>
            <p className="text-xs text-[#475569] mt-1 line-clamp-1">
              {lang === 'am' ? recentMessages[0]?.titleAm : recentMessages[0]?.titleEn}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('messages')}
            className="mt-4 pt-3 border-t border-[#EEF1EE] inline-flex items-center justify-between w-full text-xs font-semibold text-[#0E4D34] hover:underline"
          >
            <span>{lang === 'am' ? 'መልዕክቶችን ክፈት' : 'Open Inbox'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Dedicated Section: Edir Benefit Payout Rules (የሚፈጸሙ ክፍያዎች አይነትና መጠን) & Recent Committee Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Benefit Payouts Card */}
        <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#EEF1EE]">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  {tr('benefitPayoutsTitle', lang)}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {lang === 'am'
                    ? 'በዕድሩ ደንብ መሰረት ለአባላት እና ለተመዘገቡ ቤተሰቦች የሚፈጸሙ የገንዘብ እና የንብረት ድጋፎች'
                    : 'Official mutual aid cash payouts & non-cash support covered by your membership'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs font-semibold text-[#0E4D34] hover:underline whitespace-nowrap shrink-0"
              >
                {lang === 'am' ? 'ድጋፍ ጠይቅ →' : 'Claim Benefit →'}
              </button>
            </div>

            <div className="divide-y divide-[#EEF1EE] mt-2">
              {BENEFIT_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {lang === 'am' ? rule.titleAm : rule.titleEn}
                    </p>
                    <p className="text-xs text-[#334155]">
                      {lang === 'am' ? rule.nonCashSupportAm : rule.nonCashSupportEn}
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      {lang === 'am' ? rule.eligibilityNoteAm : rule.eligibilityNoteEn}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="font-mono text-base font-bold text-[#0E4D34] tabular-nums">
                      {rule.payoutAmountEtb.toLocaleString()} {tr('etb', lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Messages & Family Coverage Quick Summary */}
        <section className="lg:col-span-5 bg-white border border-[#DCE2DD] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#EEF1EE]">
              <h2 className="text-base font-bold text-[#0F172A]">
                {lang === 'am' ? 'የቅርብ ጊዜ የኮሚቴ መልዕክቶች' : 'Recent Committee Messages'}
              </h2>
              <button
                onClick={() => setActiveTab('messages')}
                className="text-xs font-semibold text-[#0E4D34] hover:underline"
              >
                {lang === 'am' ? 'ሁሉንም እይ' : 'View all'}
              </button>
            </div>

            <div className="divide-y divide-[#EEF1EE] mt-2">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span
                      className={`font-semibold ${
                        msg.category === 'urgent'
                          ? 'text-[#DC2626]'
                          : msg.category === 'payments'
                          ? 'text-[#D97706]'
                          : 'text-[#0E4D34]'
                      }`}
                    >
                      {msg.category.toUpperCase()} {!msg.read ? '· UNREAD' : ''}
                    </span>
                    <span className="font-mono tabular-nums">{msg.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {lang === 'am' ? msg.titleAm : msg.titleEn}
                  </p>
                  <p className="text-xs text-[#475569] line-clamp-2">
                    {lang === 'am' ? msg.bodyAm : msg.bodyEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#EEF1EE] flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#334155]">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>
                {currentUser.beneficiaries.length}{' '}
                {lang === 'am' ? 'የቤተሰብ አባላት ተመዝግበዋል' : 'covered dependents registered'}
              </span>
            </span>
            <button
              onClick={() => setActiveTab('family')}
              className="font-semibold text-[#0E4D34] hover:underline"
            >
              {lang === 'am' ? 'ቤተሰብ አስተካክል' : 'Manage Family'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
