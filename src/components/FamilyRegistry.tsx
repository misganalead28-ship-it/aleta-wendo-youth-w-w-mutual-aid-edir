import React, { useState } from 'react';
import { CheckCircle2, HeartHandshake, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEdir } from '../context/EdirContext';
import { tr } from '../i18n/translations';
import { FamilyBeneficiary } from '../types';

export const FamilyRegistry: React.FC = () => {
  const { lang, currentUser, addDependent, updateDependent, removeDependent } = useEdir();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [fullNameAm, setFullNameAm] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [relationship, setRelationship] = useState<FamilyBeneficiary['relationship']>('spouse');
  const [birthDateOrAge, setBirthDateOrAge] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setFullNameAm('');
    setFullNameEn('');
    setRelationship('spouse');
    setBirthDateOrAge('');
    setPhone('');
    setNotes('');
    setShowForm(false);
  };

  const startEdit = (b: FamilyBeneficiary) => {
    setEditingId(b.id);
    setFullNameAm(b.fullNameAm);
    setFullNameEn(b.fullNameEn);
    setRelationship(b.relationship);
    setBirthDateOrAge(b.birthDateOrAge || '');
    setPhone(b.phone || '');
    setNotes(b.notes || '');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim()) return;
    if (editingId) {
      updateDependent(editingId, {
        fullNameAm: fullNameAm.trim() || fullNameEn.trim(),
        fullNameEn: fullNameEn.trim(),
        relationship,
        birthDateOrAge: birthDateOrAge.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });
    } else {
      addDependent({
        fullNameAm: fullNameAm.trim() || fullNameEn.trim(),
        fullNameEn: fullNameEn.trim(),
        relationship,
        birthDateOrAge: birthDateOrAge.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        covered: true,
      });
    }
    resetForm();
  };

  const relLabel = (rel: FamilyBeneficiary['relationship']) => {
    if (lang === 'am') {
      return rel === 'spouse'
        ? 'የትዳር ጓደኛ'
        : rel === 'child'
        ? 'ልጅ'
        : rel === 'parent'
        ? 'ወላጅ'
        : 'ወንድም / እህት';
    }
    return rel.charAt(0).toUpperCase() + rel.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {lang === 'am'
              ? 'የቤተሰብ እና ተተኪዎች ዝርዝር መመዝገቢያ'
              : 'Family & Dependents Coverage Registry'}
          </h2>
          <p className="text-sm text-[#475569] mt-0.5">
            {lang === 'am'
              ? 'በዕድሩ ደንብ መሰረት የሀዘን እና የድጋፍ ሽፋን የሚያገኙ የቅርብ ቤተሰቦችዎን ያስገቡ እና ያስተካክሉ።'
              : 'Add, review, and update immediate family members covered under Edir mutual aid rules.'}
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0E4D34] rounded-xl hover:bg-[#0A3B27] whitespace-nowrap min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          {showForm
            ? tr('cancel', lang)
            : lang === 'am'
            ? 'የቤተሰብ አባል ጨምር'
            : 'Add Family Member'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#CBD5D0] rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-base font-bold text-[#0F172A] border-b border-[#EEF1EE] pb-3">
            {editingId
              ? lang === 'am'
                ? 'የቤተሰብ አባል መረጃ ማስተካከያ'
                : 'Edit Family Member Details'
              : lang === 'am'
              ? 'አዲስ የቤተሰብ አባል መመዝገቢያ'
              : 'Register Covered Family Member / Dependent'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ሙሉ ስም (አማርኛ)' : 'Full Name (Amharic)'}
              </label>
              <input
                type="text"
                value={fullNameAm}
                onChange={(e) => setFullNameAm(e.target.value)}
                placeholder="ብርቱካን ካሳ"
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ሙሉ ስም (English)' : 'Full Name (English)'}
              </label>
              <input
                type="text"
                required
                value={fullNameEn}
                onChange={(e) => setFullNameEn(e.target.value)}
                placeholder="Birtukan Kassa"
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ዝምድና (Relationship)' : 'Relationship'}
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as FamilyBeneficiary['relationship'])}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg bg-white"
              >
                <option value="spouse">{lang === 'am' ? 'የትዳር ጓደኛ (Spouse)' : 'Spouse'}</option>
                <option value="child">{lang === 'am' ? 'ልጅ (Child)' : 'Child'}</option>
                <option value="parent">{lang === 'am' ? 'ወላጅ (Parent)' : 'Parent'}</option>
                <option value="sibling">{lang === 'am' ? 'ወንድም/እህት (Sibling)' : 'Sibling'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'የትውልድ ቀን ወይም ዕድሜ' : 'Birth Date or Age'}
              </label>
              <input
                type="text"
                value={birthDateOrAge}
                onChange={(e) => setBirthDateOrAge(e.target.value)}
                placeholder="e.g. 1998-05-10 (28 yrs)"
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ስልክ ቁጥር (አማራጭ)' : 'Phone Number (Optional)'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 9..."
                className="w-full px-3 py-2.5 text-sm font-mono border border-[#CBD5D0] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                {lang === 'am' ? 'ተጨማሪ ማስታወሻ' : 'Notes / Residence'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'am' ? 'አድራሻ ወይም ማብራሪያ...' : 'Address or beneficiary note...'}
                className="w-full px-3 py-2.5 text-sm border border-[#CBD5D0] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold border border-[#D4DBD7] rounded-lg"
            >
              {tr('cancel', lang)}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0E4D34] rounded-lg hover:bg-[#0A3B27]"
            >
              {editingId ? tr('save', lang) : lang === 'am' ? 'መዝግብ' : 'Add Dependent'}
            </button>
          </div>
        </form>
      )}

      {/* Dependents Cards */}
      <div className="bg-white border border-[#DCE2DD] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6E3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#0E4D34]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              {lang === 'am' ? 'የተመዘገቡ ቤተሰቦች' : 'Registered Dependents'}
            </h3>
          </div>
          <span className="text-xs font-mono text-[#64748B] tabular-nums">
            {currentUser.beneficiaries.length}{' '}
            {lang === 'am' ? 'ሰዎች' : 'covered'}
          </span>
        </div>

        {currentUser.beneficiaries.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            {lang === 'am'
              ? 'እስካሁን የተመዘገበ የቤተሰብ አባል የለም።'
              : 'No dependents registered yet. Add your spouse, children, or parents above.'}
          </div>
        ) : (
          <div className="divide-y divide-[#EEF1EE]">
            {currentUser.beneficiaries.map((dep) => (
              <div
                key={dep.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#0E4D34]">{relLabel(dep.relationship)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#16A34A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lang === 'am' ? 'በዕድሩ የተሸፈነ' : 'Covered under Edir Rules'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#0F172A]">
                    {lang === 'am' ? dep.fullNameAm : dep.fullNameEn}
                  </h4>
                  <p className="text-xs text-[#475569]">
                    {dep.birthDateOrAge ? `${dep.birthDateOrAge} · ` : ''}
                    {dep.phone ? `${dep.phone} · ` : ''}
                    {dep.notes || ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(dep)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] border border-[#D4DBD7] rounded-lg hover:bg-[#F4F6F5]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {tr('edit', lang)}
                  </button>
                  <button
                    onClick={() => removeDependent(dep.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#DC2626] border border-[#FECACA] rounded-lg hover:bg-[#FEF2F2]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {tr('delete', lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
