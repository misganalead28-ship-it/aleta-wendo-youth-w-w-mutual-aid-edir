import React, { useMemo } from 'react';
import { Landmark, Package, TrendingUp, Users } from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { tr } from '../i18n/translations';

export const StandingReport: React.FC = () => {
  const { lang, orgStanding, transactions, requests, assets, campaigns } = useEdir();

  const totalCollected = orgStanding.totalCollectedEtb || 0;
  const totalDisbursed = orgStanding.totalDisbursedEtb || 0;
  const netTreasuryEtb = Math.max(0, totalCollected - totalDisbursed);

  // Channel totals computed live from verified transactions
  const channelTotals = useMemo(() => {
    const map = {
      cbe: 0,
      awash: 0,
      telebirr: 0,
    };
    transactions
      .filter((t) => t.status === 'verified')
      .forEach((t) => {
        if (t.method === 'Awash Bank') map.awash += t.amount;
        else if (t.method === 'Telebirr') map.telebirr += t.amount;
        else map.cbe += t.amount;
      });
    return map;
  }, [transactions]);

  // Dynamic 6-month chart series from live verified transactions & disbursed requests
  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months: {
      key: string;
      labelEn: string;
      labelAm: string;
      collectedEtb: number;
      disbursedEtb: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const labelEn = d.toLocaleString('en-US', { month: 'short' });
      const labelAm = labelEn;
      months.push({ key, labelEn, labelAm, collectedEtb: 0, disbursedEtb: 0 });
    }

    transactions
      .filter((t) => t.status === 'verified')
      .forEach((t) => {
        const mKey = (t.paymentDate || t.submittedDate || '').slice(0, 7);
        const bucket = months.find((m) => m.key === mKey);
        if (bucket) bucket.collectedEtb += t.amount;
      });

    requests
      .filter((r) => r.status === 'disbursed')
      .forEach((r) => {
        const mKey = (r.submittedDate || '').slice(0, 7);
        const bucket = months.find((m) => m.key === mKey);
        if (bucket) bucket.disbursedEtb += r.requestedAmountEtb || 0;
      });

    return months;
  }, [transactions, requests]);

  const maxChartVal = Math.max(
    1,
    ...monthlySeries.map((p) => Math.max(p.collectedEtb, p.disbursedEtb))
  );
  const hasChartActivity = monthlySeries.some((p) => p.collectedEtb > 0 || p.disbursedEtb > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">
          {lang === 'am'
            ? 'የዕድሩ ጠቅላላ አቋም እና የፋይናንስ ግልጽነት ሪፖርት'
            : 'Edir Overall Financial & Operational Standing Report'}
        </h2>
        <p className="text-sm text-[#475569] mt-0.5">
          {lang === 'am'
            ? 'ለሁሉም አባላት ግልጽ የሆነ የአባላት ብዛት፣ የባንክ ሂሳብ፣ የመዋጮ ስብሰባ እና የንብረት ዝርዝር'
            : 'Live overview of active membership, treasury reserves, verified collections, and association assets'}
        </p>
      </div>

      {/* 4 Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'ጠቅላላ የዕድሩ ገንዘብ' : 'Net Treasury Standing'}</span>
            <Landmark className="w-4 h-4 text-[#0E4D34]" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#0E4D34] mt-2">
            {netTreasuryEtb.toLocaleString()} {tr('etb', lang)}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {lang === 'am'
              ? `ገቢ ${totalCollected.toLocaleString()} · ወጪ ${totalDisbursed.toLocaleString()}`
              : `In: ${totalCollected.toLocaleString()} · Out: ${totalDisbursed.toLocaleString()}`}
          </p>
        </div>

        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'ንቁ አባላት ብዛት' : 'Active Members'}</span>
            <Users className="w-4 h-4 text-[#0E4D34]" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
            {orgStanding.totalActiveMembers}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {orgStanding.localMembers} {lang === 'am' ? 'አለታ ወንዶ' : 'Local'} ·{' '}
            {orgStanding.outOfTownMembers}{' '}
            {lang === 'am' ? 'ከከተማ ውጪ / ዳያስፖራ' : 'Out-of-Town'}
          </p>
        </div>

        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'ጠቅላላ የተረጋገጠ ገቢ' : 'Verified Collections'}</span>
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#16A34A] mt-2">
            {totalCollected.toLocaleString()} {tr('etb', lang)}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {lang === 'am' ? 'በገንዘብ ያዥ የጸደቁ ደረሰኞች' : 'Cashier-verified receipts'}
          </p>
        </div>

        <div className="bg-white border border-[#DCE2DD] rounded-xl p-5">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>{lang === 'am' ? 'ንቁ የዕድር ንብረቶች' : 'Physical Assets'}</span>
            <Package className="w-4 h-4 text-[#B8821E]" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-[#0F172A] mt-2">
            {assets.reduce((s, a) => s + a.totalQuantity, 0)}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {lang === 'am' ? 'ድንኳኖች፣ ወንበሮች እና የድግስ ዕቃዎች' : 'Tents, chairs, utensils & audio'}
          </p>
        </div>
      </section>

      {/* Chart + Bank Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6-Month Collections vs Payouts Chart */}
        <section className="lg:col-span-7 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {lang === 'am'
                  ? 'የ6 ወራት ወርሃዊ ገቢ እና የድጋፍ ወጪ'
                  : '6-Month Contribution Collections vs. Benefit Payouts'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {lang === 'am' ? 'በኢትዮጵያ ብር (ETB)' : 'Measured in Ethiopian Birr (ETB)'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#0F172A]">
                <span className="w-3 h-3 rounded-sm bg-[#0E4D34]" />
                {lang === 'am' ? 'የተሰበሰበ ገቢ' : 'Collected'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A]">
                <span className="w-3 h-3 rounded-sm bg-[#C89228]" />
                {lang === 'am' ? 'የተፈጸመ ድጋፍ' : 'Payouts'}
              </span>
            </div>
          </div>

          {!hasChartActivity ? (
            <div className="h-56 flex items-center justify-center border border-dashed border-[#DCE2DD] rounded-xl text-xs text-[#64748B] px-4 text-center">
              {lang === 'am'
                ? 'እስካሁን የተረጋገጠ የክፍያ እንቅስቃሴ የለም። የአባላት ደረሰኞች ሲጸድቁ ግራፉ በቀጥታ ይሞላል።'
                : 'No verified receipts or disbursements recorded yet. The 6-month chart updates live as transactions are verified.'}
            </div>
          ) : (
            <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-[#E2E6E3]">
              {monthlySeries.map((pt) => {
                const colPct = pt.collectedEtb > 0 ? Math.max(6, Math.round((pt.collectedEtb / maxChartVal) * 100)) : 2;
                const disPct = pt.disbursedEtb > 0 ? Math.max(6, Math.round((pt.disbursedEtb / maxChartVal) * 100)) : 2;
                return (
                  <div key={pt.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      <div
                        className="w-4 sm:w-6 bg-[#0E4D34] rounded-t transition-all"
                        style={{ height: `${colPct}%` }}
                        title={`Collected: ${pt.collectedEtb.toLocaleString()} ETB`}
                      />
                      <div
                        className="w-4 sm:w-6 bg-[#C89228] rounded-t transition-all"
                        style={{ height: `${disPct}%` }}
                        title={`Disbursed: ${pt.disbursedEtb.toLocaleString()} ETB`}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#475569] pb-2">
                      {lang === 'am' ? pt.labelAm : pt.labelEn}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Treasury Accounts & Active Campaigns */}
        <section className="lg:col-span-5 bg-white border border-[#DCE2DD] rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] mb-3">
              {lang === 'am' ? 'የባንክ እና የቴሌብር ሂሳብ ክፍፍል' : 'Verified Receipts by Channel'}
            </h3>
            <div className="divide-y divide-[#EEF1EE] text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#334155]">CBE Main / CBE Birr</span>
                <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                  {channelTotals.cbe.toLocaleString()} {tr('etb', lang)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#334155]">Awash Bank Branch</span>
                <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                  {channelTotals.awash.toLocaleString()} {tr('etb', lang)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#334155]">Telebirr Merchant</span>
                <span className="font-mono font-semibold tabular-nums text-[#0F172A]">
                  {channelTotals.telebirr.toLocaleString()} {tr('etb', lang)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EEF1EE] space-y-3">
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              {lang === 'am' ? 'የልዩ መዋጮዎች አፈጻጸም' : 'Special Campaign Progress'}
            </h4>
            {campaigns.length === 0 ? (
              <p className="text-xs text-[#64748B]">
                {lang === 'am' ? 'ንቁ ልዩ መዋጮ ገና አልተፈጠረም።' : 'No active special campaigns created yet.'}
              </p>
            ) : (
              campaigns.map((c) => {
                const pct =
                  c.totalGoal > 0
                    ? Math.min(100, Math.round((c.collectedAmount / c.totalGoal) * 100))
                    : 0;
                return (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#0F172A] truncate pr-2">
                        {lang === 'am' ? c.titleAm : c.titleEn}
                      </span>
                      <span className="font-mono text-[#0E4D34] shrink-0">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#EAEFEA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0E4D34] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Asset Inventory Summary Table */}
      <section className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3]">
          <h3 className="text-base font-bold text-[#0F172A]">
            {lang === 'am' ? 'የዕድሩ ንብረቶች ዝርዝር ሁኔታ' : 'Association Asset Inventory Summary'}
          </h3>
        </div>
        {assets.length === 0 ? (
          <p className="p-6 text-xs text-[#64748B]">
            {lang === 'am'
              ? 'እስካሁን የተመዘገበ የዕድር ንብረት የለም።'
              : 'No Edir assets registered in inventory yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAF9] text-xs text-[#475569] border-b border-[#E2E6E3]">
                <tr>
                  <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'ንብረት' : 'Asset Item'}</th>
                  <th className="px-5 py-3 font-semibold">{lang === 'am' ? 'መጋዘን' : 'Location'}</th>
                  <th className="px-5 py-3 font-semibold text-right">{lang === 'am' ? 'ጠቅላላ' : 'Total'}</th>
                  <th className="px-5 py-3 font-semibold text-right">{lang === 'am' ? 'በመጋዘን ያለ' : 'Available'}</th>
                  <th className="px-5 py-3 font-semibold text-right">{lang === 'am' ? 'የቀን ኪራይ' : 'Member Rate'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1EE]">
                {assets.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FAFCFB]">
                    <td className="px-5 py-3 font-medium text-[#0F172A]">
                      {lang === 'am' ? a.nameAm : a.nameEn}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#475569]">{a.storageLocation}</td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums">{a.totalQuantity}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-[#0E4D34] tabular-nums">
                      {a.availableQuantity}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-[#475569]">
                      {a.dailyRentalFeeEtb} {tr('etb', lang)}/day
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
