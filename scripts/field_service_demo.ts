import { chooseApprovedTemplate, followUpRequest, renderFollowUp } from "../src/field_service_sms.ts";

const request = followUpRequest.parse({
  workOrderId: "WO-1042",
  technicianId: "tech-17",
  customerPhone: "+8613800138000",
  photoCount: 3,
  status: "completed",
});

const template = chooseApprovedTemplate(request);
console.log({ template: template.name, signature: template.signature, message: renderFollowUp(request) });
