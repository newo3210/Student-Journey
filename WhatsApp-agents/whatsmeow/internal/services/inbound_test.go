package services

import (
	"testing"

	"whatsmeow-agent/internal/infrastructure"
)

func TestHandleInboundTextSends(t *testing.T) {
	client := &infrastructure.RecordingClient{}
	fromMe := false
	result := HandleInboundWebhook(map[string]any{
		"event": "message",
		"payload": map[string]any{
			"id": "1", "from": "54911@s.whatsapp.net", "fromMe": fromMe, "body": "hi",
		},
	}, InboundHandlerDeps{
		Client:         client,
		CouponMediaURL: "https://example.com/coupon.pdf",
		MinDelayMS:     0,
		MaxDelayMS:     0,
		Sleep:          func(ms int) {},
	})
	if !result.Handled || result.Sent != 1 {
		t.Fatalf("%+v client=%+v", result, client)
	}
}
