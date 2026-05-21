'use client';

interface StepperProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { num: 1, label: 'Základní údaje' },
  { num: 2, label: 'Konfigurace variant' },
  { num: 3, label: 'Náhled a export' },
];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.num;
        const active = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center">
            {/* Krok */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? 'bg-[#04EDB5] text-[#012163]' : active ? 'bg-[#012163] text-white' : 'bg-[#E8EBFF] text-[#012163]/40'}`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium whitespace-nowrap
                  ${active ? 'text-[#012163]' : done ? 'text-[#012163]/60' : 'text-[#012163]/30'}`}
              >
                {step.label}
              </span>
            </div>

            {/* Spojovací čára */}
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 rounded-full transition-all
                  ${done ? 'bg-[#04EDB5]' : 'bg-[#E8EBFF]'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
