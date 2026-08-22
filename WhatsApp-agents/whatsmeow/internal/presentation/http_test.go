package presentation

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
)

func testEnv() contracts.AppEnv {
	return contracts.AppEnv{
		StoreDir:       "./whatsmeow_store",
		Port:           3004,
		CouponMediaURL: "https://example.com/coupon.pdf",
		MenuMode:       "text",
		HumanizeMinMS:  0,
		HumanizeMaxMS:  0,
	}
}

func couponBody() []byte {
	raw, _ := json.Marshal(map[string]any{
		"event": "message",
		"payload": map[string]any{
			"id": "W.1", "from": "54911@s.whatsapp.net", "fromMe": false, "body": "coupon",
		},
	})
	return raw
}

func waitFor(t *testing.T, pred func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if pred() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal("timeout waiting for send")
}

func TestHealth(t *testing.T) {
	mux := NewMux(HTTPDeps{Env: testEnv(), Client: &infrastructure.RecordingClient{}, Sleep: func(ms int) {}})
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestWebhookTriggersSend(t *testing.T) {
	client := &infrastructure.RecordingClient{}
	mux := NewMux(HTTPDeps{Env: testEnv(), Client: client, Sleep: func(ms int) {}})
	req := httptest.NewRequest(http.MethodPost, "/webhook", bytes.NewReader(couponBody()))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d body %s", rec.Code, rec.Body.String())
	}
	waitFor(t, func() bool { return client.MessageCalls > 0 && client.LastKind == "media" })
}

func TestWebhookSecretRejectMissing(t *testing.T) {
	client := &infrastructure.RecordingClient{}
	env := testEnv()
	env.WebhookSecret = "shared-secret"
	mux := NewMux(HTTPDeps{Env: env, Client: client, Sleep: func(ms int) {}})
	req := httptest.NewRequest(http.MethodPost, "/webhook", bytes.NewReader(couponBody()))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != 401 {
		t.Fatalf("status %d", rec.Code)
	}
	time.Sleep(50 * time.Millisecond)
	if client.MessageCalls != 0 {
		t.Fatal("must not send")
	}
}

func TestWebhookSecretRejectMismatch(t *testing.T) {
	client := &infrastructure.RecordingClient{}
	env := testEnv()
	env.WebhookSecret = "shared-secret"
	mux := NewMux(HTTPDeps{Env: env, Client: client, Sleep: func(ms int) {}})
	req := httptest.NewRequest(http.MethodPost, "/webhook", bytes.NewReader(couponBody()))
	req.Header.Set("x-webhook-secret", "wrong")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != 403 {
		t.Fatalf("status %d", rec.Code)
	}
	time.Sleep(50 * time.Millisecond)
	if client.MessageCalls != 0 {
		t.Fatal("must not send")
	}
}

func TestWebhookSecretAccept(t *testing.T) {
	client := &infrastructure.RecordingClient{}
	env := testEnv()
	env.WebhookSecret = "shared-secret"
	mux := NewMux(HTTPDeps{Env: env, Client: client, Sleep: func(ms int) {}})
	req := httptest.NewRequest(http.MethodPost, "/webhook", bytes.NewReader(couponBody()))
	req.Header.Set("x-webhook-secret", "shared-secret")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	waitFor(t, func() bool { return client.MessageCalls > 0 })
}

func TestWebhookSkipsOmittedFromMe(t *testing.T) {
	client := &infrastructure.RecordingClient{}
	mux := NewMux(HTTPDeps{Env: testEnv(), Client: client, Sleep: func(ms int) {}})
	raw, _ := json.Marshal(map[string]any{
		"event": "message",
		"payload": map[string]any{"from": "54911@s.whatsapp.net", "id": "OMIT", "body": "coupon"},
	})
	req := httptest.NewRequest(http.MethodPost, "/webhook", bytes.NewReader(raw))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	time.Sleep(50 * time.Millisecond)
	if client.MessageCalls != 0 {
		t.Fatal("must not send")
	}
	_, _ = io.ReadAll(io.NopCloser(bytes.NewReader(nil)))
}
