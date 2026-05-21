'use client';

import { useRef, useState } from 'react';
import { SalespersonData } from '@/lib/types';
import { saveSalesperson } from '@/lib/storage';

interface Step0Props {
  initialData: SalespersonData;
  onSave: (data: SalespersonData) => void;
  onClose: () => void;
  isFirstRun: boolean;
}

export default function Step0Settings({ initialData, onSave, onClose, isFirstRun }: Step0Props) {
  const [data, setData] = useState<SalespersonData>(initialData);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setData((d) => ({ ...d, photo: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!data.name.trim()) {
      setError('Jméno je povinné.');
      return;
    }
    saveSalesperson(data);
    onSave(data);
  }

  function set(field: keyof SalespersonData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((d) => ({ ...d, [field]: e.target.value }));
      setError('');
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Hlavička */}
        <div className="bg-[#012163] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Nastavení profilu</h2>
            <p className="text-white/50 text-sm mt-0.5">
              {isFirstRun ? 'Vyplňte své údaje pro generování nabídek.' : 'Upravte své kontaktní údaje.'}
            </p>
          </div>
          {!isFirstRun && (
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-[#F2F4FF] border-2 border-[#E8EBFF] flex items-center justify-center cursor-pointer hover:border-[#04EDB5] transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {data.photo ? (
                <img src={data.photo} alt="foto" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-[#012163]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-[#012163] hover:text-[#0D60FF] transition-colors"
              >
                {data.photo ? 'Změnit fotografii' : 'Nahrát fotografii'}
              </button>
              <p className="text-xs text-[#012163]/40 mt-0.5">JPG, PNG – doporučeno čtvercový formát</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Formulář */}
          <div className="space-y-3">
            <Field label="Jméno a příjmení *" value={data.name} onChange={set('name')} placeholder="Např. Jana Nováková" />
            <Field label="Pracovní pozice" value={data.position} onChange={set('position')} placeholder="Např. Sales Consultant" />
            <Field label="Email" value={data.email} onChange={set('email')} placeholder="jana.novakova@mediaboard.com" type="email" />
            <Field label="Telefon" value={data.phone} onChange={set('phone')} placeholder="+420 000 000 000" type="tel" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            className="w-full bg-[#012163] hover:bg-[#011040] text-white font-bold py-3 rounded-xl transition-colors"
          >
            Uložit a pokračovat
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#012163]/60 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-[#E8EBFF] rounded-lg px-3 py-2.5 text-sm text-[#012163] placeholder-[#012163]/30 focus:outline-none focus:border-[#0D60FF] focus:ring-2 focus:ring-[#0D60FF]/10 transition"
      />
    </div>
  );
}
