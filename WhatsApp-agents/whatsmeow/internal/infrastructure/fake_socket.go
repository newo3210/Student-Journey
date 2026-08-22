package infrastructure

import (
	"sync"

	"whatsmeow-agent/internal/contracts"
)

// FakeSocket - records presence/text/media calls; tests never open WhatsApp.
type FakeSocket struct {
	mu       sync.Mutex
	Presence [][2]string
	Texts    [][2]string
	Media    [][5]string
}

func (f *FakeSocket) SendPresenceUpdate(presence, jid string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.Presence = append(f.Presence, [2]string{presence, jid})
	return nil
}

func (f *FakeSocket) SendText(jid, text string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.Texts = append(f.Texts, [2]string{jid, text})
	return nil
}

func (f *FakeSocket) SendMedia(jid, mediaType, mediaURL, caption, fileName string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.Media = append(f.Media, [5]string{jid, mediaType, mediaURL, caption, fileName})
	return nil
}

// RecordingClient - Client used by HTTP tests (counts sends without a device).
type RecordingClient struct {
	mu            sync.Mutex
	PresenceCalls int
	MessageCalls  int
	LastKind      string
}

func (c *RecordingClient) SendPresence(to, presence string) (SendResult, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.PresenceCalls++
	_ = to
	_ = presence
	return SendResult{Status: 200, Body: map[string]bool{"ok": true}}, nil
}

func (c *RecordingClient) SendMessage(message contracts.OutboundMessage) (SendResult, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.MessageCalls++
	c.LastKind = message.Kind
	return SendResult{Status: 200, Body: map[string]bool{"ok": true}}, nil
}
