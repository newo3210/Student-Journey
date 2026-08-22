package services

import "whatsmeow-agent/internal/contracts"

const (
	DemoButtonInfo   = "menu_info"
	DemoButtonCoupon = "menu_coupon"
	DemoButtonHelp   = "menu_help"
)

type DemoFlowOptions struct {
	CouponMediaURL string
	MenuMode       string
}

type DemoAction struct {
	Messages []contracts.OutboundMessage
}

// ResolveDemoAction - maps keyword or interactive id to outbound messages.
func ResolveDemoAction(inputType, textBody, interactiveID string, options DemoFlowOptions) DemoAction {
	to := "__TO__"
	menuMode := options.MenuMode
	if menuMode == "" {
		menuMode = "text"
	}

	if inputType == "interactive" && interactiveID != "" {
		return resolveInteractive(interactiveID, to, options)
	}
	if inputType != "text" {
		return DemoAction{}
	}

	text := stringsToLowerTrim(textBody)

	if text == "1" || text == "info" || text == DemoButtonInfo {
		return resolveInteractive(DemoButtonInfo, to, options)
	}
	if text == "3" || text == "help" || text == DemoButtonHelp {
		return resolveInteractive(DemoButtonHelp, to, options)
	}

	if isMenuKeyword(text) || text == "" {
		return DemoAction{Messages: []contracts.OutboundMessage{buildMenuMessage(to, menuMode)}}
	}

	if isCouponKeyword(text) || text == DemoButtonCoupon {
		return DemoAction{Messages: []contracts.OutboundMessage{BuildMediaMessage(contracts.MediaOutboundInput{
			To:       to,
			Type:     "document",
			Link:     options.CouponMediaURL,
			Caption:  "Your demo coupon PDF",
			Filename: "coupon.pdf",
		})}}
	}

	return DemoAction{Messages: []contracts.OutboundMessage{BuildTextMessage(contracts.TextOutboundInput{
		To:   to,
		Body: `You said: "` + textBody + `". Send "menu" for options or "coupon" for a PDF.`,
	})}}
}

// BindRecipient - replaces placeholder `to` with the real WhatsApp user id.
func BindRecipient(messages []contracts.OutboundMessage, to string) []contracts.OutboundMessage {
	out := make([]contracts.OutboundMessage, len(messages))
	for i, message := range messages {
		message.To = to
		out[i] = message
	}
	return out
}

func buildMenuMessage(to, menuMode string) contracts.OutboundMessage {
	bodyText := "Choose an option to continue the Level 1 demo.\n1) Info\n2) Coupon PDF\n3) Help"

	if menuMode == "buttons" {
		return BuildInteractiveButtonsMessage(to, bodyText)
	}
	if menuMode == "list" {
		return BuildInteractiveListMessage(to, bodyText)
	}

	return BuildTextMessage(contracts.TextOutboundInput{
		To:   to,
		Body: "Demo bot — " + bodyText + "\nReply with 1, 2, 3, or keywords info / coupon / help.",
	})
}

func resolveInteractive(interactiveID, to string, options DemoFlowOptions) DemoAction {
	switch interactiveID {
	case DemoButtonInfo:
		return DemoAction{Messages: []contracts.OutboundMessage{BuildTextMessage(contracts.TextOutboundInput{
			To:   to,
			Body: "This is the WhatsMeow Level 1 demo: text, numbered menu (native buttons unstable), and media with presence+delay humanization.",
		})}}
	case DemoButtonCoupon:
		return DemoAction{Messages: []contracts.OutboundMessage{
			BuildTextMessage(contracts.TextOutboundInput{To: to, Body: "Sending your coupon document…"}),
			BuildMediaMessage(contracts.MediaOutboundInput{
				To: to, Type: "document", Link: options.CouponMediaURL, Caption: "Demo coupon", Filename: "coupon.pdf",
			}),
		}}
	case DemoButtonHelp:
		return DemoAction{Messages: []contracts.OutboundMessage{BuildTextMessage(contracts.TextOutboundInput{
			To:   to,
			Body: "Keywords: menu | coupon | hi. Options: 1 Info, 2 Coupon PDF, 3 Help. Native buttons/list are unstable on WhatsMeow; default is numbered text.",
		})}}
	default:
		return DemoAction{Messages: []contracts.OutboundMessage{BuildTextMessage(contracts.TextOutboundInput{
			To:   to,
			Body: `Unknown option "` + interactiveID + `". Send "menu" to try again.`,
		})}}
	}
}

func isMenuKeyword(text string) bool {
	switch text {
	case "hi", "hello", "hola", "menu", "start", "ayuda":
		return true
	default:
		return false
	}
}

func isCouponKeyword(text string) bool {
	switch text {
	case "coupon", "cupon", "pdf", "promo", "2":
		return true
	default:
		return false
	}
}

func stringsToLowerTrim(value string) string {
	out := make([]rune, 0, len(value))
	started := false
	for _, r := range value {
		if !started && (r == ' ' || r == '\t' || r == '\n' || r == '\r') {
			continue
		}
		started = true
		if r >= 'A' && r <= 'Z' {
			r += 'a' - 'A'
		}
		out = append(out, r)
	}
	for len(out) > 0 {
		last := out[len(out)-1]
		if last == ' ' || last == '\t' || last == '\n' || last == '\r' {
			out = out[:len(out)-1]
			continue
		}
		break
	}
	return string(out)
}
