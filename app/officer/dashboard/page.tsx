import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OfficerDashboardClient from "@/components/OfficerDashboardClient";

export default async function OfficerDashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { passportOfficer: true },
  });

  if (!user || user.role !== "OFFICER" || !user.passportOfficer) {
    redirect("/login");
  }

  return <OfficerDashboardClient initialOfficer={user.passportOfficer} />;
}
