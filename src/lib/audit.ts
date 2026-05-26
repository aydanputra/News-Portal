
import { prisma } from "@/lib/prisma";

export async function logActivity(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  req?: Request
) {
  try {
    let ip = "unknown";
    let ua = "unknown";
    
    if (req) {
        ip = req.headers.get("x-forwarded-for") || "unknown";
        ua = req.headers.get("user-agent") || "unknown";
    }

    // @ts-ignore: Prisma Client type update lag
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details || {},
        ipAddress: ip,
        userAgent: ua
      }
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
    // Silent fail to not disrupt UX, but log to stderr
  }
}
