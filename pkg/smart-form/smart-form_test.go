package smart-form

import "testing"

func TestSayHello(t *testing.T) {
	result := SayHello("Test")
	expected := "Hello, Test!"
	if result != expected {
		t.Errorf("Expected %s but got %s", expected, result)
	}
}

func TestSayHelloEmpty(t *testing.T) {
	result := SayHello("")
	expected := "Hello, there!"
	if result != expected {
		t.Errorf("Expected %s but got %s", expected, result)
	}
}
