package infrastructure

import (
	"os"
	"strings"
	"testing"

	"whatsmeow-agent/internal/contracts"
)

func TestToWhatsAppJID(t *testing.T) {
	if ToWhatsAppJID("54911") != "54911@s.whatsapp.net" {
		t.Fatal("jid")
	}
	if ToWhatsAppJID("a@b") != "a@b" {
		t.Fatal("keep")
	}
}

func TestAdapterNeverNeedsLiveWhatsApp(t *testing.T) {
	sock := &FakeSocket{}
	client := AdapterClient{Sock: sock}
	if _, err := client.SendPresence("54911", "composing"); err != nil {
		t.Fatal(err)
	}
	if _, err := client.SendMessage(contracts.OutboundMessage{Kind: "text", To: "54911", Text: "hi"}); err != nil {
		t.Fatal(err)
	}
	if _, err := client.SendMessage(contracts.OutboundMessage{
		Kind: "media", To: "54911", MediaType: "document", Media: "https://example.com/c.pdf", FileName: "coupon.pdf",
	}); err != nil {
		t.Fatal(err)
	}
	if len(sock.Presence) != 1 || len(sock.Texts) != 1 || len(sock.Media) != 1 {
		t.Fatalf("%+v", sock)
	}
}

func TestDefaultBuildIncludesLiveWhatsmeowWithoutConnect(t *testing.T) {
	source, err := os.ReadFile("live_whatsmeow.go")
	if err != nil {
		t.Fatal(err)
	}
	text := string(source)
	if strings.Contains(text, "//go:build live") {
		t.Fatal("live library must compile in the default binary")
	}
	if !strings.Contains(text, "GetQRChannel") || !strings.Contains(text, "bindLiveSend") {
		t.Fatal("expected GetQRChannel and bindLiveSend")
	}
	if !strings.Contains(text, "SendChatPresence") || !strings.Contains(text, "SendMessage") {
		t.Fatal("bindLiveSend must wire real client send methods")
	}
	if LiveLibraryStart == nil {
		t.Fatal("LiveLibraryStart must be assigned in default tests (do not call it)")
	}
}

func TestLiveSendBridgeDelegatesWithoutConnect(t *testing.T) {
	bridge := &LiveSendBridge{}
	fake := &FakeSocket{}
	sock := NewLiveEventSock()
	sock.SendBind = bridge.Bind
	bindLiveSend(nil, sock)
	if fake.Texts != nil {
		t.Fatal("nil client must not bind")
	}
	sock.SendBind(fake)
	client := AdapterClient{Sock: bridge}
	if _, err := client.SendPresence("54911", "composing"); err != nil {
		t.Fatal(err)
	}
	if _, err := client.SendMessage(contracts.OutboundMessage{Kind: "text", To: "54911", Text: "hi"}); err != nil {
		t.Fatal(err)
	}
	if len(fake.Presence) != 1 || len(fake.Texts) != 1 {
		t.Fatalf("%+v", fake)
	}
}
