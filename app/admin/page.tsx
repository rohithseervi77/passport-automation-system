import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminIndexPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
