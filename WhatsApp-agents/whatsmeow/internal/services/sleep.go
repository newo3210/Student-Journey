package services

import "time"

// defaultSleep - wall-clock delay (production path).
func defaultSleep(ms int) {
	if ms <= 0 {
		return
	}
	time.Sleep(time.Duration(ms) * time.Millisecond)
}
