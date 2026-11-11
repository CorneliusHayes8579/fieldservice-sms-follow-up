import test from "node:test";
import assert from "node:assert/strict";
import { chooseApprovedTemplate, renderFollowUp } from "../src/field_service_sms.ts";

test("completed work with photos selects the approved follow-up template", () => {
  const input = {
    workOrderId: "WO-1042",
    technicianId: "tech-17",
    customerPhone: "+8613800138000",
    photoCount: 2,
    status: "completed" as const,
  };

  assert.equal(chooseApprovedTemplate(input).signature, "Northwind Service");
  assert.match(renderFollowUp(input), /WO-1042/);
});

test("a completion without photos is rejected", () => {
  assert.throws(() => chooseApprovedTemplate({
    workOrderId: "WO-1043",
    technicianId: "tech-18",
    customerPhone: "+8613800138001",
    photoCount: 0,
    status: "completed",
  }));
});
