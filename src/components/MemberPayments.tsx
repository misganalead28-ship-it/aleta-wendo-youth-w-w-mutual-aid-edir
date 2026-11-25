import React, { useMemo, useState } from 'react';
import { Copy, Landmark, Upload } from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { BANK_ACCOUNTS } from '../data/seedData';
import { tr } from '../i18n/translations';
import { PayableDueItem, PaymentTransaction } from '../types';

function compressImageDataUrl(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        resolve(undefined);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let compressed = canvas.toDataURL('image/jpeg', 0.65);
        if (compressed.length > 340000) {
          compressed = canvas.toDataURL('image/jpeg', 0.45);
        }
        resolve(compressed.length <= 340000 ? compressed : undefined);
      };
      img.onerror = () => resolve(undefined);
      img.src = reader.result;
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

export const MemberPayments: React.FC = () => {
  const {
    lang,
    currentUser,
    campaigns,
    submitPaymentReceipt,
    showToast,
  } = useEdir();

  // Build payable items list for the signed-in member
  const payableItems: PayableDueItem[] = useMemo(() => {
    if (!currentUser) return [];
    const items: PayableDueItem[] = [];
    if (currentUser.monthlyDueBalance > 0) {
      items.push({
        id: 'DUE-MONTHLY',
        kind: 'monthly_dues',
        titleAm: 'ወርሃዊ መደበኛ መዋጮ',
        titleEn: 'Monthly Membership Dues',
        subtitleAm: 'ወርሃዊ የአባልነት መዋጮ (እስከ ወሩ 10ኛ ቀን)',
        subtitleEn: 'Standard monthly contribution (due 10th of month)',
        amountEtb: currentUser.monthlyDueBalance,
        dueDate: new Date().toISOString().slice(0, 8) + '10',
        isOverdue: true,
      });
    }
    if (currentUser.penaltyBalance > 0) {
      items.push({
        id: 'DUE-PENALTY',
        kind: 'late_penalty',
        titleAm: 'አውቶማቲክ የዘገየ ክፍያ ቅጣት',
        titleEn: 'Automated Late Payment Penalty',
        subtitleAm: 'ከወሩ የመጨረሻ ቀን በኋላ የተጨመረ ቅጣት',
        subtitleEn: 'Applied automatically after monthly cut-off date',
        amountEtb: currentUser.penaltyBalance,
        dueDate: new Date().toISOString().slice(0, 8) + '11',
        isOverdue: true,
      });
    }
    campaigns
      .filter((c) => c.status === 'active')
      .forEach((cmp) => {
        items.push({
          id: `DUE-${cmp.id}`,
          kind: 'special_campaign',
          campaignId: cmp.id,
          titleAm: cmp.titleAm,
          titleEn: cmp.titleEn,
          subtitleAm:
            cmp.contributionMode === 'fixed'
              ? 'የግዴታ ልዩ መዋጮ (ለወንበር/ድንኳን)'
              : 'የበጎ ፈቃድ ልዩ መዋጮ (ለሰርግ)',
          subtitleEn:
            cmp.contributionMode === 'fixed'
              ? 'Fixed Special Contribution'
              : 'Voluntary Special Contribution',
          amountEtb: cmp.targetAmountPerMember,
          dueDate: cmp.deadline,
          isOverdue: false,
        });
      });
    return items;
  }, [currentUser, campaigns]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    payableItems.length > 0 ? [payableItems[0].id] : []
  );
  const [method, setMethod] = useState<PaymentTransaction['method']>('Telebirr');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptPreviewType, setReceiptPreviewType] = useState<'image' | 'pdf'>('image');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | undefined>(undefined);
  const [customAmount, setCustomAmount] = useState<string>('');

  if (!currentUser) return null;

  const selectedItems = payableItems.filter((item) => selectedIds.includes(item.id));
  const computedTotal = selectedItems.reduce((sum, i) => sum + i.amountEtb, 0);
  const finalAmount = customAmount ? Number(customAmount) : computedTotal || 300;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setCustomAmount('');
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFileName(file.name);
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    setReceiptPreviewType(isPdf ? 'pdf' : 'image');
    if (!isPdf) {
      const compressed = await compressImageDataUrl(file);
      setReceiptDataUrl(compressed);
    } else {
      setReceiptDataUrl(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      showToast(
        lang === 'am'
          ? 'እባክዎ የባንክ ወይም የቴሌብር ማጣቀሻ ቁጥር ያስገቡ።'
          : 'Please enter the transaction reference number.'
      );
      return;
    }
    const labelsEn =
      selectedItems.length > 0
        ? selectedItems.map((i) => i.titleEn).join(' + ')
        : 'Advance Monthly Contribution';
    const labelsAm =
      selectedItems.length > 0
        ? selectedItems.map((i) => i.titleAm).join(' + ')
        : 'ቅድመ ወርሃዊ መዋጮ';

    await submitPaymentReceipt({
      type:
        selectedItems.length > 1
          ? 'combined'
          : selectedItems[0]?.kind === 'late_penalty'
          ? 'penalty_settlement'
          : selectedItems[0]?.kind === 'special_campaign'
          ? 'special_campaign'
          : 'monthly_dues',
      itemLabelsAm: labelsAm,
      itemLabelsEn: labelsEn,
      amount: finalAmount,
      method,
      referenceNumber: referenceNumber.trim(),
      paymentDate,
      receiptFileName: receiptFileName || `${method.toLowerCase().replace(/\s+/g, '_')}_slip.jpg`,
      receiptPreviewType,
      receiptDataUrl,
    });
    setReferenceNumber('');
    setReceiptFileName('');
    setReceiptDataUrl(undefined);
    setCustomAmount('');
  };

  const copyAccount = (acc: string) => {
    navigator.clipboard?.writeText(acc);
    showToast(lang === 'am' ? `ቁጥር ${acc} ተቀድቷል።` : `Copied ${acc} to clipboard.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am'
            ? 'ወርሃዊ እና ሌሎች ክፍያዎች መፈጸሚያ እና ደረሰኝ መላኪያ'
            : 'Payments, Special Contributions & Receipt Upload'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {lang === 'am'
            ? 'የሚከፍሉትን ይምረጡ፣ በባንክ ወይም በቴሌብር ይክፈሉ እና ደረሰኝ አያይዘው ይላኩ።'
            : 'Select dues or special contributions to pay, transfer via Bank/Telebirr, and attach your receipt.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step 1 & 2: Select Payable Items + Bank Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Selectable Items */}
          <section className="bg-white border border-[#DCE2DD] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF1EE] pb-3">
              <h3 className="text-sm font-bold text-[#0F172A]">
                {lang === 'am' ? '1. የሚከፈሉ ክፍያዎችን ይምረጡ' : '1. Select Items to Pay'}
              </h3>
              <span className="font-mono text-sm font-bold text-[#0E4D34] tabular-nums">
                {finalAmount.toLocaleString()} {tr('etb', lang)}
              </span>
            </div>

            {payableItems.length === 0 ? (
              <p className="text-xs text-[#64748B] py-2">
                {lang === 'am'
                  ? 'ምንም ያልተከፈለ ቀሪ ሂሳብ የለም። የቅድመ ወርሃዊ መዋጮ መክፈል ከፈለጉ ከጎን ያለውን ቅጽ ይሙሉ።'
                  : 'No overdue dues pending. You may submit an advance monthly contribution using the receipt form.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {payableItems.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#F3F8F5] border-[#0E4D34]'
                          : 'bg-[#FAFBFB] border-[#E2E6E3] hover:border-[#CBD5D0]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 w-4 h-4 accent-[#0E4D34] rounded"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {lang === 'am' ? item.titleAm : item.titleEn}
                          </p>
                          <p className="text-xs text-[#475569]">
                            {lang === 'am' ? item.subtitleAm : item.subtitleEn} ·{' '}
                            <span className={item.isOverdue ? 'text-[#DC2626] font-medium' : ''}>
                              {lang === 'am' ? 'ቀነ-ገደብ' : 'Due'} {item.dueDate}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#0F172A] tabular-nums shrink-0">
                        {item.amountEtb.toLocaleString()} {tr('etb', lang)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Official Edir Payment Channels */}
          <section className="bg-white border border-[#DCE2DD] rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
              <Landmark className="w-4 h-4 text-[#0E4D34]" />
              <h3>
                {lang === 'am'
                  ? '2. የዕድሩ የባንክ እና የቴሌብር ሂሳቦች'
                  : '2. Official Bank & Telebirr Accounts'}
              </h3>
            </div>
            <div className="divide-y divide-[#EEF1EE]">
              {BANK_ACCOUNTS.map((acc) => (
                <div
                  key={acc.accountNumber}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">
                      {lang === 'am' ? acc.bankAm : acc.bankEn}
                    </p>
                    <p className="text-xs text-[#64748B]">{acc.accountHolder}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyAccount(acc.accountNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-[#0E4D34] bg-[#EEF3F0] rounded-lg hover:bg-[#E1ECE6]"
                  >
                    <span>{acc.accountNumber}</span>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Step 3: Upload Receipt Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 bg-white border border-[#DCE2DD] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <h3 className="text-sm font-bold text-[#0F172A] border-b border-[#EEF1EE] pb-3">
            {lang === 'am'
              ? '3. የክፍያ ደረሰኝ አያይዘው ይላኩ'
              : '3. Upload Payment Receipt (Image or PDF)'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'የክፍያ መንገድ' : 'Payment Channel'}
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentTransaction['method'])}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="Telebirr">Telebirr (884920)</option>
                <option value="CBE Bank Transfer">CBE Bank Transfer</option>
                <option value="CBE Birr">CBE Birr</option>
                <option value="Awash Bank">Awash Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'የተከፈለው መጠን (ብር)' : 'Amount Paid (ETB)'}
              </label>
              <input
                type="number"
                min={10}
                required
                value={customAmount || computedTotal || 300}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-mono font-semibold border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'የማጣቀሻ ቁጥር (FT / Ref No.)' : 'Transaction Reference Number'}
              </label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. TB99401283 / FT26328CBE"
                className="w-full px-3 py-2.5 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ክፍያ የተፈጸመበት ቀን' : 'Payment Date'}
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">
              {lang === 'am'
                ? 'የደረሰኝ ፋይል (ፎቶ / Screenshot / PDF)'
                : 'Attach Receipt Screenshot or PDF'}
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#CBD5D0] rounded-xl bg-[#F8FAF9] hover:border-[#0E4D34] cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-[#0E4D34] mb-1.5" />
              <span className="text-xs font-semibold text-[#0F172A]">
                {receiptFileName ||
                  (lang === 'am' ? 'ፋይል ለመምረጥ እዚህ ይጫኑ' : 'Tap to choose JPG, PNG, or PDF receipt')}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>

            {receiptDataUrl && (
              <div className="mt-3 p-2 bg-[#F8FAF9] border border-[#E2E6E3] rounded-lg flex items-center gap-3">
                <img
                  src={receiptDataUrl}
                  alt="Selected receipt preview"
                  className="w-14 h-14 object-cover rounded border border-[#D4DBD7]"
                />
                <div className="text-xs text-[#334155]">
                  <p className="font-semibold">{receiptFileName}</p>
                  <p className="text-[#16A34A]">{lang === 'am' ? 'ለመላክ ዝግጁ ነው' : 'Ready to submit'}</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] transition-colors min-h-[44px]"
          >
            {lang === 'am'
              ? `ደረሰኝ ላክ (${finalAmount.toLocaleString()} ብር)`
              : `Submit Payment Receipt (${finalAmount.toLocaleString()} ETB)`}
          </button>
        </form>
      </div>
    </div>
  );
};
