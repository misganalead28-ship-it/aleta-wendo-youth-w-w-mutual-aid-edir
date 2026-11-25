import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppViewTab,
  AssetItem,
  AuditLogEntry,
  CommitteeMessage,
  Directive,
  EdirRecordDoc,
  FamilyBeneficiary,
  Language,
  Meeting,
  MemberRequest,
  PaymentTransaction,
  PortalRole,
  SpecialCampaign,
  UserAccount,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_ASSETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CAMPAIGNS,
  INITIAL_DIRECTIVES,
  INITIAL_MEETINGS,
  INITIAL_MESSAGES,
  INITIAL_RECORDS,
  INITIAL_REQUESTS,
  INITIAL_TRANSACTIONS,
  PHOTOS,
} from '../data/seedData';

interface PersistedState {
  lang: Language;
  isAuthenticated: boolean;
  signedInAccountId: string;
  accounts: UserAccount[];
  transactions: PaymentTransaction[];
  campaigns: SpecialCampaign[];
  requests: MemberRequest[];
  meetings: Meeting[];
  records: EdirRecordDoc[];
  messages: CommitteeMessage[];
  assets: AssetItem[];
  directives: Directive[];
  auditLogs: AuditLogEntry[];
}

const STORAGE_KEY = 'aw_edir_rbac_portal_v3';

function getDefaultTabForRole(role: PortalRole): AppViewTab {
  return role === 'member' ? 'dashboard' : 'mgmt_overview';
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedState;
    }
  } catch {
    // ignore storage read error
  }
  return {
    lang: 'en',
    isAuthenticated: false,
    signedInAccountId: 'AWY-2024-001',
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    campaigns: INITIAL_CAMPAIGNS,
    requests: INITIAL_REQUESTS,
    meetings: INITIAL_MEETINGS,
    records: INITIAL_RECORDS,
    messages: INITIAL_MESSAGES,
    assets: INITIAL_ASSETS,
    directives: INITIAL_DIRECTIVES,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
}

interface EdirContextValue extends PersistedState {
  activeTab: AppViewTab;
  setActiveTab: (tab: AppViewTab) => void;
  setLang: (lang: Language) => void;
  currentUser: UserAccount;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Role-Based Auth (No Demo Login)
  signInWithRoleAndCredentials: (
    selectedRole: PortalRole,
    identifier: string,
    password: string
  ) => { ok: boolean; errorAm?: string; errorEn?: string };
  signOut: () => void;

  // Member Actions
  submitPaymentReceipt: (input: {
    type: PaymentTransaction['type'];
    itemLabelsAm: string;
    itemLabelsEn: string;
    amount: number;
    method: PaymentTransaction['method'];
    referenceNumber: string;
    paymentDate: string;
    receiptFileName: string;
    receiptPreviewType: 'image' | 'pdf';
    receiptDataUrl?: string;
  }) => void;
  submitMemberRequest: (input: {
    requestType: MemberRequest['requestType'];
    titleAm: string;
    titleEn: string;
    description: string;
    requestedDate?: string;
    requestedAmountEtb?: number;
    attachmentName?: string;
  }) => void;
  addDependent: (dep: Omit<FamilyBeneficiary, 'id'>) => void;
  updateDependent: (id: string, patch: Partial<FamilyBeneficiary>) => void;
  removeDependent: (id: string) => void;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  recordQrAttendance: (meetingId: string) => void;

  // Vice Chairperson & Committee Workflows
  registerMember: (input: {
    fullNameAm: string;
    fullNameEn: string;
    phone: string;
    email: string;
    password: string;
    city: string;
    country: string;
    addressDetail: string;
    residenceType: 'local' | 'out_of_town';
    emergencyContactName: string;
    emergencyContactPhone: string;
    bloodType: string;
    approveImmediately: boolean;
    dependentNameEn?: string;
    dependentNameAm?: string;
    dependentRel?: FamilyBeneficiary['relationship'];
  }) => void;
  toggleMemberPortalAccess: (memberId: string) => void;
  chairApproveMember: (memberId: string, approve: boolean) => void;
  viceChairProcessRequest: (requestId: string, approve: boolean, note: string) => void;
  chairAuthorizeAssetRequest: (requestId: string, approve: boolean, note: string) => void;
  cashierDisburseRequest: (requestId: string) => void;
  cashierVerifyReceipt: (txnId: string, approve: boolean, reason?: string) => void;
  runPenaltyEngine: () => void;
  createMeetingCall: (input: {
    titleAm: string;
    titleEn: string;
    date: string;
    time: string;
    locationEn: string;
    agendaEn: string;
  }) => void;
  publishNotice: (input: {
    category: CommitteeMessage['category'];
    titleAm: string;
    titleEn: string;
    bodyAm: string;
    bodyEn: string;
  }) => void;
  issueDirective: (input: {
    titleAm: string;
    titleEn: string;
    description: string;
    assignedToRole: PortalRole;
    dueDate: string;
  }) => void;
  updateDirectiveStatus: (id: string, status: Directive['status']) => void;
  importEdirRecord: (input: {
    recordType: EdirRecordDoc['recordType'];
    code: string;
    titleAm: string;
    titleEn: string;
    date: string;
    summaryAm: string;
    summaryEn: string;
    contentAm: string;
    contentEn: string;
    attachedFileName?: string;
    attachedFileSize?: string;
    attachedDataUrl?: string;
    importedRowCount?: number;
  }) => void;
}

const EdirContext = createContext<EdirContextValue | null>(null);

export const EdirProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<AppViewTab>(() => {
    const init = loadInitialState();
    const acc = init.accounts.find((a) => a.id === init.signedInAccountId);
    return getDefaultTabForRole(acc?.role || 'member');
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const currentUser =
    state.accounts.find((a) => a.id === state.signedInAccountId) || state.accounts[0];

  const nowStamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
  const todayDate = () => new Date().toISOString().slice(0, 10);

  const appendAudit = (
    prev: PersistedState,
    action: string,
    detailsAm: string,
    detailsEn: string
  ): AuditLogEntry[] => [
    {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: nowStamp(),
      actorName: currentUser.fullNameEn,
      actorRole: currentUser.role,
      action,
      detailsAm,
      detailsEn,
    },
    ...prev.auditLogs,
  ];

  const setLang = (lang: Language) => setState((p) => ({ ...p, lang }));

  const signInWithRoleAndCredentials: EdirContextValue['signInWithRoleAndCredentials'] = (
    selectedRole,
    identifier,
    password
  ) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s-]/g, '');

    if (!cleanId || !password.trim()) {
      return {
        ok: false,
        errorAm: 'እባክዎ መለያ (ID/ስልክ/ኢሜይል) እና የይለፍ ቃል ያስገቡ።',
        errorEn: 'Please enter both your identifier and password.',
      };
    }

    const found = state.accounts.find(
      (a) =>
        a.role === selectedRole &&
        (a.id.toLowerCase() === cleanId ||
          a.email.toLowerCase() === cleanId ||
          a.phone.replace(/[\s-]/g, '') === cleanPhone)
    );

    if (!found) {
      return {
        ok: false,
        errorAm: 'ለተመረጠው ሚና ትክክለኛ መለያ አልተገኘም። እባክዎ ሚናዎንና መለያዎን ያረጋግጡ።',
        errorEn: 'No account found matching this identifier for the selected role.',
      };
    }

    if (!found.portalAccessEnabled || found.status === 'suspended') {
      return {
        ok: false,
        errorAm: 'የዚህ መለያ የፖርታል አክሰስ ታግዷል። እባክዎ ምክትል ሰብሳቢውን ያነጋግሩ።',
        errorEn: 'Portal access is suspended for this account. Contact the Vice Chairperson.',
      };
    }

    if (found.password !== password) {
      return {
        ok: false,
        errorAm: 'የገባው የይለፍ ቃል ትክክል አይደለም።',
        errorEn: 'Incorrect password. Please check your credentials.',
      };
    }

    setState((p) => ({
      ...p,
      isAuthenticated: true,
      signedInAccountId: found.id,
    }));
    setActiveTab(getDefaultTabForRole(found.role));
    showToast(
      state.lang === 'am'
        ? `እንኳን ደህና መጡ፣ ${found.fullNameAm}`
        : `Signed in as ${found.fullNameEn}`
    );
    return { ok: true };
  };

  const signOut = () => {
    setState((p) => ({ ...p, isAuthenticated: false }));
  };

  const submitPaymentReceipt: EdirContextValue['submitPaymentReceipt'] = (input) => {
    const newTxn: PaymentTransaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      memberId: currentUser.id,
      memberNameAm: currentUser.fullNameAm,
      memberNameEn: currentUser.fullNameEn,
      type: input.type,
      itemLabelsAm: input.itemLabelsAm,
      itemLabelsEn: input.itemLabelsEn,
      amount: input.amount,
      method: input.method,
      referenceNumber: input.referenceNumber,
      paymentDate: input.paymentDate,
      submittedDate: todayDate(),
      receiptFileName: input.receiptFileName,
      receiptPreviewType: input.receiptPreviewType,
      receiptDataUrl: input.receiptDataUrl,
      status: 'pending_verification',
    };
    setState((p) => ({ ...p, transactions: [newTxn, ...p.transactions] }));
    showToast(
      state.lang === 'am'
        ? 'የክፍያ ደረሰኝዎ ለገንዘብ ያዥ ማረጋገጫ ተልኳል።'
        : 'Receipt uploaded and queued for Cashier verification.'
    );
  };

  const submitMemberRequest: EdirContextValue['submitMemberRequest'] = (input) => {
    const req: MemberRequest = {
      id: `REQ-${Date.now().toString().slice(-5)}`,
      memberId: currentUser.id,
      memberNameAm: currentUser.fullNameAm,
      memberNameEn: currentUser.fullNameEn,
      ...input,
      submittedDate: todayDate(),
      status: 'pending_vice_chair',
    };
    setState((p) => ({ ...p, requests: [req, ...p.requests] }));
    showToast(
      state.lang === 'am'
        ? 'ጥያቄዎ ለምክትል ሰብሳቢ ቀርቧል።'
        : 'Request submitted to Vice Chairperson for review.'
    );
  };

  const addDependent: EdirContextValue['addDependent'] = (dep) => {
    const newDep: FamilyBeneficiary = { ...dep, id: `BEN-${Date.now().toString().slice(-4)}` };
    setState((p) => ({
      ...p,
      accounts: p.accounts.map((a) =>
        a.id === currentUser.id ? { ...a, beneficiaries: [...a.beneficiaries, newDep] } : a
      ),
    }));
    showToast(state.lang === 'am' ? 'የቤተሰብ አባል ተጨምሯል።' : 'Dependent added to Family Registry.');
  };

  const updateDependent: EdirContextValue['updateDependent'] = (id, patch) => {
    setState((p) => ({
      ...p,
      accounts: p.accounts.map((a) =>
        a.id === currentUser.id
          ? {
              ...a,
              beneficiaries: a.beneficiaries.map((b) => (b.id === id ? { ...b, ...patch } : b)),
            }
          : a
      ),
    }));
    showToast(state.lang === 'am' ? 'የቤተሰብ መረጃ ተስተካክሏል።' : 'Dependent details updated.');
  };

  const removeDependent: EdirContextValue['removeDependent'] = (id) => {
    setState((p) => ({
      ...p,
      accounts: p.accounts.map((a) =>
        a.id === currentUser.id
          ? { ...a, beneficiaries: a.beneficiaries.filter((b) => b.id !== id) }
          : a
      ),
    }));
    showToast(state.lang === 'am' ? 'ከቤተሰብ ዝርዝር ተሰርዟል።' : 'Dependent removed.');
  };

  const markMessageRead = (id: string) => {
    setState((p) => ({
      ...p,
      messages: p.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
    }));
  };

  const markAllMessagesRead = () => {
    setState((p) => ({
      ...p,
      messages: p.messages.map((m) => ({ ...m, read: true })),
    }));
  };

  const recordQrAttendance = (meetingId: string) => {
    const isExempt = currentUser.residenceType === 'out_of_town';
    setState((p) => ({
      ...p,
      meetings: p.meetings.map((mtg) => {
        if (mtg.id !== meetingId) return mtg;
        const already = mtg.attendance.find((a) => a.memberId === currentUser.id);
        const entry = {
          memberId: currentUser.id,
          status: isExempt ? ('geo_exempt' as const) : ('present' as const),
          checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method: isExempt ? ('auto_geo' as const) : ('qr_scan' as const),
        };
        return {
          ...mtg,
          attendance: already
            ? mtg.attendance.map((a) => (a.memberId === currentUser.id ? entry : a))
            : [...mtg.attendance, entry],
        };
      }),
    }));
    showToast(
      isExempt
        ? state.lang === 'am'
          ? 'ከአለታ ወንዶ ውጪ ነዋሪ ስለሆኑ በአካል ስብሰባ መገኘት አይጠበቅብዎትም።'
          : 'Outside Aleta Wondo — physical attendance not required.'
        : state.lang === 'am'
        ? 'የQR ስብሰባ አቴንዳንስዎ ተመዝግቧል።'
        : 'Meeting attendance recorded via QR scan!'
    );
  };

  const registerMember: EdirContextValue['registerMember'] = (input) => {
    const num = (state.accounts.length + 1).toString().padStart(3, '0');
    const newId = `AWY-2026-${num}`;
    const newAcc: UserAccount = {
      id: newId,
      role: 'member',
      fullNameAm: input.fullNameAm,
      fullNameEn: input.fullNameEn,
      roleTitleAm:
        input.residenceType === 'out_of_town'
          ? 'መደበኛ አባል (ከከተማ ውጪ)'
          : 'መደበኛ አባል (አለታ ወንዶ)',
      roleTitleEn:
        input.residenceType === 'out_of_town'
          ? 'Member (Out-of-Town / Diaspora)'
          : 'Member (Aleta Wondo)',
      phone: input.phone,
      email: input.email,
      password: input.password || 'edir2026',
      city: input.city,
      country: input.country,
      addressDetail: input.addressDetail,
      residenceType: input.residenceType,
      joinDate: todayDate(),
      bloodType: input.bloodType || 'O+',
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      photoUrl: input.residenceType === 'out_of_town' ? PHOTOS.samuel : PHOTOS.dawit,
      status: input.approveImmediately ? 'active' : 'pending_chair',
      portalAccessEnabled: input.approveImmediately,
      monthlyDueBalance: 0,
      penaltyBalance: 0,
      specialDueBalance: 0,
      totalPaidEtb: 0,
      lastPaidMonth: '2026-11',
      beneficiaries: input.dependentNameEn
        ? [
            {
              id: `BEN-${Date.now().toString().slice(-4)}`,
              fullNameAm: input.dependentNameAm || input.dependentNameEn,
              fullNameEn: input.dependentNameEn,
              relationship: input.dependentRel || 'spouse',
              covered: true,
            },
          ]
        : [],
    };
    setState((p) => ({
      ...p,
      accounts: [newAcc, ...p.accounts],
      auditLogs: appendAudit(
        p,
        'MEMBER_REGISTERED',
        `አዲስ አባል ${input.fullNameAm} (${newId} · ${input.city}) ተመዝግቧል።`,
        `Registered member ${input.fullNameEn} (${newId} · ${input.city}, ${
          input.approveImmediately ? 'Active & Portal Enabled' : 'Pending Chair Approval'
        }).`
      ),
    }));
    showToast(
      state.lang === 'am'
        ? `አባል ${newId} ተመዝግቧል።`
        : `Member ${newId} registered (${input.approveImmediately ? 'Active' : 'Submitted to Chair'}).`
    );
  };

  const toggleMemberPortalAccess = (memberId: string) => {
    setState((p) => {
      const target = p.accounts.find((a) => a.id === memberId);
      if (!target) return p;
      const next = !target.portalAccessEnabled;
      return {
        ...p,
        accounts: p.accounts.map((a) =>
          a.id === memberId
            ? { ...a, portalAccessEnabled: next, status: next ? 'active' : 'suspended' }
            : a
        ),
        auditLogs: appendAudit(
          p,
          'ACCESS_UPDATED',
          `የ${target.fullNameAm} ፖርታል አክሰስ ${next ? 'ተከፍቷል' : 'ታግዷል'}።`,
          `${next ? 'Enabled' : 'Suspended'} portal login access for ${target.fullNameEn} (${memberId}).`
        ),
      };
    });
    showToast(state.lang === 'am' ? 'የአባሉ ፖርታል አክሰስ ተዘምኗል።' : 'Member portal access updated.');
  };

  const chairApproveMember = (memberId: string, approve: boolean) => {
    setState((p) => {
      const target = p.accounts.find((a) => a.id === memberId);
      if (!target) return p;
      return {
        ...p,
        accounts: p.accounts.map((a) =>
          a.id === memberId
            ? {
                ...a,
                status: approve ? 'active' : 'suspended',
                portalAccessEnabled: approve,
              }
            : a
        ),
        auditLogs: appendAudit(
          p,
          'MEMBER_APPROVED',
          `የ${target.fullNameAm} አባልነት ${approve ? 'ጸድቋል' : 'ተሰርዟል'}።`,
          `Chairperson ${approve ? 'approved' : 'declined'} membership ${memberId}.`
        ),
      };
    });
    showToast(approve ? 'Member approved & activated.' : 'Member application declined.');
  };

  const viceChairProcessRequest = (requestId: string, approve: boolean, note: string) => {
    setState((p) => {
      const req = p.requests.find((r) => r.id === requestId);
      if (!req) return p;
      const nextStatus: MemberRequest['status'] = !approve
        ? 'rejected'
        : req.requestType === 'benefit_claim'
        ? 'pending_cashier'
        : req.requestType === 'asset_rental'
        ? 'pending_chair'
        : 'approved';

      return {
        ...p,
        requests: p.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: nextStatus,
                committeeResponseAm:
                  note ||
                  (approve
                    ? req.requestType === 'benefit_claim'
                      ? 'በምክትል ሰብሳቢ ጸድቆ ለገንዘብ ያዥ ተልኳል።'
                      : req.requestType === 'asset_rental'
                      ? 'ንብረቱ መኖሩ ተረጋግጦ ለዋና ሰብሳቢ ተልኳል።'
                      : 'በምክትል ሰብሳቢ ጸድቋል።'
                    : 'ውድቅ ተደርጓል።'),
                committeeResponseEn:
                  note ||
                  (approve
                    ? req.requestType === 'benefit_claim'
                      ? 'Authorized by Vice Chair and forwarded to Cashier.'
                      : req.requestType === 'asset_rental'
                      ? 'Availability verified by Vice Chair; routed to Chairperson.'
                      : 'Approved by Vice Chair.'
                    : 'Declined by Vice Chair.'),
              }
            : r
        ),
        auditLogs: appendAudit(
          p,
          'REQUEST_ROUTED',
          `ምክትል ሰብሳቢ ጥያቄ ${requestId}ን ወደ ${nextStatus} አሸጋግረዋል።`,
          `Vice Chair updated request ${requestId} to ${nextStatus}.`
        ),
      };
    });
    showToast(
      approve
        ? state.lang === 'am'
          ? 'ጥያቄው ጸድቆ ወደ ቀጣዩ ክፍል ተልኳል።'
          : 'Request authorized and routed.'
        : state.lang === 'am'
        ? 'ጥያቄው ውድቅ ተደርጓል።'
        : 'Request rejected.'
    );
  };

  const chairAuthorizeAssetRequest = (requestId: string, approve: boolean, note: string) => {
    setState((p) => ({
      ...p,
      requests: p.requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: approve ? 'approved' : 'rejected',
              committeeResponseAm: note || (approve ? 'በዋና ሰብሳቢ ጸድቋል።' : 'ተከልክሏል።'),
              committeeResponseEn:
                note || (approve ? 'Final authorization granted by Chairperson.' : 'Declined by Chairperson.'),
            }
          : r
      ),
      auditLogs: appendAudit(
        p,
        'ASSET_AUTHORIZED',
        `ዋና ሰብሳቢ የንብረት ጥያቄ ${requestId}ን ${approve ? 'ፈቅደዋል' : 'ከልክለዋል'}።`,
        `Chairperson ${approve ? 'authorized' : 'declined'} asset request ${requestId}.`
      ),
    }));
    showToast(approve ? 'Asset rental authorized by Chairperson.' : 'Asset request declined.');
  };

  const cashierDisburseRequest = (requestId: string) => {
    setState((p) => {
      const req = p.requests.find((r) => r.id === requestId);
      if (!req) return p;
      return {
        ...p,
        requests: p.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'disbursed',
                committeeResponseAm: 'ክፍያው በገንዘብ ያዥ ተፈጽሟል።',
                committeeResponseEn: 'Payout disbursed by Cashier.',
              }
            : r
        ),
        auditLogs: appendAudit(
          p,
          'PAYOUT_DISBURSED',
          `ገንዘብ ያዥ ለጥያቄ ${requestId} ክፍያ ፈጽመዋል።`,
          `Cashier disbursed payout for ${requestId} (${req.requestedAmountEtb || 0} ETB).`
        ),
      };
    });
    showToast(state.lang === 'am' ? 'ክፍያው ተፈጽሟል።' : 'Benefit payout disbursed.');
  };

  const cashierVerifyReceipt = (txnId: string, approve: boolean, reason?: string) => {
    setState((p) => {
      const txn = p.transactions.find((t) => t.id === txnId);
      if (!txn) return p;
      return {
        ...p,
        transactions: p.transactions.map((t) =>
          t.id === txnId
            ? {
                ...t,
                status: approve ? 'verified' : 'rejected',
                verifiedBy: currentUser.fullNameEn,
                rejectionReasonAm: !approve ? reason || 'ደረሰኙ አይታይም' : undefined,
                rejectionReasonEn: !approve ? reason || 'Receipt could not be verified' : undefined,
              }
            : t
        ),
        accounts: approve
          ? p.accounts.map((a) =>
              a.id === txn.memberId
                ? {
                    ...a,
                    totalPaidEtb: a.totalPaidEtb + txn.amount,
                    monthlyDueBalance:
                      txn.type === 'monthly_dues'
                        ? Math.max(0, a.monthlyDueBalance - txn.amount)
                        : a.monthlyDueBalance,
                    penaltyBalance:
                      txn.type === 'penalty_settlement'
                        ? Math.max(0, a.penaltyBalance - txn.amount)
                        : a.penaltyBalance,
                    specialDueBalance:
                      txn.type === 'special_campaign'
                        ? Math.max(0, a.specialDueBalance - txn.amount)
                        : a.specialDueBalance,
                  }
                : a
            )
          : p.accounts,
        auditLogs: appendAudit(
          p,
          approve ? 'RECEIPT_VERIFIED' : 'RECEIPT_REJECTED',
          `ደረሰኝ ${txnId} (${txn.amount} ብር) ${approve ? 'ጸድቋል' : 'ውድቅ ተደርጓል'}።`,
          `${approve ? 'Approved' : 'Rejected'} receipt ${txnId} (${txn.amount} ETB) for ${txn.memberNameEn}.`
        ),
      };
    });
    showToast(approve ? 'Receipt approved and balance updated.' : 'Receipt rejected with reason.');
  };

  const runPenaltyEngine = () => {
    let count = 0;
    setState((p) => {
      const updated = p.accounts.map((a) => {
        if (a.role === 'member' && a.monthlyDueBalance > 0) {
          count += 1;
          return { ...a, penaltyBalance: a.penaltyBalance + 50 };
        }
        return a;
      });
      return {
        ...p,
        accounts: updated,
        auditLogs: appendAudit(
          p,
          'PENALTY_APPLIED',
          `ለ${count} ያልከፈሉ አባላት 50 ብር የዘገየ ቅጣት ተጨምሯል።`,
          `Applied 50 ETB automated late fee to ${count} overdue members.`
        ),
      };
    });
    showToast(
      state.lang === 'am'
        ? `ለ${count} አባላት የ50 ብር ቅጣት ተጨምሯል።`
        : `Automated penalty engine applied 50 ETB to ${count} overdue members.`
    );
  };

  const createMeetingCall: EdirContextValue['createMeetingCall'] = (input) => {
    const exempt = state.accounts
      .filter((a) => a.residenceType === 'out_of_town')
      .map((a) => ({ memberId: a.id, status: 'geo_exempt' as const, method: 'auto_geo' as const }));
    const mtg: Meeting = {
      id: `MTG-${Date.now().toString().slice(-5)}`,
      titleAm: input.titleAm,
      titleEn: input.titleEn,
      date: input.date,
      time: input.time,
      locationAm: input.locationEn,
      locationEn: input.locationEn,
      agendaAm: input.agendaEn,
      agendaEn: input.agendaEn,
      qrToken: `AWY-MTG-${Date.now().toString().slice(-5)}`,
      status: 'live',
      attendance: exempt,
    };
    setState((p) => ({
      ...p,
      meetings: [mtg, ...p.meetings],
      auditLogs: appendAudit(
        p,
        'MEETING_CALLED',
        `አዲስ ስብሰባ ተጠርቷል፡ ${input.titleAm}`,
        `Called meeting ${input.titleEn} on ${input.date}.`
      ),
    }));
    showToast(state.lang === 'am' ? 'የስብሰባ ጥሪ እና QR ኮድ ተፈጥሯል።' : 'Meeting call & QR token created.');
  };

  const publishNotice: EdirContextValue['publishNotice'] = (input) => {
    const msg: CommitteeMessage = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      ...input,
      senderAm: `${currentUser.fullNameAm} (${currentUser.roleTitleAm})`,
      senderEn: `${currentUser.fullNameEn} (${currentUser.roleTitleEn})`,
      date: todayDate(),
      read: false,
    };
    setState((p) => ({
      ...p,
      messages: [msg, ...p.messages],
      auditLogs: appendAudit(
        p,
        'NOTICE_PUBLISHED',
        `ማስታወቂያ ታትሟል፡ ${input.titleAm}`,
        `Published committee message: ${input.titleEn}`
      ),
    }));
    showToast(state.lang === 'am' ? 'መልዕክቱ ለአባላት ተላልፏል።' : 'Notice published to member inbox.');
  };

  const issueDirective: EdirContextValue['issueDirective'] = (input) => {
    const dir: Directive = {
      id: `DIR-${Date.now().toString().slice(-4)}`,
      ...input,
      status: 'assigned',
      issuedBy: currentUser.fullNameEn,
    };
    setState((p) => ({
      ...p,
      directives: [dir, ...p.directives],
      auditLogs: appendAudit(
        p,
        'DIRECTIVE_ISSUED',
        `አዲስ ትእዛዝ ተሰጥቷል፡ ${input.titleAm}`,
        `Chairperson issued directive: ${input.titleEn}`
      ),
    }));
    showToast(state.lang === 'am' ? 'ትእዛዙ ተመዝግቧል።' : 'Executive directive issued.');
  };

  const updateDirectiveStatus = (id: string, status: Directive['status']) => {
    setState((p) => ({
      ...p,
      directives: p.directives.map((d) => (d.id === id ? { ...d, status } : d)),
    }));
    showToast(state.lang === 'am' ? 'የትእዛዝ ሁኔታ ታድሷል።' : 'Directive status updated.');
  };

  const importEdirRecord: EdirContextValue['importEdirRecord'] = (input) => {
    const doc: EdirRecordDoc = {
      id: `REC-${Date.now().toString().slice(-5)}`,
      ...input,
      author: `${currentUser.fullNameEn} (${currentUser.roleTitleEn})`,
    };
    setState((p) => ({
      ...p,
      records: [doc, ...p.records],
      auditLogs: appendAudit(
        p,
        'RECORD_IMPORTED',
        `የዕድር መዝገብ ኢንፖርት/አታች ተደርጓል፡ ${input.titleAm}`,
        `Imported/attached Edir record: ${input.titleEn} (${input.attachedFileName || 'text'})`
      ),
    }));
    showToast(
      state.lang === 'am'
        ? 'መዝገቡ በተሳካ ሁኔታ ወደ ዕድሩ መዛግብት ገብቷል።'
        : 'Edir record successfully imported to repository.'
    );
  };

  return (
    <EdirContext.Provider
      value={{
        ...state,
        activeTab,
        setActiveTab,
        setLang,
        currentUser,
        toastMessage,
        showToast,
        signInWithRoleAndCredentials,
        signOut,
        submitPaymentReceipt,
        submitMemberRequest,
        addDependent,
        updateDependent,
        removeDependent,
        markMessageRead,
        markAllMessagesRead,
        recordQrAttendance,
        registerMember,
        toggleMemberPortalAccess,
        chairApproveMember,
        viceChairProcessRequest,
        chairAuthorizeAssetRequest,
        cashierDisburseRequest,
        cashierVerifyReceipt,
        runPenaltyEngine,
        createMeetingCall,
        publishNotice,
        issueDirective,
        updateDirectiveStatus,
        importEdirRecord,
      }}
    >
      {children}
    </EdirContext.Provider>
  );
};

export function useEdir() {
  const ctx = useContext(EdirContext);
  if (!ctx) throw new Error('useEdir must be used inside EdirProvider');
  return ctx;
}
