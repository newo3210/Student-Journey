package infrastructure

import (
	"context"
	"fmt"
	"log"
)

// LiveLibraryStart - real WhatsMeow connect (assigned in live_whatsmeow.go init). Tests must not call this.
var LiveLibraryStart func(ctx context.Context, storeDir string, sock *LiveEventSock) error

// StartLiveSession - QR + inbound via linked WhatsMeow library (production binary).
func StartLiveSession(ctx context.Context, storeDir string, sock *LiveEventSock) error {
	if LiveLibraryStart == nil {
		log.Printf("WhatsMeow live library not linked. HTTP simulator is active. Store dir would be %s", storeDir)
		<-ctx.Done()
		return ctx.Err()
	}
	return LiveLibraryStart(ctx, storeDir, sock)
}

// EmitQRFromChannel - maps GetQRChannel-like codes onto the fakeable event sock.
func EmitQRFromChannel(sock *LiveEventSock, code string) {
	if code == "" {
		return
	}
	sock.Emit("qr", code)
}

func LogLiveConnectError(err error) {
	if err != nil {
		log.Println(fmt.Sprintf("WhatsMeow live connect: %v", err))
	}
}
