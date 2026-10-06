import Step from "@/components/public_booking/Steps";

export default function BookingSteps({ currentStep }) {
  return (
    <nav className="hidden items-center gap-6 md:flex">

      <Step
        active={currentStep === 1}
        completed={currentStep > 1}
        number="1"
        label="Service"
      />

      <Step
        active={currentStep === 2}
        completed={currentStep > 2}
        number="2"
        label="Date & Time"
      />

      <Step
        active={currentStep === 3}
        completed={false}
        number="3"
        label="Payment"
      />

    </nav>
  );
}