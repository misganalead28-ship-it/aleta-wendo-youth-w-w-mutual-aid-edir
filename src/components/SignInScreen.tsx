import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Globe2,
  KeyRound,
  LogOut,
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
  const {
    lang,
    setLang,
    signInWithGoogle,
    signInWithRoleAndCredentials,
    signOut,
    unregisteredEmail,
    accessSuspendedMsg,
    authErrorMsg,
    popupBlocked,
  } = useEdir();

  const [roleGroup, setRoleGroup] = useState<'member' | 'committee'>('member');
  const [committeeRole, setCommitteeRole] = useState<PortalRole>('vice_chair');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [googleErrorMsg, setGoogleErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedRole: PortalRole = roleGroup === 'member' ? 'member' : committeeRole;

  const handleGoogleSignIn = async () => {
    const signInPromise = signInWithGoogle();
    setErrorMsg(null);
    setGoogleErrorMsg(null);
    setSubmitting(true);
    const res = await signInPromise;
    setSubmitting(false);
    if (!res.ok) {
      setGoogleErrorMsg(lang === 'am' ? res.errorAm || '' : res.errorEn || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGoogleErrorMsg(null);
    setSubmitting(true);
    const res = await signInWithRoleAndCredentials(selectedRole, identifier, password);
    setSubmitting(false);
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
                    ? 'ምክትል ሰብሳቢ የተጠቃሚዎች ምዝገባ፣ የይለፍ ቃል እና የፖርታል አክሰስ ያስተዳድራሉ'
                    : 'Vice Chairperson administers users, passwords & portal access'}
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

            {/* Unregistered / Suspended Firebase Auth State Banner */}
            {(unregisteredEmail || accessSuspendedMsg) && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-[#991B1B]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      {accessSuspendedMsg
                        ? lang === 'am'
                          ? 'የፖርታል አክሰስ ታግዷል'
                          : 'Account Access Suspended'
                        : lang === 'am'
                        ? 'መለያው በዕድሩ ገና አልተመዘገበም'
                        : 'Email Not Registered in Edir Directory'}
                    </p>
                    <p>
                      {accessSuspendedMsg ||
                        (lang === 'am'
                          ? `በ "${unregisteredEmail}" ገብተዋል፤ ነገር ግን ምክትል ሰብሳቢው ገና አባልነትዎን አልመዘገቡም። እባክዎ የዕድሩን ምክትል ሰብሳቢ ያነጋግሩ።`
                          : `Signed in as "${unregisteredEmail}", which has not been registered by the Vice Chairperson yet. Please ask the Vice Chairperson to register your email.`)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#991B1B] bg-white border border-[#FCA5A5] rounded-lg hover:bg-[#FEE2E2]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {lang === 'am' ? 'ውጣ / ሌላ መለያ ሞክር' : 'Sign Out / Switch Account'}
                </button>
              </div>
            )}

            {/* Primary Live Firebase Google Sign-In */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleSignIn}
                className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 text-sm font-semibold text-[#0F172A] bg-white border-2 border-[#0E4D34] rounded-xl hover:bg-[#F3F8F5] transition-colors min-h-[46px] disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>
                  {lang === 'am'
                    ? 'በGoogle መለያ ይግቡ (Sign in with Google)'
                    : 'Sign in with Google'}
                </span>
              </button>
              <p className="text-[11px] text-[#64748B] text-center">
                {lang === 'am'
                  ? 'በምክትል ሰብሳቢ የተመዘገቡ አባላት እና የኮሚቴ አመራሮች በGoogle መለያቸው በቀጥታ ይገባሉ።'
                  : 'Registered members & committee officers sign in with their registered Google account.'}
              </p>
              {(googleErrorMsg || authErrorMsg) && !unregisteredEmail && !accessSuspendedMsg && (
                <div className="text-xs font-medium text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-3 rounded-xl space-y-2.5 break-words">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                    <span>{googleErrorMsg || authErrorMsg}</span>
                  </div>
                  {popupBlocked && typeof window !== 'undefined' && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'am'
                            ? 'በአዲስ Tab ክፈትና በGoogle ግባ'
                            : 'Open in New Tab to Sign In'}
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#E2E6E3]" />
              <span className="shrink mx-3 text-[11px] font-medium text-[#64748B] uppercase">
                {lang === 'am' ? 'ወይም በኢሜይልና የይለፍ ቃል' : 'Or Email & Password'}
              </span>
              <div className="flex-grow border-t border-[#E2E6E3]" />
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
                  {lang === 'am' ? 'የተመዘገበ ኢሜይል አድራሻ' : 'Registered Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com"
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
                <p className="text-xs font-medium text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-lg break-words">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27] transition-colors min-h-[44px] disabled:opacity-60"
              >
                <span>
                  {tr('signInBtn', lang)} —{' '}
                  {lang === 'am' ? ROLE_LABELS[selectedRole].am : ROLE_LABELS[selectedRole].en}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#64748B] px-4">
        {tr('orgFullName', lang)} · {tr('orgLocation', lang)}
      </footer>
    </div>
  );
};
