package infrastructure

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"google.golang.org/protobuf/proto"
	_ "modernc.org/sqlite"
)

func init() {
	LiveLibraryStart = startWhatsmeowLibrary
}

// Compile-time: live client implements SocketLike (go test never calls Connect).
var _ SocketLike = (*WhatsMeowSocket)(nil)

// WhatsMeowSocket - presence/text/media through whatsmeow.Client.
type WhatsMeowSocket struct {
	Client *whatsmeow.Client
	HTTP   *http.Client
}

func (s *WhatsMeowSocket) httpClient() *http.Client {
	if s.HTTP != nil {
		return s.HTTP
	}
	return &http.Client{Timeout: 30 * time.Second}
}

// SendPresenceUpdate - chat composing/paused via SendChatPresence.
func (s *WhatsMeowSocket) SendPresenceUpdate(presence, jid string) error {
	parsed, err := types.ParseJID(jid)
	if err != nil {
		return err
	}
	state := types.ChatPresenceComposing
	if presence == "paused" || presence == "unavailable" {
		state = types.ChatPresencePaused
	}
	return s.Client.SendChatPresence(context.Background(), parsed, state, types.ChatPresenceMediaText)
}

// SendText - conversation message through the live client.
func (s *WhatsMeowSocket) SendText(jid, text string) error {
	parsed, err := types.ParseJID(jid)
	if err != nil {
		return err
	}
	_, err = s.Client.SendMessage(context.Background(), parsed, &waE2E.Message{
		Conversation: proto.String(text),
	})
	return err
}

// SendMedia - download URL, Upload, then image/document message.
func (s *WhatsMeowSocket) SendMedia(jid, mediaType, mediaURL, caption, fileName string) error {
	parsed, err := types.ParseJID(jid)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, mediaURL, nil)
	if err != nil {
		return err
	}
	resp, err := s.httpClient().Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("media download status %d", resp.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(resp.Body, 16<<20))
	if err != nil {
		return err
	}

	isImage := mediaType == "image" || strings.HasSuffix(strings.ToLower(fileName), ".png") || strings.HasSuffix(strings.ToLower(fileName), ".jpg") || strings.HasSuffix(strings.ToLower(fileName), ".jpeg")
	appInfo := whatsmeow.MediaDocument
	if isImage {
		appInfo = whatsmeow.MediaImage
	}
	uploaded, err := s.Client.Upload(context.Background(), body, appInfo)
	if err != nil {
		return err
	}

	var msg *waE2E.Message
	if isImage {
		mime := "image/jpeg"
		if strings.HasSuffix(strings.ToLower(fileName), ".png") {
			mime = "image/png"
		}
		msg = &waE2E.Message{
			ImageMessage: &waE2E.ImageMessage{
				Caption:       proto.String(caption),
				Mimetype:      proto.String(mime),
				URL:           proto.String(uploaded.URL),
				DirectPath:    proto.String(uploaded.DirectPath),
				MediaKey:      uploaded.MediaKey,
				FileEncSHA256: uploaded.FileEncSHA256,
				FileSHA256:    uploaded.FileSHA256,
				FileLength:    proto.Uint64(uploaded.FileLength),
			},
		}
	} else {
		if fileName == "" {
			fileName = "coupon.pdf"
		}
		msg = &waE2E.Message{
			DocumentMessage: &waE2E.DocumentMessage{
				Caption:       proto.String(caption),
				Mimetype:      proto.String("application/pdf"),
				FileName:      proto.String(fileName),
				URL:           proto.String(uploaded.URL),
				DirectPath:    proto.String(uploaded.DirectPath),
				MediaKey:      uploaded.MediaKey,
				FileEncSHA256: uploaded.FileEncSHA256,
				FileSHA256:    uploaded.FileSHA256,
				FileLength:    proto.Uint64(uploaded.FileLength),
			},
		}
	}
	_, err = s.Client.SendMessage(context.Background(), parsed, msg)
	return err
}

// startWhatsmeowLibrary - sqlstore + GetQRChannel + inbound Message events (tests must not call this).
func startWhatsmeowLibrary(ctx context.Context, storeDir string, sock *LiveEventSock) error {
	if err := os.MkdirAll(storeDir, 0o700); err != nil {
		return err
	}
	dsn := fmt.Sprintf("file:%s/whatsmeow.db?_pragma=foreign_keys(1)", storeDir)
	container, err := sqlstore.New(ctx, "sqlite", dsn, waLog.Noop)
	if err != nil {
		return err
	}
	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		return err
	}
	client := whatsmeow.NewClient(deviceStore, waLog.Stdout("whatsmeow", "INFO", true))
	bindLiveSend(client, sock)

	client.AddEventHandler(func(evt any) {
		switch v := evt.(type) {
		case *events.Message:
			fromMe := v.Info.IsFromMe
			text := v.Message.GetConversation()
			if text == "" && v.Message.GetExtendedTextMessage() != nil {
				text = v.Message.GetExtendedTextMessage().GetText()
			}
			sock.Emit("message", NewLiveMessage(v.Info.Chat.String(), fromMe, v.Info.ID, text))
		}
	})

	if client.Store.ID == nil {
		qrChan, err := client.GetQRChannel(ctx)
		if err != nil {
			return err
		}
		err = client.Connect()
		if err != nil {
			return err
		}
		for evt := range qrChan {
			if evt.Event == "code" {
				EmitQRFromChannel(sock, evt.Code)
			}
		}
	} else {
		if err := client.Connect(); err != nil {
			return err
		}
	}

	<-ctx.Done()
	client.Disconnect()
	return ctx.Err()
}

// bindLiveSend - attach WhatsMeowSocket to LiveEventSock.SendBind (not a no-op).
func bindLiveSend(client *whatsmeow.Client, sock *LiveEventSock) {
	if client == nil || sock == nil {
		return
	}
	adapter := &WhatsMeowSocket{Client: client}
	if sock.SendBind != nil {
		sock.SendBind(adapter)
	}
	log.Println("WhatsMeow send/presence bound to live client")
}
