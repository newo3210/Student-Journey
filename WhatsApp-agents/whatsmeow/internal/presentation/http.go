package presentation

import (
	"crypto/subtle"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
	"whatsmeow-agent/internal/services"
)

type HTTPDeps struct {
	Env    contracts.AppEnv
	Client infrastructure.Client
	Sleep  services.SleepFn
}

// NewMux - health + POST /webhook simulator (thin HTTP).
func NewMux(deps HTTPDeps) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})
	mux.HandleFunc("POST /webhook", func(w http.ResponseWriter, r *http.Request) {
		handleWebhook(w, r, deps)
	})
	return mux
}

func handleWebhook(w http.ResponseWriter, r *http.Request, deps HTTPDeps) {
	if deps.Env.WebhookSecret != "" {
		header := r.Header.Get("x-webhook-secret")
		if header == "" {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
			return
		}
		if !webhookSecretMatches(header, deps.Env.WebhookSecret) {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "forbidden"})
			return
		}
	}

	raw, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid body"})
		return
	}
	var body any
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "received"})

	go func() {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.Printf("Inbound webhook panic: %v", recovered)
			}
		}()
		services.HandleInboundWebhook(body, services.InboundHandlerDeps{
			Client:         deps.Client,
			CouponMediaURL: deps.Env.CouponMediaURL,
			MinDelayMS:     deps.Env.HumanizeMinMS,
			MaxDelayMS:     deps.Env.HumanizeMaxMS,
			MenuMode:       deps.Env.MenuMode,
			Sleep:          deps.Sleep,
		})
	}()
}

func webhookSecretMatches(provided, expected string) bool {
	a := []byte(provided)
	b := []byte(expected)
	if len(a) != len(b) {
		return false
	}
	return subtle.ConstantTimeCompare(a, b) == 1
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
