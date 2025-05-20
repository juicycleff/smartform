package smartform

// DefaultWhen represents a conditional default value
type DefaultWhen struct {
	Condition *Condition  `json:"condition"`
	Value     interface{} `json:"value"`
}
