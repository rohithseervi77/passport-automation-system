import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Administration Console",
  description: "Administrative console for monitoring passport application workload, officer performance, and system governance.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
