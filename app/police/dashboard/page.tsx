import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PoliceDashboardClient from "@/components/PoliceDashboardClient";

export default async function PoliceDashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { police: true },
  });

  if (!user || user.role !== "POLICE" || !user.police) {
    redirect("/login");
  }

  return <PoliceDashboardClient initialPolice={user.police} />;
}
