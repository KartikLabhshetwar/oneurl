import { LayoutGrid, BarChart3, Zap, Shield, Globe, Smartphone, Fingerprint, PenTool } from "lucide-react";

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
    <section className="border-t-2 border-dashed border-zinc-200 pt-24 md:pt-32 pb-24 md:pb-32">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-medium mb-4">Everything you need.</h2>
            <p className="text-sm text-zinc-600 max-w-2xl">
              Powerful features to help you share your online presence effectively.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
           {features.map((f, i) => (
             <div key={i} className="space-y-2 p-4 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors w-full max-w-sm">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 flex items-center justify-center shrink-0">
                   <f.icon className="w-4 h-4 text-foreground" />
                 </div>
                 <h3 className="text-xs font-medium">{f.title}</h3>
               </div>
               <p className="text-xs text-zinc-600 leading-relaxed pl-8">{f.description}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  )
}
