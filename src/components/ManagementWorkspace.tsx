import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  KeyRound,
  Lock,
  MapPin,
  Megaphone,
  Package,
  Pencil,
  Plus,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Unlock,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { ROLE_LABELS, tr } from '../i18n/translations';
import {
  AssetItem,
  CommitteeMessage,
  FamilyBeneficiary,
  PortalRole,
  SpecialCampaign,
  UserAccount,
} from '../types';
import { MemberAvatar } from './MemberAvatar';

const ALL_ROLES: PortalRole[] = [
  'member',
  'vice_chair',
  'chairperson',
  'secretary',
  'cashier',
  'pr',
  'auditor',
];

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
    campaigns,
    updateDirectiveStatus,
    addSpecialCampaign,
    setActiveTab,
  } = useEdir();

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [cmpTitleAm, setCmpTitleAm] = useState('');
  const [cmpTitleEn, setCmpTitleEn] = useState('');
  const [cmpCategory, setCmpCategory] = useState<SpecialCampaign['category']>('asset_purchase');
  const [cmpMode, setCmpMode] = useState<SpecialCampaign['contributionMode']>('fixed');
  const [cmpPerMember, setCmpPerMember] = useState('500');
  const [cmpGoal, setCmpGoal] = useState('50000');
  const [cmpDeadline, setCmpDeadline] = useState('2026-12-30');
  const [cmpDesc, setCmpDesc] = useState('');

  if (!currentUser) return null;

  const membersOnly = accounts.filter((a) => a.role === 'member');
  const pendingReceipts = transactions.filter((t) => t.status === 'pending_verification').length;
  const pendingViceChair = requests.filter((r) => r.status === 'pending_vice_chair').length;
  const pendingChair =
    requests.filter((r) => r.status === 'pending_chair').length +
    accounts.filter((a) => a.status === 'pending_chair').length;
  const pendingPayouts = requests.filter((r) => r.status === 'pending_cashier').length;

  const myDirectives = directives.filter(
    (d) =>
      d.assignedToRole === currentUser.role ||
      currentUser.role === 'chairperson' ||
      currentUser.role === 'vice_chair' ||
      currentUser.role === 'auditor'
  );

  const canCreateCampaign =
    currentUser.role === 'vice_chair' ||
    currentUser.role === 'chairperson' ||
    currentUser.role === 'cashier';

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpTitleEn.trim() && !cmpTitleAm.trim()) return;
    await addSpecialCampaign({
      titleAm: cmpTitleAm.trim() || cmpTitleEn.trim(),
      titleEn: cmpTitleEn.trim() || cmpTitleAm.trim(),
      category: cmpCategory,
      contributionMode: cmpMode,
      targetAmountPerMember: Number(cmpPerMember) || 0,
      totalGoal: Number(cmpGoal) || 0,
      deadline: cmpDeadline,
      descriptionEn: cmpDesc.trim() || cmpTitleEn.trim(),
    });
    setCmpTitleAm('');
    setCmpTitleEn('');
    setCmpDesc('');
    setShowCampaignForm(false);
  };

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
              {currentUser.role === 'vice_chair'
                ? lang === 'am'
                  ? 'ተጠቃሚዎችና የይለፍ ቃል አስተዳድር'
                  : 'Administer Users & Passwords'
                : lang === 'am'
                ? 'አዲስ አባል መዝግብ'
                : 'Register New Member'}
            </button>
          )}
          {currentUser.role === 'vice_chair' && (
            <button
              onClick={() => setActiveTab('mgmt_approvals')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F172A] bg-[#F8FAF9] border border-[#D4DBD7] rounded-xl hover:bg-[#EEF3F0] whitespace-nowrap"
            >
              <ClipboardCheck className="w-4 h-4 text-[#0E4D34]" />
              {lang === 'am'
                ? `ጥያቄዎችን አጽድቅ (${pendingViceChair})`
                : `Review Requests (${pendingViceChair})`}
            </button>
          )}
          {currentUser.role === 'cashier' && (
            <button
              onClick={() => setActiveTab('mgmt_cashier')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              {lang === 'am'
                ? `ደረሰኞችን አረጋግጥ (${pendingReceipts})`
                : `Verify Receipts (${pendingReceipts})`}
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

      {/* Special Campaigns Management (Live DB) */}
      {canCreateCampaign && (
        <section className="bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                {lang === 'am' ? 'ልዩ መዋጮዎች (ለሰርግ፣ ሀዘን፣ ንብረት)' : 'Special Contribution Campaigns'}
              </h2>
              <p className="text-xs text-[#64748B]">
                {lang === 'am'
                  ? 'አባላት በክፍያ ገጻቸው የሚመርጡት ልዩ መዋጮ ይፍጠሩ'
                  : 'Create active special contributions visible in member payments'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCampaignForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27]"
            >
              <Plus className="w-3.5 h-3.5" />
              {showCampaignForm
                ? tr('cancel', lang)
                : lang === 'am'
                ? 'አዲስ ልዩ መዋጮ ፍጠር'
                : 'Create Special Campaign'}
            </button>
          </div>

          {showCampaignForm && (
            <form
              onSubmit={handleCampaignSubmit}
              className="p-4 bg-[#F8FAF9] border border-[#E2E6E3] rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              <input
                type="text"
                value={cmpTitleAm}
                onChange={(e) => setCmpTitleAm(e.target.value)}
                placeholder={lang === 'am' ? 'ርዕስ (አማርኛ)' : 'Campaign Title (Amharic)'}
                className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white"
              />
              <input
                type="text"
                required
                value={cmpTitleEn}
                onChange={(e) => setCmpTitleEn(e.target.value)}
                placeholder={lang === 'am' ? 'ርዕስ (English) *' : 'Campaign Title (English) *'}
                className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white"
              />
              <select
                value={cmpCategory}
                onChange={(e) => setCmpCategory(e.target.value as SpecialCampaign['category'])}
                className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="asset_purchase">Tent / Chair Purchase</option>
                <option value="wedding">Wedding Gift</option>
                <option value="bereavement">Bereavement Support</option>
                <option value="medical">Medical Aid</option>
                <option value="other">Other</option>
              </select>
              <select
                value={cmpMode}
                onChange={(e) => setCmpMode(e.target.value as SpecialCampaign['contributionMode'])}
                className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="fixed">Fixed Per Member</option>
                <option value="voluntary">Voluntary Contribution</option>
              </select>
              <input
                type="number"
                min={0}
                value={cmpPerMember}
                onChange={(e) => setCmpPerMember(e.target.value)}
                placeholder="Amount per member (ETB)"
                className="px-3 py-2 text-xs font-mono border border-[#CBD5D0] rounded-lg bg-white"
              />
              <input
                type="number"
                min={0}
                value={cmpGoal}
                onChange={(e) => setCmpGoal(e.target.value)}
                placeholder="Total Goal (ETB)"
                className="px-3 py-2 text-xs font-mono border border-[#CBD5D0] rounded-lg bg-white"
              />
              <input
                type="date"
                value={cmpDeadline}
                onChange={(e) => setCmpDeadline(e.target.value)}
                className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white"
              />
              <input
                type="text"
                value={cmpDesc}
                onChange={(e) => setCmpDesc(e.target.value)}
                placeholder={lang === 'am' ? 'አጭር ማብራሪያ...' : 'Short description...'}
                className="px-3 py-2 text-xs border border-[#CBD5D0] rounded-lg bg-white sm:col-span-2"
              />
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
                >
                  {lang === 'am' ? 'መዋጮውን ፍጠር' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          )}

          {campaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 border border-[#E2E6E3] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-[#0F172A]">
                      {lang === 'am' ? c.titleAm : c.titleEn}
                    </p>
                    <p className="text-[#64748B]">
                      {c.targetAmountPerMember.toLocaleString()} {tr('etb', lang)} · Due {c.deadline}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-[#0E4D34] uppercase">{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Executive Directives */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'የኮሚቴ ተግባራት እና ትእዛዛት' : 'Committee Tasks & Executive Directives'}
          </h2>
          <span className="text-xs font-mono text-[#64748B]">{myDirectives.length}</span>
        </div>

        {myDirectives.length === 0 ? (
          <p className="p-6 text-xs text-[#64748B]">
            {lang === 'am' ? 'እስካሁን የተመዘገበ የኮሚቴ ትእዛዝ የለም።' : 'No executive directives issued yet.'}
          </p>
        ) : (
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
                      {lang === 'am'
                        ? ROLE_LABELS[dir.assignedToRole].am
                        : ROLE_LABELS[dir.assignedToRole].en}
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
        )}
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
    viceChairResetPassword,
    viceChairUpdateUser,
    viceChairDeleteUser,
    chairApproveMember,
  } = useEdir();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<PortalRole>('member');
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

  // Vice Chair password reset modal state
  const [pwdTarget, setPwdTarget] = useState<UserAccount | null>(null);
  const [newPwdValue, setNewPwdValue] = useState('');

  // Vice Chair edit user modal state
  const [editTarget, setEditTarget] = useState<UserAccount | null>(null);
  const [editForm, setEditForm] = useState({
    fullNameAm: '',
    fullNameEn: '',
    phone: '',
    email: '',
    city: '',
    country: '',
    addressDetail: '',
    residenceType: 'local' as 'local' | 'out_of_town',
    role: 'member' as PortalRole,
    status: 'active' as UserAccount['status'],
    portalAccessEnabled: true,
  });

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!currentUser) return null;

  const canRegister = currentUser.role === 'vice_chair' || currentUser.role === 'secretary';
  const isViceChair = currentUser.role === 'vice_chair';
  const isChair = currentUser.role === 'chairperson';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim() || !phone.trim() || !email.trim()) return;
    await registerMember({
      role: isViceChair ? role : 'member',
      fullNameAm: fullNameAm.trim() || fullNameEn.trim(),
      fullNameEn: fullNameEn.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
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
    setRole('member');
    setFullNameAm('');
    setFullNameEn('');
    setPhone('');
    setEmail('');
    setAddressDetail('');
    setEmergencyName('');
    setEmergencyPhone('');
    setDependentNameEn('');
  };

  const openEditModal = (acc: UserAccount) => {
    setEditTarget(acc);
    setEditForm({
      fullNameAm: acc.fullNameAm,
      fullNameEn: acc.fullNameEn,
      phone: acc.phone,
      email: acc.email,
      city: acc.city,
      country: acc.country,
      addressDetail: acc.addressDetail,
      residenceType: acc.residenceType,
      role: acc.role,
      status: acc.status,
      portalAccessEnabled: acc.portalAccessEnabled,
    });
  };

  const handleResetPwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdTarget || !newPwdValue.trim()) return;
    await viceChairResetPassword(pwdTarget.id, newPwdValue.trim());
    setPwdTarget(null);
    setNewPwdValue('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await viceChairUpdateUser(editTarget.id, editForm);
    setEditTarget(null);
  };

  const memberAccounts = accounts.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.fullNameEn.toLowerCase().includes(q) ||
      a.fullNameAm.includes(search) ||
      a.id.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {isViceChair
            ? lang === 'am'
              ? 'የምክትል ሰብሳቢ የተጠቃሚዎች፣ የይለፍ ቃል እና የፖርታል አክሰስ አስተዳደር'
              : 'Vice Chairperson User, Role & Password Administration'
            : lang === 'am'
            ? 'የአባላት ዝርዝር እና ምዝገባ'
            : 'Member Registration & Association Directory'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {isViceChair
            ? lang === 'am'
              ? 'አባላትን እና የኮሚቴ ኃላፊዎችን ይመዝግቡ፣ የስራ ሚና ይመድቡ፣ የይለፍ ቃል ይቀይሩ፣ እና የፖርታል አክሰስ ይስጡ ወይም ያግዱ።'
              : 'Register members and committee officers, assign roles, reset portal passwords, and enable or suspend portal access.'
            : lang === 'am'
            ? 'የአባላትን ዝርዝር፣ የመኖሪያ ሁኔታ እና የአባልነት ፍቃድ ይከታተሉ።'
            : 'Manage member directory, residence classification, and registration approvals.'}
        </p>
      </div>

      {/* Member / User Registration Form (Vice Chair & Secretary) */}
      {canRegister && (
        <form
          onSubmit={handleRegister}
          className="bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#EEF1EE] pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0E4D34]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                {isViceChair
                  ? lang === 'am'
                    ? 'አዲስ ተጠቃሚ (አባል ወይም ኮሚቴ) መመዝገቢያ'
                    : 'Create New User Account (Member or Committee)'
                  : lang === 'am'
                  ? 'አዲስ አባል መመዝገቢያ (Member Registration)'
                  : 'Register New Member'}
              </h3>
            </div>
            <span className="text-xs font-medium text-[#0E4D34]">
              {isViceChair
                ? lang === 'am'
                  ? 'የምክትል ሰብሳቢ ሙሉ ስልጣን'
                  : 'Vice Chair User & Password Authority'
                : lang === 'am'
                ? 'ለዋና ሰብሳቢ ማጽደቂያ ይላካል'
                : 'Forwards to Chairperson'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isViceChair && (
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  {lang === 'am' ? 'የፖርታል ሚና (Role) *' : 'Assigned Portal Role *'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as PortalRole)}
                  className="w-full px-3 py-2 text-sm font-medium border border-[#CBD5D0] rounded-lg bg-white"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {lang === 'am' ? ROLE_LABELS[r].am : ROLE_LABELS[r].en}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                placeholder="+2519..."
                className="w-full px-3 py-2 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'ኢሜይል (Google መግቢያ) *' : 'Email Address (For Sign-In) *'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
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
              {isViceChair
                ? lang === 'am'
                  ? 'ተጠቃሚውን መዝግብ'
                  : 'Create User Account'
                : lang === 'am'
                ? 'አባሉን መዝግብ'
                : 'Submit Member Registration'}
            </button>
          </div>
        </form>
      )}

      {/* Member Directory & Portal Access Control */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'የአባላት እና የኮሚቴ ዝርዝር' : 'Member & Committee Directory'} (
            {memberAccounts.length})
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

        {memberAccounts.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#64748B]">
            {lang === 'am'
              ? 'እስካሁን የተመዘገበ ተጠቃሚ የለም። ከላይ ያለውን ቅጽ በመጠቀም አባላትን ይመዝግቡ።'
              : 'No user accounts match or registered yet. Use the registration form above to add live Edir members.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF9] text-xs text-[#475569] border-b border-[#E2E6E3]">
                <tr>
                  <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'አባል / ሚና' : 'Account'}</th>
                  <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'አድራሻ' : 'Residence'}</th>
                  <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'ቀሪ ሂሳብ' : 'Balance'}</th>
                  <th className="px-5 py-3 font-semibold">
                    {lang === 'am' ? 'ሁኔታ / አክሰስ' : 'Access Status'}
                  </th>
                  {(isViceChair || isChair) && (
                    <th className="px-5 py-3 font-semibold text-right">
                      {lang === 'am' ? 'እርምጃ' : 'Administration'}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1EE]">
                {memberAccounts.map((acc) => {
                  const pending = acc.monthlyDueBalance + acc.penaltyBalance + acc.specialDueBalance;
                  const isSelf = acc.id === currentUser.id;
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
                              {acc.email} ·{' '}
                              {lang === 'am' ? ROLE_LABELS[acc.role].am : ROLE_LABELS[acc.role].en}
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
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                            {isViceChair && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(acc)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] border border-[#CBD5D0] rounded-lg hover:bg-[#F4F6F5]"
                                  title={lang === 'am' ? 'መረጃና ሚና አስተካክል' : 'Edit User & Role'}
                                >
                                  <Pencil className="w-3 h-3" />
                                  {lang === 'am' ? 'አስተካክል' : 'Edit'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPwdTarget(acc);
                                    setNewPwdValue('');
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#854D0E] bg-[#FDF8EE] border border-[#E5C98B] rounded-lg hover:bg-[#FAF0D7]"
                                  title={lang === 'am' ? 'የይለፍ ቃል ቀይር' : 'Reset Password'}
                                >
                                  <KeyRound className="w-3 h-3" />
                                  {lang === 'am' ? 'የይለፍ ቃል' : 'Password'}
                                </button>

                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => toggleMemberPortalAccess(acc.id)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border ${
                                      acc.portalAccessEnabled
                                        ? 'text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]'
                                        : 'text-[#0E4D34] border-[#BBD4C6] bg-[#F3F8F5] hover:bg-[#E1ECE6]'
                                    }`}
                                  >
                                    {acc.portalAccessEnabled ? (
                                      <>
                                        <Lock className="w-3 h-3" />
                                        {lang === 'am' ? 'አግድ' : 'Suspend'}
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3 h-3" />
                                        {lang === 'am' ? 'ክፈት' : 'Enable'}
                                      </>
                                    )}
                                  </button>
                                )}

                                {!isSelf &&
                                  (confirmDeleteId === acc.id ? (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await viceChairDeleteUser(acc.id);
                                        setConfirmDeleteId(null);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#DC2626] rounded-lg"
                                    >
                                      {lang === 'am' ? 'አረጋግጥ ሰርዝ' : 'Confirm Delete'}
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(acc.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-[#DC2626] border border-[#FECACA] rounded-lg hover:bg-[#FEF2F2]"
                                      aria-label="Delete user"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  ))}
                              </>
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
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Vice Chair Reset Password Modal */}
      {pwdTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleResetPwdSubmit}
            className="bg-white border border-[#D4DBD7] rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#EEF1EE] pb-3">
              <h4 className="text-sm font-bold text-[#0F172A]">
                {lang === 'am' ? 'የተጠቃሚ የይለፍ ቃል መቀየሪያ' : 'Reset User Portal Password'}
              </h4>
              <button
                type="button"
                onClick={() => setPwdTarget(null)}
                className="text-xs font-medium text-[#64748B]"
              >
                {tr('close', lang)}
              </button>
            </div>
            <p className="text-xs text-[#475569]">
              {lang === 'am' ? pwdTarget.fullNameAm : pwdTarget.fullNameEn} ({pwdTarget.email})
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                {lang === 'am' ? 'አዲስ የይለፍ ቃል *' : 'New Portal Password *'}
              </label>
              <input
                type="text"
                required
                minLength={6}
                value={newPwdValue}
                onChange={(e) => setNewPwdValue(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPwdTarget(null)}
                className="px-4 py-2 text-xs font-semibold border border-[#D4DBD7] rounded-lg"
              >
                {tr('cancel', lang)}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
              >
                {lang === 'am' ? 'የይለፍ ቃል አዘምን' : 'Save Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vice Chair Edit User & Role Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white border border-[#D4DBD7] rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EEF1EE] pb-3">
              <h4 className="text-sm font-bold text-[#0F172A]">
                {lang === 'am' ? 'የተጠቃሚ መረጃ እና ሚና ማስተካከያ' : 'Edit User Profile, Role & Access'}
              </h4>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-xs font-medium text-[#64748B]"
              >
                {tr('close', lang)}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Full Name (Amharic)</label>
                <input
                  type="text"
                  required
                  value={editForm.fullNameAm}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullNameAm: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Full Name (English)</label>
                <input
                  type="text"
                  required
                  value={editForm.fullNameEn}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullNameEn: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Portal Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as PortalRole }))}
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg bg-white"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {lang === 'am' ? ROLE_LABELS[r].am : ROLE_LABELS[r].en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value as UserAccount['status'] }))
                  }
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg bg-white"
                >
                  <option value="active">Active</option>
                  <option value="pending_chair">Pending Chair</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 font-mono border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#334155] mb-1">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#334155] mb-1">Residence Classification</label>
                <select
                  value={editForm.residenceType}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      residenceType: e.target.value as 'local' | 'out_of_town',
                    }))
                  }
                  className="w-full px-3 py-2 border border-[#CBD5D0] rounded-lg bg-white"
                >
                  <option value="local">Inside Aleta Wondo (Local)</option>
                  <option value="out_of_town">Outside Aleta Wondo (Out-of-Town / Diaspora)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="inline-flex items-center gap-2 font-medium text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.portalAccessEnabled}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, portalAccessEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#0E4D34]"
                  />
                  {lang === 'am' ? 'የፖርታል አክሰስ ክፍት ይሁን' : 'Portal Access Enabled'}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF1EE]">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-xs font-semibold border border-[#D4DBD7] rounded-lg"
              >
                {tr('cancel', lang)}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg"
              >
                {tr('save', lang)}
              </button>
            </div>
          </form>
        </div>
      )}
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
    addAssetItem,
  } = useEdir();

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [dirTitleAm, setDirTitleAm] = useState('');
  const [dirTitleEn, setDirTitleEn] = useState('');
  const [dirDesc, setDirDesc] = useState('');
  const [dirRole, setDirRole] = useState<PortalRole>('vice_chair');
  const [dirDue, setDirDue] = useState('2026-12-10');

  const [showAssetForm, setShowAssetForm] = useState(false);
  const [assetNameAm, setAssetNameAm] = useState('');
  const [assetNameEn, setAssetNameEn] = useState('');
  const [assetCat, setAssetCat] = useState<AssetItem['category']>('tent');
  const [assetQty, setAssetQty] = useState('1');
  const [assetFee, setAssetFee] = useState('500');
  const [assetLoc, setAssetLoc] = useState('Aleta Wondo Edir Store');

  if (!currentUser) return null;

  const isViceChair = currentUser.role === 'vice_chair';
  const isChair = currentUser.role === 'chairperson';
  const canManageAssets = isViceChair || isChair || currentUser.role === 'secretary';

  const handleDirectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirTitleEn.trim()) return;
    await issueDirective({
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

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNameEn.trim() && !assetNameAm.trim()) return;
    await addAssetItem({
      nameAm: assetNameAm.trim() || assetNameEn.trim(),
      nameEn: assetNameEn.trim() || assetNameAm.trim(),
      category: assetCat,
      totalQuantity: Number(assetQty) || 1,
      dailyRentalFeeEtb: Number(assetFee) || 0,
      storageLocation: assetLoc.trim() || 'Aleta Wondo Store',
    });
    setAssetNameAm('');
    setAssetNameEn('');
    setShowAssetForm(false);
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

          {requests.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#64748B]">
              {lang === 'am' ? 'እስካሁን የቀረበ የአባላት ጥያቄ የለም።' : 'No member requests submitted yet.'}
            </p>
          ) : (
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
                      <span className="font-semibold text-[#0E4D34] uppercase">
                        {req.status.replace(/_/g, ' ')}
                      </span>
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
                      {req.requestedAmountEtb > 0 && (
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
          )}
        </section>

        {/* Right Side: Live Asset Availability + Chair Directives */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-[#DCE2DD] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#EEF1EE] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0E4D34]" />
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {lang === 'am' ? 'በመጋዘን ያሉ የዕድሩ ንብረቶች' : 'Edir Asset Availability Check'}
                </h3>
              </div>
              {canManageAssets && (
                <button
                  type="button"
                  onClick={() => setShowAssetForm((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E4D34] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAssetForm ? tr('cancel', lang) : lang === 'am' ? 'ንብረት ጨምር' : 'Add Asset'}
                </button>
              )}
            </div>

            {showAssetForm && canManageAssets && (
              <form
                onSubmit={handleAddAsset}
                className="p-3 bg-[#F8FAF9] border border-[#E2E6E3] rounded-xl space-y-2 text-xs"
              >
                <input
                  type="text"
                  value={assetNameAm}
                  onChange={(e) => setAssetNameAm(e.target.value)}
                  placeholder={lang === 'am' ? 'የንብረት ስም (አማርኛ)' : 'Asset Name (Amharic)'}
                  className="w-full px-2.5 py-1.5 border border-[#CBD5D0] rounded-lg bg-white"
                />
                <input
                  type="text"
                  required
                  value={assetNameEn}
                  onChange={(e) => setAssetNameEn(e.target.value)}
                  placeholder={lang === 'am' ? 'የንብረት ስም (English) *' : 'Asset Name (English) *'}
                  className="w-full px-2.5 py-1.5 border border-[#CBD5D0] rounded-lg bg-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={assetCat}
                    onChange={(e) => setAssetCat(e.target.value as AssetItem['category'])}
                    className="px-2 py-1.5 border border-[#CBD5D0] rounded-lg bg-white"
                  >
                    <option value="tent">Tent</option>
                    <option value="chair">Chair</option>
                    <option value="utensil">Utensil</option>
                    <option value="electronics">Audio/Elec</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={assetQty}
                    onChange={(e) => setAssetQty(e.target.value)}
                    placeholder="Qty"
                    className="px-2 py-1.5 font-mono border border-[#CBD5D0] rounded-lg bg-white"
                  />
                  <input
                    type="number"
                    min={0}
                    value={assetFee}
                    onChange={(e) => setAssetFee(e.target.value)}
                    placeholder="Fee/day"
                    className="px-2 py-1.5 font-mono border border-[#CBD5D0] rounded-lg bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={assetLoc}
                  onChange={(e) => setAssetLoc(e.target.value)}
                  placeholder="Storage Location"
                  className="w-full px-2.5 py-1.5 border border-[#CBD5D0] rounded-lg bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 font-semibold text-white bg-[#0E4D34] rounded-lg"
                >
                  {lang === 'am' ? 'ንብረቱን መዝግብ' : 'Save Asset'}
                </button>
              </form>
            )}

            {assets.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#64748B]">
                {lang === 'am' ? 'እስካሁን የተመዘገበ ንብረት የለም።' : 'No assets registered yet.'}
              </p>
            ) : (
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
            )}
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

  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  const isCashier = currentUser.role === 'cashier' || currentUser.role === 'vice_chair';
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
              <div
                key={req.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
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

        {transactions.length === 0 ? (
          <p className="p-6 text-xs text-[#64748B]">
            {lang === 'am' ? 'እስካሁን የተላከ የክፍያ ደረሰኝ የለም።' : 'No member receipts submitted yet.'}
          </p>
        ) : (
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

                {txn.receiptDataUrl && (
                  <img
                    src={txn.receiptDataUrl}
                    alt={txn.receiptFileName}
                    className="max-h-40 rounded-lg border border-[#D4DBD7]"
                  />
                )}

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
        )}
      </section>
    </div>
  );
};

export const MgmtMeetingsView: React.FC = () => {
  const { lang, currentUser, meetings, accounts, createMeetingCall } = useEdir();
  const [titleAm, setTitleAm] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [date, setDate] = useState('2026-12-06');
  const [time, setTime] = useState('09:00 AM (3:00 LT)');
  const [locationEn, setLocationEn] = useState('Aleta Wondo Municipality Hall');
  const [agendaEn, setAgendaEn] = useState('');

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return;
    await createMeetingCall({
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
          {lang === 'am'
            ? 'የስብሰባ ጥሪ እና QR አቴንዳንስ መከታተያ'
            : 'Meetings, QR Calls & Attendance Roster'}
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
          {meetings.length === 0 ? (
            <p className="p-6 text-xs text-[#64748B]">
              {lang === 'am' ? 'እስካሁን የተጠራ ስብሰባ የለም።' : 'No meetings scheduled yet.'}
            </p>
          ) : (
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
          )}
        </section>
      </div>
    </div>
  );
};

export const MgmtCommsView: React.FC = () => {
  const { lang, currentUser, messages, publishNotice } = useEdir();
  const [category, setCategory] = useState<CommitteeMessage['category']>('general');
  const [titleAm, setTitleAm] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAm, setBodyAm] = useState('');
  const [bodyEn, setBodyEn] = useState('');

  if (!currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() && !titleAm.trim()) return;
    await publishNotice({
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
          {messages.length === 0 ? (
            <p className="p-6 text-xs text-[#64748B]">
              {lang === 'am' ? 'እስካሁን የታተመ ማስታወቂያ የለም።' : 'No notices published yet.'}
            </p>
          ) : (
            messages.map((m) => (
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
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export const MgmtAuditView: React.FC = () => {
  const { lang, currentUser, auditLogs } = useEdir();
  if (!currentUser) return null;
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
        {auditLogs.length === 0 ? (
          <p className="p-6 text-xs text-[#64748B]">
            {lang === 'am' ? 'እስካሁን የተመዘገበ የኦዲት እንቅስቃሴ የለም።' : 'No audit entries recorded yet.'}
          </p>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-mono font-bold text-[#0E4D34]">{log.action}</span>
                  <span>·</span>
                  <span>{log.actorName}</span>
                  <span>
                    ({lang === 'am' ? ROLE_LABELS[log.actorRole].am : ROLE_LABELS[log.actorRole].en})
                  </span>
                </div>
                <p className="text-sm text-[#0F172A]">
                  {lang === 'am' ? log.detailsAm : log.detailsEn}
                </p>
              </div>
              <span className="font-mono text-xs text-[#64748B] shrink-0">{log.timestamp}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
