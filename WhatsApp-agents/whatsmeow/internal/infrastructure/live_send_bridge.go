package infrastructure

import (
	"errors"
	"sync"
)

// LiveSendBridge - SocketLike that starts empty; bindLiveSend attaches the WhatsMeow client.
type LiveSendBridge struct {
	mu   sync.Mutex
	sock SocketLike
}

// Bind - replace the inner socket (called from bindLiveSend, not from tests' FakeSocket path).
func (b *LiveSendBridge) Bind(sock SocketLike) {
	if b == nil {
		return
	}
	b.mu.Lock()
	defer b.mu.Unlock()
	b.sock = sock
}

func (b *LiveSendBridge) inner() (SocketLike, error) {
	if b == nil {
		return nil, errors.New("live send bridge is nil")
	}
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.sock == nil {
		return nil, errors.New("whatsmeow send not bound yet")
	}
	return b.sock, nil
}

func (b *LiveSendBridge) SendPresenceUpdate(presence, jid string) error {
	sock, err := b.inner()
	if err != nil {
		return err
	}
	return sock.SendPresenceUpdate(presence, jid)
}

func (b *LiveSendBridge) SendText(jid, text string) error {
	sock, err := b.inner()
	if err != nil {
		return err
	}
	return sock.SendText(jid, text)
}

func (b *LiveSendBridge) SendMedia(jid, mediaType, mediaURL, caption, fileName string) error {
	sock, err := b.inner()
	if err != nil {
		return err
	}
	return sock.SendMedia(jid, mediaType, mediaURL, caption, fileName)
}
