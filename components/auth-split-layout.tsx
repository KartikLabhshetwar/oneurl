"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  heading: string;
  description: string;
  promotionalTitle: string;
  promotionalDescription: string;
  showBackButton?: boolean;
  backHref?: string;
}

export function AuthSplitLayout({
  children,
  heading,
  description,
  promotionalTitle,
  promotionalDescription,
  showBackButton = false,
  backHref = "/",
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col p-10 h-full">
          {showBackButton && (
            <div className="mb-auto pt-2">
              <Link href={backHref}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/90 hover:text-white hover:bg-white/10 border-0"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-left space-y-8 max-w-md">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-white leading-tight tracking-tight">
                  {promotionalTitle}
                </h2>
                <p className="text-xl text-white/90 leading-relaxed font-light">
                  {promotionalDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="OneURL"
                  width={128}
                  height={128}
                  className="h-25 w-25"
                />
              </Link>
            </div>
            <div className="space-y-3 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {heading}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

