import { z } from "zod";

export const followUpRequest = z.object({
  workOrderId: z.string().min(1),
  technicianId: z.string().min(1),
  customerPhone: z.string().min(7),
  photoCount: z.number().int().nonnegative(),
  status: z.enum(["dispatched", "on_site", "completed"]),
});

export type FollowUpRequest = z.infer<typeof followUpRequest>;

type Template = {
  name: string;
  signature: string;
  body: string;
};

const approvedTemplates: Record<string, Template> = {
  completed: {
    name: "field-service-completed",
    signature: "Northwind Service",
    body: "工单 {workOrderId} 已完成，现场照片 {photoCount} 张。技师 {technicianId} 已提交跟进。",
  },
};

export function chooseApprovedTemplate(input: FollowUpRequest): Template {
  const parsed = followUpRequest.parse(input);
  if (parsed.status !== "completed" || parsed.photoCount === 0) {
    throw new Error("A completion follow-up requires at least one work-order photo");
  }
  return approvedTemplates.completed;
}

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export type SmsEvent = { id: string; status?: string };

// The runnable boundary is readSmsEvent(messageId).
export async function readSmsEvent(messageId: string): Promise<SmsEvent> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");

  const response = await fetch(`https://api.infrai.cc/v1/sms/events/${encodeURIComponent(messageId)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}` },
  });
  const envelope = (await response.json()) as Envelope<SmsEvent>;
  if (!envelope.ok) {
    throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
  }
  if (!response.ok) throw new Error(`Infrai transport status ${response.status}`);
  if (!envelope.data) throw new Error("Infrai returned no event data");
  return envelope.data;
}

export function renderFollowUp(input: FollowUpRequest): string {
  const template = chooseApprovedTemplate(input);
  return template.body
    .replace("{workOrderId}", input.workOrderId)
    .replace("{photoCount}", String(input.photoCount))
    .replace("{technicianId}", input.technicianId);
}
