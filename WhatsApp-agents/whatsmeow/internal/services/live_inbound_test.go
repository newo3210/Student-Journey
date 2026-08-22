package services

import (
	"sync"
	"testing"
	"time"

	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
)

func TestLiveInboundDrivesDemoHandler(t *testing.T) {
	sock := infrastructure.NewLiveEventSock()
	client := &infrastructure.RecordingClient{}
	var wg sync.WaitGroup
	wg.Add(1)
	infrastructure.WireLiveEvents(sock, infrastructure.WireLiveOptions{
		OnInbound: func(body any) {
			defer wg.Done()
			HandleInboundWebhook(body, InboundHandlerDeps{
				Client:         client,
				CouponMediaURL: "https://example.com/coupon.pdf",
				MinDelayMS:     0,
				MaxDelayMS:     0,
				Sleep:          func(ms int) {},
			})
		},
		PrintQR: func(qr string) {},
	})
	sock.Emit("message", infrastructure.NewLiveMessage("5491112345678@s.whatsapp.net", false, "LIVE1", "hello"))
	done := make(chan struct{})
	go func() { wg.Wait(); close(done) }()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("timeout")
	}
	if client.MessageCalls != 1 || client.PresenceCalls != 1 {
		t.Fatalf("calls %+v", client)
	}
	event := contracts.ExtractInboundEvent(infrastructure.MapLiveMessageToWebhookBody(
		infrastructure.NewLiveMessage("5491112345678@s.whatsapp.net", false, "LIVE1", "hello"),
	))
	if event == nil || event.TextBody != "hello" {
		t.Fatalf("%+v", event)
	}
}
