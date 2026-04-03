"use client"

import Button from "~/components/Button";
import { useRouter } from "next/navigation";


export default function CTAButton() {
  const router = useRouter();

  return (
    <Button variant="submit" size="lg" onClick={() => router.push("/editor")}>
      Open the editor
    </Button>
  );
}