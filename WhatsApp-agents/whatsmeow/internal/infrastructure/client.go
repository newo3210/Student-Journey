package infrastructure

import "whatsmeow-agent/internal/contracts"

// SendResult - HTTP-like status so humanized dispatch can count 2xx vs failures.
type SendResult struct {
	Status int
	Body   any
}

// Client - injectable WhatsMeow adapter (tests provide a fake; never a live session).
type Client interface {
	SendPresence(to, presence string) (SendResult, error)
	SendMessage(message contracts.OutboundMessage) (SendResult, error)
}

// ToWhatsAppJID - user chats typically use phone@s.whatsapp.net.
func ToWhatsAppJID(to string) string {
	for _, ch := range to {
		if ch == '@' {
			return to
		}
	}
	return to + "@s.whatsapp.net"
}

// AdapterClient - presence + send text/media via injectable socket-like methods.
type AdapterClient struct {
	Sock SocketLike
}

// SocketLike - subset used by the adapter (tests provide a fake, never a live WA client).
type SocketLike interface {
	SendPresenceUpdate(presence, jid string) error
	SendText(jid, text string) error
	SendMedia(jid string, mediaType, mediaURL, caption, fileName string) error
}

func (c AdapterClient) SendPresence(to, presence string) (SendResult, error) {
	if presence == "" {
		presence = "composing"
	}
	if err := c.Sock.SendPresenceUpdate(presence, ToWhatsAppJID(to)); err != nil {
		return SendResult{Status: 500, Body: map[string]string{"error": err.Error()}}, nil
	}
	return SendResult{Status: 200, Body: map[string]bool{"ok": true}}, nil
}

func (c AdapterClient) SendMessage(message contracts.OutboundMessage) (SendResult, error) {
	switch message.Kind {
	case "text":
		return c.sendText(message.To, message.Text)
	case "buttons":
		return c.sendButtons(message)
	case "list":
		return c.sendList(message)
	case "media":
		return c.sendMedia(message)
	default:
		return SendResult{Status: 500, Body: map[string]string{"error": "unknown kind"}}, nil
	}
}

func (c AdapterClient) sendText(to, text string) (SendResult, error) {
	if err := c.Sock.SendText(ToWhatsAppJID(to), text); err != nil {
		return SendResult{Status: 500, Body: map[string]string{"error": err.Error()}}, nil
	}
	return SendResult{Status: 200, Body: map[string]bool{"ok": true}}, nil
}

func (c AdapterClient) sendButtons(message contracts.OutboundMessage) (SendResult, error) {
	lines := ""
	for i, button := range message.Buttons {
		if i > 0 {
			lines += "\n"
		}
		lines += itoa(i+1) + ") " + button.DisplayText
	}
	text := joinNonEmpty(message.Title, message.Description, lines, message.Footer)
	return c.sendText(message.To, text)
}

func (c AdapterClient) sendList(message contracts.OutboundMessage) (SendResult, error) {
	lines := ""
	index := 1
	for _, section := range message.Sections {
		for _, row := range section.Rows {
			if lines != "" {
				lines += "\n"
			}
			lines += itoa(index) + ") " + row.Title
			index++
		}
	}
	text := joinNonEmpty(message.Title, message.Description, lines, message.Footer)
	return c.sendText(message.To, text)
}

func (c AdapterClient) sendMedia(message contracts.OutboundMessage) (SendResult, error) {
	fileName := message.FileName
	if fileName == "" {
		fileName = "coupon.pdf"
	}
	if err := c.Sock.SendMedia(ToWhatsAppJID(message.To), message.MediaType, message.Media, message.Caption, fileName); err != nil {
		return SendResult{Status: 500, Body: map[string]string{"error": err.Error()}}, nil
	}
	return SendResult{Status: 200, Body: map[string]bool{"ok": true}}, nil
}

func joinNonEmpty(parts ...string) string {
	out := ""
	for _, part := range parts {
		if part == "" {
			continue
		}
		if out != "" {
			out += "\n"
		}
		out += part
	}
	return out
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [16]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
