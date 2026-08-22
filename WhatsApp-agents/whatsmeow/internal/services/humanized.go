package services

import (
	"log"
	"math/rand"

	"whatsmeow-agent/internal/contracts"
	"whatsmeow-agent/internal/infrastructure"
)

// SleepFn - injectable delay used by humanized dispatch (tests inject no-op).
type SleepFn func(ms int)

// HumanizedDispatchConfig - delay range, client adapter, optional sleep inject.
type HumanizedDispatchConfig struct {
	Client     infrastructure.Client
	MinDelayMS int
	MaxDelayMS int
	Sleep      SleepFn
	Random     func() float64
}

type HumanizedDispatchResult struct {
	PresenceStatus int
	SendStatus     int
	DelayMS        int
	SendBody       any
}

// PickDelayMS - inclusive random integer between min and max (ms).
func PickDelayMS(minDelayMS, maxDelayMS int, random func() float64) int {
	if maxDelayMS <= minDelayMS {
		return minDelayMS
	}
	if random == nil {
		random = rand.Float64
	}
	span := maxDelayMS - minDelayMS + 1
	return minDelayMS + int(random()*float64(span))
}

// HumanizedDispatch - composing presence → stochastic delay → send. No Redis/BullMQ.
func HumanizedDispatch(message contracts.OutboundMessage, config HumanizedDispatchConfig) (HumanizedDispatchResult, error) {
	sleep := config.Sleep
	if sleep == nil {
		sleep = defaultSleep
	}
	delayMS := PickDelayMS(config.MinDelayMS, config.MaxDelayMS, config.Random)

	presence, err := config.Client.SendPresence(message.To, "composing")
	if err != nil {
		return HumanizedDispatchResult{PresenceStatus: 500, DelayMS: delayMS}, err
	}
	sleep(delayMS)
	send, err := config.Client.SendMessage(message)
	if err != nil {
		return HumanizedDispatchResult{
			PresenceStatus: presence.Status,
			SendStatus:     500,
			DelayMS:        delayMS,
			SendBody:       send.Body,
		}, err
	}

	return HumanizedDispatchResult{
		PresenceStatus: presence.Status,
		SendStatus:     send.Status,
		DelayMS:        delayMS,
		SendBody:       send.Body,
	}, nil
}

// HumanizedSendAll - dispatches each outbound message through presence+delay.
func HumanizedSendAll(messages []contracts.OutboundMessage, config HumanizedDispatchConfig) (sent int, results []HumanizedDispatchResult) {
	for _, message := range messages {
		result, err := HumanizedDispatch(message, config)
		results = append(results, result)
		if err != nil {
			log.Printf("WhatsMeow send failed: %v kind=%s to=%s", err, message.Kind, message.To)
			continue
		}
		if result.SendStatus >= 200 && result.SendStatus < 300 {
			sent++
		} else {
			log.Printf("WhatsMeow send failed (non-2xx) status=%d kind=%s to=%s", result.SendStatus, message.Kind, message.To)
		}
	}
	return sent, results
}
