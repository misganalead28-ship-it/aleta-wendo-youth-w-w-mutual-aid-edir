import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe2,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { LOGO_PATH, ROLE_LABELS, tr } from '../i18n/translations';
import { PortalRole } from '../types';

const MANAGEMENT_ROLES: PortalRole[] = [
  'vice_chair',
  'chairperson',
  'secretary',
  'cashier',
  'pr',
  'auditor',
];

export const SignInScreen: React.FC = () => {
  const { lang, setLang, signInWithRoleAndCredentials } = useEdir();

  const [roleGroup, setRoleGroup] = useState<'member' | 'committee'>('member');
  const [committeeRole, setCommitteeRole] = useState<PortalRole>('vice_chair');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRef, setShowRef] = useState(false);

  const selectedRole: PortalRole = roleGroup === 'member' ? 'member' : committeeRole;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = signInWithRoleAndCredentials(selectedRole, identifier, password);
    if (!res.ok) {
      setErrorMsg(lang === 'am' ? res.errorAm || '' : res.errorEn || '');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_PATH}
            alt="Aleta Wondo Youth Mutual Support Edir Logo"
            className="w-10 h-10 rounded-full object-cover border border-[#D4DBD7] bg-white"
          />
          <div>
            <p className="text-sm font-semibold text-[#0E4D34] leading-tight">
              {tr('orgName', lang)}
            </p>
            <p className="text-xs text-[#64748B]">{tr('orgLocation', lang)}</p>
          </div>
        </div>

        <div
          className="flex items-center p-0.5 bg-[#EAEFEA] rounded-lg border border-[#D4DBD7]"
          role="group"
          aria-label="Language switcher"
        >
          <button
            type="button"
            onClick={() => setLang('am')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              lang === 'am' ? 'bg-[#0E4D34] text-white' : 'text-[#334155] hover:text-[#0F172A]'
            }`}
          >
            አማርኛ
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              lang === 'en' ? 'bg-[#0E4D34] text-white' : 'text-[#334155] hover:text-[#0F172A]'
            }`}
          >
            English
          </button>
        </div>
      </header>

      {/* Center Role-Based Sign-In Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden shadow-sm">
          {/* Left Identity Panel */}
          <div className="lg:col-span-5 bg-[#0E4D34] text-white p-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-sm mx-auto lg:mx-0">
                <img
                  src={LOGO_PATH}
                  alt="Aleta Wondo Youth Mutual Aid Edir Emblem"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="text-center lg:text-left space-y-2">
                <p className="text-xs font-medium text-[#F5DFA9]">
                  {lang === 'am'
                    ? 'በሚና የተለየ የመግቢያ ስርዓት (RBAC)'
                    : 'Role-Based Mutual Aid Portal'}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold leading-snug">
                  {tr('orgFullName', lang)}
                </h1>
                <p className="text-sm text-white/85 leading-relaxed">
                  {lang === 'am'
                    ? 'አባላት እና የኮሚቴ አመራሮች በየራሳቸው የስራ ሚና በመግባት ክፍያዎችን፣ ምዝገባን፣ ጥያቄዎችን እና መዛግብትን ያስተዳድራሉ።'
                    : 'Dedicated workspaces for Edir members and committee leadership across Aleta Wondo and worldwide.'}
                </p>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/15 space-y-2.5 text-xs text-white/85">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F5DFA9] shrink-0" />
                <span>
                  {lang === 'am'
                    ? 'ምክትል ሰብሳቢ የአባላት ምዝገባ እና የፖርታል አክሰስ ፍቃድ ይሰጣሉ'
                    : 'Vice Chairperson manages member registration & portal access'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#F5DFA9] shrink-0" />
                <span>
                  {lang === 'am'
                    ? 'ከአለታ ወንዶ ውጪ ላሉ አባላት አውቶማቲክ የስብሰባ ነፃነት'
                    : 'Automatic attendance exemption for out-of-town members'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">{tr('signInTitle', lang)}</h2>
              <p className="text-sm text-[#475569] mt-1">{tr('signInSubtitle', lang)}</p>
            </div>

            {/* Role Group Selector: Member vs Committee & Management */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#334155]">
                {lang === 'am' ? '1. የመግቢያ ሚና ይምረጡ' : '1. Select Portal Role'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-[#EAEFEA] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setRoleGroup('member');
                    setErrorMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    roleGroup === 'member'
                      ? 'bg-white text-[#0E4D34] shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {tr('roleCategoryMember', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleGroup('committee');
                    setErrorMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    roleGroup === 'committee'
                      ? 'bg-white text-[#0E4D34] shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {tr('roleCategoryMgmt', lang)}
                </button>
              </div>

              {roleGroup === 'committee' && (
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    {tr('selectMgmtRole', lang)}
                  </label>
                  <select
                    value={committeeRole}
                    onChange={(e) => {
                      setCommitteeRole(e.target.value as PortalRole);
                      setErrorMsg(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm font-medium border border-[#CBD5D0] rounded-lg bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0E4D34]"
                  >
                    {MANAGEMENT_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {lang === 'am' ? ROLE_LABELS[r].am : ROLE_LABELS[r].en}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Standard Credential Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  {tr('memberIdentifierLabel', lang)}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    roleGroup === 'member'
                      ? 'AWY-2024-001 · +251916428810 · dawit.tadesse@edir.et'
                      : 'AWY-2024-005 · vicechair@edir.et'
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-[#CBD5D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D34]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  {tr('passwordLabel', lang)}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-[#CBD5D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4D34]"
                  />
                  <KeyRound className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-lg">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27] transition-colors min-h-[44px]"
              >
                <span>
                  {tr('signInBtn', lang)} —{' '}
                  {lang === 'am' ? ROLE_LABELS[selectedRole].am : ROLE_LABELS[selectedRole].en}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Plain-text collapsible credential directory for verification (no clickable login buttons) */}
            <div className="pt-3 border-t border-[#E2E6E3]">
              <button
                type="button"
                onClick={() => setShowRef((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-[#0E4D34]"
              >
                {showRef ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {lang === 'am'
                  ? 'የተመዘገቡ መለያዎች መመሪያ (ለፈተና/ማረጋገጫ)'
                  : 'Registered Account Directory Reference'}
              </button>

              {showRef && (
                <div className="mt-2.5 p-3.5 bg-[#F8FAF9] border border-[#DCE2DD] rounded-xl text-[11px] text-[#334155] space-y-1 font-mono">
                  <p className="font-sans font-semibold text-[#0E4D34] mb-1">
                    {lang === 'am'
                      ? 'የሁሉም መለያዎች ነባሪ የይለፍ ቃል፡ edir2026'
                      : 'Default password for registered accounts: edir2026'}
                  </p>
                  <p>Member (Local): AWY-2024-001 · dawit.tadesse@edir.et</p>
                  <p>Member (Diaspora): AWY-2024-004 · samuel.yohannes@edir.et</p>
                  <p>Vice Chair: AWY-2024-005 · vicechair@edir.et</p>
                  <p>Chairperson: AWY-2024-003 · chair@edir.et</p>
                  <p>Secretary: AWY-2024-002 · secretary@edir.et</p>
                  <p>Cashier: AWY-2024-006 · cashier@edir.et</p>
                  <p>Public Relations: AWY-2024-007 · pr@edir.et</p>
                  <p>Auditor: AWY-2024-008 · auditor@edir.et</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#64748B] px-4">
        {tr('orgFullName', lang)} · {tr('orgLocation', lang)}
      </footer>
    </div>
  );
};
