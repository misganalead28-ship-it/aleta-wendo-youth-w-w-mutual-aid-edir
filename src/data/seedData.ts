import { BenefitRule } from '../types';

export const ORG_ID = 'aleta-wondo-edir';
export const ADMIN_OWNER_EMAIL = 'misganalead28@gmail.com';

export const PHOTOS = {
  dawit: '/src/assets/images/avatar_member_dawit_1795599007211.jpg',
  samuel: '/src/assets/images/avatar_diaspora_samuel_1795599008256.jpg',
  tigist: '/src/assets/images/avatar_secretary_tigist_1795599008256.jpg',
  bekele: '/src/assets/images/avatar_chairperson_bekele_1795599009307.jpg',
};

export const BANK_ACCOUNTS = [
  {
    bankAm: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
    bankEn: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: '1000482910447',
    accountHolder: 'Aleta Wondo Youth Mutual Aid Edir',
  },
  {
    bankAm: 'ቴሌብር የነጋዴ መለያ (Telebirr)',
    bankEn: 'Telebirr Merchant Pay',
    accountNumber: '884920',
    accountHolder: 'Aleta Wondo Youth Edir',
  },
  {
    bankAm: 'አዋሽ ባንክ (Awash Bank)',
    bankEn: 'Awash Bank — Aleta Wondo Branch',
    accountNumber: '013204918200',
    accountHolder: 'Aleta Wondo Youth Mutual Aid Edir',
  },
];

export const BENEFIT_RULES: BenefitRule[] = [
  {
    id: 'BEN-RULE-01',
    eventType: 'bereavement_member',
    titleAm: 'የአባል ህልፈተ ህይወት ድጋፍ',
    titleEn: 'Member Passing (Bereavement Support)',
    payoutAmountEtb: 25000,
    nonCashSupportAm: '2 ድንኳን + 150 ወንበሮች + የድግስ ዕቃዎች በነፃ (ለ5 ቀናት)',
    nonCashSupportEn: '2 Tents + 150 Chairs + Catering Utensils Free for 5 Days',
    eligibilityNoteAm: 'ለተመዘገቡ ቤተሰቦች እና ተተኪዎች ወዲያውኑ ይከፈላል።',
    eligibilityNoteEn: 'Paid immediately to registered spouse or family beneficiaries.',
  },
  {
    id: 'BEN-RULE-02',
    eventType: 'bereavement_family',
    titleAm: 'የቅርብ ቤተሰብ (ወላጅ / የትዳር ጓደኛ / ልጅ) ሀዘን',
    titleEn: 'Immediate Family Bereavement (Parent / Spouse / Child)',
    payoutAmountEtb: 15000,
    nonCashSupportAm: '1 ድንኳን + 100 ወንበሮች በነፃ (ለ3 ቀናት)',
    nonCashSupportEn: '1 Tent + 100 Chairs Free for 3 Days',
    eligibilityNoteAm: 'በቤተሰብ ዝርዝር መዝገብ ውስጥ ለተመዘገቡ ቤተሰቦች ይፈጸማል።',
    eligibilityNoteEn: 'Covers dependents registered in your Family Registry.',
  },
  {
    id: 'BEN-RULE-03',
    eventType: 'wedding',
    titleAm: 'የአባል ሰርግ የደስታ መጋራት ክፍያ',
    titleEn: 'Member Wedding Mutual Aid Grant',
    payoutAmountEtb: 5000,
    nonCashSupportAm: '1 ድንኳን + 80 ወንበሮች በ50% የአባላት ቅናሽ',
    nonCashSupportEn: '1 Tent + 80 Chairs at 50% Member Discount',
    eligibilityNoteAm: 'ቢያንስ 6 ወር ያለ ውዝፍ የከፈለ አባል ይገባዋል።',
    eligibilityNoteEn: 'Available after 6 months of continuous active membership.',
  },
  {
    id: 'BEN-RULE-04',
    eventType: 'medical',
    titleAm: 'ድንገተኛ የህክምና እና የአደጋ ድጋፍ',
    titleEn: 'Emergency Hospitalization & Medical Aid',
    payoutAmountEtb: 4000,
    nonCashSupportAm: 'የኮሚቴ ጉብኝት እና አስፈላጊ ሲሆን ልዩ መዋጮ ጥሪ',
    nonCashSupportEn: 'Committee hospital visit + solidarity campaign support if needed',
    eligibilityNoteAm: 'ከ3 ቀናት በላይ ሆስፒታል ለተኙ አባላት በማስረጃ ይፈጸማል።',
    eligibilityNoteEn: 'Requires hospital admission proof exceeding 3 days.',
  },
];
