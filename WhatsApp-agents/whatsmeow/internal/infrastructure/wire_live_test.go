package infrastructure

import "testing"

func TestMapLiveMessageMatchesExtractorShape(t *testing.T) {
	body := MapLiveMessageToWebhookBody(NewLiveMessage("5491112345678@s.whatsapp.net", false, "LIVE1", "hello"))
	payload, _ := body["payload"].(map[string]any)
	if payload["body"] != "hello" || payload["from"] != "5491112345678@s.whatsapp.net" {
		t.Fatalf("%+v", body)
	}
}

func TestWireLivePrintsQR(t *testing.T) {
	sock := NewLiveEventSock()
	got := ""
	WireLiveEvents(sock, WireLiveOptions{
		OnInbound: func(body any) {},
		PrintQR:   func(qr string) { got = qr },
	})
	sock.Emit("qr", "TESTQR")
	if got != "TESTQR" {
		t.Fatalf("qr %s", got)
	}
}

func TestWireLiveSkipsFromMe(t *testing.T) {
	sock := NewLiveEventSock()
	called := false
	WireLiveEvents(sock, WireLiveOptions{
		OnInbound: func(body any) { called = true },
		PrintQR:   func(qr string) {},
	})
	sock.Emit("message", NewLiveMessage("54911@s.whatsapp.net", true, "SELF", "echo"))
	if called {
		t.Fatal("fromMe should skip")
	}
}
