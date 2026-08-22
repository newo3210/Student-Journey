package contracts

import (
	"errors"
	"net/url"
	"strings"
)

// OutboundMessage - discriminated kinds for adapter + humanizer.
type OutboundMessage struct {
	Kind        string
	To          string
	Text        string
	Title       string
	Description string
	Footer      string
	ButtonText  string
	Buttons     []OutboundButton
	Sections    []OutboundSection
	MediaType   string
	Media       string
	Caption     string
	FileName    string
}

type OutboundButton struct {
	ID          string
	DisplayText string
}

type OutboundSection struct {
	Title string
	Rows  []OutboundRow
}

type OutboundRow struct {
	ID          string
	Title       string
	Description string
}

type TextOutboundInput struct {
	To   string
	Body string
}

type MediaOutboundInput struct {
	To       string
	Type     string
	Link     string
	Caption  string
	Filename string
}

type InteractiveButtonsInput struct {
	To         string
	BodyText   string
	Buttons    []struct{ ID, Title string }
	HeaderText string
	FooterText string
}

type InteractiveListInput struct {
	To         string
	BodyText   string
	ButtonText string
	HeaderText string
	FooterText string
	Sections   []struct {
		Title string
		Rows  []struct {
			ID          string
			Title       string
			Description string
		}
	}
}

var (
	errEmptyTo   = errors.New("to must be non-empty")
	errEmptyBody = errors.New("body must be non-empty")
	errMediaURL  = errors.New("media link must be a valid URL")
)

// ValidateTextInput - destination and non-empty body.
func ValidateTextInput(input TextOutboundInput) (TextOutboundInput, error) {
	input.To = strings.TrimSpace(input.To)
	input.Body = strings.TrimSpace(input.Body)
	if input.To == "" {
		return input, errEmptyTo
	}
	if input.Body == "" {
		return input, errEmptyBody
	}
	return input, nil
}

// ValidateMediaInput - image or document with HTTPS/HTTP URL.
func ValidateMediaInput(input MediaOutboundInput) (MediaOutboundInput, error) {
	input.To = strings.TrimSpace(input.To)
	input.Type = strings.TrimSpace(input.Type)
	input.Link = strings.TrimSpace(input.Link)
	if input.To == "" {
		return input, errEmptyTo
	}
	if input.Type != "image" && input.Type != "document" {
		return input, errors.New("media type must be image or document")
	}
	if _, err := url.ParseRequestURI(input.Link); err != nil {
		return input, errMediaURL
	}
	return input, nil
}
