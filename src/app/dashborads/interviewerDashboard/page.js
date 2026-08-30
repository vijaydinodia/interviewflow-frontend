"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectInterviewerDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/interviewer");
  }, [router]);

  return null;
}
