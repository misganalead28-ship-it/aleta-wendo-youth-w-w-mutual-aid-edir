import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, RotateCw, ShieldCheck, MapPin, Phone, Droplets } from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { LOGO_PATH, tr } from '../i18n/translations';
import { MemberAvatar } from './MemberAvatar';

export const DigitalIdCard: React.FC = () => {
  const { currentUser, lang } = useEdir();
  const [showBothSides, setShowBothSides] = useState(true);

  const qrPayload = JSON.stringify({
    org: 'ALETA_WONDO_YOUTH_EDIR',
    id: currentUser.id,
    name: currentUser.fullNameEn,
    residence: currentUser.residenceType,
  });

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E6E3]">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            {lang === 'am' ? 'የአባል ዲጂታል መታወቂያ' : 'My Digital Member ID Card'}
          </h2>
          <p className="text-sm text-[#475569] mt-0.5">
            {lang === 'am'
              ? 'ለስብሰባ QR አቴንዳንስ እና ለአባልነት ማረጋገጫ የሚያገለግል የፊትና የጀርባ መታወቂያ'
              : 'Printable front & back official Edir ID with scannable QR verification'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBothSides((v) => !v)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[#0F172A] bg-white border border-[#D4DBD7] rounded-lg hover:bg-[#F1F5F3] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCw className="w-4 h-4 text-[#0E4D34]" />
            {showBothSides
              ? lang === 'am'
                ? 'የፊት ገጽ ብቻ'
                : 'Front Side Only'
              : lang === 'am'
              ? 'ሁለቱንም ገጽ አሳይ'
              : 'Front & Back'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27] transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            {lang === 'am' ? 'መታወቂያ አትም' : 'Print ID Card'}
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${showBothSides ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-lg'}`}>
        {/* FRONT SIDE */}
        <div className="print-container bg-white border border-[#D4DBD7] rounded-xl overflow-hidden max-w-[480px] w-full mx-auto">
          <div className="bg-[#0E4D34] text-white px-5 py-3.5 border-b-2 border-[#C89228]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={LOGO_PATH}
                  alt="Edir Logo"
                  className="w-10 h-10 rounded-full object-cover bg-white p-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#F5DFA9] truncate">
                    የአለታ ወንዶ ወጣቶች በሁሉ ቦታ መረዳጃ ዕድር
                  </p>
                  <p className="text-xs font-semibold tracking-tight truncate">
                    ALETA WONDO YOUTH MUTUAL SUPPORT EDIR
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-[#F5DFA9] tabular-nums shrink-0">
                {currentUser.id}
              </span>
            </div>
          </div>

          <div className="p-5 flex items-start gap-5">
            <div className="shrink-0 space-y-2 text-center">
              <MemberAvatar
                src={currentUser.photoUrl}
                name={currentUser.fullNameEn}
                size="xl"
                className="rounded-xl border-2 border-[#0E4D34]/20"
              />
              <p className="text-[11px] font-semibold text-[#16A34A]">
                {lang === 'am' ? 'ንቁ አባል' : 'Active Member'}
              </p>
            </div>

            <div className="flex-1 min-w-0 space-y-2.5">
              <div>
                <p className="text-base font-bold text-[#0F172A] leading-snug">
                  {currentUser.fullNameAm}
                </p>
                <p className="text-sm font-semibold text-[#334155]">{currentUser.fullNameEn}</p>
                <p className="text-xs text-[#B8821E] font-medium mt-0.5">
                  {lang === 'am' ? currentUser.roleTitleAm : currentUser.roleTitleEn}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EEF1EE] space-y-1.5 text-xs text-[#475569]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0E4D34] shrink-0" />
                  <span className="truncate">
                    {currentUser.city}, {currentUser.country} ·{' '}
                    <strong className="text-[#0F172A]">
                      {currentUser.residenceType === 'local'
                        ? tr('statusLocal', lang)
                        : tr('statusOutOfTown', lang)}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0E4D34] shrink-0" />
                  <span className="font-mono tabular-nums">{currentUser.phone}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>{lang === 'am' ? 'ደም' : 'Blood'}:</span>
                    <strong className="font-mono text-[#0F172A]">
                      {currentUser.bloodType || 'O+'}
                    </strong>
                  </span>
                  <span className="text-[#64748B] font-mono tabular-nums">
                    {lang === 'am' ? 'የገቡበት' : 'Joined'}: {currentUser.joinDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-2.5 bg-[#F8FAF9] border-t border-[#E2E6E3] flex items-center justify-between text-[11px] text-[#475569]">
            <span>{lang === 'am' ? 'የፊት ገጽ' : 'Front Side'} · Official Member ID</span>
            <span className="font-mono text-[#0E4D34] font-medium">Aleta Wondo, Ethiopia</span>
          </div>
        </div>

        {/* BACK SIDE */}
        {showBothSides && (
          <div className="print-container bg-white border border-[#D4DBD7] rounded-xl overflow-hidden max-w-[480px] w-full mx-auto flex flex-col justify-between">
            <div className="bg-[#F8FAF9] px-5 py-3 border-b border-[#E2E6E3] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0E4D34]">
                {lang === 'am' ? 'የጀርባ ገጽ · QR ማረጋገጫ እና አስቸኳይ መረጃ' : 'ID BACK · QR VERIFICATION & EMERGENCY'}
              </span>
              <ShieldCheck className="w-4 h-4 text-[#0E4D34]" />
            </div>

            <div className="p-5 flex items-center gap-5">
              <div className="p-2.5 bg-white border border-[#D4DBD7] rounded-lg shrink-0">
                <QRCodeSVG value={qrPayload} size={112} level="M" fgColor="#0E4D34" />
              </div>

              <div className="flex-1 space-y-2.5 text-xs">
                <div>
                  <p className="text-[#64748B] font-medium">
                    {lang === 'am' ? 'የአደጋ ጊዜ ተጠሪ' : 'Emergency Contact'}
                  </p>
                  <p className="font-semibold text-[#0F172A]">{currentUser.emergencyContactName}</p>
                  <p className="font-mono text-[#334155] tabular-nums">
                    {currentUser.emergencyContactPhone}
                  </p>
                </div>

                <div>
                  <p className="text-[#64748B] font-medium">
                    {lang === 'am' ? 'አድራሻ' : 'Registered Address'}
                  </p>
                  <p className="text-[#0F172A]">{currentUser.addressDetail}</p>
                </div>

                <div className="pt-1 border-t border-[#EEF1EE] text-[11px] text-[#475569]">
                  {currentUser.residenceType === 'out_of_town'
                    ? lang === 'am'
                      ? 'ከአለታ ወንዶ ውጪ ነዋሪ በመሆናቸው ከአካላዊ ስብሰባ ነፃ ናቸው።'
                      : 'Verified Out-of-Town / Diaspora member: Physical assembly attendance is not required.'
                    : lang === 'am'
                    ? 'ይህን QR ኮድ በስብሰባ ቦታ በማሳየት አቴንዳንስ ያስመዝግቡ።'
                    : 'Present this QR code at Aleta Wondo assembly venues for attendance.'}
                </div>
              </div>
            </div>

            <div className="px-5 py-2.5 bg-[#0E4D34] text-white flex items-center justify-between text-[11px]">
              <span>{tr('orgFullName', lang)}</span>
              <span className="font-mono text-[#F5DFA9] tabular-nums">{currentUser.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
