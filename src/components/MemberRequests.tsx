import React, { useState } from 'react';
import { CheckCircle2, Clock, Paperclip, Send, XCircle } from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { tr } from '../i18n/translations';
import { MemberRequest } from '../types';

export const MemberRequests: React.FC = () => {
  const { lang, currentUser, requests, submitMemberRequest } = useEdir();

  const [requestType, setRequestType] = useState<MemberRequest['requestType']>('asset_rental');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const myRequests = requests.filter((r) => r.memberId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    submitMemberRequest({
      requestType,
      titleAm: title.trim(),
      titleEn: title.trim(),
      description: description.trim(),
      requestedDate: requestedDate || undefined,
      requestedAmountEtb: requestedAmount ? Number(requestedAmount) : undefined,
      attachmentName: attachmentName || undefined,
    });
    setTitle('');
    setDescription('');
    setRequestedDate('');
    setRequestedAmount('');
    setAttachmentName('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am' ? 'የአባል ጥያቄ ማቅረቢያ' : 'Submit a Request to Edir Committee'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {lang === 'am'
            ? 'የድንኳን/ወንበር ኪራይ፣ የሀዘን/ሰርግ/ህክምና ክፍያ ጥያቄ፣ የአድራሻ ማስተካከያ ወይም አጠቃላይ ጥያቄ ያቅርቡ።'
            : 'Request tent/chair rentals, mutual aid benefit payouts, address updates, or general committee support.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Request Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-base font-bold text-[#0F172A] border-b border-[#EEF1EE] pb-3">
            {lang === 'am' ? 'አዲስ ጥያቄ' : 'New Request Form'}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am' ? 'የጥያቄው አይነት' : 'Request Category'}
            </label>
            <select
              value={requestType}
              onChange={(e) => {
                const val = e.target.value as MemberRequest['requestType'];
                setRequestType(val);
                if (val === 'benefit_claim') setRequestedAmount('5000');
                else setRequestedAmount('');
              }}
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg bg-white"
            >
              <option value="asset_rental">
                {lang === 'am' ? 'የድንኳን / ወንበር / ንብረት ጥያቄ' : 'Edir Asset / Tent / Chair Rental'}
              </option>
              <option value="benefit_claim">
                {lang === 'am' ? 'የሀዘን / ሰርግ / ህክምና ክፍያ ጥያቄ' : 'Benefit Payout Claim'}
              </option>
              <option value="profile_update">
                {lang === 'am' ? 'የአድራሻ / ስልክ ማስተካከያ' : 'Profile / Address Update'}
              </option>
              <option value="general_inquiry">
                {lang === 'am' ? 'አጠቃላይ ጥያቄ / አስተያየት' : 'General Inquiry'}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am' ? 'የጥያቄው ርዕስ' : 'Subject / Title'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                lang === 'am'
                  ? 'ለምሳሌ፡ 1 ድንኳን እና 100 ወንበር ለታህሳስ 10'
                  : 'e.g. Need 1 Tent & 100 Chairs for Dec 12'
              }
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {requestType === 'asset_rental' && (
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  {lang === 'am' ? 'የሚፈለግበት ቀን' : 'Event / Needed Date'}
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
                />
              </div>
            )}
            {requestType === 'benefit_claim' && (
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  {lang === 'am' ? 'የሚጠየቅ የገንዘብ መጠን (ብር)' : 'Claim Amount (ETB)'}
                </label>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-mono border border-[#CBD5D0] rounded-lg"
                />
              </div>
            )}
            <div className={requestType === 'asset_rental' || requestType === 'benefit_claim' ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ተያያዥ ማስረጃ (አማራጭ)' : 'Optional Attachment'}
              </label>
              <label className="flex items-center gap-2 px-3 py-2.5 text-xs text-[#334155] border border-[#CBD5D0] rounded-lg bg-[#F8FAF9] cursor-pointer hover:border-[#0E4D34]">
                <Paperclip className="w-3.5 h-3.5 text-[#0E4D34] shrink-0" />
                <span className="truncate">
                  {attachmentName || (lang === 'am' ? 'ፋይል አያይዝ...' : 'Attach PDF or Image...')}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || '')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am' ? 'ዝርዝር መግለጫ' : 'Description & Details'}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                lang === 'am'
                  ? 'ዝርዝር ሁኔታውን፣ አድራሻውን እና ስልክዎን ይጻፉ...'
                  : 'Provide location, event context, or supporting details...'
              }
              className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] transition-colors min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            {lang === 'am' ? 'ጥያቄውን ላክ' : 'Submit Request'}
          </button>
        </form>

        {/* Past Requests History */}
        <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'ያቀረቧቸው ጥያቄዎች ዝርዝር' : 'My Past Requests & Status'}
            </h3>
            <span className="text-xs font-mono text-[#64748B] tabular-nums">
              {myRequests.length} {lang === 'am' ? 'ጥያቄዎች' : 'requests'}
            </span>
          </div>

          {myRequests.length === 0 ? (
            <p className="p-6 text-sm text-[#64748B]">
              {lang === 'am' ? 'እስካሁን የቀረበ ጥያቄ የለም።' : 'You have not submitted any requests yet.'}
            </p>
          ) : (
            <div className="divide-y divide-[#EEF1EE]">
              {myRequests.map((req) => (
                <div key={req.id} className="p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span className="font-mono">{req.id}</span>
                      <span>·</span>
                      <span>{req.requestType.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{req.submittedDate}</span>
                    </div>

                    <div className="text-xs">
                      {req.status === 'approved' || req.status === 'disbursed' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {req.status === 'disbursed'
                            ? tr('statusDisbursed', lang)
                            : tr('statusApproved', lang)}
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#DC2626]">
                          <XCircle className="w-3.5 h-3.5" />
                          {tr('statusRejected', lang)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#D97706]">
                          <Clock className="w-3.5 h-3.5" />
                          {req.status === 'pending_vice_chair'
                            ? lang === 'am'
                              ? 'ምክትል ሰብሳቢ እየተመለከቱት'
                              : 'Pending Vice Chair'
                            : req.status === 'pending_chair'
                            ? lang === 'am'
                              ? 'ዋና ሰብሳቢ ፍቃድ ይጠበቃል'
                              : 'Pending Chairperson'
                            : req.status === 'pending_cashier'
                            ? lang === 'am'
                              ? 'ገንዘብ ያዥ ክፍያ ይጠበቃል'
                              : 'Pending Cashier Payout'
                            : tr('statusPendingReview', lang)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-[#0F172A]">
                      {lang === 'am' ? req.titleAm : req.titleEn}
                    </h4>
                    {req.requestedAmountEtb && (
                      <span className="font-mono text-sm font-bold text-[#0E4D34] shrink-0 tabular-nums">
                        {req.requestedAmountEtb.toLocaleString()} {tr('etb', lang)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#475569]">{req.description}</p>

                  {req.attachmentName && (
                    <p className="text-xs text-[#0E4D34] inline-flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      {req.attachmentName}
                    </p>
                  )}

                  {(req.committeeResponseAm || req.committeeResponseEn) && (
                    <div className="p-3 bg-[#F8FAF9] border border-[#E2E6E3] rounded-lg text-xs text-[#334155]">
                      <strong className="text-[#0E4D34]">
                        {lang === 'am' ? 'የኮሚቴ ምላሽ፡ ' : 'Committee Update: '}
                      </strong>
                      {lang === 'am' ? req.committeeResponseAm : req.committeeResponseEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
