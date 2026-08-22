package contracts

import "testing"

func TestParseEnvDefaults(t *testing.T) {
	result := ParseEnv(map[string]string{})
	if !result.OK {
		t.Fatalf("expected ok, got %s", result.Error)
	}
	if result.Env.StoreDir != "./whatsmeow_store" {
		t.Fatalf("store dir: %s", result.Env.StoreDir)
	}
	if result.Env.Port != 3004 {
		t.Fatalf("port: %d", result.Env.Port)
	}
	if result.Env.HumanizeMinMS != 20_000 || result.Env.HumanizeMaxMS != 45_000 {
		t.Fatalf("delays: %d %d", result.Env.HumanizeMinMS, result.Env.HumanizeMaxMS)
	}
	if result.Env.MenuMode != "text" {
		t.Fatalf("menu: %s", result.Env.MenuMode)
	}
}

func TestParseEnvRejectsInvertedRange(t *testing.T) {
	result := ParseEnv(map[string]string{"HUMANIZE_MIN_MS": "100", "HUMANIZE_MAX_MS": "50"})
	if result.OK {
		t.Fatal("expected fail")
	}
	if result.Error == "" || !contains(result.Error, "HUMANIZE_MAX_MS") {
		t.Fatalf("error: %s", result.Error)
	}
}

func TestParseEnvProductionRejectsEmptyWebhookSecret(t *testing.T) {
	result := ParseEnv(map[string]string{
		"GO_ENV": "production",
	})
	if result.OK {
		t.Fatal("expected production secret fail")
	}
	if !contains(result.Error, "WHATSMEOW_WEBHOOK_SECRET") {
		t.Fatalf("error: %s", result.Error)
	}
}

func TestParseEnvProductionAcceptsSecret(t *testing.T) {
	result := ParseEnv(map[string]string{
		"GO_ENV":                   "production",
		"WHATSMEOW_WEBHOOK_SECRET": "prod-secret",
	})
	if !result.OK {
		t.Fatalf("expected ok: %s", result.Error)
	}
}

func TestParseEnvProductionRejectsZeroDelay(t *testing.T) {
	result := ParseEnv(map[string]string{
		"NODE_ENV": "production", "HUMANIZE_MIN_MS": "0", "HUMANIZE_MAX_MS": "0",
	})
	if result.OK {
		t.Fatal("expected production floor fail")
	}
}

func TestParseEnvTestAllowsZeroDelay(t *testing.T) {
	result := ParseEnv(map[string]string{
		"GO_ENV": "test", "HUMANIZE_MIN_MS": "0", "HUMANIZE_MAX_MS": "0",
	})
	if !result.OK {
		t.Fatalf("expected ok: %s", result.Error)
	}
	if result.Env.HumanizeMinMS != 0 || result.Env.HumanizeMaxMS != 0 {
		t.Fatal("expected 0/0")
	}
}

func TestParseEnvInvalidCouponURL(t *testing.T) {
	result := ParseEnv(map[string]string{"COUPON_MEDIA_URL": "not-a-url"})
	if result.OK {
		t.Fatal("expected fail")
	}
	if !contains(result.Error, "COUPON_MEDIA_URL") {
		t.Fatalf("error: %s", result.Error)
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 || search(s, sub))
}

func search(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
