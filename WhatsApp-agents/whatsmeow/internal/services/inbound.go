package services

import (
	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
)

type InboundHandlerDeps struct {
	Client         infrastructure.Client
	CouponMediaURL string
	MinDelayMS     int
	MaxDelayMS     int
	MenuMode       string
	Sleep          SleepFn
}

type HandleInboundResult struct {
	Handled bool
	Sent    int
}

// HandleInboundWebhook - parses simulator POST body and humanized-sends demo replies.
func HandleInboundWebhook(body any, deps InboundHandlerDeps) HandleInboundResult {
	event := contracts.ExtractInboundEvent(body)
	if event == nil {
		return HandleInboundResult{}
	}

	action := ResolveDemoAction(event.Type, event.TextBody, event.InteractiveID, DemoFlowOptions{
		CouponMediaURL: deps.CouponMediaURL,
		MenuMode:       deps.MenuMode,
	})
	messages := BindRecipient(action.Messages, event.From)
	if len(messages) == 0 {
		return HandleInboundResult{Handled: true, Sent: 0}
	}

	sent, _ := HumanizedSendAll(messages, HumanizedDispatchConfig{
		Client:     deps.Client,
		MinDelayMS: deps.MinDelayMS,
		MaxDelayMS: deps.MaxDelayMS,
		Sleep:      deps.Sleep,
	})
	return HandleInboundResult{Handled: true, Sent: sent}
}
