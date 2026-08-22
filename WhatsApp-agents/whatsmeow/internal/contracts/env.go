package contracts

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

// AppEnv - validated configuration used across layers after startup parse.
type AppEnv struct {
	StoreDir          string
	Port              int
	CouponMediaURL    string
	MenuMode          string
	WebhookSecret     string
	GoEnv             string
	HumanizeMinMS     int
	HumanizeMaxMS     int
}

// EnvParseResult - either validated config or a clear invalid-keys error.
type EnvParseResult struct {
	OK    bool
	Env   AppEnv
	Error string
}

// ParseEnv - fail-fast env validation (defaults, production delay floor).
func ParseEnv(raw map[string]string) EnvParseResult {
	storeDir := pick(raw, "WHATSMEOW_STORE_DIR", "./whatsmeow_store")
	if strings.TrimSpace(storeDir) == "" {
		return fail("WHATSMEOW_STORE_DIR: must be non-empty")
	}

	port, err := parseInt(pick(raw, "PORT", "3004"))
	if err != nil || port <= 0 {
		return fail("PORT: must be a positive integer")
	}

	coupon := pick(raw, "COUPON_MEDIA_URL", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
	if _, err := url.ParseRequestURI(coupon); err != nil {
		return fail("COUPON_MEDIA_URL: must be a valid URL")
	}

	menuMode := pick(raw, "WHATSMEOW_MENU_MODE", "text")
	switch menuMode {
	case "text", "buttons", "list":
	default:
		return fail("WHATSMEOW_MENU_MODE: must be text, buttons, or list")
	}

	minMS, err := parseInt(pick(raw, "HUMANIZE_MIN_MS", "20000"))
	if err != nil || minMS < 0 {
		return fail("HUMANIZE_MIN_MS: must be a non-negative integer")
	}
	maxMS, err := parseInt(pick(raw, "HUMANIZE_MAX_MS", "45000"))
	if err != nil || maxMS < 0 {
		return fail("HUMANIZE_MAX_MS: must be a non-negative integer")
	}
	if maxMS < minMS {
		return fail("HUMANIZE_MAX_MS: HUMANIZE_MAX_MS must be >= HUMANIZE_MIN_MS")
	}

	goEnv := pick(raw, "GO_ENV", "")
	if goEnv == "" {
		goEnv = pick(raw, "NODE_ENV", "")
	}

	secret := strings.TrimSpace(pick(raw, "WHATSMEOW_WEBHOOK_SECRET", ""))

	if goEnv == "production" {
		if minMS < 20_000 {
			return fail("HUMANIZE_MIN_MS: HUMANIZE_MIN_MS must be >= 20000 when GO_ENV/NODE_ENV is production")
		}
		if maxMS < 45_000 {
			return fail("HUMANIZE_MAX_MS: HUMANIZE_MAX_MS must be >= 45000 when GO_ENV/NODE_ENV is production")
		}
		if secret == "" {
			return fail("WHATSMEOW_WEBHOOK_SECRET: must be non-empty when GO_ENV/NODE_ENV is production")
		}
	}

	return EnvParseResult{
		OK: true,
		Env: AppEnv{
			StoreDir:       storeDir,
			Port:           port,
			CouponMediaURL: coupon,
			MenuMode:       menuMode,
			WebhookSecret:  secret,
			GoEnv:          goEnv,
			HumanizeMinMS:  minMS,
			HumanizeMaxMS:  maxMS,
		},
	}
}

// ParseProcessEnv - reads os.Getenv keys used by ParseEnv.
func ParseProcessEnv() EnvParseResult {
	keys := []string{
		"WHATSMEOW_STORE_DIR", "PORT", "COUPON_MEDIA_URL", "WHATSMEOW_MENU_MODE",
		"HUMANIZE_MIN_MS", "HUMANIZE_MAX_MS", "WHATSMEOW_WEBHOOK_SECRET", "GO_ENV", "NODE_ENV",
	}
	raw := make(map[string]string, len(keys))
	for _, key := range keys {
		if value, ok := os.LookupEnv(key); ok {
			raw[key] = value
		}
	}
	return ParseEnv(raw)
}

func pick(raw map[string]string, key, fallback string) string {
	if raw == nil {
		return fallback
	}
	if value, ok := raw[key]; ok && value != "" {
		return value
	}
	return fallback
}

func parseInt(value string) (int, error) {
	n, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return 0, err
	}
	return n, nil
}

func fail(message string) EnvParseResult {
	return EnvParseResult{OK: false, Error: fmt.Sprintf("Invalid environment configuration: %s", message)}
}
