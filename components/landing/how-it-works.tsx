import { CheckCircle2, Link2, Share2 } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Claim your username",
    description: "Pick a unique handle. You get oneurl.live/yourname instantly.",
    icon: CheckCircle2,
  },
  {
    step: 2,
    title: "Add your links",
    description: "Drop in your socials, projects, anything. Drag to reorder. Choose list or grid layout.",
    icon: Link2,
  },
  {
    step: 3,
    title: "Share everywhere",
    description: "One link in your bio, email signature, or anywhere. Track every click.",
    icon: Share2,
  },
];

export function HowItWorks() {
  return (
    <section className="border-t-2 border-dashed border-zinc-200 pt-24 md:pt-32 pb-24 md:pb-32 bg-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-2">How it works</h2>
          <p className="text-sm text-zinc-600">Three steps. Under a minute.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step) => (
            <div key={step.step} className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-zinc-900" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center shadow-sm">
                  {step.step}
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

