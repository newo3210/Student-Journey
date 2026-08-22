package services

import "whatsmeow-agent/internal/contracts"

// BuildTextMessage - adapter sendText shape from validated input.
func BuildTextMessage(input contracts.TextOutboundInput) contracts.OutboundMessage {
	data, err := contracts.ValidateTextInput(input)
	if err != nil {
		return contracts.OutboundMessage{Kind: "text", To: input.To, Text: input.Body}
	}
	return contracts.OutboundMessage{Kind: "text", To: data.To, Text: data.Body}
}

// BuildMediaMessage - document or image for client.SendMedia.
func BuildMediaMessage(input contracts.MediaOutboundInput) contracts.OutboundMessage {
	data, err := contracts.ValidateMediaInput(input)
	if err != nil {
		return contracts.OutboundMessage{
			Kind: "media", To: input.To, MediaType: input.Type, Media: input.Link,
			Caption: input.Caption, FileName: input.Filename,
		}
	}
	return contracts.OutboundMessage{
		Kind: "media", To: data.To, MediaType: data.Type, Media: data.Link,
		Caption: data.Caption, FileName: data.Filename,
	}
}

// BuildInteractiveButtonsMessage - optional/unstable native buttons shape.
func BuildInteractiveButtonsMessage(to, bodyText string) contracts.OutboundMessage {
	return contracts.OutboundMessage{
		Kind:        "buttons",
		To:          to,
		Title:       "Demo bot",
		Description: bodyText,
		Footer:      "WhatsMeow template",
		Buttons: []contracts.OutboundButton{
			{ID: DemoButtonInfo, DisplayText: "Info"},
			{ID: DemoButtonCoupon, DisplayText: "Coupon PDF"},
			{ID: DemoButtonHelp, DisplayText: "Help"},
		},
	}
}

// BuildInteractiveListMessage - optional/unstable list shape.
func BuildInteractiveListMessage(to, bodyText string) contracts.OutboundMessage {
	return contracts.OutboundMessage{
		Kind:        "list",
		To:          to,
		Title:       "Demo bot",
		Description: bodyText,
		ButtonText:  "Options",
		Footer:      "WhatsMeow template",
		Sections: []contracts.OutboundSection{{
			Title: "Menu",
			Rows: []contracts.OutboundRow{
				{ID: DemoButtonInfo, Title: "Info"},
				{ID: DemoButtonCoupon, Title: "Coupon PDF"},
				{ID: DemoButtonHelp, Title: "Help"},
			},
		}},
	}
}
