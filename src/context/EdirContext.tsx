import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, hashPassword, OperationType } from '../firebase';
import { ADMIN_OWNER_EMAIL, ORG_ID, PHOTOS } from '../data/seedData';
import { ROLE_LABELS } from '../i18n/translations';
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
  MeetingAttendanceRecord,
  MemberRequest,
  OrgStanding,
  PaymentTransaction,
  PortalRole,
  SpecialCampaign,
  UserAccount,
} from '../types';

function getDefaultTabForRole(role: PortalRole): AppViewTab {
  return role === 'member' ? 'dashboard' : 'mgmt_overview';
}

const DEFAULT_STANDING: OrgStanding = {
  orgId: ORG_ID,
  committeeEmails: [ADMIN_OWNER_EMAIL],
  totalActiveMembers: 0,
  localMembers: 0,
  outOfTownMembers: 0,
  totalCollectedEtb: 0,
  totalDisbursedEtb: 0,
};

interface EdirContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  authReady: boolean;
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  unregisteredEmail: string | null;
  accessSuspendedMsg: string | null;
  authErrorMsg: string | null;
  popupBlocked: boolean;
  currentUser: UserAccount | null;
  activeTab: AppViewTab;
  setActiveTab: (tab: AppViewTab) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Live Firestore collections
  orgStanding: OrgStanding;
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

  // Auth actions
  signInWithGoogle: () => Promise<{ ok: boolean; errorAm?: string; errorEn?: string }>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithRoleAndCredentials: (
    selectedRole: PortalRole,
    identifier: string,
    password: string
  ) => Promise<{ ok: boolean; errorAm?: string; errorEn?: string }>;
  signOut: () => Promise<void>;

  // Member actions
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
  }) => Promise<void>;
  submitMemberRequest: (input: {
    requestType: MemberRequest['requestType'];
    titleAm: string;
    titleEn: string;
    description: string;
    requestedDate?: string;
    requestedAmountEtb?: number;
    attachmentName?: string;
  }) => Promise<void>;
  addDependent: (dep: Omit<FamilyBeneficiary, 'id'>) => Promise<void>;
  updateDependent: (id: string, patch: Partial<FamilyBeneficiary>) => Promise<void>;
  removeDependent: (id: string) => Promise<void>;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  recordQrAttendance: (meetingId: string) => Promise<void>;

  // Vice Chairperson & Committee Workflows
  registerMember: (input: {
    role?: PortalRole;
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
  }) => Promise<void>;
  toggleMemberPortalAccess: (userId: string) => Promise<void>;
  viceChairResetPassword: (userId: string, newPassword: string) => Promise<void>;
  viceChairUpdateUser: (
    userId: string,
    patch: {
      fullNameAm: string;
      fullNameEn: string;
      phone: string;
      email: string;
      city: string;
      country: string;
      addressDetail: string;
      residenceType: 'local' | 'out_of_town';
      role: PortalRole;
      status: UserAccount['status'];
      portalAccessEnabled: boolean;
    }
  ) => Promise<void>;
  viceChairDeleteUser: (userId: string) => Promise<void>;
  chairApproveMember: (memberId: string, approve: boolean) => Promise<void>;
  viceChairProcessRequest: (requestId: string, approve: boolean, note: string) => Promise<void>;
  chairAuthorizeAssetRequest: (requestId: string, approve: boolean, note: string) => Promise<void>;
  cashierDisburseRequest: (requestId: string) => Promise<void>;
  cashierVerifyReceipt: (txnId: string, approve: boolean, reason?: string) => Promise<void>;
  runPenaltyEngine: () => Promise<void>;
  createMeetingCall: (input: {
    titleAm: string;
    titleEn: string;
    date: string;
    time: string;
    locationEn: string;
    agendaEn: string;
  }) => Promise<void>;
  publishNotice: (input: {
    category: CommitteeMessage['category'];
    titleAm: string;
    titleEn: string;
    bodyAm: string;
    bodyEn: string;
  }) => Promise<void>;
  issueDirective: (input: {
    titleAm: string;
    titleEn: string;
    description: string;
    assignedToRole: PortalRole;
    dueDate: string;
  }) => Promise<void>;
  updateDirectiveStatus: (id: string, status: Directive['status']) => Promise<void>;
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
  }) => Promise<void>;
  addAssetItem: (input: {
    nameAm: string;
    nameEn: string;
    category: AssetItem['category'];
    totalQuantity: number;
    dailyRentalFeeEtb: number;
    storageLocation: string;
  }) => Promise<void>;
  addSpecialCampaign: (input: {
    titleAm: string;
    titleEn: string;
    category: SpecialCampaign['category'];
    contributionMode: SpecialCampaign['contributionMode'];
    targetAmountPerMember: number;
    totalGoal: number;
    deadline: string;
    descriptionEn: string;
  }) => Promise<void>;
}

const EdirContext = createContext<EdirContextValue | null>(null);

export const EdirProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aw_edir_lang');
      return saved === 'am' ? 'am' : 'en';
    } catch {
      return 'en';
    }
  });

  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);
  const [accessSuspendedMsg, setAccessSuspendedMsg] = useState<string | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const resolvingRef = useRef<{
    uid: string;
    promise: Promise<{ ok: boolean; errorAm?: string; errorEn?: string }>;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<AppViewTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Firestore states (start empty — zero demo data)
  const [orgStanding, setOrgStanding] = useState<OrgStanding>(DEFAULT_STANDING);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [campaigns, setCampaigns] = useState<SpecialCampaign[]>([]);
  const [requests, setRequests] = useState<MemberRequest[]>([]);
  const [rawMeetings, setRawMeetings] = useState<Meeting[]>([]);
  const [attendanceByMeeting, setAttendanceByMeeting] = useState<
    Record<string, MeetingAttendanceRecord[]>
  >({});
  const [records, setRecords] = useState<EdirRecordDoc[]>([]);
  const [rawMessages, setRawMessages] = useState<CommitteeMessage[]>([]);
  const [readMsgIds, setReadMsgIds] = useState<string[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Purge any legacy demo localStorage keys on boot
  useEffect(() => {
    try {
      localStorage.removeItem('aw_edir_rbac_portal_v3');
      localStorage.removeItem('aw_edir_member_portal_v1');
      localStorage.removeItem('aw_edir_member_portal_v2');
    } catch {
      // ignore
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem('aw_edir_lang', next);
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const todayDate = () => new Date().toISOString().slice(0, 10);
  const nowStamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  const resolveSignedInUser = async (
    fbUser: FirebaseUser | null
  ): Promise<{ ok: boolean; errorAm?: string; errorEn?: string }> => {
    if (!fbUser || !fbUser.email) {
      resolvingRef.current = null;
      setFirebaseUser(null);
      setCurrentUser(null);
      setUnregisteredEmail(null);
      setAccessSuspendedMsg(null);
      setAuthErrorMsg(null);
      setAccounts([]);
      setTransactions([]);
      setRequests([]);
      setCampaigns([]);
      setRawMeetings([]);
      setAttendanceByMeeting({});
      setRecords([]);
      setRawMessages([]);
      setAssets([]);
      setDirectives([]);
      setAuditLogs([]);
      setOrgStanding(DEFAULT_STANDING);
      setAuthReady(true);
      return { ok: false };
    }

    if (resolvingRef.current && resolvingRef.current.uid === fbUser.uid) {
      return resolvingRef.current.promise;
    }

    const runResolution = async (): Promise<{
      ok: boolean;
      errorAm?: string;
      errorEn?: string;
    }> => {
      const email = fbUser.email!.toLowerCase();
      setFirebaseUser(fbUser);
      setUnregisteredEmail(null);
      setAccessSuspendedMsg(null);
      setAuthErrorMsg(null);

      if (!fbUser.emailVerified) {
        const amMsg = 'የመለያዎ ኢሜይል ገና አልተረጋገጠም። እባክዎ የተረጋገጠ የGoogle መለያ ይጠቀሙ።';
        const enMsg = 'Your email address is not verified. Please sign in with a verified Google account.';
        setCurrentUser(null);
        setAuthErrorMsg(lang === 'am' ? amMsg : enMsg);
        setAuthReady(true);
        return { ok: false, errorAm: amMsg, errorEn: enMsg };
      }

      try {
        // 1. Check direct doc at users/{uid}
        let foundDoc: UserAccount | null = null;
        const directSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (directSnap.exists()) {
          foundDoc = directSnap.data() as UserAccount;
        } else {
          // 2. Check pre-registered account by email
          const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            foundDoc = qSnap.docs[0].data() as UserAccount;
            if (!foundDoc.authUid) {
              const safePhoto = (fbUser.photoURL || foundDoc.photoUrl || PHOTOS.dawit).slice(0, 500);
              await updateDoc(doc(db, 'users', foundDoc.id), {
                authUid: fbUser.uid,
                photoUrl: safePhoto,
                updatedAt: serverTimestamp(),
              });
              foundDoc = { ...foundDoc, authUid: fbUser.uid, photoUrl: safePhoto };
            }
          }
        }

        // 3. Bootstrap live Admin / Vice Chairperson on clean DB for owner email
        if (!foundDoc && email === ADMIN_OWNER_EMAIL) {
          const initialHash = await hashPassword('edir2026');
          const safeName = (fbUser.displayName || '').trim().slice(0, 155);
          const safePhoto = (fbUser.photoURL || PHOTOS.bekele).slice(0, 500);
          const adminProfile: UserAccount = {
            id: fbUser.uid,
            authUid: fbUser.uid,
            role: 'vice_chair',
            fullNameAm: safeName || 'ምክትል ሰብሳቢ (አስተዳዳሪ)',
            fullNameEn: safeName || 'Vice Chairperson (System Admin)',
            roleTitleAm: ROLE_LABELS.vice_chair.am,
            roleTitleEn: ROLE_LABELS.vice_chair.en,
            phone: '',
            email,
            passwordHash: initialHash,
            city: 'Aleta Wondo',
            country: 'Ethiopia',
            addressDetail: 'Headquarters',
            residenceType: 'local',
            joinDate: todayDate(),
            bloodType: 'O+',
            emergencyContactName: '',
            emergencyContactPhone: '',
            photoUrl: safePhoto,
            status: 'active',
            portalAccessEnabled: true,
            monthlyDueBalance: 0,
            penaltyBalance: 0,
            specialDueBalance: 0,
            totalPaidEtb: 0,
            lastPaidMonth: todayDate().slice(0, 7),
            beneficiaries: [],
            committeeEmails: [ADMIN_OWNER_EMAIL],
          };

          await setDoc(doc(db, 'users', fbUser.uid), {
            ...adminProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          await setDoc(doc(db, 'committee_roster', email), {
            email,
            role: 'vice_chair',
            active: true,
            updatedAt: serverTimestamp(),
          });

          const standingSnap = await getDoc(doc(db, 'org', 'standing'));
          if (!standingSnap.exists()) {
            await setDoc(doc(db, 'org', 'standing'), {
              ...DEFAULT_STANDING,
              updatedAt: serverTimestamp(),
            });
          }

          foundDoc = adminProfile;
        }

        if (!foundDoc) {
          setCurrentUser(null);
          setUnregisteredEmail(email);
          setAuthReady(true);
          return {
            ok: false,
            errorAm: 'ይህ ኢሜይል በዕድሩ ገና አልተመዘገበም።',
            errorEn: 'This email is not registered in the Edir directory yet.',
          };
        }

        if (!foundDoc.portalAccessEnabled || foundDoc.status === 'suspended') {
          setCurrentUser(null);
          const amMsg = 'የዚህ መለያ የፖርታል አክሰስ ታግዷል። እባክዎ ምክትል ሰብሳቢውን ያነጋግሩ።';
          const enMsg = 'Portal access is suspended for this account. Contact the Vice Chairperson.';
          setAccessSuspendedMsg(lang === 'am' ? amMsg : enMsg);
          setAuthReady(true);
          return { ok: false, errorAm: amMsg, errorEn: enMsg };
        }

        setCurrentUser(foundDoc);
        setActiveTab(getDefaultTabForRole(foundDoc.role));

        try {
          const readRaw = localStorage.getItem(`aw_read_msgs_${foundDoc.id}`);
          setReadMsgIds(readRaw ? (JSON.parse(readRaw) as string[]) : []);
        } catch {
          setReadMsgIds([]);
        }

        setAuthReady(true);
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Auth profile resolution error:', msg);
        setCurrentUser(null);
        setAuthErrorMsg(msg);
        setAuthReady(true);
        return { ok: false, errorAm: msg, errorEn: msg };
      }
    };

    const promise = runResolution().finally(() => {
      if (resolvingRef.current?.promise === promise) {
        resolvingRef.current = null;
      }
    });
    resolvingRef.current = { uid: fbUser.uid, promise };
    return promise;
  };

  // Firebase Auth listener & user profile binding
  useEffect(() => {
    void getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          void resolveSignedInUser(res.user);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Google redirect auth error:', msg);
        setAuthErrorMsg(msg);
      });

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      void resolveSignedInUser(fbUser);
    });

    return () => unsub();
  }, []);

  // Attach real-time Firestore listeners ONLY when authenticated with an active profile
  useEffect(() => {
    if (!authReady || !firebaseUser || !currentUser) return;
    const unsubs: (() => void)[] = [];
    const userEmail = currentUser.email.toLowerCase();
    const isAdminOwner = userEmail === ADMIN_OWNER_EMAIL;
    const isMember = currentUser.role === 'member';

    // 1. Org Standing
    unsubs.push(
      onSnapshot(
        doc(db, 'org', 'standing'),
        (snap) => {
          if (snap.exists()) setOrgStanding(snap.data() as OrgStanding);
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'org/standing')
      )
    );

    // 2. Shared org collections (records, messages, campaigns, assets, meetings)
    const orgCollections: {
      path: string;
      setter: (items: never[]) => void;
    }[] = [
      { path: 'records', setter: (items) => setRecords(items as EdirRecordDoc[]) },
      { path: 'messages', setter: (items) => setRawMessages(items as CommitteeMessage[]) },
      { path: 'campaigns', setter: (items) => setCampaigns(items as SpecialCampaign[]) },
      { path: 'assets', setter: (items) => setAssets(items as AssetItem[]) },
      {
        path: 'meetings',
        setter: (items) =>
          setRawMeetings((items as Meeting[]).map((m) => ({ ...m, attendance: [] }))),
      },
    ];

    orgCollections.forEach(({ path, setter }) => {
      const q = query(collection(db, path), where('orgId', '==', ORG_ID));
      unsubs.push(
        onSnapshot(
          q,
          (snap) => {
            const list = snap.docs.map((d) => d.data()) as never[];
            setter(list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, path)
        )
      );
    });

    // 3. Transactions & Requests (member sees own; committee sees committee-routed)
    const txnQuery = isMember
      ? query(collection(db, 'transactions'), where('ownerUid', '==', firebaseUser.uid))
      : isAdminOwner
      ? collection(db, 'transactions')
      : query(collection(db, 'transactions'), where('committeeEmails', 'array-contains', userEmail));

    unsubs.push(
      onSnapshot(
        txnQuery,
        (snap) => {
          const list = snap.docs.map((d) => d.data() as PaymentTransaction);
          list.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
          setTransactions(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
      )
    );

    const reqQuery = isMember
      ? query(collection(db, 'requests'), where('ownerUid', '==', firebaseUser.uid))
      : isAdminOwner
      ? collection(db, 'requests')
      : query(collection(db, 'requests'), where('committeeEmails', 'array-contains', userEmail));

    unsubs.push(
      onSnapshot(
        reqQuery,
        (snap) => {
          const list = snap.docs.map((d) => d.data() as MemberRequest);
          list.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
          setRequests(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'requests')
      )
    );

    // 4. Current user's own account live listener
    unsubs.push(
      onSnapshot(
        doc(db, 'users', currentUser.id),
        (snap) => {
          if (snap.exists()) {
            setCurrentUser(snap.data() as UserAccount);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, `users/${currentUser.id}`)
      )
    );

    // 5. Committee-only collections (users directory, directives, auditLogs)
    if (!isMember) {
      const usersQ = isAdminOwner
        ? collection(db, 'users')
        : query(collection(db, 'users'), where('committeeEmails', 'array-contains', userEmail));
      unsubs.push(
        onSnapshot(
          usersQ,
          (snap) => setAccounts(snap.docs.map((d) => d.data() as UserAccount)),
          (err) => handleFirestoreError(err, OperationType.LIST, 'users')
        )
      );

      const dirQ = isAdminOwner
        ? collection(db, 'directives')
        : query(collection(db, 'directives'), where('committeeEmails', 'array-contains', userEmail));
      unsubs.push(
        onSnapshot(
          dirQ,
          (snap) => setDirectives(snap.docs.map((d) => d.data() as Directive)),
          (err) => handleFirestoreError(err, OperationType.LIST, 'directives')
        )
      );

      const audQ = isAdminOwner
        ? collection(db, 'auditLogs')
        : query(collection(db, 'auditLogs'), where('committeeEmails', 'array-contains', userEmail));
      unsubs.push(
        onSnapshot(
          audQ,
          (snap) => {
            const list = snap.docs.map((d) => d.data() as AuditLogEntry);
            list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            setAuditLogs(list);
          },
          (err) => handleFirestoreError(err, OperationType.LIST, 'auditLogs')
        )
      );
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [authReady, firebaseUser?.uid, currentUser?.id, currentUser?.role]);

  // Listen to attendance subcollections for loaded meetings
  useEffect(() => {
    if (!authReady || !firebaseUser || !currentUser || rawMeetings.length === 0) return;
    const isMember = currentUser.role === 'member';
    const userEmail = currentUser.email.toLowerCase();
    const isAdminOwner = userEmail === ADMIN_OWNER_EMAIL;

    const unsubs = rawMeetings.map((mtg) => {
      const attCol = collection(db, 'meetings', mtg.id, 'attendance');
      const attQ = isMember
        ? query(attCol, where('ownerUid', '==', firebaseUser.uid))
        : isAdminOwner
        ? attCol
        : query(attCol, where('committeeEmails', 'array-contains', userEmail));

      return onSnapshot(
        attQ,
        (snap) => {
          const list = snap.docs.map((d) => d.data() as MeetingAttendanceRecord);
          setAttendanceByMeeting((prev) => ({ ...prev, [mtg.id]: list }));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, `meetings/${mtg.id}/attendance`)
      );
    });

    return () => unsubs.forEach((fn) => fn());
  }, [authReady, firebaseUser?.uid, currentUser?.id, currentUser?.role, rawMeetings]);

  const meetings: Meeting[] = rawMeetings.map((m) => ({
    ...m,
    attendance: attendanceByMeeting[m.id] || [],
  }));

  const messages: CommitteeMessage[] = rawMessages
    .map((m) => ({ ...m, read: readMsgIds.includes(m.id) }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const getCommitteeRoutingEmails = (): string[] => {
    const base = new Set<string>([ADMIN_OWNER_EMAIL, ...(orgStanding.committeeEmails || [])]);
    accounts.forEach((a) => {
      if (a.role !== 'member' && a.portalAccessEnabled && a.email) {
        base.add(a.email.toLowerCase());
      }
    });
    return Array.from(base).slice(0, 15);
  };

  const writeAuditLog = async (action: string, detailsAm: string, detailsEn: string) => {
    if (!currentUser || !firebaseUser) return;
    const logId = `AUD-${Date.now()}`;
    const committeeEmails = getCommitteeRoutingEmails();
    try {
      await setDoc(doc(db, 'auditLogs', logId), {
        id: logId,
        orgId: ORG_ID,
        timestamp: nowStamp(),
        actorName: currentUser.fullNameEn,
        actorUid: firebaseUser.uid,
        actorRole: currentUser.role,
        action,
        detailsAm: detailsAm.slice(0, 490),
        detailsEn: detailsEn.slice(0, 490),
        committeeEmails,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `auditLogs/${logId}`);
    }
  };

  const syncStandingCounters = async (
    nextAccounts: UserAccount[],
    collectedDelta = 0,
    disbursedDelta = 0
  ) => {
    const activeMembers = nextAccounts.filter(
      (a) => a.role === 'member' && a.status === 'active'
    );
    const localCount = activeMembers.filter((a) => a.residenceType === 'local').length;
    const outCount = activeMembers.filter((a) => a.residenceType === 'out_of_town').length;

    const committeeSet = new Set<string>([ADMIN_OWNER_EMAIL]);
    nextAccounts.forEach((a) => {
      if (a.role !== 'member' && a.portalAccessEnabled && a.email) {
        committeeSet.add(a.email.toLowerCase());
      }
    });

    try {
      await setDoc(doc(db, 'org', 'standing'), {
        orgId: ORG_ID,
        committeeEmails: Array.from(committeeSet).slice(0, 15),
        totalActiveMembers: activeMembers.length,
        localMembers: localCount,
        outOfTownMembers: outCount,
        totalCollectedEtb: Math.max(0, (orgStanding.totalCollectedEtb || 0) + collectedDelta),
        totalDisbursedEtb: Math.max(0, (orgStanding.totalDisbursedEtb || 0) + disbursedDelta),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'org/standing');
    }
  };

  // Auth Actions
  const signInWithGoogleRedirect: EdirContextValue['signInWithGoogleRedirect'] = async () => {
    setAuthErrorMsg(null);
    setPopupBlocked(false);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Redirect Sign-In failed';
      setAuthErrorMsg(msg);
    }
  };

  const signInWithGoogle: EdirContextValue['signInWithGoogle'] = async () => {
    setAuthErrorMsg(null);
    setPopupBlocked(false);

    const inIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (!inIframe) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { ok: true };
      } catch (err) {
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/unauthorized-domain') {
          const host = window.location.hostname;
          return {
            ok: false,
            errorAm: `ይህ ዶሜይን (${host}) በFirebase Authorized Domains ውስጥ አልተፈቀደም።`,
            errorEn: `Domain "${host}" is not authorized in Firebase Authentication > Settings > Authorized domains.`,
          };
        }
        if (code === 'auth/operation-not-allowed') {
          return {
            ok: false,
            errorAm: 'የGoogle Sign-In አገልግሎት በFirebase Console Authentication ውስጥ ገና አልተከፈተም።',
            errorEn: 'Google Sign-In provider is not enabled in Firebase Authentication > Sign-in method.',
          };
        }
        const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
        return { ok: false, errorAm: msg, errorEn: msg };
      }
    }

    try {
      // Preview embeds can block full-page redirects, so use a popup there.
      const popupPromise = signInWithPopup(auth, googleProvider);
      const cred = await popupPromise;
      return await resolveSignedInUser(cred.user);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        setPopupBlocked(true);
        return {
          ok: false,
          errorAm:
            'ብራውዘርዎ የGoogle መግቢያ Pop-up መስኮቱን አግዶታል። ከታች "በአዲስ Tab ክፈትና ግባ" የሚለውን ይጫኑ።',
          errorEn:
            'The Google sign-in popup was blocked or closed. Click "Open in New Tab to Sign In" below to continue.',
        };
      }
      if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        return {
          ok: false,
          errorAm: `ይህ ዶሜይን (${host}) በFirebase Authorized Domains ውስጥ አልተፈቀደም።`,
          errorEn: `Domain "${host}" is not authorized in Firebase Authentication > Settings > Authorized domains.`,
        };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          ok: false,
          errorAm: 'የGoogle Sign-In አገልግሎት በFirebase Console Authentication ውስጥ ገና አልተከፈተም።',
          errorEn: 'Google Sign-In provider is not enabled in Firebase Authentication > Sign-in method.',
        };
      }
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
      return { ok: false, errorAm: msg, errorEn: msg };
    }
  };

  const signInWithRoleAndCredentials: EdirContextValue['signInWithRoleAndCredentials'] = async (
    selectedRole,
    identifier,
    password
  ) => {
    const cleanId = identifier.trim();
    if (!cleanId || !password.trim()) {
      return {
        ok: false,
        errorAm: 'እባክዎ መለያ/ኢሜይል እና የይለፍ ቃል ያስገቡ።',
        errorEn: 'Please enter both your identifier/email and password.',
      };
    }

    if (!cleanId.includes('@')) {
      return {
        ok: false,
        errorAm: 'ለFirebase መግቢያ እባክዎ የGoogle Sign-In ወይም የተመዘገበ ኢሜይል ይጠቀሙ።',
        errorEn: 'Please sign in with Google or enter your registered email address.',
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanId.toLowerCase(), password);
      const q = query(
        collection(db, 'users'),
        where('email', '==', cleanId.toLowerCase()),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userDoc = snap.docs[0].data() as UserAccount;
        if (userDoc.role !== selectedRole) {
          await fbSignOut(auth);
          return {
            ok: false,
            errorAm: 'የመረጡት ሚና ከመለያዎ ሚና ጋር አይዛመድም።',
            errorEn: 'Your account role does not match the selected role.',
          };
        }
      } else if (cred.user.email?.toLowerCase() !== ADMIN_OWNER_EMAIL) {
        await fbSignOut(auth);
        return {
          ok: false,
          errorAm: 'ይህ መለያ በዕድሩ ገና አልተመዘገበም።',
          errorEn: 'Account not registered by the Vice Chairperson yet.',
        };
      }
      return { ok: true };
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/operation-not-allowed') {
        return {
          ok: false,
          errorAm:
            'የኢሜይል/ይለፍ ቃል መግቢያ በFirebase Console ገና አልተከፈተም። እባክዎ ከላይ ያለውን "Sign in with Google" ይጠቀሙ።',
          errorEn:
            'Email/Password sign-in is not enabled in Firebase Console. Please use "Sign in with Google" above.',
        };
      }
      return {
        ok: false,
        errorAm: 'የገባው መለያ ወይም የይለፍ ቃል ትክክል አይደለም።',
        errorEn: 'Invalid email or password, or sign in with Google.',
      };
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
    setUnregisteredEmail(null);
    setAccessSuspendedMsg(null);
    setAuthErrorMsg(null);
    setPopupBlocked(false);
  };

  // Member Actions
  const submitPaymentReceipt: EdirContextValue['submitPaymentReceipt'] = async (input) => {
    if (!currentUser || !firebaseUser) return;
    const txnId = `TXN-${Date.now()}`;
    const payload: PaymentTransaction = {
      id: txnId,
      memberId: currentUser.id,
      ownerUid: firebaseUser.uid,
      memberEmail: currentUser.email.toLowerCase(),
      memberNameAm: currentUser.fullNameAm.slice(0, 155),
      memberNameEn: currentUser.fullNameEn.slice(0, 155),
      type: input.type,
      itemLabelsAm: input.itemLabelsAm.slice(0, 295),
      itemLabelsEn: input.itemLabelsEn.slice(0, 295),
      amount: input.amount,
      method: input.method,
      referenceNumber: input.referenceNumber.slice(0, 115),
      paymentDate: input.paymentDate,
      submittedDate: todayDate(),
      receiptFileName: input.receiptFileName.slice(0, 195),
      receiptPreviewType: input.receiptPreviewType,
      receiptDataUrl: (input.receiptDataUrl || '').slice(0, 340000),
      status: 'pending_verification',
      rejectionReasonAm: '',
      rejectionReasonEn: '',
      verifiedBy: '',
      committeeEmails: currentUser.committeeEmails?.length
        ? currentUser.committeeEmails
        : getCommitteeRoutingEmails(),
    };
    try {
      await setDoc(doc(db, 'transactions', txnId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast(
        lang === 'am'
          ? 'የክፍያ ደረሰኝዎ ለገንዘብ ያዥ ተልኳል።'
          : 'Payment receipt submitted to Cashier for review.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${txnId}`);
    }
  };

  const submitMemberRequest: EdirContextValue['submitMemberRequest'] = async (input) => {
    if (!currentUser || !firebaseUser) return;
    const reqId = `REQ-${Date.now()}`;
    const payload: MemberRequest = {
      id: reqId,
      memberId: currentUser.id,
      ownerUid: firebaseUser.uid,
      memberEmail: currentUser.email.toLowerCase(),
      memberNameAm: currentUser.fullNameAm.slice(0, 155),
      memberNameEn: currentUser.fullNameEn.slice(0, 155),
      requestType: input.requestType,
      titleAm: input.titleAm.slice(0, 195),
      titleEn: input.titleEn.slice(0, 195),
      description: input.description.slice(0, 1990),
      requestedDate: input.requestedDate || '',
      requestedAmountEtb: input.requestedAmountEtb || 0,
      attachmentName: (input.attachmentName || '').slice(0, 195),
      submittedDate: todayDate(),
      status: 'pending_vice_chair',
      committeeResponseAm: '',
      committeeResponseEn: '',
      committeeEmails: currentUser.committeeEmails?.length
        ? currentUser.committeeEmails
        : getCommitteeRoutingEmails(),
    };
    try {
      await setDoc(doc(db, 'requests', reqId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast(
        lang === 'am'
          ? 'ጥያቄዎ ለምክትል ሰብሳቢ ቀርቧል።'
          : 'Request submitted to Vice Chairperson.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `requests/${reqId}`);
    }
  };

  const addDependent: EdirContextValue['addDependent'] = async (dep) => {
    if (!currentUser || !firebaseUser) return;
    if (currentUser.beneficiaries.length >= 20) {
      showToast(lang === 'am' ? 'ከ20 በላይ ቤተሰብ መመዝገብ አይቻልም።' : 'Maximum 20 dependents allowed.');
      return;
    }
    const newDep: FamilyBeneficiary = { ...dep, id: `BEN-${Date.now().toString().slice(-5)}` };
    const nextList = [...currentUser.beneficiaries, newDep];
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        authUid: firebaseUser.uid,
        beneficiaries: nextList,
        updatedAt: serverTimestamp(),
      });
      showToast(lang === 'am' ? 'የቤተሰብ አባል ተጨምሯል።' : 'Dependent added to Family Registry.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const updateDependent: EdirContextValue['updateDependent'] = async (id, patch) => {
    if (!currentUser || !firebaseUser) return;
    const nextList = currentUser.beneficiaries.map((b) => (b.id === id ? { ...b, ...patch } : b));
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        authUid: firebaseUser.uid,
        beneficiaries: nextList,
        updatedAt: serverTimestamp(),
      });
      showToast(lang === 'am' ? 'የቤተሰብ መረጃ ተስተካክሏል።' : 'Dependent updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const removeDependent: EdirContextValue['removeDependent'] = async (id) => {
    if (!currentUser || !firebaseUser) return;
    const nextList = currentUser.beneficiaries.filter((b) => b.id !== id);
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        authUid: firebaseUser.uid,
        beneficiaries: nextList,
        updatedAt: serverTimestamp(),
      });
      showToast(lang === 'am' ? 'ከቤተሰብ ዝርዝር ተሰርዟል።' : 'Dependent removed.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const markMessageRead = (id: string) => {
    if (!currentUser) return;
    if (readMsgIds.includes(id)) return;
    const next = [...readMsgIds, id];
    setReadMsgIds(next);
    try {
      localStorage.setItem(`aw_read_msgs_${currentUser.id}`, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const markAllMessagesRead = () => {
    if (!currentUser) return;
    const allIds = rawMessages.map((m) => m.id);
    setReadMsgIds(allIds);
    try {
      localStorage.setItem(`aw_read_msgs_${currentUser.id}`, JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const recordQrAttendance = async (meetingId: string) => {
    if (!currentUser || !firebaseUser) return;
    const isExempt = currentUser.residenceType === 'out_of_town';
    const record: MeetingAttendanceRecord = {
      memberId: currentUser.id,
      ownerUid: firebaseUser.uid,
      status: isExempt ? 'geo_exempt' : 'present',
      checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: isExempt ? 'auto_geo' : 'qr_scan',
      committeeEmails: currentUser.committeeEmails?.length
        ? currentUser.committeeEmails
        : getCommitteeRoutingEmails(),
    };
    try {
      await setDoc(doc(db, 'meetings', meetingId, 'attendance', currentUser.id), {
        ...record,
        updatedAt: serverTimestamp(),
      });
      showToast(
        isExempt
          ? lang === 'am'
            ? 'ከአለታ ወንዶ ውጪ ነዋሪ ስለሆኑ በአካል ስብሰባ መገኘት አይጠበቅብዎትም።'
            : 'Outside Aleta Wondo — physical attendance not required.'
          : lang === 'am'
          ? 'የQR ስብሰባ አቴንዳንስዎ ተመዝግቧል።'
          : 'Meeting attendance recorded via QR scan!'
      );
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `meetings/${meetingId}/attendance/${currentUser.id}`
      );
    }
  };

  // Vice Chairperson & Committee Workflows
  const registerMember: EdirContextValue['registerMember'] = async (input) => {
    if (!currentUser) return;
    const targetRole: PortalRole =
      currentUser.role === 'vice_chair' && input.role ? input.role : 'member';
    const num = (accounts.length + 1).toString().padStart(3, '0');
    const newId = `AWY-${new Date().getFullYear()}-${num}-${Date.now().toString().slice(-3)}`;
    const cleanEmail = input.email.trim().toLowerCase();
    const pwdHash = await hashPassword(input.password || 'edir2026');
    const committeeEmails = getCommitteeRoutingEmails();
    if (targetRole !== 'member' && input.approveImmediately && !committeeEmails.includes(cleanEmail)) {
      committeeEmails.push(cleanEmail);
    }

    const newAcc: UserAccount = {
      id: newId,
      authUid: '',
      role: targetRole,
      fullNameAm: (input.fullNameAm || input.fullNameEn).trim().slice(0, 155),
      fullNameEn: input.fullNameEn.trim().slice(0, 155),
      roleTitleAm: ROLE_LABELS[targetRole].am,
      roleTitleEn: ROLE_LABELS[targetRole].en,
      phone: input.phone.trim().slice(0, 38),
      email: cleanEmail.slice(0, 175),
      passwordHash: pwdHash,
      city: input.city.trim().slice(0, 95),
      country: input.country.trim().slice(0, 95),
      addressDetail: input.addressDetail.trim().slice(0, 240),
      residenceType: input.residenceType,
      joinDate: todayDate(),
      bloodType: (input.bloodType || 'O+').slice(0, 8),
      emergencyContactName: input.emergencyContactName.trim().slice(0, 155),
      emergencyContactPhone: input.emergencyContactPhone.trim().slice(0, 38),
      photoUrl: input.residenceType === 'out_of_town' ? PHOTOS.samuel : PHOTOS.dawit,
      status: input.approveImmediately ? 'active' : 'pending_chair',
      portalAccessEnabled: input.approveImmediately,
      monthlyDueBalance: 0,
      penaltyBalance: 0,
      specialDueBalance: 0,
      totalPaidEtb: 0,
      lastPaidMonth: todayDate().slice(0, 7),
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
      committeeEmails: committeeEmails.slice(0, 15),
    };

    try {
      await setDoc(doc(db, 'users', newId), {
        ...newAcc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (targetRole !== 'member') {
        await setDoc(doc(db, 'committee_roster', cleanEmail), {
          email: cleanEmail,
          role: targetRole,
          active: input.approveImmediately,
          updatedAt: serverTimestamp(),
        });
      }

      await syncStandingCounters([newAcc, ...accounts]);
      await writeAuditLog(
        'USER_REGISTERED',
        `አዲስ ተጠቃሚ ${newAcc.fullNameAm} (${newId} · ${ROLE_LABELS[targetRole].am}) ተመዝግቧል።`,
        `Registered ${ROLE_LABELS[targetRole].en} ${newAcc.fullNameEn} (${newId}).`
      );
      showToast(
        lang === 'am' ? `ተጠቃሚ ${newId} ተመዝግቧል።` : `Account ${newId} registered successfully.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${newId}`);
    }
  };

  const toggleMemberPortalAccess = async (userId: string) => {
    const target = accounts.find((a) => a.id === userId);
    if (!target) return;
    const next = !target.portalAccessEnabled;
    try {
      await updateDoc(doc(db, 'users', userId), {
        portalAccessEnabled: next,
        status: next ? 'active' : 'suspended',
        updatedAt: serverTimestamp(),
      });
      if (target.role !== 'member') {
        await setDoc(doc(db, 'committee_roster', target.email.toLowerCase()), {
          email: target.email.toLowerCase(),
          role: target.role,
          active: next,
          updatedAt: serverTimestamp(),
        });
      }
      const nextList = accounts.map((a) =>
        a.id === userId
          ? { ...a, portalAccessEnabled: next, status: next ? ('active' as const) : ('suspended' as const) }
          : a
      );
      await syncStandingCounters(nextList);
      await writeAuditLog(
        'ACCESS_UPDATED',
        `የ${target.fullNameAm} ፖርታል አክሰስ ${next ? 'ተከፍቷል' : 'ታግዷል'}።`,
        `${next ? 'Enabled' : 'Suspended'} portal access for ${target.fullNameEn} (${userId}).`
      );
      showToast(lang === 'am' ? 'የፖርታል አክሰስ ተዘምኗል።' : 'Portal access updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const viceChairResetPassword: EdirContextValue['viceChairResetPassword'] = async (
    userId,
    newPassword
  ) => {
    const target = accounts.find((a) => a.id === userId);
    if (!target || !newPassword.trim()) return;
    const newHash = await hashPassword(newPassword.trim());
    try {
      await updateDoc(doc(db, 'users', userId), {
        passwordHash: newHash,
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'PASSWORD_RESET',
        `ምክትል ሰብሳቢ የ${target.fullNameAm} (${userId}) የይለፍ ቃል ቀይረዋል።`,
        `Vice Chair reset portal password for ${target.fullNameEn} (${userId}).`
      );
      showToast(
        lang === 'am'
          ? `የ${target.fullNameAm} የይለፍ ቃል ተቀይሯል።`
          : `Password updated for ${target.fullNameEn}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const viceChairUpdateUser: EdirContextValue['viceChairUpdateUser'] = async (userId, patch) => {
    const target = accounts.find((a) => a.id === userId);
    if (!target) return;
    const cleanEmail = patch.email.trim().toLowerCase();
    try {
      await updateDoc(doc(db, 'users', userId), {
        fullNameAm: patch.fullNameAm.trim().slice(0, 155),
        fullNameEn: patch.fullNameEn.trim().slice(0, 155),
        phone: patch.phone.trim().slice(0, 38),
        email: cleanEmail.slice(0, 175),
        city: patch.city.trim().slice(0, 95),
        country: patch.country.trim().slice(0, 95),
        addressDetail: patch.addressDetail.trim().slice(0, 240),
        residenceType: patch.residenceType,
        role: patch.role,
        roleTitleAm: ROLE_LABELS[patch.role].am,
        roleTitleEn: ROLE_LABELS[patch.role].en,
        status: patch.status,
        portalAccessEnabled: patch.portalAccessEnabled,
        updatedAt: serverTimestamp(),
      });

      if (patch.role !== 'member') {
        await setDoc(doc(db, 'committee_roster', cleanEmail), {
          email: cleanEmail,
          role: patch.role,
          active: patch.portalAccessEnabled && patch.status === 'active',
          updatedAt: serverTimestamp(),
        });
      } else if (target.role !== 'member') {
        await deleteDoc(doc(db, 'committee_roster', target.email.toLowerCase()));
      }

      const nextList = accounts.map((a) =>
        a.id === userId ? { ...a, ...patch, email: cleanEmail } : a
      );
      await syncStandingCounters(nextList);
      await writeAuditLog(
        'USER_UPDATED',
        `ምክትል ሰብሳቢ የ${patch.fullNameAm} (${userId}) መረጃና ሚና አስተካክለዋል።`,
        `Vice Chair updated user ${patch.fullNameEn} (${userId}) -> ${ROLE_LABELS[patch.role].en}.`
      );
      showToast(lang === 'am' ? 'የተጠቃሚ መረጃ ተዘምኗል።' : 'User profile & role updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const viceChairDeleteUser: EdirContextValue['viceChairDeleteUser'] = async (userId) => {
    const target = accounts.find((a) => a.id === userId);
    if (!target) return;
    if (currentUser && target.id === currentUser.id) {
      showToast(lang === 'am' ? 'የራስዎን መለያ ማጥፋት አይችሉም።' : 'Cannot delete your active account.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (target.role !== 'member') {
        await deleteDoc(doc(db, 'committee_roster', target.email.toLowerCase()));
      }
      const nextList = accounts.filter((a) => a.id !== userId);
      await syncStandingCounters(nextList);
      await writeAuditLog(
        'USER_DELETED',
        `ምክትል ሰብሳቢ ተጠቃሚ ${target.fullNameAm} (${userId}) ሰርዘዋል።`,
        `Vice Chair removed user account ${target.fullNameEn} (${userId}).`
      );
      showToast(lang === 'am' ? 'ተጠቃሚው ተሰርዟል።' : 'User account deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    }
  };

  const chairApproveMember = async (memberId: string, approve: boolean) => {
    const target = accounts.find((a) => a.id === memberId);
    if (!target) return;
    try {
      await updateDoc(doc(db, 'users', memberId), {
        status: approve ? 'active' : 'suspended',
        portalAccessEnabled: approve,
        updatedAt: serverTimestamp(),
      });
      const nextList = accounts.map((a) =>
        a.id === memberId
          ? {
              ...a,
              status: approve ? ('active' as const) : ('suspended' as const),
              portalAccessEnabled: approve,
            }
          : a
      );
      await syncStandingCounters(nextList);
      await writeAuditLog(
        'MEMBER_APPROVED',
        `ዋና ሰብሳቢ የ${target.fullNameAm} አባልነት ${approve ? 'አጽድቀዋል' : 'ሰርዘዋል'}።`,
        `Chairperson ${approve ? 'approved' : 'declined'} membership ${memberId}.`
      );
      showToast(approve ? 'Member approved & activated.' : 'Member application declined.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${memberId}`);
    }
  };

  const viceChairProcessRequest = async (requestId: string, approve: boolean, note: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    const nextStatus: MemberRequest['status'] = !approve
      ? 'rejected'
      : req.requestType === 'benefit_claim'
      ? 'pending_cashier'
      : req.requestType === 'asset_rental'
      ? 'pending_chair'
      : 'approved';

    const respAm =
      note ||
      (approve
        ? req.requestType === 'benefit_claim'
          ? 'በምክትል ሰብሳቢ ጸድቆ ለገንዘብ ያዥ ተልኳል።'
          : req.requestType === 'asset_rental'
          ? 'ንብረቱ መኖሩ ተረጋግጦ ለዋና ሰብሳቢ ተልኳል።'
          : 'በምክትል ሰብሳቢ ጸድቋል።'
        : 'ውድቅ ተደርጓል።');
    const respEn =
      note ||
      (approve
        ? req.requestType === 'benefit_claim'
          ? 'Authorized by Vice Chair and forwarded to Cashier.'
          : req.requestType === 'asset_rental'
          ? 'Availability verified by Vice Chair; routed to Chairperson.'
          : 'Approved by Vice Chair.'
        : 'Declined by Vice Chair.');

    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: nextStatus,
        committeeResponseAm: respAm.slice(0, 490),
        committeeResponseEn: respEn.slice(0, 490),
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'REQUEST_ROUTED',
        `ምክትል ሰብሳቢ ጥያቄ ${requestId}ን ወደ ${nextStatus} አሸጋግረዋል።`,
        `Vice Chair updated request ${requestId} to ${nextStatus}.`
      );
      showToast(approve ? 'Request authorized and routed.' : 'Request rejected.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
    }
  };

  const chairAuthorizeAssetRequest = async (requestId: string, approve: boolean, note: string) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: approve ? 'approved' : 'rejected',
        committeeResponseAm: (note || (approve ? 'በዋና ሰብሳቢ ጸድቋል።' : 'ተከልክሏል።')).slice(0, 490),
        committeeResponseEn: (
          note || (approve ? 'Final authorization granted by Chairperson.' : 'Declined by Chairperson.')
        ).slice(0, 490),
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'ASSET_AUTHORIZED',
        `ዋና ሰብሳቢ የንብረት ጥያቄ ${requestId}ን ${approve ? 'ፈቅደዋል' : 'ከልክለዋል'}።`,
        `Chairperson ${approve ? 'authorized' : 'declined'} asset request ${requestId}.`
      );
      showToast(approve ? 'Asset rental authorized.' : 'Asset request declined.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
    }
  };

  const cashierDisburseRequest = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'disbursed',
        committeeResponseAm: 'ክፍያው በገንዘብ ያዥ ተፈጽሟል።',
        committeeResponseEn: 'Payout disbursed by Cashier.',
        updatedAt: serverTimestamp(),
      });
      await syncStandingCounters(accounts, 0, req.requestedAmountEtb || 0);
      await writeAuditLog(
        'PAYOUT_DISBURSED',
        `ገንዘብ ያዥ ለጥያቄ ${requestId} ክፍያ ፈጽመዋል።`,
        `Cashier disbursed payout for ${requestId} (${req.requestedAmountEtb || 0} ETB).`
      );
      showToast(lang === 'am' ? 'ክፍያው ተፈጽሟል።' : 'Benefit payout disbursed.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
    }
  };

  const cashierVerifyReceipt = async (txnId: string, approve: boolean, reason?: string) => {
    if (!currentUser) return;
    const txn = transactions.find((t) => t.id === txnId);
    if (!txn) return;
    try {
      await updateDoc(doc(db, 'transactions', txnId), {
        status: approve ? 'verified' : 'rejected',
        verifiedBy: currentUser.fullNameEn.slice(0, 155),
        rejectionReasonAm: !approve ? (reason || 'ደረሰኙ አልተረጋገጠም').slice(0, 390) : '',
        rejectionReasonEn: !approve ? (reason || 'Receipt could not be verified').slice(0, 390) : '',
        updatedAt: serverTimestamp(),
      });

      if (approve) {
        const member = accounts.find((a) => a.id === txn.memberId);
        if (member) {
          await updateDoc(doc(db, 'users', member.id), {
            totalPaidEtb: member.totalPaidEtb + txn.amount,
            monthlyDueBalance:
              txn.type === 'monthly_dues'
                ? Math.max(0, member.monthlyDueBalance - txn.amount)
                : member.monthlyDueBalance,
            penaltyBalance:
              txn.type === 'penalty_settlement'
                ? Math.max(0, member.penaltyBalance - txn.amount)
                : member.penaltyBalance,
            specialDueBalance:
              txn.type === 'special_campaign'
                ? Math.max(0, member.specialDueBalance - txn.amount)
                : member.specialDueBalance,
            lastPaidMonth: todayDate().slice(0, 7),
            updatedAt: serverTimestamp(),
          });
        }
        await syncStandingCounters(accounts, txn.amount, 0);
      }

      await writeAuditLog(
        approve ? 'RECEIPT_VERIFIED' : 'RECEIPT_REJECTED',
        `ደረሰኝ ${txnId} (${txn.amount} ብር) ${approve ? 'ጸድቋል' : 'ውድቅ ተደርጓል'}።`,
        `${approve ? 'Approved' : 'Rejected'} receipt ${txnId} (${txn.amount} ETB).`
      );
      showToast(approve ? 'Receipt approved.' : 'Receipt rejected with reason.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${txnId}`);
    }
  };

  const runPenaltyEngine = async () => {
    const overdue = accounts.filter((a) => a.role === 'member' && a.monthlyDueBalance > 0);
    try {
      await Promise.all(
        overdue.map((m) =>
          updateDoc(doc(db, 'users', m.id), {
            penaltyBalance: m.penaltyBalance + 50,
            updatedAt: serverTimestamp(),
          })
        )
      );
      await writeAuditLog(
        'PENALTY_APPLIED',
        `ለ${overdue.length} ያልከፈሉ አባላት 50 ብር የዘገየ ቅጣት ተጨምሯል።`,
        `Applied 50 ETB automated late fee to ${overdue.length} overdue members.`
      );
      showToast(
        lang === 'am'
          ? `ለ${overdue.length} አባላት የ50 ብር ቅጣት ተጨምሯል።`
          : `Applied 50 ETB penalty to ${overdue.length} overdue members.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const createMeetingCall: EdirContextValue['createMeetingCall'] = async (input) => {
    const id = `MTG-${Date.now()}`;
    const payload = {
      id,
      orgId: ORG_ID,
      titleAm: input.titleAm.slice(0, 195),
      titleEn: input.titleEn.slice(0, 195),
      date: input.date,
      time: input.time,
      locationAm: input.locationEn.slice(0, 195),
      locationEn: input.locationEn.slice(0, 195),
      agendaAm: input.agendaEn.slice(0, 1990),
      agendaEn: input.agendaEn.slice(0, 1990),
      qrToken: `AWY-MTG-${Date.now().toString().slice(-6)}`,
      status: 'live' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'meetings', id), payload);
      await writeAuditLog(
        'MEETING_CALLED',
        `አዲስ ስብሰባ ተጠርቷል፡ ${input.titleAm}`,
        `Called meeting ${input.titleEn} on ${input.date}.`
      );
      showToast(lang === 'am' ? 'የስብሰባ ጥሪ እና QR ኮድ ተፈጥሯል።' : 'Meeting call & QR token created.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `meetings/${id}`);
    }
  };

  const publishNotice: EdirContextValue['publishNotice'] = async (input) => {
    if (!currentUser) return;
    const id = `MSG-${Date.now()}`;
    try {
      await setDoc(doc(db, 'messages', id), {
        id,
        orgId: ORG_ID,
        category: input.category,
        titleAm: input.titleAm.slice(0, 195),
        titleEn: input.titleEn.slice(0, 195),
        bodyAm: input.bodyAm.slice(0, 1990),
        bodyEn: input.bodyEn.slice(0, 1990),
        senderAm: `${currentUser.fullNameAm} (${currentUser.roleTitleAm})`.slice(0, 155),
        senderEn: `${currentUser.fullNameEn} (${currentUser.roleTitleEn})`.slice(0, 155),
        date: todayDate(),
        createdAt: serverTimestamp(),
      });
      await writeAuditLog(
        'NOTICE_PUBLISHED',
        `ማስታወቂያ ታትሟል፡ ${input.titleAm}`,
        `Published notice: ${input.titleEn}`
      );
      showToast(lang === 'am' ? 'መልዕክቱ ለአባላት ተላልፏል።' : 'Notice published to member inbox.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `messages/${id}`);
    }
  };

  const issueDirective: EdirContextValue['issueDirective'] = async (input) => {
    if (!currentUser) return;
    const id = `DIR-${Date.now()}`;
    try {
      await setDoc(doc(db, 'directives', id), {
        id,
        orgId: ORG_ID,
        titleAm: input.titleAm.slice(0, 195),
        titleEn: input.titleEn.slice(0, 195),
        description: input.description.slice(0, 990),
        assignedToRole: input.assignedToRole,
        dueDate: input.dueDate,
        status: 'assigned',
        issuedBy: currentUser.fullNameEn.slice(0, 155),
        committeeEmails: getCommitteeRoutingEmails(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'DIRECTIVE_ISSUED',
        `አዲስ ትእዛዝ ተሰጥቷል፡ ${input.titleAm}`,
        `Issued directive: ${input.titleEn}`
      );
      showToast(lang === 'am' ? 'ትእዛዙ ተመዝግቧል።' : 'Directive issued.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `directives/${id}`);
    }
  };

  const updateDirectiveStatus = async (id: string, status: Directive['status']) => {
    try {
      await updateDoc(doc(db, 'directives', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      showToast(lang === 'am' ? 'የትእዛዝ ሁኔታ ታድሷል።' : 'Directive status updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `directives/${id}`);
    }
  };

  const importEdirRecord: EdirContextValue['importEdirRecord'] = async (input) => {
    if (!currentUser) return;
    const id = `REC-${Date.now()}`;
    const safeUrl = (input.attachedDataUrl || '').slice(0, 440000);
    try {
      await setDoc(doc(db, 'records', id), {
        id,
        orgId: ORG_ID,
        recordType: input.recordType,
        code: input.code.slice(0, 95),
        titleAm: input.titleAm.slice(0, 195),
        titleEn: input.titleEn.slice(0, 195),
        date: input.date,
        author: `${currentUser.fullNameEn} (${currentUser.roleTitleEn})`.slice(0, 155),
        summaryAm: input.summaryAm.slice(0, 490),
        summaryEn: input.summaryEn.slice(0, 490),
        contentAm: input.contentAm.slice(0, 19900),
        contentEn: input.contentEn.slice(0, 19900),
        attachedFileName: (input.attachedFileName || '').slice(0, 195),
        attachedFileSize: (input.attachedFileSize || '').slice(0, 35),
        attachedDataUrl: safeUrl,
        importedRowCount: input.importedRowCount || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'RECORD_IMPORTED',
        `የዕድር መዝገብ ኢንፖርት ተደርጓል፡ ${input.titleAm}`,
        `Imported Edir record: ${input.titleEn}`
      );
      showToast(
        lang === 'am'
          ? 'መዝገቡ ወደ ዕድሩ መዛግብት ገብቷል።'
          : 'Edir record imported to live repository.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `records/${id}`);
    }
  };

  const addAssetItem: EdirContextValue['addAssetItem'] = async (input) => {
    const id = `AST-${Date.now()}`;
    try {
      await setDoc(doc(db, 'assets', id), {
        id,
        orgId: ORG_ID,
        nameAm: input.nameAm.slice(0, 195),
        nameEn: input.nameEn.slice(0, 195),
        category: input.category,
        totalQuantity: input.totalQuantity,
        availableQuantity: input.totalQuantity,
        dailyRentalFeeEtb: input.dailyRentalFeeEtb,
        condition: 'good',
        storageLocation: input.storageLocation.slice(0, 195),
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'ASSET_ADDED',
        `አዲስ ንብረት ተመዝግቧል፡ ${input.nameAm}`,
        `Added Edir asset: ${input.nameEn} (Qty ${input.totalQuantity}).`
      );
      showToast(lang === 'am' ? 'ንብረቱ ተመዝግቧል።' : 'Asset added to inventory.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assets/${id}`);
    }
  };

  const addSpecialCampaign: EdirContextValue['addSpecialCampaign'] = async (input) => {
    const id = `CMP-${Date.now()}`;
    try {
      await setDoc(doc(db, 'campaigns', id), {
        id,
        orgId: ORG_ID,
        titleAm: input.titleAm.slice(0, 195),
        titleEn: input.titleEn.slice(0, 195),
        category: input.category,
        contributionMode: input.contributionMode,
        targetAmountPerMember: input.targetAmountPerMember,
        totalGoal: input.totalGoal,
        collectedAmount: 0,
        deadline: input.deadline,
        status: 'active',
        descriptionAm: input.descriptionEn.slice(0, 990),
        descriptionEn: input.descriptionEn.slice(0, 990),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(
        'CAMPAIGN_CREATED',
        `አዲስ ልዩ መዋጮ ተጀምሯል፡ ${input.titleAm}`,
        `Created special campaign: ${input.titleEn}`
      );
      showToast(lang === 'am' ? 'ልዩ መዋጮው ተፈጥሯል።' : 'Special campaign created.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `campaigns/${id}`);
    }
  };

  return (
    <EdirContext.Provider
      value={{
        lang,
        setLang,
        authReady,
        isAuthenticated: Boolean(authReady && firebaseUser && currentUser),
        firebaseUser,
        unregisteredEmail,
        accessSuspendedMsg,
        authErrorMsg,
        popupBlocked,
        currentUser,
        activeTab,
        setActiveTab,
        toastMessage,
        showToast,
        orgStanding,
        accounts,
        transactions,
        campaigns,
        requests,
        meetings,
        records,
        messages,
        assets,
        directives,
        auditLogs,
        signInWithGoogle,
        signInWithGoogleRedirect,
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
        viceChairResetPassword,
        viceChairUpdateUser,
        viceChairDeleteUser,
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
        addAssetItem,
        addSpecialCampaign,
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
