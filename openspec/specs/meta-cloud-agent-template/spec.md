# meta-cloud-agent-template

## Purpose

Runnable Meta WhatsApp Cloud API Level 1 template: webhook verify, text/interactive/media demo flow, Clean Architecture layout, optional HMAC signature, and honest Graph failure handling.

## Requirements

### Requirement: Webhook verification challenge
The Meta Cloud API template SHALL expose a GET webhook endpoint that completes Meta’s subscription verification when the verify token matches configuration.

#### Scenario: Valid verify token
- **WHEN** Meta sends GET with `hub.mode=subscribe`, matching `hub.verify_token`, and a `hub.challenge`
- **THEN** the server responds with HTTP 200 and the plain-text challenge value

#### Scenario: Invalid verify token
- **WHEN** Meta sends GET with a verify token that does not match configuration
- **THEN** the server responds with HTTP 403 (or equivalent forbidden) and does not echo the challenge

### Requirement: Inbound text message handling and text reply
The template SHALL accept POST webhook payloads for inbound text messages and reply with a text message via Meta Graph API.

#### Scenario: Inbound text triggers outbound text
- **WHEN** a valid webhook POST contains an inbound text message from a WhatsApp user
- **THEN** the service sends a text reply to that user through the Graph API client using configured phone number id and access token

### Requirement: Interactive buttons or lists
The template SHALL support sending at least one interactive message type (reply buttons and/or a list) and SHALL handle the corresponding inbound interactive reply.

#### Scenario: Outbound interactive menu
- **WHEN** the demo flow decides to present a menu (e.g. after a keyword or first message)
- **THEN** the Graph API client sends an interactive buttons or list message per Meta Cloud API schema

#### Scenario: Inbound interactive reply
- **WHEN** the user selects an interactive option
- **THEN** the webhook handler parses the selected id/title and the service responds with a deterministic text (or follow-up) reply

### Requirement: Outbound PDF image or coupon media
The template SHALL demonstrate sending media suitable for a coupon or document use case (image and/or PDF document) with optional caption.

#### Scenario: Send document or image coupon
- **WHEN** the demo flow triggers a coupon/media send (e.g. interactive choice or keyword)
- **THEN** the service calls Graph API to send `image` or `document` media to the user with caption and filename when applicable

### Requirement: Configuration and secrets safety
The template SHALL load Meta credentials from environment variables and SHALL ship an `.env.example` without real secrets.

#### Scenario: Missing required env fails fast
- **WHEN** the server starts without required Meta env vars
- **THEN** startup validation fails with a clear error listing missing keys

### Requirement: Clean Architecture layout and defense README
The template SHALL separate presentation, services, infrastructure, and contracts folders, and SHALL include a README with setup, tunnel notes, and oral-defense / decision bullets.

#### Scenario: Thin presentation layer
- **WHEN** a reviewer inspects webhook route handlers
- **THEN** handlers only validate/parse and call services; they do not embed Graph API HTTP calls inline

#### Scenario: Defense README present
- **WHEN** a reader opens `WhatsApp-agents/meta-cloud-api/README.md`
- **THEN** they find setup steps, required env vars, how to expose the webhook, demo script (text / interactive / media), and decision bullets (why Meta first, layering, no anti-ban on official API)

### Requirement: Automated tests for webhook and payload builders
The template SHALL include automated tests (TDD) for verify-token logic and for building outbound text, interactive, and media payloads (Graph API HTTP mocked).

#### Scenario: Verify token unit test
- **WHEN** the test suite runs
- **THEN** tests cover accept and reject paths for webhook verification

#### Scenario: Outbound payload builder tests
- **WHEN** the test suite runs
- **THEN** tests assert shapes for text, interactive, and media outbound payloads without calling the real Graph API

### Requirement: Webhook signature validation when app secret is configured
When `WHATSAPP_APP_SECRET` is set, the template SHALL reject POST webhooks that lack a valid `X-Hub-Signature-256` HMAC of the raw body. README SHALL warn that a public tunnel without the secret is unsafe (token abuse via forged inbound).

#### Scenario: Valid signature accepted
- **WHEN** `WHATSAPP_APP_SECRET` is set and POST includes a matching `X-Hub-Signature-256` over the raw body
- **THEN** the server accepts the webhook (HTTP 200 ack path) and may process inbound events

#### Scenario: Missing or invalid signature rejected
- **WHEN** `WHATSAPP_APP_SECRET` is set and POST omits the header or the HMAC does not match
- **THEN** the server responds with HTTP 401 or 403 and does not call the Graph API client

#### Scenario: Unsigned demo documented as unsafe
- **WHEN** a reader opens the Meta template README
- **THEN** they see an explicit warning that exposing the webhook publicly without `WHATSAPP_APP_SECRET` allows forged inbound and outbound spam via the Graph token

### Requirement: Graph send failures are not counted as success
The template SHALL treat Graph API non-2xx responses as send failures: log them and not count them toward successful `sent` totals. Architecture docs SHALL match this behavior.

#### Scenario: Graph HTTP 500 is not a successful send
- **WHEN** the Graph client returns HTTP status 500 for an outbound message
- **THEN** the handler logs the failure and does not increment successful `sent` for that payload

### Requirement: Demo menu only for text keywords
The demo flow SHALL open the interactive menu only for inbound `text` messages that match menu keywords (or empty/first-text greeting rules scoped to text), not for unrelated media types such as image/audio/sticker.

#### Scenario: Inbound image does not open menu
- **WHEN** an inbound webhook event has `type` image (or other non-text) without a text menu keyword
- **THEN** the service does not send the interactive menu as a default reply
