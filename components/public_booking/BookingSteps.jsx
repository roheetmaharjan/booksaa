import Step from "@/components/public_booking/Steps";

export default function BookingSteps({ currentStep }) {
  const steps = ["Service", "Date & Time", "Your Details", "Verify Email", "Payment", "Confirmation"];

  return (
    <>
      <span className="max-w-32 truncate text-right text-xs font-medium text-slate-500 md:hidden">
        Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
      </span>
      <nav className="hidden items-center gap-6 md:flex">
        {steps.map((label, index) => (
          <Step
            key={label}
            active={currentStep === index + 1}
            completed={currentStep > index + 1}
            number={String(index + 1)}
            label={label}
          />
        ))}
      </nav>
    </>
  );
}