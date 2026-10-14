import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Police Enquiry Authority",
  description: "Police authority console for conducting residential inquiries, criminal background checks, and submitting verification certificates.",
};

export default function PoliceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
