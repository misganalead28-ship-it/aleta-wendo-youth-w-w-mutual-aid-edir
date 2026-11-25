import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Camera,
  CheckCircle2,
  Globe2,
  MapPin,
  QrCode,
  ScanLine,
  VideoOff,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';

export const QrAttendanceScanner: React.FC = () => {
  const { lang, currentUser, meetings, recordQrAttendance } = useEdir();

  const liveMeeting = meetings.find((m) => m.status === 'live') || meetings[0];
  const isOutOfTown = currentUser.residenceType === 'out_of_town';

  const myRecord = liveMeeting?.attendance.find((a) => a.memberId === currentUser.id);
  const isCheckedIn = myRecord?.status === 'present';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        lang === 'am'
          ? 'ካሜራ በዚህ ብራውዘር ውስጥ አይደገፍም። ከታች ያለውን የQR ማረጋገጫ ቁልፍ ይጠቀሙ።'
          : 'Camera API unavailable in this environment. Use the Verify Venue QR Check-In button below.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(
        lang === 'am'
          ? 'የካሜራ ፍቃድ አልተሰጠም — ከታች ያለውን "Scan Meeting QR" ቁልፍ ይጫኑ።'
          : 'Camera permission unavailable or declined. Use the "Verify Venue QR Check-In" button below to record attendance.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am'
            ? 'QR ስካነር ለስብሰባ አቴንዳንስ'
            : 'QR Scanner for Meeting Attendance'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {lang === 'am'
            ? 'በኮሚቴው የተጠራ ስብሰባ ሲኖር በቦታው ያለውን QR ኮድ በመቃኘት አቴንዳንስዎን ይመዝግቡ።'
            : 'Scan the official meeting venue QR code to verify your attendance instantly.'}
        </p>
      </div>

      {/* Automatic Geo-Location Recognition Banner */}
      {isOutOfTown ? (
        <section className="bg-[#F3F8F5] border border-[#BBD4C6] rounded-2xl p-6 space-y-3">
          <div className="flex items-start gap-3.5">
            <Globe2 className="w-6 h-6 text-[#0E4D34] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#0E4D34]">
                {lang === 'am'
                  ? 'ከአለታ ወንዶ ውጪ ነዋሪ — በአካል ስብሰባ መገኘት አይጠበቅብዎትም'
                  : 'Out-of-Town / Diaspora Member — Physical Attendance Not Required'}
              </h3>
              <p className="text-sm text-[#1E293B] leading-relaxed">
                {lang === 'am'
                  ? `የተመዘገበው አድራሻዎ (${currentUser.city}, ${currentUser.country}) ከአለታ ወንዶ ውጪ በመሆኑ በዕድሩ መተዳደሪያ ደንብ መሰረት ከአካላዊ ስብሰባ እና ከቀሪ ቅጣት በራስ-ሰር ነፃ ነዎት።`
                  : `Your registered address (${currentUser.city}, ${currentUser.country}) is outside Aleta Wondo. Per Edir Bylaws Article 4, physical meeting attendance is automatically waived and no absentee penalty applies.`}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[#FDF8EE] border border-[#E5C98B] rounded-2xl p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#B8821E] shrink-0" />
          <p className="text-xs sm:text-sm text-[#78350F]">
            {lang === 'am'
              ? `አድራሻዎ በአለታ ወንዶ (${currentUser.addressDetail}) ስለሆነ በስብሰባ ቦታ QR አቴንዳንስ መመዝገብ ያስፈልጋል።`
              : `Your registered address is in Aleta Wondo (${currentUser.addressDetail}). Please scan the venue QR code when attending.`}
          </p>
        </section>
      )}

      {/* Active Meeting Card + Scanner Interface */}
      {liveMeeting && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Viewport */}
          <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EEF1EE] pb-3">
              <div>
                <p className="text-xs font-semibold text-[#0E4D34]">
                  {lang === 'am' ? 'ንቁ የስብሰባ ጥሪ' : 'Active Initiated Meeting'}
                </p>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {lang === 'am' ? liveMeeting.titleAm : liveMeeting.titleEn}
                </h3>
              </div>
              <span className="font-mono text-xs text-[#64748B]">{liveMeeting.date}</span>
            </div>

            <div className="text-xs text-[#475569] space-y-1">
              <p>
                <strong>{lang === 'am' ? 'ቦታ እና ሰዓት፡' : 'Venue & Time:'}</strong>{' '}
                {lang === 'am' ? liveMeeting.locationAm : liveMeeting.locationEn} ·{' '}
                {liveMeeting.time}
              </p>
              <p>
                <strong>{lang === 'am' ? 'አጀንዳ፡' : 'Agenda:'}</strong>{' '}
                {lang === 'am' ? liveMeeting.agendaAm : liveMeeting.agendaEn}
              </p>
            </div>

            {/* Camera Box */}
            <div className="relative bg-[#0F172A] rounded-2xl overflow-hidden aspect-[4/3] max-h-[300px] flex items-center justify-center border border-[#D4DBD7]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#F5DFA9]/60 flex items-center justify-center mx-auto text-[#F5DFA9]">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-white/80 max-w-xs mx-auto">
                    {cameraError ||
                      (lang === 'am'
                        ? 'የስልክዎን ካሜራ በመክፈት የስብሰባ አዳራሹን QR ኮድ ይቃኙ'
                        : 'Activate camera to scan the meeting venue QR code, or use the desktop simulation button below.')}
                  </p>
                </div>
              )}

              {/* Target Reticle */}
              {cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-44 h-44 border-2 border-[#F5DFA9] rounded-xl" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isCheckedIn ? (
              <div className="p-4 bg-[#F3F8F5] border border-[#BBD4C6] rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#0E4D34]">
                    {lang === 'am'
                      ? 'የስብሰባ አቴንዳንስዎ ተመዝግቧል!'
                      : 'Attendance Recorded Successfully!'}
                  </p>
                  <p className="text-xs text-[#334155]">
                    {lang === 'am' ? 'ሰዓት፡' : 'Checked in at'} {myRecord?.checkedInAt} ·{' '}
                    {liveMeeting.qrToken}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-[#0F172A] bg-white border border-[#CBD5D0] rounded-xl hover:bg-[#F4F6F5] min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-[#0E4D34]" />
                    {lang === 'am' ? 'ካሜራ ክፈት' : 'Open Camera Scanner'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-xl min-h-[44px]"
                  >
                    <VideoOff className="w-4 h-4" />
                    {lang === 'am' ? 'ካሜራ ዝጋ' : 'Stop Camera'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => recordQrAttendance(liveMeeting.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] min-h-[44px]"
                >
                  <ScanLine className="w-4 h-4" />
                  {isOutOfTown
                    ? lang === 'am'
                      ? 'የነፃነት ሁኔታ አረጋግጥ'
                      : 'Confirm Out-of-Town Exemption'
                    : lang === 'am'
                    ? 'የQR ስብሰባ አቴንዳንስ መዝግብ'
                    : 'Verify Venue QR Check-In'}
                </button>
              </div>
            )}
          </section>

          {/* Venue Reference QR + Past Attendance */}
          <section className="lg:col-span-5 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-5">
            <div className="text-center p-5 bg-[#F8FAF9] border border-[#E2E6E3] rounded-xl space-y-3">
              <p className="text-xs font-semibold text-[#0E4D34]">
                {lang === 'am' ? 'የስብሰባው ይፋዊ QR ኮድ' : 'Official Venue QR Code'}
              </p>
              <div className="inline-block p-3 bg-white border border-[#D4DBD7] rounded-xl">
                <QRCodeSVG
                  value={JSON.stringify({ meetingId: liveMeeting.id, token: liveMeeting.qrToken })}
                  size={140}
                  fgColor="#0E4D34"
                />
              </div>
              <p className="font-mono text-xs text-[#64748B]">{liveMeeting.qrToken}</p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-[#0F172A]">
                {lang === 'am' ? 'የቀደሙ ስብሰባዎች አቴንዳንስ' : 'My Recent Meeting Attendance'}
              </h4>
              <div className="divide-y divide-[#EEF1EE]">
                {meetings.map((m) => {
                  const rec = m.attendance.find((a) => a.memberId === currentUser.id);
                  return (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-[#0F172A]">
                          {lang === 'am' ? m.titleAm : m.titleEn}
                        </p>
                        <p className="font-mono text-[#64748B]">{m.date}</p>
                      </div>
                      <span
                        className={`font-semibold shrink-0 ${
                          isOutOfTown || rec?.status === 'geo_exempt'
                            ? 'text-[#0E4D34]'
                            : rec?.status === 'present'
                            ? 'text-[#16A34A]'
                            : 'text-[#D97706]'
                        }`}
                      >
                        {isOutOfTown || rec?.status === 'geo_exempt'
                          ? lang === 'am'
                            ? 'ከከተማ ውጪ (ነፃ)'
                            : 'Exempt'
                          : rec?.status === 'present'
                          ? `${lang === 'am' ? 'ተገኝተዋል' : 'Present'} (${rec.checkedInAt})`
                          : lang === 'am'
                          ? 'በመጠበቅ ላይ'
                          : 'Pending Scan'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
