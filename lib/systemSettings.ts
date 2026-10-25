import { prisma } from "./prisma";

export interface SystemSettingItem {
  key: string;
  value: string;
  description?: string | null;
  updatedBy?: string | null;
  updatedAt?: Date;
}

const DEFAULT_SETTINGS: Record<string, { value: string; description: string }> = {
  MAINTENANCE_MODE: {
    value: "false",
    description: "When enabled, citizen portals display a scheduled maintenance screen while administrators retain full access.",
  },
  SYSTEM_ANNOUNCEMENT: {
    value: "All Passport Seva Kendras (PSK & POPSK) operational as per standard working hours (09:00 AM – 05:00 PM).",
    description: "Global citizen broadcast message displayed on public portal headers.",
  },
  ALLOW_NEW_REGISTRATIONS: {
    value: "true",
    description: "Permits new citizens to register online application accounts.",
  },
  AUTO_POLICE_DISPATCH: {
    value: "true",
    description: "Automatically dispatches verified applications to jurisdictional police station queues.",
  },
};

/**
 * Retrieves a single setting by key, with built-in default fallback.
 */
export async function getSystemSetting(key: string): Promise<string> {
  try {
    const item = await prisma.systemSetting.findUnique({
      where: { key },
    });
    if (item) return item.value;
    return DEFAULT_SETTINGS[key]?.value || "";
  } catch {
    return DEFAULT_SETTINGS[key]?.value || "";
  }
}

/**
 * Retrieves all system settings.
 */
export async function getAllSystemSettings(): Promise<SystemSettingItem[]> {
  try {
    const items = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    // Ensure defaults exist in the output list
    const resultMap = new Map<string, SystemSettingItem>();
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      resultMap.set(k, {
        key: k,
        value: v.value,
        description: v.description,
      });
    }

    for (const item of items) {
      resultMap.set(item.key, item);
    }

    return Array.from(resultMap.values());
  } catch {
    return Object.entries(DEFAULT_SETTINGS).map(([k, v]) => ({
      key: k,
      value: v.value,
      description: v.description,
    }));
  }
}

/**
 * Sets or updates a system setting with an audit trail.
 */
export async function setSystemSetting(
  key: string,
  value: string,
  updatedBy: string,
  description?: string
): Promise<SystemSettingItem> {
  const item = await prisma.systemSetting.upsert({
    where: { key },
    update: {
      value,
      updatedBy,
      ...(description ? { description } : {}),
      updatedAt: new Date(),
    },
    create: {
      key,
      value,
      description: description || DEFAULT_SETTINGS[key]?.description || null,
      updatedBy,
    },
  });

  return item;
}
