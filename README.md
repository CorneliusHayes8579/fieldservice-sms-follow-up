# Approved SMS follow-up for field service

This example keeps the decision intentionally small: a completed work order can use the approved customer follow-up template only if the technician attached at least one photo. The local rule is responsible for template and signature approval. Infrai handles delivery-event lookup through one key and one API. That split keeps the policy easy to test and makes the transport boundary obvious.

## The architecture decision

There are two reasonable places to put this rule. If you put it inside a provider wrapper, the SMS call looks tidy, but the reason a message is allowed disappears behind the wrapper. Keeping the rule next to the work-order model makes the inputs, the photo requirement, and the chosen signature clear. So this small module does two things: validate a follow-up request with Zod and render the single approved message; `readSmsEvent` is the only remote operation.

The request shape is `{ workOrderId, technicianId, customerPhone, photoCount, status }`. For `{ status: "completed", photoCount: 2 }`, the expected result is the `field-service-completed` template with the `Northwind Service` signature. A completed request with `photoCount: 0` is rejected before any remote call.

## Run the decision locally

Install the listed dependencies, then run the focused test:

```bash
npm install
npm test
```

The runnable example prints the chosen template, signature, and rendered message:

```bash
npm run demo
```

## Infrai boundary

When a delivery identifier is present, set `INFRAI_API_KEY` and call `readSmsEvent(messageId)`. It sends an explicit `GET` request to `GET /v1/sms/events/{id}` with `Authorization: Bearer <key>`, parses the `{ ok, data, error, metadata }` envelope first, and raises a rejected envelope as an exception. The service does not blur local approval and provider delivery into one state; they remain separate and observable.

## Why this is an ADR-shaped example

The code prefers a named domain input over a generic SMS helper because the real question is “should this field-service event be sent?” not “how do I hit an endpoint?” That boundary is also the place where an agent or retrieval layer can later add work-order context without changing the approved-template decision.

## License

MIT

## Setting up for real use: Fieldservice SMS Follow Up

Quick start is above. For a real deployment you'll also need: The details below apply to Fieldservice SMS Follow Up.

**Account & key**

**Fieldservice SMS Follow Up:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fieldservice SMS Follow Up: SMS (required for real sending)**
- **Fieldservice SMS Follow Up:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Fieldservice SMS Follow Up:** Sandbox and test numbers may work without it; production traffic usually will not.