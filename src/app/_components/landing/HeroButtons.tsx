"use client"

import { useRouter } from "next/navigation";
import Button from "~/components/Button";


export default function HeroButtons() {
  const router = useRouter();

  return (
    <div>
      <Button
        variant="submit"
        size="lg"
        onClick={() => router.push("/editor")}>
        Create exercise
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() => router.push("/documentation")}
      >
        Documentation
      </Button>
    </div>
  );
}