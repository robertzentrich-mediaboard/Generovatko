'use client';

import { useEffect, useState } from 'react';
import { OfferData, SalespersonData } from '@/lib/types';
import { DEFAULT_OFFER, DEFAULT_SALESPERSON } from '@/lib/constants';
import { hasSalesperson, loadSalesperson, loadOffer, saveOffer, clearOffer } from '@/lib/storage';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import Step0Settings from '@/components/steps/Step0Settings';
import Step1BasicInfo from '@/components/steps/Step1BasicInfo';
import Step2Variants from '@/components/steps/Step2Variants';
import Step3Preview from '@/components/steps/Step3Preview';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [salesperson, setSalesperson] = useState<SalespersonData>(DEFAULT_SALESPERSON);
  const [offer, setOffer] = useState<OfferData>(DEFAULT_OFFER);

  // Načtení dat z localStorage při prvním renderu
  useEffect(() => {
    setMounted(true);
    const sp = loadSalesperson();
    setSalesperson(sp);
    setOffer(loadOffer());
    // Pokud obchodník ještě nenastavil svůj profil, zobrazí se nastavení
    if (!hasSalesperson()) {
      setSettingsOpen(true);
    }
  }, []);

  // Uložit nabídku do localStorage při každé změně
  useEffect(() => {
    if (mounted) saveOffer(offer);
  }, [offer, mounted]);

  function handleSalespersonSave(data: SalespersonData) {
    setSalesperson(data);
    setSettingsOpen(false);
  }

  function handleNewOffer() {
    const fresh: OfferData = {
      ...DEFAULT_OFFER,
      date: new Date().toISOString().split('T')[0],
    };
    setOffer(fresh);
    clearOffer();
    setStep(1);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="text-[#012163] opacity-40 text-sm">Načítám…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      <Header
        salesperson={salesperson}
        onSettingsOpen={() => setSettingsOpen(true)}
        onNewOffer={handleNewOffer}
      />

      {/* Settings modal */}
      {settingsOpen && (
        <Step0Settings
          initialData={salesperson}
          onSave={handleSalespersonSave}
          onClose={() => setSettingsOpen(false)}
          isFirstRun={!hasSalesperson()}
        />
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Stepper – zobrazuje se jen pro kroky 1–3 */}
        {!settingsOpen && (
          <Stepper currentStep={step as 1 | 2 | 3} />
        )}

        <div className="mt-8">
          {step === 1 && (
            <Step1BasicInfo
              offer={offer}
              onChange={setOffer}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Variants
              offer={offer}
              onChange={setOffer}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Preview
              offer={offer}
              salesperson={salesperson}
              onBack={() => setStep(2)}
              onNewOffer={handleNewOffer}
            />
          )}
        </div>
      </main>
    </div>
  );
}
