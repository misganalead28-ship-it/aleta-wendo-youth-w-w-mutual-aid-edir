import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FilePlus2,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  QrCode,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { LOGO_PATH, ROLE_LABELS, tr } from '../i18n/translations';
import { AppViewTab, PortalRole } from '../types';
import { CommitteeMessages } from './CommitteeMessages';
import { DigitalIdCard } from './DigitalIdCard';
import { FamilyRegistry } from './FamilyRegistry';
import { ImportRecordsModule } from './ImportRecordsModule';
import {
  MgmtApprovalsView,
  MgmtAuditView,
  MgmtCashierView,
  MgmtCommsView,
  MgmtMeetingsView,
  MgmtMembersView,
  MgmtOverviewView,
} from './ManagementWorkspace';
import { MemberAvatar } from './MemberAvatar';
import { MemberDashboard } from './MemberDashboard';
import { MemberPayments } from './MemberPayments';
import { MemberRecords } from './MemberRecords';
import { MemberRequests } from './MemberRequests';
import { QrAttendanceScanner } from './QrAttendanceScanner';
import { SignInScreen } from './SignInScreen';
import { StandingReport } from './StandingReport';

interface NavItem {
  id: AppViewTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const AppShell: React.FC = () => {
  const {
    lang,
    setLang,
    isAuthenticated,
    currentUser,
    signOut,
    activeTab,
    setActiveTab,
    messages,
    transactions,
    requests,
    toastMessage,
  } = useEdir();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <SignInScreen />
        {toastMessage && (
          <div className="no-print fixed bottom-5 right-5 z-50 bg-[#0E4D34] text-white px-4 py-3 rounded-xl shadow-lg border border-[#C89228] text-xs font-medium max-w-sm">
            {toastMessage}
          </div>
        )}
      </>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;
  const pendingViceChairCount = requests.filter((r) => r.status === 'pending_vice_chair').length;
  const pendingChairCount = requests.filter((r) => r.status === 'pending_chair').length;
  const pendingCashierCount =
    transactions.filter((t) => t.status === 'pending_verification').length +
    requests.filter((r) => r.status === 'pending_cashier').length;

  const getNavItemsForRole = (role: PortalRole): NavItem[] => {
    if (role === 'member') {
      return [
        { id: 'dashboard', label: tr('navDashboard', lang), icon: <Home className="w-4 h-4" /> },
        { id: 'payments', label: tr('navPayments', lang), icon: <CreditCard className="w-4 h-4" /> },
        { id: 'requests', label: tr('navRequests', lang), icon: <FilePlus2 className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'family', label: tr('navFamily', lang), icon: <Users className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> },
        {
          id: 'messages',
          label: tr('navMessages', lang),
          icon: <Bell className="w-4 h-4" />,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { id: 'qr_scanner', label: tr('navQrScanner', lang), icon: <QrCode className="w-4 h-4" /> },
        { id: 'digital_id', label: tr('navDigitalId', lang), icon: <Award className="w-4 h-4" /> },
      ];
    }

    const commonMgmt: NavItem[] = [
      { id: 'mgmt_overview', label: tr('navMgmtOverview', lang), icon: <LayoutDashboard className="w-4 h-4" /> },
    ];

    if (role === 'vice_chair') {
      commonMgmt.push(
        { id: 'mgmt_members', label: tr('navMgmtMembers', lang), icon: <UserPlus className="w-4 h-4" /> },
        {
          id: 'mgmt_approvals',
          label: tr('navMgmtApprovals', lang),
          icon: <ClipboardCheck className="w-4 h-4" />,
          badge: pendingViceChairCount > 0 ? pendingViceChairCount : undefined,
        },
        { id: 'mgmt_import_records', label: tr('navMgmtImport', lang), icon: <FolderPlus className="w-4 h-4" /> },
        { id: 'mgmt_meetings', label: tr('navMgmtMeetings', lang), icon: <QrCode className="w-4 h-4" /> },
        { id: 'mgmt_comms', label: tr('navMgmtComms', lang), icon: <Megaphone className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> }
      );
    } else if (role === 'chairperson') {
      commonMgmt.push(
        {
          id: 'mgmt_approvals',
          label: tr('navMgmtApprovals', lang),
          icon: <ClipboardCheck className="w-4 h-4" />,
          badge: pendingChairCount > 0 ? pendingChairCount : undefined,
        },
        { id: 'mgmt_members', label: tr('navMgmtMembers', lang), icon: <Users className="w-4 h-4" /> },
        { id: 'mgmt_cashier', label: tr('navMgmtCashier', lang), icon: <FileCheck2 className="w-4 h-4" /> },
        { id: 'mgmt_import_records', label: tr('navMgmtImport', lang), icon: <FolderPlus className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'mgmt_audit', label: tr('navMgmtAudit', lang), icon: <History className="w-4 h-4" /> }
      );
    } else if (role === 'secretary') {
      commonMgmt.push(
        { id: 'mgmt_members', label: tr('navMgmtMembers', lang), icon: <UserPlus className="w-4 h-4" /> },
        { id: 'mgmt_meetings', label: tr('navMgmtMeetings', lang), icon: <QrCode className="w-4 h-4" /> },
        { id: 'mgmt_import_records', label: tr('navMgmtImport', lang), icon: <FolderPlus className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> }
      );
    } else if (role === 'cashier') {
      commonMgmt.push(
        {
          id: 'mgmt_cashier',
          label: tr('navMgmtCashier', lang),
          icon: <FileCheck2 className="w-4 h-4" />,
          badge: pendingCashierCount > 0 ? pendingCashierCount : undefined,
        },
        { id: 'mgmt_import_records', label: tr('navMgmtImport', lang), icon: <FolderPlus className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> }
      );
    } else if (role === 'pr') {
      commonMgmt.push(
        { id: 'mgmt_comms', label: tr('navMgmtComms', lang), icon: <Megaphone className="w-4 h-4" /> },
        { id: 'mgmt_import_records', label: tr('navMgmtImport', lang), icon: <FolderPlus className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> }
      );
    } else if (role === 'auditor') {
      commonMgmt.push(
        { id: 'mgmt_audit', label: tr('navMgmtAudit', lang), icon: <History className="w-4 h-4" /> },
        { id: 'mgmt_cashier', label: tr('navMgmtCashier', lang), icon: <FileCheck2 className="w-4 h-4" /> },
        { id: 'mgmt_members', label: tr('navMgmtMembers', lang), icon: <Users className="w-4 h-4" /> },
        { id: 'records', label: tr('navRecords', lang), icon: <BookOpen className="w-4 h-4" /> },
        { id: 'standing', label: tr('navStanding', lang), icon: <BarChart3 className="w-4 h-4" /> }
      );
    }

    commonMgmt.push({
      id: 'digital_id',
      label: tr('navDigitalId', lang),
      icon: <Award className="w-4 h-4" />,
    });

    return commonMgmt;
  };

  const navItems = getNavItemsForRole(currentUser.role);
  const activeNavLabel =
    navItems.find((n) => n.id === activeTab)?.label || navItems[0]?.label || tr('navDashboard', lang);

  return (
    <div className="min-h-screen flex bg-[#F5F7F5] text-[#0F172A]">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Role-Scoped Navigation Sidebar */}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-50 h-screen w-[272px] bg-[#0E4D34] text-white flex flex-col justify-between transition-transform duration-200 shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={LOGO_PATH}
                alt="Aleta Wondo Youth Edir Logo"
                className="w-10 h-10 rounded-full object-cover bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#F5DFA9] truncate">{tr('orgName', lang)}</p>
                <p className="text-[11px] text-white/80 truncate">
                  {lang === 'am' ? ROLE_LABELS[currentUser.role].am : ROLE_LABELS[currentUser.role].en}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-white/80 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors text-left min-h-[44px] ${
                    isActive
                      ? 'bg-white text-[#0E4D34] font-semibold'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? 'text-[#0E4D34]' : 'text-[#F5DFA9]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[11px] font-mono font-bold rounded ${
                        isActive ? 'bg-[#0E4D34] text-white' : 'bg-[#C89228] text-[#0A2E1F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Signed-In User & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <MemberAvatar
              src={currentUser.photoUrl}
              name={currentUser.fullNameEn}
              size="md"
              className="border-white/25"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {lang === 'am' ? currentUser.fullNameAm : currentUser.fullNameEn}
              </p>
              <p className="text-[11px] font-mono text-[#F5DFA9] truncate">{currentUser.id}</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-white/15 rounded-lg hover:bg-white/25"
          >
            <LogOut className="w-3.5 h-3.5" />
            {tr('signOut', lang)}
          </button>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print sticky top-0 z-30 bg-white border-b border-[#DCE2DD] px-4 sm:px-8 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-[#CBD5D0] text-[#0F172A] hover:bg-[#F4F6F5] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <p className="text-xs text-[#64748B] truncate">
                  {tr('orgFullName', lang)} ·{' '}
                  <span className="font-semibold text-[#0E4D34]">
                    {lang === 'am' ? ROLE_LABELS[currentUser.role].am : ROLE_LABELS[currentUser.role].en}
                  </span>
                </p>
                <p className="text-sm sm:text-base font-bold text-[#0F172A] truncate">
                  {activeNavLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Language Switcher */}
              <div
                className="flex items-center p-0.5 bg-[#EAEFEA] rounded-lg border border-[#CBD5D0]"
                role="group"
                aria-label="Language switcher"
              >
                <button
                  onClick={() => setLang('am')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    lang === 'am' ? 'bg-[#0E4D34] text-white' : 'text-[#334155] hover:text-[#0F172A]'
                  }`}
                >
                  አማርኛ
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    lang === 'en' ? 'bg-[#0E4D34] text-white' : 'text-[#334155] hover:text-[#0F172A]'
                  }`}
                >
                  English
                </button>
              </div>

              {currentUser.role === 'member' && (
                <button
                  onClick={() => setActiveTab('messages')}
                  className="relative p-2.5 bg-white border border-[#CBD5D0] rounded-lg text-[#0F172A] hover:bg-[#F4F6F5]"
                  aria-label={tr('navMessages', lang)}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B8821E] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && <MemberDashboard />}
          {activeTab === 'payments' && <MemberPayments />}
          {activeTab === 'requests' && <MemberRequests />}
          {activeTab === 'records' && <MemberRecords />}
          {activeTab === 'family' && <FamilyRegistry />}
          {activeTab === 'standing' && <StandingReport />}
          {activeTab === 'messages' && <CommitteeMessages />}
          {activeTab === 'qr_scanner' && <QrAttendanceScanner />}
          {activeTab === 'digital_id' && <DigitalIdCard />}

          {activeTab === 'mgmt_overview' && <MgmtOverviewView />}
          {activeTab === 'mgmt_members' && <MgmtMembersView />}
          {activeTab === 'mgmt_approvals' && <MgmtApprovalsView />}
          {activeTab === 'mgmt_cashier' && <MgmtCashierView />}
          {activeTab === 'mgmt_meetings' && <MgmtMeetingsView />}
          {activeTab === 'mgmt_comms' && <MgmtCommsView />}
          {activeTab === 'mgmt_import_records' && <ImportRecordsModule />}
          {activeTab === 'mgmt_audit' && <MgmtAuditView />}
        </main>
      </div>

      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-[#0E4D34] text-white px-4 py-3 rounded-xl shadow-lg border border-[#C89228] text-xs font-medium max-w-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
