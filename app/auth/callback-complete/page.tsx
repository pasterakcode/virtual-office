"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // po zakończeniu magic linka wracamy na główną stronę
    router.replace("/");
  }, [router]);

  return <p>Signing you in…</p>;
}
