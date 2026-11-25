export type Language = 'am' | 'en';

export type ResidenceType = 'local' | 'out_of_town';

export type PortalRole =
  | 'member'
  | 'vice_chair'
  | 'chairperson'
  | 'secretary'
  | 'cashier'
  | 'pr'
  | 'auditor';

export type AppViewTab =
  // Member 8 modules + Digital ID
  | 'dashboard'
  | 'payments'
  | 'requests'
  | 'records'
  | 'family'
  | 'standing'
  | 'messages'
  | 'qr_scanner'
  | 'digital_id'
  // Committee & Management dedicated modules
  | 'mgmt_overview'
  | 'mgmt_members'
  | 'mgmt_approvals'
  | 'mgmt_cashier'
  | 'mgmt_meetings'
  | 'mgmt_comms'
  | 'mgmt_import_records'
  | 'mgmt_audit';

export interface FamilyBeneficiary {
  id: string;
  fullNameAm: string;
  fullNameEn: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling';
  birthDateOrAge?: string;
  phone?: string;
  notes?: string;
  covered: boolean;
}

export interface UserAccount {
  id: string;
  role: PortalRole;
  fullNameAm: string;
  fullNameEn: string;
  roleTitleAm: string;
  roleTitleEn: string;
  phone: string;
  email: string;
  password: string;
  city: string;
  country: string;
  addressDetail: string;
  residenceType: ResidenceType;
  joinDate: string;
  bloodType?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  photoUrl: string;
  status: 'active' | 'pending_chair' | 'suspended';
  portalAccessEnabled: boolean;
  monthlyDueBalance: number;
  penaltyBalance: number;
  specialDueBalance: number;
  totalPaidEtb: number;
  lastPaidMonth: string;
  beneficiaries: FamilyBeneficiary[];
}

export interface PayableDueItem {
  id: string;
  kind: 'monthly_dues' | 'late_penalty' | 'special_campaign';
  campaignId?: string;
  titleAm: string;
  titleEn: string;
  subtitleAm: string;
  subtitleEn: string;
  amountEtb: number;
  dueDate: string;
  isOverdue: boolean;
}

export interface PaymentTransaction {
  id: string;
  memberId: string;
  memberNameAm: string;
  memberNameEn: string;
  type: 'monthly_dues' | 'penalty_settlement' | 'special_campaign' | 'combined';
  itemLabelsEn: string;
  itemLabelsAm: string;
  amount: number;
  method: 'Telebirr' | 'CBE Birr' | 'CBE Bank Transfer' | 'Awash Bank';
  referenceNumber: string;
  paymentDate: string;
  submittedDate: string;
  receiptFileName?: string;
  receiptPreviewType?: 'image' | 'pdf';
  receiptDataUrl?: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  rejectionReasonAm?: string;
  rejectionReasonEn?: string;
  verifiedBy?: string;
}

export interface SpecialCampaign {
  id: string;
  titleAm: string;
  titleEn: string;
  category: 'wedding' | 'bereavement' | 'asset_purchase' | 'medical' | 'other';
  contributionMode: 'fixed' | 'voluntary';
  targetAmountPerMember: number;
  totalGoal: number;
  collectedAmount: number;
  deadline: string;
  status: 'active' | 'closed';
  descriptionAm: string;
  descriptionEn: string;
}

export interface MemberRequest {
  id: string;
  memberId: string;
  memberNameAm: string;
  memberNameEn: string;
  requestType: 'asset_rental' | 'benefit_claim' | 'profile_update' | 'general_inquiry';
  titleAm: string;
  titleEn: string;
  description: string;
  requestedDate?: string;
  requestedAmountEtb?: number;
  attachmentName?: string;
  submittedDate: string;
  status:
    | 'pending_vice_chair'
    | 'pending_chair'
    | 'pending_cashier'
    | 'approved'
    | 'disbursed'
    | 'rejected';
  committeeResponseAm?: string;
  committeeResponseEn?: string;
}

export interface MeetingAttendanceRecord {
  memberId: string;
  status: 'present' | 'geo_exempt' | 'absent';
  checkedInAt?: string;
  method?: 'qr_scan' | 'auto_geo';
}

export interface Meeting {
  id: string;
  titleAm: string;
  titleEn: string;
  date: string;
  time: string;
  locationAm: string;
  locationEn: string;
  agendaAm: string;
  agendaEn: string;
  qrToken: string;
  status: 'live' | 'upcoming' | 'completed';
  attendance: MeetingAttendanceRecord[];
}

export interface EdirRecordDoc {
  id: string;
  recordType: 'bylaw' | 'minutes' | 'policy' | 'financial_sheet' | 'member_sheet';
  code: string;
  titleAm: string;
  titleEn: string;
  date: string;
  author: string;
  summaryAm: string;
  summaryEn: string;
  contentAm: string;
  contentEn: string;
  attachedFileName?: string;
  attachedFileSize?: string;
  attachedDataUrl?: string;
  importedRowCount?: number;
}

export interface AssetItem {
  id: string;
  nameAm: string;
  nameEn: string;
  category: 'tent' | 'chair' | 'utensil' | 'electronics';
  totalQuantity: number;
  availableQuantity: number;
  dailyRentalFeeEtb: number;
  condition: 'good' | 'fair';
  storageLocation: string;
}

export interface BenefitRule {
  id: string;
  eventType: string;
  titleAm: string;
  titleEn: string;
  payoutAmountEtb: number;
  nonCashSupportAm: string;
  nonCashSupportEn: string;
  eligibilityNoteAm: string;
  eligibilityNoteEn: string;
}

export interface CommitteeMessage {
  id: string;
  category: 'urgent' | 'meetings' | 'payments' | 'general';
  titleAm: string;
  titleEn: string;
  bodyAm: string;
  bodyEn: string;
  senderAm: string;
  senderEn: string;
  date: string;
  read: boolean;
}

export interface Directive {
  id: string;
  titleAm: string;
  titleEn: string;
  description: string;
  assignedToRole: PortalRole;
  dueDate: string;
  status: 'assigned' | 'in_progress' | 'completed';
  issuedBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: PortalRole;
  action: string;
  detailsAm: string;
  detailsEn: string;
}

export interface MonthlyTreasuryPoint {
  monthAm: string;
  monthEn: string;
  collectedEtb: number;
  disbursedEtb: number;
}
