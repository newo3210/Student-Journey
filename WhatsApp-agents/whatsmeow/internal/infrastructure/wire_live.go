package infrastructure

import "fmt"

// LiveEventSock - subscribe methods plus optional send bind; tests fake events and never Connect.
type LiveEventSock struct {
	listeners map[string][]func(payload any)
	SendBind  func(SocketLike)
}

func NewLiveEventSock() *LiveEventSock {
	return &LiveEventSock{listeners: map[string][]func(payload any){}}
}

func (s *LiveEventSock) On(event string, listener func(payload any)) {
	s.listeners[event] = append(s.listeners[event], listener)
}

func (s *LiveEventSock) Emit(event string, payload any) {
	for _, listener := range s.listeners[event] {
		listener(payload)
	}
}

type WireLiveOptions struct {
	OnInbound func(body any)
	PrintQR   func(qr string)
}

// LiveMessage - inbound user text from WhatsMeow-like events (tests emit fakes).
type LiveMessage struct {
	ChatJID string
	FromMe  *bool
	ID      string
	Text    string
}

// PrintWhatsMeowQRToTerminal - pairing QR string so a human can scan locally.
func PrintWhatsMeowQRToTerminal(qr string) {
	fmt.Println("WhatsMeow pairing QR — scan with WhatsApp Linked Devices:")
	fmt.Println(qr)
	fmt.Printf("WHATSMEOW_QR_PAYLOAD:%s\n", qr)
}

// MapLiveMessageToWebhookBody - same `{ event, payload }` shape as ExtractInboundEvent / HTTP simulator.
func MapLiveMessageToWebhookBody(message LiveMessage) map[string]any {
	payload := map[string]any{
		"id":   message.ID,
		"from": message.ChatJID,
		"body": message.Text,
	}
	if message.FromMe != nil {
		payload["fromMe"] = *message.FromMe
	}
	return map[string]any{
		"event":   "messages.upsert",
		"payload": payload,
	}
}

// WireLiveEvents - QR from qr event; inbound text → demo handler (skip fromMe).
func WireLiveEvents(sock *LiveEventSock, options WireLiveOptions) {
	printQR := options.PrintQR
	if printQR == nil {
		printQR = PrintWhatsMeowQRToTerminal
	}

	sock.On("qr", func(payload any) {
		code, _ := payload.(string)
		if code != "" {
			printQR(code)
		}
	})

	sock.On("message", func(payload any) {
		msg, ok := payload.(LiveMessage)
		if !ok {
			if m, ok := payload.(map[string]any); ok {
				msg = mapToLiveMessage(m)
			} else {
				return
			}
		}
		if msg.FromMe == nil || *msg.FromMe {
			return
		}
		body := MapLiveMessageToWebhookBody(msg)
		if options.OnInbound != nil {
			options.OnInbound(body)
		}
	})
}

func mapToLiveMessage(m map[string]any) LiveMessage {
	msg := LiveMessage{}
	if v, ok := m["chatJid"].(string); ok {
		msg.ChatJID = v
	}
	if v, ok := m["id"].(string); ok {
		msg.ID = v
	}
	if v, ok := m["text"].(string); ok {
		msg.Text = v
	}
	if v, ok := m["fromMe"].(bool); ok {
		msg.FromMe = &v
	}
	return msg
}

// NewLiveMessage - helper for tests and live adapters.
func NewLiveMessage(chatJID string, fromMe bool, id, text string) LiveMessage {
	fm := fromMe
	return LiveMessage{ChatJID: chatJID, FromMe: &fm, ID: id, Text: text}
}
