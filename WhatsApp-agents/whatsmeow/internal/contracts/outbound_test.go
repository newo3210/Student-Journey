package contracts

import "testing"

func TestValidateTextAndMedia(t *testing.T) {
	text, err := ValidateTextInput(TextOutboundInput{To: "1", Body: "hi"})
	if err != nil || text.Body != "hi" {
		t.Fatalf("%v %+v", err, text)
	}
	if _, err := ValidateTextInput(TextOutboundInput{To: "", Body: "hi"}); err == nil {
		t.Fatal("expected empty to")
	}
	media, err := ValidateMediaInput(MediaOutboundInput{
		To: "1", Type: "document", Link: "https://example.com/c.pdf",
	})
	if err != nil || media.Type != "document" {
		t.Fatalf("%v %+v", err, media)
	}
	if _, err := ValidateMediaInput(MediaOutboundInput{To: "1", Type: "document", Link: "nope"}); err == nil {
		t.Fatal("expected bad url")
	}
}
