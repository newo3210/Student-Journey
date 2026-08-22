package services

import "testing"

func TestResolveDemoActionMenuAndCoupon(t *testing.T) {
	coupon := "https://example.com/coupon.pdf"
	menu := ResolveDemoAction("text", "menu", "", DemoFlowOptions{CouponMediaURL: coupon})
	if len(menu.Messages) != 1 || menu.Messages[0].Kind != "text" {
		t.Fatalf("%+v", menu)
	}
	if !contains(menu.Messages[0].Text, "1) Info") {
		t.Fatalf("menu text: %s", menu.Messages[0].Text)
	}

	buttons := ResolveDemoAction("text", "menu", "", DemoFlowOptions{CouponMediaURL: coupon, MenuMode: "buttons"})
	if buttons.Messages[0].Kind != "buttons" {
		t.Fatalf("kind %s", buttons.Messages[0].Kind)
	}

	couponAction := ResolveDemoAction("text", "coupon", "", DemoFlowOptions{CouponMediaURL: coupon})
	if couponAction.Messages[0].Kind != "media" || couponAction.Messages[0].MediaType != "document" {
		t.Fatalf("%+v", couponAction)
	}

	interactive := ResolveDemoAction("interactive", "", DemoButtonCoupon, DemoFlowOptions{CouponMediaURL: coupon})
	if len(interactive.Messages) != 2 {
		t.Fatalf("len %d", len(interactive.Messages))
	}

	bound := BindRecipient(menu.Messages, "549119999")
	if bound[0].To != "549119999" {
		t.Fatal("bind")
	}

	if len(ResolveDemoAction("image", "", "", DemoFlowOptions{CouponMediaURL: coupon}).Messages) != 0 {
		t.Fatal("image should not open menu")
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && search(s, sub)
}

func search(s, sub string) bool {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
