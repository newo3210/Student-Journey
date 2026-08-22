package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
	"whatsmeow-agent/internal/presentation"
	"whatsmeow-agent/internal/services"
)

func main() {
	parsed := contracts.ParseProcessEnv()
	if !parsed.OK {
		log.Fatal(parsed.Error)
	}
	env := parsed.Env

	send := &infrastructure.LiveSendBridge{}
	sock := infrastructure.NewLiveEventSock()
	sock.SendBind = send.Bind
	client := infrastructure.AdapterClient{Sock: send}

	mux := presentation.NewMux(presentation.HTTPDeps{
		Env:    env,
		Client: client,
		Sleep:  nil,
	})

	infrastructure.WireLiveEvents(sock, infrastructure.WireLiveOptions{
		OnInbound: func(body any) {
			services.HandleInboundWebhook(body, services.InboundHandlerDeps{
				Client:         client,
				CouponMediaURL: env.CouponMediaURL,
				MinDelayMS:     env.HumanizeMinMS,
				MaxDelayMS:     env.HumanizeMaxMS,
				MenuMode:       env.MenuMode,
			})
		},
		PrintQR: infrastructure.PrintWhatsMeowQRToTerminal,
	})

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := infrastructure.StartLiveSession(ctx, env.StoreDir, sock); err != nil && err != context.Canceled {
			infrastructure.LogLiveConnectError(err)
		}
	}()

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", env.Port),
		Handler:           mux,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("WhatsMeow agent listening on %s (POST /webhook simulator)", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = server.Shutdown(shutdownCtx)
}
