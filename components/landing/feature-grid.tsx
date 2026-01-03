import { BarChart3, Zap, Shield, Smartphone, Fingerprint, PenTool } from "lucide-react";

const features = [
  {
    title: "Google Authentication",
    description: "Secure and seamless sign-in with your existing Google account. No new passwords to remember.",
    icon: Shield
  },
  {
    title: "Custom Profile",
    description: "Claim your unique username (oneurl.live/you) and customize your bio and avatar to match your brand.",
    icon: Fingerprint
  },
  {
    title: "Link Management",
    description: "Add, edit, and reorganize your links effortlessly. Keep your audience directed to what matters most.",
    icon: PenTool
  },
  {
    title: "Deep Analytics",
    description: "Track clicks and view detailed insights to understand what your audience engages with.",
    icon: BarChart3
  },
  {
    title: "Fast & Modern",
    description: "Built with Next.js 16 and React 19 for instant page loads and a smooth user experience.",
    icon: Zap
  },
  {
    title: "Responsive Design",
    description: "Your profile looks perfect on every device, from desktop monitors to mobile phones.",
    icon: Smartphone
  }
];

export function LandingFeatures() {
  return (
    <section className="border-t-2 border-dashed border-zinc-200 pt-24 md:pt-32 pb-24 md:pb-32 bg-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-medium mb-4">Everything you need.</h2>
          <p className="text-sm text-zinc-600 max-w-2xl">
            Powerful features to help you share your online presence effectively.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-white rounded-lg border border-zinc-200 p-6 space-y-3 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-zinc-900" strokeWidth={1.5} />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
