"use client"

import { useRouter } from "next/navigation";
import Button from "~/components/Button";


export default function page() {
  const router = useRouter();

  return (
    <main className="bg-pattern text-cream flex min-h-screen flex-col items-center justify-center">
      <div className="flex w-full justify-center gap-4">
        <Button
          variant="secondary"
          onClick={() => {
            router.push("/code");
          }}
        >
          Create exercise
        </Button>
        <Button
          variant="primary"
        >
          Documentation
        </Button>
      </div>
    </main>
  );
}