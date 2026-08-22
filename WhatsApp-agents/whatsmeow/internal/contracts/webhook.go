package contracts

import (
	"encoding/json"
	"strings"
)

// InboundEvent - normalized fields used by application services.
type InboundEvent struct {
	From              string
	MessageID         string
	Type              string
	TextBody          string
	InteractiveID     string
	InteractiveTitle  string
}

type webhookPayload struct {
	ID              string          `json:"id"`
	From            string          `json:"from"`
	RemoteJid       string          `json:"remoteJid"`
	ChatID          string          `json:"chatId"`
	FromMe          *bool           `json:"fromMe"`
	Body            string          `json:"body"`
	Type            string          `json:"type"`
	SelectedButtonID string         `json:"selectedButtonId"`
	ListResponse    *listReply      `json:"listResponse"`
	ButtonsResponse *buttonsReply   `json:"buttonsResponse"`
}

type listReply struct {
	RowID string `json:"rowId"`
	Title string `json:"title"`
	ID    string `json:"id"`
}

type buttonsReply struct {
	SelectedButtonID     string `json:"selectedButtonId"`
	SelectedDisplayText  string `json:"selectedDisplayText"`
	ButtonID             string `json:"buttonId"`
}

type webhookBody struct {
	Event   string          `json:"event"`
	Payload *webhookPayload `json:"payload"`
}

// NormalizeRemoteJID - strip WhatsApp suffixes to a bare phone/number id.
func NormalizeRemoteJID(remoteJid string) string {
	if i := strings.Index(remoteJid, "@"); i >= 0 {
		return remoteJid[:i]
	}
	return remoteJid
}

// ExtractInboundEvent - simulator/socket envelope; skip unless fromMe is explicitly false.
func ExtractInboundEvent(body any) *InboundEvent {
	parsed, ok := decodeWebhook(body)
	if !ok {
		return nil
	}

	eventName := parsed.Event
	if eventName != "" && eventName != "message" && eventName != "messages.upsert" {
		return nil
	}

	payload := parsed.Payload
	if payload == nil {
		return nil
	}

	from := firstNonEmpty(payload.From, payload.RemoteJid, payload.ChatID)
	if from == "" {
		return nil
	}
	if payload.FromMe == nil || *payload.FromMe {
		return nil
	}

	interactiveID := firstNonEmpty(
		payload.SelectedButtonID,
		valueOrEmpty(payload.ListResponse, func(v *listReply) string { return firstNonEmpty(v.RowID, v.ID) }),
		valueOrEmpty(payload.ButtonsResponse, func(v *buttonsReply) string {
			return firstNonEmpty(v.SelectedButtonID, v.ButtonID)
		}),
	)
	interactiveTitle := firstNonEmpty(
		valueOrEmpty(payload.ListResponse, func(v *listReply) string { return v.Title }),
		valueOrEmpty(payload.ButtonsResponse, func(v *buttonsReply) string { return v.SelectedDisplayText }),
	)

	textBody := payload.Body
	msgType := inferType(payload, interactiveID)
	if msgType != "interactive" && textBody == "" {
		return nil
	}

	messageID := payload.ID
	if messageID == "" {
		messageID = "unknown"
	}

	return &InboundEvent{
		From:             NormalizeRemoteJID(from),
		MessageID:        messageID,
		Type:             msgType,
		TextBody:         textBody,
		InteractiveID:    interactiveID,
		InteractiveTitle: interactiveTitle,
	}
}

func decodeWebhook(body any) (webhookBody, bool) {
	switch v := body.(type) {
	case webhookBody:
		return v, true
	case []byte:
		var parsed webhookBody
		if err := json.Unmarshal(v, &parsed); err != nil {
			return webhookBody{}, false
		}
		return parsed, true
	default:
		raw, err := json.Marshal(v)
		if err != nil {
			return webhookBody{}, false
		}
		var parsed webhookBody
		if err := json.Unmarshal(raw, &parsed); err != nil {
			return webhookBody{}, false
		}
		return parsed, true
	}
}

func inferType(payload *webhookPayload, interactiveID string) string {
	if interactiveID != "" {
		return "interactive"
	}
	if payload.Type != "" && payload.Type != "chat" && payload.Type != "text" {
		return payload.Type
	}
	if payload.Body != "" {
		return "text"
	}
	if payload.Type == "" {
		return "unknown"
	}
	return payload.Type
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func valueOrEmpty[T any](ptr *T, pick func(*T) string) string {
	if ptr == nil {
		return ""
	}
	return pick(ptr)
}
