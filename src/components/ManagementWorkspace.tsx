import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  Lock,
  MapPin,
  Megaphone,
  Package,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Unlock,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { ROLE_LABELS, tr } from '../i18n/translations';
import { CommitteeMessage, FamilyBeneficiary, MemberRequest, PortalRole } from '../types';
import { MemberAvatar } from './MemberAvatar';

export const MgmtOverviewView: React.FC = () => {
  const {
    lang,
    currentUser,
    accounts,
    transactions,
    requests,
    directives,
    meetings,
    records,
    updateDirectiveStatus,
    setActiveTab,
  } = useEdir();

  const membersOnly = accounts.filter((a) => a.role === 'member');
  const pendingReceipts = transactions.filter((t) => t.status === 'pending_verification').length;
  const pendingViceChair = requests.filter((r) => r.status === 'pending_vice_chair').length;
  const pendingChair =
    requests.filter((r) => r.status === 'pending_chair').length +
    accounts.filter((a) => a.status === 'pending_chair').length;
  const pendingPayouts = requests.filter((r) => r.status === 'pending_cashier').length;

  const myDirectives = directives.filter(
    (d) => d.assignedToRole === currentUser.role || currentUser.role === 'chairperson' || currentUser.role === 'auditor'
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#DCE2DD] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MemberAvatar src={currentUser.photoUrl} name={currentUser.fullNameEn} size="lg" />
          <div>
            <p className="text-xs font-semibold text-[#B8821E]">
              {lang === 'am' ? ROLE_LABELS[currentUser.role].am : ROLE_LABELS[currentUser.role].en}
            </p>
            <h1 className="text-xl font-bold text-[#0F172A]">
              {lang === 'am' ? currentUser.fullNameAm : currentUser.fullNameEn}
            </h1>
            <p className="text-xs text-[#64748B] font-mono mt-0.5">
              {currentUser.id} · {currentUser.city}, {currentUser.country}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {(currentUser.role === 'vice_chair' || currentUser.role === 'secretary') && (
            <button
              onClick={() => setActiveTab('mgmt_members')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              {lang === 'am' ? 'አዲስ አባል መዝግብ' : 'Register New Member'}
            </button>
          )}
          {currentUser.role === 'vice_chair' && (
            <button
              onClick={() => setActiveTab('mgmt_approvals')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F172A] bg-[#F8FAF9] border border-[#D4DBD7] rounded-xl hover:bg-[#EEF3F0] whitespace-nowrap"
            >
              <ClipboardCheck className="w-4 h-4 text-[#0E4D34]" />
              {lang === 'am' ? `ጥያቄዎችን አጽድቅ (${pendingViceChair})` : `Review Requests (${pendingViceChair})`}
            </button>
          )}
          {currentUser.role === 'cashier' && (
            <button
              onClick={() => setActiveTab('mgmt_cashier')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              {lang === 'am' ? `ደረሰኞችን አረጋግጥ (${pendingReceipts})` : `Verify Receipts (${pendingReceipts})`}
            </button>
          )}
          {currentUser.role !== 'auditor' && (
            <button
              onClick={() => setActiveTab('mgmt_import_records')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#854D0E] bg-[#FDF8EE] border border-[#E5C98B] rounded-xl hover:bg-[#FAF0D7] whitespace-nowrap"
            >
              {lang === 'am' ? 'መዛግብት ኢንፖርት አድርግ' : 'Import Edir Records'}
            </button>
          )}
        </div>
      </section>

      {/* Key Operational Queues */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <p className="text-xs font-medium text-[#64748B]">
            {lang === 'am' ? 'የተመዘገቡ አባላት' : 'Registered Member Accounts'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
            {membersOnly.length}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {membersOnly.filter((m) => m.portalAccessEnabled).length}{' '}
            {lang === 'am' ? 'ፖርታል አክሰስ ያላቸው' : 'portal enabled'}
          </p>
        </div>

        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <p className="text-xs font-medium text-[#64748B]">
            {lang === 'am' ? 'ምክትል ሰብሳቢ የሚጠብቁ' : 'Vice Chair Review Queue'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#D97706] mt-2">
            {pendingViceChair}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {lang === 'am' ? 'የንብረት እና የድጋፍ ጥያቄዎች' : 'Benefit & asset requests'}
          </p>
        </div>

        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <p className="text-xs font-medium text-[#64748B]">
            {lang === 'am' ? 'የገንዘብ ያዥ ወረፋ' : 'Cashier Queue'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#0E4D34] mt-2">
            {pendingReceipts + pendingPayouts}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {pendingReceipts} {lang === 'am' ? 'ደረሰኞች' : 'receipts'} · {pendingPayouts}{' '}
            {lang === 'am' ? 'ክፍያዎች' : 'payouts'}
          </p>
        </div>

        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <p className="text-xs font-medium text-[#64748B]">
            {lang === 'am' ? 'ዋና ሰብሳቢ / መዛግብት' : 'Chair Queue & Records'}
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
            {pendingChair} / {records.length}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {meetings.filter((m) => m.status === 'live').length}{' '}
            {lang === 'am' ? 'ንቁ ስብሰባ' : 'live meeting'}
          </p>
        </div>
      </section>

      {/* Executive Directives */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'የኮሚቴ ተግባራት እና ትእዛዛት' : 'Committee Tasks & Executive Directives'}
          </h2>
          <span className="text-xs font-mono text-[#64748B]">{myDirectives.length}</span>
        </div>

        <div className="divide-y divide-[#EEF1EE]">
          {myDirectives.map((dir) => (
            <div
              key={dir.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-mono">{dir.id}</span>
                  <span>·</span>
                  <span className="font-semibold text-[#0E4D34]">
                    {lang === 'am' ? ROLE_LABELS[dir.assignedToRole].am : ROLE_LABELS[dir.assignedToRole].en}
                  </span>
                  <span>·</span>
                  <span className="font-mono">Due {dir.dueDate}</span>
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  {lang === 'am' ? dir.titleAm : dir.titleEn}
                </p>
                <p className="text-xs text-[#475569]">{dir.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentUser.role !== 'auditor' ? (
                  <select
                    value={dir.status}
                    onChange={(e) =>
                      updateDirectiveStatus(dir.id, e.target.value as typeof dir.status)
                    }
                    className="px-3 py-2 text-xs font-semibold border border-[#CBD5D0] rounded-lg bg-white"
                  >
                    <option value="assigned">{lang === 'am' ? 'ተሰጥቷል' : 'Assigned'}</option>
                    <option value="in_progress">{lang === 'am' ? 'በሂደት ላይ' : 'In Progress'}</option>
                    <option value="completed">{lang === 'am' ? 'ተጠናቋል' : 'Completed'}</option>
                  </select>
                ) : (
                  <span className="text-xs font-semibold text-[#0E4D34] uppercase">{dir.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const MgmtMembersView: React.FC = () => {
  const {
    lang,
    currentUser,
    accounts,
    registerMember,
    toggleMemberPortalAccess,
    chairApproveMember,
  } = useEdir();

  const canRegister = currentUser.role === 'vice_chair' || currentUser.role === 'secretary';
  const isViceChair = currentUser.role === 'vice_chair';
  const isChair = currentUser.role === 'chairperson';

  const [search, setSearch] = useState('');
  const [fullNameAm, setFullNameAm] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('edir2026');
  const [city, setCity] = useState('Aleta Wondo');
  const [country, setCountry] = useState('Ethiopia');
  const [addressDetail, setAddressDetail] = useState('');
  const [residenceType, setResidenceType] = useState<'local' | 'out_of_town'>('local');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [dependentNameEn, setDependentNameEn] = useState('');
  const [dependentRel, setDependentRel] = useState<FamilyBeneficiary['relationship']>('spouse');
  const [approveImmediately, setApproveImmediately] = useState(true);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim() || !phone.trim()) return;
    registerMember({
      fullNameAm: fullNameAm.trim() || fullNameEn.trim(),
      fullNameEn: fullNameEn.trim(),
      phone: phone.trim(),
      email: email.trim() || `${fullNameEn.trim().toLowerCase().replace(/\s+/g, '.')}@edir.et`,
      password: password.trim() || 'edir2026',
      city: city.trim(),
      country: country.trim(),
      addressDetail: addressDetail.trim() || city.trim(),
      residenceType,
      emergencyContactName: emergencyName.trim() || 'Family Representative',
      emergencyContactPhone: emergencyPhone.trim() || phone.trim(),
      bloodType,
      approveImmediately: isViceChair ? approveImmediately : false,
      dependentNameEn: dependentNameEn.trim() || undefined,
      dependentNameAm: dependentNameEn.trim() || undefined,
      dependentRel,
    });
    setFullNameAm('');
    setFullNameEn('');
    setPhone('');
    setEmail('');
    setAddressDetail('');
    setEmergencyName('');
    setEmergencyPhone('');
    setDependentNameEn('');
  };

  const memberAccounts = accounts.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.fullNameEn.toLowerCase().includes(q) ||
      a.fullNameAm.includes(search) ||
      a.id.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {isViceChair
            ? lang === 'am'
              ? 'የምክትል ሰብሳቢ አባላት መመዝገቢያ እና የፖርታል አክሰስ መቆጣጠሪያ'
              : 'Vice Chairperson Member Registration & Portal Access Control'
            : lang === 'am'
            ? 'የአባላት ዝርዝር እና ምዝገባ'
            : 'Member Registration & Association Directory'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {isViceChair
            ? lang === 'am'
              ? 'አዲስ አባላትን ይመዝግቡ፣ አለታ ወንዶ ወይም ከከተማ ውጪ መሆናቸውን ይለዩ፣ እንዲሁም የአባላትን የፖርታል አክሰስ ይስጡ ወይም ያግዱ።'
              : 'Register new local/diaspora members, approve registrations, and enable or suspend member portal login access.'
            : lang === 'am'
            ? 'የአባላትን ዝርዝር፣ የመኖሪያ ሁኔታ እና የአባልነት ፍቃድ ይከታተሉ።'
            : 'Manage member directory, residence classification, and registration approvals.'}
        </p>
      </div>

      {/* Member Registration Form (Vice Chair & Secretary) */}
      {canRegister && (
        <form
          onSubmit={handleRegister}
          className="bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#EEF1EE] pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0E4D34]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                {lang === 'am' ? 'አዲስ አባል መመዝገቢያ (Member Registration)' : 'Register New Member'}
              </h3>
            </div>
            <span className="text-xs font-medium text-[#0E4D34]">
              {isViceChair
                ? lang === 'am'
                  ? 'የምክትል ሰብሳቢ ስልጣን'
                  : 'Vice Chair Authority'
                : lang === 'am'
                ? 'ለዋና ሰብሳቢ ማጽደቂያ ይላካል'
                : 'Forwards to Chairperson'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ሙሉ ስም (አማርኛ)' : 'Full Name (Amharic)'}
              </label>
              <input
                type="text"
                value={fullNameAm}
                onChange={(e) => setFullNameAm(e.target.value)}
                placeholder="አበበ ከበደ ሞላ"
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ሙሉ ስም (English) *' : 'Full Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                placeholder="Abebe Kebede Mola"
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ስልክ ቁጥር *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251916..."
                className="w-full px-3 py-2 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ኢሜይል' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@edir.et"
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'መነሻ የይለፍ ቃል (Password)' : 'Initial Portal Password'}
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'የመኖሪያ ሁኔታ (Residence Marker) *' : 'Residence Classification *'}
              </label>
              <select
                value={residenceType}
                onChange={(e) => setResidenceType(e.target.value as 'local' | 'out_of_town')}
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="local">
                  {lang === 'am' ? 'አለታ ወንዶ ነዋሪ (Inside Aleta Wondo)' : 'Inside Aleta Wondo (Local)'}
                </option>
                <option value="out_of_town">
                  {lang === 'am'
                    ? 'ከአለታ ወንዶ ውጪ / ዳያስፖራ (Out-of-Town)'
                    : 'Outside Aleta Wondo (Out-of-Town / Diaspora)'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ከተማ (City)' : 'Current City'}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ሀገር (Country)' : 'Country'}
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ቀበሌ / ሰፈር / አድራሻ' : 'Address Detail / Kebele'}
              </label>
              <input
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Kebele 01 / Street..."
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'የአደጋ ጊዜ ተጠሪ ስም' : 'Emergency Contact Name'}
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'የአደጋ ጊዜ ተጠሪ ስልክ' : 'Emergency Contact Phone'}
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  {lang === 'am' ? 'የደም አይነት' : 'Blood Type'}
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg bg-white"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  {lang === 'am' ? 'ተተኪ ቤተሰብ' : 'First Dependent'}
                </label>
                <input
                  type="text"
                  value={dependentNameEn}
                  onChange={(e) => setDependentNameEn(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
                />
              </div>
            </div>
          </div>

          {dependentNameEn.trim() && (
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'የተተኪ ዝምድና' : 'Dependent Relationship'}
              </label>
              <select
                value={dependentRel}
                onChange={(e) => setDependentRel(e.target.value as FamilyBeneficiary['relationship'])}
                className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#EEF1EE]">
            {isViceChair ? (
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveImmediately}
                  onChange={(e) => setApproveImmediately(e.target.checked)}
                  className="w-4 h-4 accent-[#0E4D34]"
                />
                {lang === 'am'
                  ? 'ወዲያውኑ አጽድቅ እና የፖርታል አክሰስ ክፈት (Approve & Grant Portal Access Immediately)'
                  : 'Approve immediately & grant portal login access'}
              </label>
            ) : (
              <span className="text-xs text-[#64748B]">
                {lang === 'am'
                  ? 'ምዝገባው ለዋና ሰብሳቢ ውሳኔ ይላካል።'
                  : 'Application will be routed to Chairperson for activation.'}
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] whitespace-nowrap"
            >
              {lang === 'am' ? 'አባሉን መዝግብ' : 'Submit Member Registration'}
            </button>
          </div>
        </form>
      )}

      {/* Member Directory & Portal Access Control */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'የአባላት እና የኮሚቴ ዝርዝር' : 'Member & Committee Directory'}
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr('searchPlaceholder', lang)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAF9] text-xs text-[#475569] border-b border-[#E2E6E3]">
              <tr>
                <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'አባል / ሚና' : 'Account'}</th>
                <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'አድራሻ' : 'Residence'}</th>
                <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'ቀሪ ሂሳብ' : 'Balance'}</th>
                <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'ሁኔታ / አክሰስ' : 'Access Status'}</th>
                {(isViceChair || isChair) && (
                  <th className="px-5 py-3 font-semibold text-right">
                    {lang === 'am' ? 'እርምጃ' : 'Actions'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1EE]">
              {memberAccounts.map((acc) => {
                const pending = acc.monthlyDueBalance + acc.penaltyBalance + acc.specialDueBalance;
                return (
                  <tr key={acc.id} className="hover:bg-[#FAFCFB]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <MemberAvatar src={acc.photoUrl} name={acc.fullNameEn} size="sm" />
                        <div>
                          <p className="font-semibold text-[#0F172A]">
                            {lang === 'am' ? acc.fullNameAm : acc.fullNameEn}
                          </p>
                          <p className="text-xs text-[#64748B] font-mono">
                            {acc.id} · {lang === 'am' ? ROLE_LABELS[acc.role].am : ROLE_LABELS[acc.role].en}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#334155]">
                      <div className="inline-flex items-center gap-1.5">
                        {acc.residenceType === 'out_of_town' ? (
                          <Globe2 className="w-3.5 h-3.5 text-[#0E4D34]" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-[#B8821E]" />
                        )}
                        <span>
                          {acc.city}, {acc.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs tabular-nums">
                      <span className={pending > 0 ? 'text-[#D97706] font-semibold' : 'text-[#16A34A]'}>
                        {pending.toLocaleString()} {tr('etb', lang)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {acc.status === 'pending_chair' ? (
                        <span className="font-semibold text-[#D97706]">
                          {lang === 'am' ? 'ዋና ሰብሳቢ ፍቃድ ይጠበቃል' : 'Pending Chair Approval'}
                        </span>
                      ) : acc.portalAccessEnabled ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {lang === 'am' ? 'ንቁ (አክሰስ ተከፍቷል)' : 'Portal Enabled'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#DC2626]">
                          <Lock className="w-3.5 h-3.5" />
                          {lang === 'am' ? 'አክሰስ ታግዷል' : 'Access Suspended'}
                        </span>
                      )}
                    </td>
                    {(isViceChair || isChair) && (
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        {isViceChair && acc.role === 'member' && (
                          <button
                            type="button"
                            onClick={() => toggleMemberPortalAccess(acc.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                              acc.portalAccessEnabled
                                ? 'text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]'
                                : 'text-[#0E4D34] border-[#BBD4C6] bg-[#F3F8F5] hover:bg-[#E1ECE6]'
                            }`}
                          >
                            {acc.portalAccessEnabled ? (
                              <>
                                <Lock className="w-3 h-3" />
                                {lang === 'am' ? 'አክሰስ አግድ' : 'Suspend Access'}
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                {lang === 'am' ? 'አክሰስ ስጥ' : 'Grant Access'}
                              </>
                            )}
                          </button>
                        )}

                        {isChair && acc.status === 'pending_chair' && (
                          <>
                            <button
                              type="button"
                              onClick={() => chairApproveMember(acc.id, true)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
                            >
                              {lang === 'am' ? 'አጽድቅ' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => chairApproveMember(acc.id, false)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#DC2626] border border-[#FECACA] rounded-lg"
                            >
                              {lang === 'am' ? 'አትቀበል' : 'Decline'}
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const MgmtApprovalsView: React.FC = () => {
  const {
    lang,
    currentUser,
    requests,
    assets,
    viceChairProcessRequest,
    chairAuthorizeAssetRequest,
    issueDirective,
  } = useEdir();

  const isViceChair = currentUser.role === 'vice_chair';
  const isChair = currentUser.role === 'chairperson';

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [dirTitleAm, setDirTitleAm] = useState('');
  const [dirTitleEn, setDirTitleEn] = useState('');
  const [dirDesc, setDirDesc] = useState('');
  const [dirRole, setDirRole] = useState<PortalRole>('vice_chair');
  const [dirDue, setDirDue] = useState('2026-12-10');

  const handleDirectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirTitleEn.trim()) return;
    issueDirective({
      titleAm: dirTitleAm.trim() || dirTitleEn.trim(),
      titleEn: dirTitleEn.trim(),
      description: dirDesc.trim() || dirTitleEn.trim(),
      assignedToRole: dirRole,
      dueDate: dirDue,
    });
    setDirTitleAm('');
    setDirTitleEn('');
    setDirDesc('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {isViceChair
            ? lang === 'am'
              ? 'የምክትል ሰብሳቢ የጥያቄዎች እና የንብረት ማረጋገጫ'
              : 'Vice Chairperson Authorizations & Asset Routing'
            : lang === 'am'
            ? 'የዋና ሰብሳቢ የመጨረሻ ፍቃድ እና ትእዛዛት'
            : 'Chairperson Final Authorizations & Directives'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {isViceChair
            ? lang === 'am'
              ? 'የክፍያ ጥያቄዎችን ለገንዘብ ያዥ፣ የድንኳንና ወንበር ኪራይ ጥያቄዎችን ደግሞ ንብረት አረጋግጠው ለዋና ሰብሳቢ ይምሩ።'
              : 'Authorize benefit claims for Cashier disbursement, or verify asset availability and route rentals to Chairperson.'
            : lang === 'am'
            ? 'በምክትል ሰብሳቢ የተረጋገጡ የንብረት ኪራዮችን ያጽድቁ እና ለኮሚቴው ትእዛዝ ይስጡ።'
            : 'Grant final authorization for Edir asset rentals and issue committee directives.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Request Queue */}
        <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'የአባላት ጥያቄዎች ወረፋ' : 'Incoming Member Requests'}
            </h3>
            <span className="text-xs font-mono text-[#64748B]">{requests.length}</span>
          </div>

          <div className="divide-y divide-[#EEF1EE]">
            {requests.map((req) => {
              const showViceActions = isViceChair && req.status === 'pending_vice_chair';
              const showChairActions = isChair && req.status === 'pending_chair';
              return (
                <div key={req.id} className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-[#64748B]">
                      {req.id} · {req.requestType.replace('_', ' ')} · {req.submittedDate}
                    </span>
                    <span className="font-semibold text-[#0E4D34] uppercase">{req.status.replace(/_/g, ' ')}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#475569]">
                        {lang === 'am' ? req.memberNameAm : req.memberNameEn} ({req.memberId})
                      </p>
                      <h4 className="text-sm font-bold text-[#0F172A] mt-0.5">
                        {lang === 'am' ? req.titleAm : req.titleEn}
                      </h4>
                      <p className="text-xs text-[#475569] mt-1">{req.description}</p>
                    </div>
                    {req.requestedAmountEtb && (
                      <span className="font-mono text-sm font-bold text-[#0E4D34] shrink-0">
                        {req.requestedAmountEtb.toLocaleString()} {tr('etb', lang)}
                      </span>
                    )}
                  </div>

                  {(showViceActions || showChairActions) && (
                    <div className="pt-2 space-y-2.5">
                      <input
                        type="text"
                        value={notes[req.id] || ''}
                        onChange={(e) => setNotes((p) => ({ ...p, [req.id]: e.target.value }))}
                        placeholder={
                          lang === 'am'
                            ? 'የኮሚቴ ማስታወሻ (አማራጭ)...'
                            : 'Optional authorization or rejection note...'
                        }
                        className="w-full px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
                      />
                      <div className="flex flex-wrap gap-2">
                        {showViceActions && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                viceChairProcessRequest(req.id, true, notes[req.id] || '')
                              }
                              className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27]"
                            >
                              {req.requestType === 'benefit_claim'
                                ? lang === 'am'
                                  ? 'አጽድቅና ለገንዘብ ያዥ ላክ'
                                  : 'Authorize & Forward to Cashier'
                                : req.requestType === 'asset_rental'
                                ? lang === 'am'
                                  ? 'ንብረት አረጋግጥና ለዋና ሰብሳቢ ላክ'
                                  : 'Verify Stock & Route to Chair'
                                : lang === 'am'
                                ? 'አጽድቅ'
                                : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                viceChairProcessRequest(req.id, false, notes[req.id] || '')
                              }
                              className="px-4 py-2 text-xs font-semibold text-[#DC2626] border border-[#FECACA] rounded-lg hover:bg-[#FEF2F2]"
                            >
                              {lang === 'am' ? 'ውድቅ አድርግ' : 'Reject'}
                            </button>
                          </>
                        )}

                        {showChairActions && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                chairAuthorizeAssetRequest(req.id, true, notes[req.id] || '')
                              }
                              className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
                            >
                              {lang === 'am' ? 'የመጨረሻ ፍቃድ ስጥ' : 'Grant Final Authorization'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                chairAuthorizeAssetRequest(req.id, false, notes[req.id] || '')
                              }
                              className="px-4 py-2 text-xs font-semibold text-[#DC2626] border border-[#FECACA] rounded-lg"
                            >
                              {lang === 'am' ? 'ከልክል' : 'Decline'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Side: Live Asset Availability + Chair Directives */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-[#DCE2DD] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#EEF1EE] pb-3">
              <Package className="w-4 h-4 text-[#0E4D34]" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                {lang === 'am' ? 'በመጋዘን ያሉ የዕድሩ ንብረቶች' : 'Edir Asset Availability Check'}
              </h3>
            </div>
            <div className="divide-y divide-[#EEF1EE] text-xs">
              {assets.map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#0F172A]">
                      {lang === 'am' ? a.nameAm : a.nameEn}
                    </p>
                    <p className="text-[#64748B]">{a.storageLocation}</p>
                  </div>
                  <span className="font-mono font-bold text-[#0E4D34] shrink-0">
                    {a.availableQuantity} / {a.totalQuantity}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {isChair && (
            <form
              onSubmit={handleDirectiveSubmit}
              className="bg-white border border-[#DCE2DD] rounded-2xl p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#EEF1EE] pb-2">
                {lang === 'am' ? 'ለኮሚቴ አባላት ትእዛዝ ስጥ' : 'Issue Committee Directive'}
              </h3>
              <input
                type="text"
                value={dirTitleAm}
                onChange={(e) => setDirTitleAm(e.target.value)}
                placeholder={lang === 'am' ? 'የትእዛዝ ርዕስ (አማርኛ)' : 'Directive Title (Amharic)'}
                className="w-full px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
              />
              <input
                type="text"
                required
                value={dirTitleEn}
                onChange={(e) => setDirTitleEn(e.target.value)}
                placeholder={lang === 'am' ? 'ርዕስ (English)' : 'Directive Title (English)'}
                className="w-full px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={dirRole}
                  onChange={(e) => setDirRole(e.target.value as PortalRole)}
                  className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white"
                >
                  <option value="vice_chair">Vice Chair</option>
                  <option value="secretary">Secretary</option>
                  <option value="cashier">Cashier</option>
                  <option value="pr">Public Relations</option>
                </select>
                <input
                  type="date"
                  value={dirDue}
                  onChange={(e) => setDirDue(e.target.value)}
                  className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                value={dirDesc}
                onChange={(e) => setDirDesc(e.target.value)}
                placeholder={lang === 'am' ? 'ዝርዝር መመሪያ...' : 'Directive instructions...'}
                className="w-full px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
              >
                {lang === 'am' ? 'ትእዛዙን ላክ' : 'Assign Directive'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const MgmtCashierView: React.FC = () => {
  const {
    lang,
    currentUser,
    transactions,
    requests,
    accounts,
    cashierVerifyReceipt,
    cashierDisburseRequest,
    runPenaltyEngine,
  } = useEdir();

  const isCashier = currentUser.role === 'cashier';
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const overdueCount = accounts.filter((a) => a.role === 'member' && a.monthlyDueBalance > 0).length;
  const payoutQueue = requests.filter((r) => r.status === 'pending_cashier');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {lang === 'am'
              ? 'የገንዘብ ያዥ ደረሰኝ ማረጋገጫ፣ ክፍያ እና ቅጣት መቆጣጠሪያ'
              : 'Cashier Receipt Verification, Payouts & Late Penalty Engine'}
          </h2>
          <p className="text-sm text-[#475569] mt-0.5">
            {lang === 'am'
              ? 'የተላኩ የባንክና የቴሌብር ደረሰኞችን ያረጋግጡ፣ የጸደቁ ድጋፎችን ይክፈሉ።'
              : 'Verify incoming member receipts, disburse Vice-Chair-authorized claims, and manage late fees.'}
          </p>
        </div>

        {isCashier && (
          <button
            type="button"
            onClick={runPenaltyEngine}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#854D0E] bg-[#FDF8EE] border border-[#E5C98B] rounded-xl hover:bg-[#FAF0D7] whitespace-nowrap"
          >
            <AlertCircle className="w-4 h-4" />
            {lang === 'am'
              ? `የወሩን 50 ብር ቅጣት አስል (${overdueCount} አባላት)`
              : `Run 50 ETB Late Penalty (${overdueCount} overdue)`}
          </button>
        )}
      </div>

      {/* Authorized Benefit Payouts Queue */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'ክፍያ የሚጠብቁ የጸደቁ የድጋፍ ጥያቄዎች' : 'Authorized Payout Queue'}
          </h3>
          <span className="text-xs font-mono text-[#64748B]">{payoutQueue.length}</span>
        </div>
        {payoutQueue.length === 0 ? (
          <p className="p-5 text-xs text-[#64748B]">
            {lang === 'am' ? 'ክፍያ የሚጠብቅ ጥያቄ የለም።' : 'No pending disbursements in queue.'}
          </p>
        ) : (
          <div className="divide-y divide-[#EEF1EE]">
            {payoutQueue.map((req) => (
              <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-[#64748B]">
                    {req.id} · {req.memberNameEn}
                  </p>
                  <p className="text-sm font-bold text-[#0F172A]">
                    {lang === 'am' ? req.titleAm : req.titleEn}
                  </p>
                  <p className="text-xs text-[#475569]">{req.committeeResponseEn}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-base font-bold text-[#0E4D34]">
                    {(req.requestedAmountEtb || 0).toLocaleString()} {tr('etb', lang)}
                  </span>
                  {isCashier && (
                    <button
                      type="button"
                      onClick={() => cashierDisburseRequest(req.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
                    >
                      {lang === 'am' ? 'ክፍያ ፈጽም' : 'Disburse Payout'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Receipt Verification Queue */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'የአባላት የክፍያ ደረሰኞች' : 'Member Receipt Submissions'}
          </h3>
          <span className="text-xs font-mono text-[#64748B]">{transactions.length}</span>
        </div>

        <div className="divide-y divide-[#EEF1EE]">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="font-mono">{txn.id}</span>
                    <span>·</span>
                    <span className="font-semibold text-[#0F172A]">
                      {lang === 'am' ? txn.memberNameAm : txn.memberNameEn}
                    </span>
                    <span>·</span>
                    <span className="font-mono">
                      {txn.method} ({txn.referenceNumber})
                    </span>
                    <span>·</span>
                    <span>{txn.receiptFileName}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {lang === 'am' ? txn.itemLabelsAm : txn.itemLabelsEn}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-base font-bold text-[#0F172A] tabular-nums">
                    {txn.amount.toLocaleString()} {tr('etb', lang)}
                  </span>
                  {txn.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                      <CheckCircle2 className="w-4 h-4" />
                      {tr('statusApproved', lang)}
                    </span>
                  ) : txn.status === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
                      <XCircle className="w-4 h-4" />
                      {tr('statusRejected', lang)}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#D97706]">
                      {tr('statusPendingReview', lang)}
                    </span>
                  )}
                </div>
              </div>

              {isCashier && txn.status === 'pending_verification' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    value={rejectReasons[txn.id] || ''}
                    onChange={(e) =>
                      setRejectReasons((p) => ({ ...p, [txn.id]: e.target.value }))
                    }
                    placeholder={
                      lang === 'am'
                        ? 'ውድቅ ካደረጉ ምክንያቱን ይጻፉ...'
                        : 'Rejection reason (required if rejecting)...'
                    }
                    className="flex-1 px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => cashierVerifyReceipt(txn.id, true)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27] whitespace-nowrap"
                  >
                    {lang === 'am' ? 'ደረሰኙን አጽድቅ' : 'Approve Receipt'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      cashierVerifyReceipt(txn.id, false, rejectReasons[txn.id] || '')
                    }
                    className="px-4 py-2 text-xs font-semibold text-[#DC2626] border border-[#FECACA] rounded-lg hover:bg-[#FEF2F2] whitespace-nowrap"
                  >
                    {lang === 'am' ? 'ውድቅ አድርግ' : 'Reject with Reason'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const MgmtMeetingsView: React.FC = () => {
  const { lang, meetings, accounts, createMeetingCall } = useEdir();
  const [titleAm, setTitleAm] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [date, setDate] = useState('2026-12-06');
  const [time, setTime] = useState('09:00 AM (3:00 LT)');
  const [locationEn, setLocationEn] = useState('Aleta Wondo Municipality Hall');
  const [agendaEn, setAgendaEn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return;
    createMeetingCall({
      titleAm: titleAm.trim() || titleEn.trim(),
      titleEn: titleEn.trim(),
      date,
      time,
      locationEn,
      agendaEn: agendaEn.trim() || 'Regular assembly agenda',
    });
    setTitleAm('');
    setTitleEn('');
    setAgendaEn('');
  };

  const membersOnly = accounts.filter((a) => a.role === 'member');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am' ? 'የስብሰባ ጥሪ እና QR አቴንዳንስ መከታተያ' : 'Meetings, QR Calls & Attendance Roster'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-[#EEF1EE] pb-3">
            <QrCode className="w-4 h-4 text-[#0E4D34]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'አዲስ የስብሰባ ጥሪ ፍጠር' : 'Call New Meeting & Generate QR'}
            </h3>
          </div>
          <input
            type="text"
            value={titleAm}
            onChange={(e) => setTitleAm(e.target.value)}
            placeholder={lang === 'am' ? 'የስብሰባ ርዕስ (አማርኛ)' : 'Meeting Title (Amharic)'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <input
            type="text"
            required
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder={lang === 'am' ? 'የስብሰባ ርዕስ (English)' : 'Meeting Title (English)'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
            />
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
            />
          </div>
          <input
            type="text"
            value={locationEn}
            onChange={(e) => setLocationEn(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <textarea
            rows={3}
            value={agendaEn}
            onChange={(e) => setAgendaEn(e.target.value)}
            placeholder={lang === 'am' ? 'የስብሰባው አጀንዳ...' : 'Meeting agenda points...'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl"
          >
            {lang === 'am' ? 'ስብሰባውን አስነሳ' : 'Publish Meeting & QR Token'}
          </button>
        </form>

        <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E6E3]">
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'የስብሰባዎች ዝርዝር' : 'Scheduled & Active Meetings'}
            </h3>
          </div>
          <div className="divide-y divide-[#EEF1EE]">
            {meetings.map((m) => (
              <div key={m.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-mono text-[#0E4D34] font-semibold">{m.qrToken}</span>
                  <span className="font-mono">
                    {m.date} · {m.time}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  {lang === 'am' ? m.titleAm : m.titleEn}
                </h4>
                <p className="text-xs text-[#475569]">
                  {m.locationEn} — {m.agendaEn}
                </p>
                <p className="text-xs text-[#0E4D34] font-medium">
                  {m.attendance.filter((a) => a.status === 'present').length} QR Present ·{' '}
                  {membersOnly.filter((acc) => acc.residenceType === 'out_of_town').length} Out-of-Town
                  Auto-Exempt
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export const MgmtCommsView: React.FC = () => {
  const { lang, messages, publishNotice } = useEdir();
  const [category, setCategory] = useState<CommitteeMessage['category']>('general');
  const [titleAm, setTitleAm] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAm, setBodyAm] = useState('');
  const [bodyEn, setBodyEn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() && !titleAm.trim()) return;
    publishNotice({
      category,
      titleAm: titleAm.trim() || titleEn.trim(),
      titleEn: titleEn.trim() || titleAm.trim(),
      bodyAm: bodyAm.trim() || bodyEn.trim(),
      bodyEn: bodyEn.trim() || bodyAm.trim(),
    });
    setTitleAm('');
    setTitleEn('');
    setBodyAm('');
    setBodyEn('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am' ? 'ይፋዊ የህዝብ ግንኙነት መልዕክት ማሰራጫ' : 'Publish Committee Notices'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-[#EEF1EE] pb-3">
            <Megaphone className="w-4 h-4 text-[#0E4D34]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'አዲስ ማስታወቂያ ላክ' : 'Broadcast Notice to All Members'}
            </h3>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CommitteeMessage['category'])}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg bg-white"
          >
            <option value="general">{lang === 'am' ? 'አጠቃላይ (General)' : 'General'}</option>
            <option value="urgent">{lang === 'am' ? 'አስቸኳይ (Urgent)' : 'Urgent'}</option>
            <option value="meetings">{lang === 'am' ? 'ስብሰባ (Meetings)' : 'Meetings'}</option>
            <option value="payments">{lang === 'am' ? 'ክፍያ (Payments)' : 'Payments'}</option>
          </select>
          <input
            type="text"
            value={titleAm}
            onChange={(e) => setTitleAm(e.target.value)}
            placeholder={lang === 'am' ? 'ርዕስ (አማርኛ)' : 'Notice Title (Amharic)'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <input
            type="text"
            required
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder={lang === 'am' ? 'ርዕስ (English)' : 'Notice Title (English)'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <textarea
            rows={2}
            value={bodyAm}
            onChange={(e) => setBodyAm(e.target.value)}
            placeholder={lang === 'am' ? 'ዝርዝር መልዕክት (አማርኛ)' : 'Message Body (Amharic)'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <textarea
            rows={2}
            required
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            placeholder={lang === 'am' ? 'ዝርዝር መልዕክት (English)' : 'Message Body (English)'}
            className="w-full px-3 py-2 text-sm border border-[#CBD5D0] rounded-lg"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl"
          >
            <Send className="w-4 h-4" />
            {lang === 'am' ? 'መልዕክቱን አሰራጭ' : 'Publish to Member Inbox'}
          </button>
        </form>

        <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl divide-y divide-[#EEF1EE]">
          {messages.map((m) => (
            <div key={m.id} className="p-5 space-y-1">
              <div className="flex justify-between text-xs text-[#64748B]">
                <span className="font-bold uppercase text-[#0E4D34]">{m.category}</span>
                <span className="font-mono">{m.date}</span>
              </div>
              <p className="text-sm font-bold text-[#0F172A]">
                {lang === 'am' ? m.titleAm : m.titleEn}
              </p>
              <p className="text-xs text-[#475569]">{lang === 'am' ? m.bodyAm : m.bodyEn}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export const MgmtAuditView: React.FC = () => {
  const { lang, auditLogs } = useEdir();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-[#0E4D34]" />
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {lang === 'am' ? 'የኦዲት እና የእንቅስቃሴ መዝገብ (Read-Only)' : 'Immutable Activity & Audit Trail'}
          </h2>
          <p className="text-sm text-[#475569]">
            {lang === 'am'
              ? 'ሁሉም የአባላት ምዝገባ፣ የፖርታል አክሰስ፣ የደረሰኝ ማረጋገጫ እና የክፍያ እንቅስቃሴዎች'
              : 'Read-only oversight log of registrations, access updates, verifications, disbursements, and imported records.'}
          </p>
        </div>
      </div>

      <section className="bg-white border border-[#DCE2DD] rounded-2xl divide-y divide-[#EEF1EE]">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                <span className="font-mono font-bold text-[#0E4D34]">{log.action}</span>
                <span>·</span>
                <span>{log.actorName}</span>
                <span>({lang === 'am' ? ROLE_LABELS[log.actorRole].am : ROLE_LABELS[log.actorRole].en})</span>
              </div>
              <p className="text-sm text-[#0F172A]">
                {lang === 'am' ? log.detailsAm : log.detailsEn}
              </p>
            </div>
            <span className="font-mono text-xs text-[#64748B] shrink-0">{log.timestamp}</span>
          </div>
        ))}
      </section>
    </div>
  );
};
