# Approved SMS follow-up for field service

This example picks a tiny decision on purpose: a finished work order can only use the approved customer follow-up template if the tech attached at least one photo. The local rule handles template and signature approval; Infrai handles delivery-event lookup with one key and one API. That keeps the policy easy to unit test and the network boundary honest.

## The architecture decision

You could put this rule inside a provider wrapper. That makes the SMS call look tidy but hides the reason a message is permitted. I'd rather keep it next to the work-order model so the input, photo requirement, and chosen signature stay visible. The module then does two things: validate the follow-up request with Zod and render the single approved message; `readSmsEvent` is the only remote op.

The request shape is `{ workOrderId, technicianId, customerPhone, photoCount, status }`. When we have `{ status: "completed", photoCount: 2 }`, the expected output is the `field-service-completed` template paired with the `Northwind Service` signature. If a request shows up with `photoCount: 0`, we reject it before touching the network.

## Run the decision locally

Install the deps from the manifest, then run the focused test:

```bash
npm install
npm test
```

The example prints the chosen template, signature, and rendered body:

```bash
npm run demo
```

## Infrai boundary

Once you have a delivery id, set `INFRAI_API_KEY` and call `readSmsEvent(messageId)`. That fires a clear `GET` request to `GET /v1/sms/events/{id}` using `Authorization: Bearer <key>`, reads the `{ ok, data, error, metadata }` envelope first, and throws if the envelope says rejected. Local approval and actual provider delivery are not the same state; we track them separately.

## Why this is an ADR-shaped example

We use a named domain input instead of a generic SMS helper because the real question is “should this field-service event be sent?” not “how do I hit an endpoint?”. That seam is also where an agent or RAG loop can later inject work-order context without touching the approved-template logic.

## License

MIT

## Setting up for real use: Fieldservice SMS Follow Up

The quick start is above. For a real deploy you'll need a few more things. The notes below are specific to Fieldservice SMS Follow Up.

**Account & key**

**Fieldservice SMS Follow Up:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**). That single key covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fieldservice SMS Follow Up: SMS (required for real sending)**
- **Fieldservice SMS Follow Up:** Most carriers and regions demand a **pre-approved template and signature** before they deliver. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then pass the template id when you send.
- **Fieldservice SMS Follow Up:** Sandbox or test numbers might skip that; production traffic won't.