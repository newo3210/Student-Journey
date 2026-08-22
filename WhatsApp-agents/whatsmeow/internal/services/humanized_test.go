package services

import (
	"testing"

	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
)

type orderClient struct {
	order *[]string
}

func (c orderClient) SendPresence(to, presence string) (infrastructure.SendResult, error) {
	*c.order = append(*c.order, "presence")
	_ = to
	_ = presence
	return infrastructure.SendResult{Status: 200}, nil
}

func (c orderClient) SendMessage(message contracts.OutboundMessage) (infrastructure.SendResult, error) {
	*c.order = append(*c.order, "send")
	_ = message
	return infrastructure.SendResult{Status: 200, Body: map[string]string{"id": "out"}}, nil
}

func TestPickDelayMS(t *testing.T) {
	if PickDelayMS(20_000, 45_000, func() float64 { return 0 }) != 20_000 {
		t.Fatal("min")
	}
	if PickDelayMS(20_000, 45_000, func() float64 { return 0.999999 }) != 45_000 {
		t.Fatal("max")
	}
	if PickDelayMS(0, 0, nil) != 0 {
		t.Fatal("zero")
	}
}

func TestHumanizedDispatchOrder(t *testing.T) {
	order := []string{}
	sleepCalls := []int{}
	result, err := HumanizedDispatch(BuildTextMessage(contracts.TextOutboundInput{To: "54911", Body: "Hi"}), HumanizedDispatchConfig{
		Client:     orderClient{order: &order},
		MinDelayMS: 100,
		MaxDelayMS: 100,
		Sleep: func(ms int) {
			order = append(order, "sleep")
			sleepCalls = append(sleepCalls, ms)
		},
		Random: func() float64 { return 0 },
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(order) != 3 || order[0] != "presence" || order[1] != "sleep" || order[2] != "send" {
		t.Fatalf("order %v", order)
	}
	if result.DelayMS != 100 || sleepCalls[0] != 100 {
		t.Fatalf("delay %+v %v", result, sleepCalls)
	}
}

func TestHumanizedDispatchZeroDelay(t *testing.T) {
	called := 0
	_, err := HumanizedDispatch(BuildTextMessage(contracts.TextOutboundInput{To: "1", Body: "x"}), HumanizedDispatchConfig{
		Client:     orderClient{order: &[]string{}},
		MinDelayMS: 0,
		MaxDelayMS: 0,
		Sleep:      func(ms int) { called++; if ms != 0 { t.Fatalf("ms %d", ms) } },
	})
	if err != nil || called != 1 {
		t.Fatalf("err %v called %d", err, called)
	}
}
