package smartform

import "testing"

func TestHelloWorld(t *testing.T) {
	expected := "Hello from smartform!"
	if got := HelloWorld(); got != expected {
		t.Errorf("HelloWorld() = %q, want %q", got, expected)
	}
}
