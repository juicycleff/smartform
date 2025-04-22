package smartform

import (
	"database/sql/driver"
	"fmt"
)

// AuthStrategy defines the available authentication strategies
type AuthStrategy string

const (
	AuthStrategyOAuth2 AuthStrategy = "oauth2"
	AuthStrategyBasic  AuthStrategy = "basic"
	AuthStrategyAPIKey AuthStrategy = "apikey"
	AuthStrategyJWT    AuthStrategy = "jwt"
	AuthStrategySAML   AuthStrategy = "saml"
	AuthStrategyCustom AuthStrategy = "custom"
)

// Values provides the possible values for AuthStrategy, compatible with entgo.
func (AuthStrategy) Values() (kinds []string) {
	return []string{
		string(AuthStrategyOAuth2),
		string(AuthStrategyBasic),
		string(AuthStrategyAPIKey),
		string(AuthStrategyJWT),
		string(AuthStrategySAML),
		string(AuthStrategyCustom),
	}
}

// MarshalText implements the encoding.TextMarshaler interface
func (a AuthStrategy) MarshalText() ([]byte, error) {
	return []byte(a), nil
}

// UnmarshalText implements the encoding.TextUnmarshaler interface
func (a *AuthStrategy) UnmarshalText(text []byte) error {
	switch AuthStrategy(text) {
	case AuthStrategyOAuth2, AuthStrategyBasic, AuthStrategyAPIKey, AuthStrategyJWT, AuthStrategySAML, AuthStrategyCustom:
		*a = AuthStrategy(text)
		return nil
	default:
		return fmt.Errorf("invalid AuthStrategy: %s", string(text))
	}
}

// Scan implements the sql.Scanner interface
func (a *AuthStrategy) Scan(value interface{}) error {
	str, ok := value.(string)
	if !ok {
		return fmt.Errorf("AuthStrategy should be a string, got %T", value)
	}
	return a.UnmarshalText([]byte(str))
}

// Value implements the driver.Valuer interface
func (a AuthStrategy) Value() (driver.Value, error) {
	return string(a), nil
}

// AuthFieldBuilderBase provides a common interface for all auth strategy builders
type AuthFieldBuilderBase interface {
	// Common methods all auth builders should implement
	Build() *Field
	Required(required bool) AuthFieldBuilderBase
	HelpText(helpText string) AuthFieldBuilderBase
	ServiceID(serviceID string) AuthFieldBuilderBase
}

// OAuth2Builder provides a fluent API for creating OAuth2 authentication fields
type OAuth2Builder struct {
	authField *AuthFieldBuilder
}

// NewOAuth2Builder creates a new OAuth2 authentication field builder
func NewOAuth2Builder(id, label string) *OAuth2Builder {
	authField := NewAuthFieldBuilder(id, label)
	authField.AuthType(string(AuthStrategyOAuth2))

	return &OAuth2Builder{
		authField: authField,
	}
}

// ClientID sets the OAuth2 client ID
func (ob *OAuth2Builder) ClientID(clientID string) *OAuth2Builder {
	ob.authField.Property("clientId", clientID)
	return ob
}

// ClientSecret sets the OAuth2 client secret
func (ob *OAuth2Builder) ClientSecret(clientSecret string) *OAuth2Builder {
	ob.authField.Property("clientSecret", clientSecret)
	return ob
}

// AuthorizationURL sets the OAuth2 authorization URL
func (ob *OAuth2Builder) AuthorizationURL(url string) *OAuth2Builder {
	ob.authField.Property("authorizationUrl", url)
	return ob
}

// TokenURL sets the OAuth2 token URL
func (ob *OAuth2Builder) TokenURL(url string) *OAuth2Builder {
	ob.authField.Property("tokenUrl", url)
	return ob
}

// Scopes sets the OAuth2 scopes
func (ob *OAuth2Builder) Scopes(scopes []string) *OAuth2Builder {
	ob.authField.Property("scopes", scopes)
	return ob
}

// RedirectURI sets the OAuth2 redirect URI
func (ob *OAuth2Builder) RedirectURI(uri string) *OAuth2Builder {
	ob.authField.Property("redirectUri", uri)
	return ob
}

// ResponseType sets the OAuth2 response type (code or token)
func (ob *OAuth2Builder) ResponseType(responseType string) *OAuth2Builder {
	ob.authField.Property("responseType", responseType)
	return ob
}

// State sets whether to use state parameter for CSRF protection
func (ob *OAuth2Builder) State(useState bool) *OAuth2Builder {
	ob.authField.Property("useState", useState)
	return ob
}

// PKCE sets whether to use PKCE (Proof Key for Code Exchange)
func (ob *OAuth2Builder) PKCE(usePKCE bool) *OAuth2Builder {
	ob.authField.Property("usePKCE", usePKCE)
	return ob
}

// AutoRefresh sets whether to auto-refresh tokens
func (ob *OAuth2Builder) AutoRefresh(autoRefresh bool) *OAuth2Builder {
	ob.authField.Property("autoRefresh", autoRefresh)
	return ob
}

// Required marks the field as required
func (ob *OAuth2Builder) Required(required bool) *OAuth2Builder {
	ob.authField.Required(required)
	return ob
}

// HelpText sets the field help text
func (ob *OAuth2Builder) HelpText(helpText string) *OAuth2Builder {
	ob.authField.HelpText(helpText)
	return ob
}

// ServiceID sets the service ID for authentication
func (ob *OAuth2Builder) ServiceID(serviceID string) *OAuth2Builder {
	ob.authField.ServiceID(serviceID)
	return ob
}

// Build finalizes and returns the OAuth2 auth field
func (ob *OAuth2Builder) Build() *Field {
	return ob.authField.Build()
}

// BasicAuthBuilder provides a fluent API for creating Basic authentication fields
type BasicAuthBuilder struct {
	authField *AuthFieldBuilder
}

// NewBasicAuthBuilder creates a new Basic authentication field builder
func NewBasicAuthBuilder(id, label string) *BasicAuthBuilder {
	authField := NewAuthFieldBuilder(id, label)
	authField.AuthType(string(AuthStrategyBasic))

	return &BasicAuthBuilder{
		authField: authField,
	}
}

// UsernameField sets the username field configuration
func (bb *BasicAuthBuilder) UsernameField(label string, placeholder string) *BasicAuthBuilder {
	bb.authField.Property("usernameField", map[string]string{
		"label":       label,
		"placeholder": placeholder,
	})
	return bb
}

// PasswordField sets the password field configuration
func (bb *BasicAuthBuilder) PasswordField(label string, placeholder string) *BasicAuthBuilder {
	bb.authField.Property("passwordField", map[string]string{
		"label":       label,
		"placeholder": placeholder,
	})
	return bb
}

// RememberMe adds a "remember me" option
func (bb *BasicAuthBuilder) RememberMe(label string, defaultValue bool) *BasicAuthBuilder {
	bb.authField.Property("rememberMe", map[string]interface{}{
		"label":        label,
		"defaultValue": defaultValue,
	})
	return bb
}

// Required marks the field as required
func (bb *BasicAuthBuilder) Required(required bool) *BasicAuthBuilder {
	bb.authField.Required(required)
	return bb
}

// HelpText sets the field help text
func (bb *BasicAuthBuilder) HelpText(helpText string) *BasicAuthBuilder {
	bb.authField.HelpText(helpText)
	return bb
}

// ServiceID sets the service ID for authentication
func (bb *BasicAuthBuilder) ServiceID(serviceID string) *BasicAuthBuilder {
	bb.authField.ServiceID(serviceID)
	return bb
}

// Build finalizes and returns the Basic auth field
func (bb *BasicAuthBuilder) Build() *Field {
	return bb.authField.Build()
}

// APIKeyBuilder provides a fluent API for creating API key authentication fields
type APIKeyBuilder struct {
	authField *AuthFieldBuilder
}

// NewAPIKeyBuilder creates a new API key authentication field builder
func NewAPIKeyBuilder(id, label string) *APIKeyBuilder {
	authField := NewAuthFieldBuilder(id, label)
	authField.AuthType(string(AuthStrategyAPIKey))

	return &APIKeyBuilder{
		authField: authField,
	}
}

// KeyName sets the API key name
func (ab *APIKeyBuilder) KeyName(name string) *APIKeyBuilder {
	ab.authField.Property("keyName", name)
	return ab
}

// KeyLocation sets where the API key should be placed (header, query, cookie)
func (ab *APIKeyBuilder) KeyLocation(location string) *APIKeyBuilder {
	ab.authField.Property("keyLocation", location)
	return ab
}

// Placeholder sets the placeholder text for the API key input
func (ab *APIKeyBuilder) Placeholder(placeholder string) *APIKeyBuilder {
	ab.authField.Property("placeholder", placeholder)
	return ab
}

// Required marks the field as required
func (ab *APIKeyBuilder) Required(required bool) *APIKeyBuilder {
	ab.authField.Required(required)
	return ab
}

// HelpText sets the field help text
func (ab *APIKeyBuilder) HelpText(helpText string) *APIKeyBuilder {
	ab.authField.HelpText(helpText)
	return ab
}

// ServiceID sets the service ID for authentication
func (ab *APIKeyBuilder) ServiceID(serviceID string) *APIKeyBuilder {
	ab.authField.ServiceID(serviceID)
	return ab
}

// Build finalizes and returns the API key auth field
func (ab *APIKeyBuilder) Build() *Field {
	return ab.authField.Build()
}

// JWTBuilder provides a fluent API for creating JWT authentication fields
type JWTBuilder struct {
	authField *AuthFieldBuilder
}

// NewJWTBuilder creates a new JWT authentication field builder
func NewJWTBuilder(id, label string) *JWTBuilder {
	authField := NewAuthFieldBuilder(id, label)
	authField.AuthType(string(AuthStrategyJWT))

	return &JWTBuilder{
		authField: authField,
	}
}

// SecretKey sets the JWT secret key
func (jb *JWTBuilder) SecretKey(key string) *JWTBuilder {
	jb.authField.Property("secretKey", key)
	return jb
}

// Algorithm sets the JWT signing algorithm
func (jb *JWTBuilder) Algorithm(algorithm string) *JWTBuilder {
	jb.authField.Property("algorithm", algorithm)
	return jb
}

// Issuer sets the JWT issuer claim
func (jb *JWTBuilder) Issuer(issuer string) *JWTBuilder {
	jb.authField.Property("issuer", issuer)
	return jb
}

// Audience sets the JWT audience claim
func (jb *JWTBuilder) Audience(audience string) *JWTBuilder {
	jb.authField.Property("audience", audience)
	return jb
}

// TokenExpiry sets the JWT token expiry time in seconds
func (jb *JWTBuilder) TokenExpiry(seconds int) *JWTBuilder {
	jb.authField.Property("expirySeconds", seconds)
	return jb
}

// Required marks the field as required
func (jb *JWTBuilder) Required(required bool) *JWTBuilder {
	jb.authField.Required(required)
	return jb
}

// HelpText sets the field help text
func (jb *JWTBuilder) HelpText(helpText string) *JWTBuilder {
	jb.authField.HelpText(helpText)
	return jb
}

// ServiceID sets the service ID for authentication
func (jb *JWTBuilder) ServiceID(serviceID string) *JWTBuilder {
	jb.authField.ServiceID(serviceID)
	return jb
}

// Build finalizes and returns the JWT auth field
func (jb *JWTBuilder) Build() *Field {
	return jb.authField.Build()
}

// SAMLBuilder provides a fluent API for creating SAML authentication fields
type SAMLBuilder struct {
	authField *AuthFieldBuilder
}

// NewSAMLBuilder creates a new SAML authentication field builder
func NewSAMLBuilder(id, label string) *SAMLBuilder {
	authField := NewAuthFieldBuilder(id, label)
	authField.AuthType(string(AuthStrategySAML))

	return &SAMLBuilder{
		authField: authField,
	}
}

// IdPMetadataURL sets the Identity Provider metadata URL
func (sb *SAMLBuilder) IdPMetadataURL(url string) *SAMLBuilder {
	sb.authField.Property("idpMetadataUrl", url)
	return sb
}

// IdPMetadata sets the Identity Provider metadata XML
func (sb *SAMLBuilder) IdPMetadata(metadata string) *SAMLBuilder {
	sb.authField.Property("idpMetadata", metadata)
	return sb
}

// AssertionConsumerServiceURL sets the Assertion Consumer Service URL
func (sb *SAMLBuilder) AssertionConsumerServiceURL(url string) *SAMLBuilder {
	sb.authField.Property("assertionConsumerServiceUrl", url)
	return sb
}

// SPEntityID sets the Service Provider entity ID
func (sb *SAMLBuilder) SPEntityID(entityID string) *SAMLBuilder {
	sb.authField.Property("spEntityId", entityID)
	return sb
}

// AttributeMapping sets the SAML attribute mapping
func (sb *SAMLBuilder) AttributeMapping(mapping map[string]string) *SAMLBuilder {
	sb.authField.Property("attributeMapping", mapping)
	return sb
}

// SignRequests specifies whether to sign SAML requests
func (sb *SAMLBuilder) SignRequests(sign bool) *SAMLBuilder {
	sb.authField.Property("signRequests", sign)
	return sb
}

// Required marks the field as required
func (sb *SAMLBuilder) Required(required bool) *SAMLBuilder {
	sb.authField.Required(required)
	return sb
}

// HelpText sets the field help text
func (sb *SAMLBuilder) HelpText(helpText string) *SAMLBuilder {
	sb.authField.HelpText(helpText)
	return sb
}

// ServiceID sets the service ID for authentication
func (sb *SAMLBuilder) ServiceID(serviceID string) *SAMLBuilder {
	sb.authField.ServiceID(serviceID)
	return sb
}

// Build finalizes and returns the SAML auth field
func (sb *SAMLBuilder) Build() *Field {
	return sb.authField.Build()
}
