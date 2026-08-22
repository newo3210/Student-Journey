package contracts

import "testing"

func boolPtr(v bool) *bool { return &v }

func TestExtractInboundEventText(t *testing.T) {
	fromMe := false
	event := ExtractInboundEvent(map[string]any{
		"event": "message",
		"payload": map[string]any{
			"id": "1", "from": "54911@s.whatsapp.net", "fromMe": fromMe, "body": "hello",
		},
	})
	if event == nil {
		t.Fatal("expected event")
	}
	if event.From != "54911" || event.TextBody != "hello" || event.Type != "text" {
		t.Fatalf("%+v", event)
	}
}

func TestExtractInboundEventSkipsFromMeTrue(t *testing.T) {
	event := ExtractInboundEvent(map[string]any{
		"event": "message",
		"payload": map[string]any{
			"from": "54911", "fromMe": true, "body": "hi",
		},
	})
	if event != nil {
		t.Fatal("expected skip")
	}
}

func TestExtractInboundEventSkipsOmittedFromMe(t *testing.T) {
	event := ExtractInboundEvent(map[string]any{
		"event": "message",
		"payload": map[string]any{
			"from": "54911", "body": "hi",
		},
	})
	if event != nil {
		t.Fatal("expected skip omitted fromMe")
	}
	_ = boolPtr
}
