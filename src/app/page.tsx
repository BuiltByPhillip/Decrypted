"use client"

import { useRouter } from "next/navigation";
import Button from "~/components/Button";
import Footer from "~/app/_components/Footer";


export default function page() {
  const router = useRouter();

  return (
    <div className="bg-pattern">
      <main className="text-cream flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-col pb-50">
          <span className="text-soft-white text-4xl font-bold uppercase">
            page is under construction
          </span>

          <span className="flex text-gray text-xl justify-center">
            Click on 'Create exercise' to experience decrypted
          </span>
        </div>

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
            onClick={() => {
              router.push("/documentation");
            }}
          >
            Documentation
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}