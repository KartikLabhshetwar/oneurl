import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">
          This profile does not exist or has not been published yet.
        </p>
        <Button render={<Link href="/" />}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

