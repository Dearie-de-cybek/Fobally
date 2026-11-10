import { Suspense } from "react";
import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { RegisterFlow } from "@/components/register/RegisterFlow";

export const metadata: Metadata = { title: "Register — The People's Canvas" };

export default function RegisterPage() {
  return (
    <>
    <Backdrop />
    <Suspense fallback={<div style={{ minHeight: "100svh", display: "grid", placeItems: "center" }}><span className="label">Loading…</span></div>}>
      <RegisterFlow />
    </Suspense>
    </>
  );
}
