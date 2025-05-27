import { FieldBuilder } from "./field-builder";
import { AuthStrategy, type Field } from "./types";

/**
 * Base type for all auth builder types
 */
export interface AuthFieldBuilderBase {
  /**
   * Common methods all auth builders should implement
   */
  build(): Field;
  required(required: boolean): AuthFieldBuilderBase;
  helpText(helpText: string): AuthFieldBuilderBase;
  serviceId(serviceId: string): AuthFieldBuilderBase;
}

/**
 * OAuth2Builder provides a fluent API for creating OAuth2 authentication fields
 */
export class OAuth2Builder implements AuthFieldBuilderBase {
  private authField: FieldBuilder;

  /**
   * Creates a new OAuth2 authentication field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    this.authField = new FieldBuilder(id, "auth", label);
    this.authField.property("authType", AuthStrategy.OAuth2);
  }

  /**
   * Sets the OAuth2 client ID
   * @param clientId Client ID
   */
  clientId(clientId: string): OAuth2Builder {
    this.authField.property("clientId", clientId);
    return this;
  }

  /**
   * Sets the OAuth2 client secret
   * @param clientSecret Client secret
   */
  clientSecret(clientSecret: string): OAuth2Builder {
    this.authField.property("clientSecret", clientSecret);
    return this;
  }

  /**
   * Sets the OAuth2 authorization URL
   * @param url Authorization URL
   */
  authorizationUrl(url: string): OAuth2Builder {
    this.authField.property("authorizationUrl", url);
    return this;
  }

  /**
   * Sets the OAuth2 token URL
   * @param url Token URL
   */
  tokenUrl(url: string): OAuth2Builder {
    this.authField.property("tokenUrl", url);
    return this;
  }

  /**
   * Sets the OAuth2 scopes
   * @param scopes Scopes
   */
  scopes(scopes: string[]): OAuth2Builder {
    this.authField.property("scopes", scopes);
    return this;
  }

  /**
   * Sets the OAuth2 redirect URI
   * @param uri Redirect URI
   */
  redirectUri(uri: string): OAuth2Builder {
    this.authField.property("redirectUri", uri);
    return this;
  }

  /**
   * Sets the OAuth2 response type (code or token)
   * @param responseType Response type
   */
  responseType(responseType: string): OAuth2Builder {
    this.authField.property("responseType", responseType);
    return this;
  }

  /**
   * Sets whether to use state parameter for CSRF protection
   * @param useState Whether to use state
   */
  state(useState: boolean): OAuth2Builder {
    this.authField.property("useState", useState);
    return this;
  }

  /**
   * Sets whether to use PKCE (Proof Key for Code Exchange)
   * @param usePKCE Whether to use PKCE
   */
  pkce(usePKCE: boolean): OAuth2Builder {
    this.authField.property("usePKCE", usePKCE);
    return this;
  }

  /**
   * Sets whether to auto-refresh tokens
   * @param autoRefresh Whether to auto-refresh
   */
  autoRefresh(autoRefresh: boolean): OAuth2Builder {
    this.authField.property("autoRefresh", autoRefresh);
    return this;
  }

  /**
   * Marks the field as required
   * @param required Whether the field is required
   */
  required(required = true): OAuth2Builder {
    this.authField.required(required);
    return this;
  }

  /**
   * Sets the field help text
   * @param helpText Help text
   */
  helpText(helpText: string): OAuth2Builder {
    this.authField.helpText(helpText);
    return this;
  }

  /**
   * Sets the service ID for authentication
   * @param serviceId Service ID
   */
  serviceId(serviceId: string): OAuth2Builder {
    this.authField.property("serviceId", serviceId);
    return this;
  }

  /**
   * Finalizes and returns the OAuth2 auth field
   * @returns Completed authentication field
   */
  build(): Field {
    return this.authField.build();
  }
}

/**
 * BasicAuthBuilder provides a fluent API for creating Basic authentication fields
 */
export class BasicAuthBuilder implements AuthFieldBuilderBase {
  private authField: FieldBuilder;

  /**
   * Creates a new Basic authentication field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    this.authField = new FieldBuilder(id, "auth", label);
    this.authField.property("authType", AuthStrategy.Basic);
  }

  /**
   * Sets the username field configuration
   * @param label Field label
   * @param placeholder Field placeholder
   */
  usernameField(label: string, placeholder: string): BasicAuthBuilder {
    this.authField.property("usernameField", {
      label,
      placeholder,
    });
    return this;
  }

  /**
   * Sets the password field configuration
   * @param label Field label
   * @param placeholder Field placeholder
   */
  passwordField(label: string, placeholder: string): BasicAuthBuilder {
    this.authField.property("passwordField", {
      label,
      placeholder,
    });
    return this;
  }

  /**
   * Adds a "remember me" option
   * @param label Option label
   * @param defaultValue Default value
   */
  rememberMe(label: string, defaultValue: boolean): BasicAuthBuilder {
    this.authField.property("rememberMe", {
      label,
      defaultValue,
    });
    return this;
  }

  /**
   * Marks the field as required
   * @param required Whether the field is required
   */
  required(required = true): BasicAuthBuilder {
    this.authField.required(required);
    return this;
  }

  /**
   * Sets the field help text
   * @param helpText Help text
   */
  helpText(helpText: string): BasicAuthBuilder {
    this.authField.helpText(helpText);
    return this;
  }

  /**
   * Sets the service ID for authentication
   * @param serviceId Service ID
   */
  serviceId(serviceId: string): BasicAuthBuilder {
    this.authField.property("serviceId", serviceId);
    return this;
  }

  /**
   * Finalizes and returns the Basic auth field
   * @returns Completed authentication field
   */
  build(): Field {
    return this.authField.build();
  }
}

/**
 * APIKeyBuilder provides a fluent API for creating API key authentication fields
 */
export class APIKeyBuilder implements AuthFieldBuilderBase {
  private authField: FieldBuilder;

  /**
   * Creates a new API key authentication field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    this.authField = new FieldBuilder(id, "auth", label);
    this.authField.property("authType", AuthStrategy.APIKey);
  }

  /**
   * Sets the API key name
   * @param name Key name
   */
  keyName(name: string): APIKeyBuilder {
    this.authField.property("keyName", name);
    return this;
  }

  /**
   * Sets where the API key should be placed (header, query, cookie)
   * @param location Key location
   */
  keyLocation(location: string): APIKeyBuilder {
    this.authField.property("keyLocation", location);
    return this;
  }

  /**
   * Sets the placeholder text for the API key input
   * @param placeholder Placeholder text
   */
  placeholder(placeholder: string): APIKeyBuilder {
    this.authField.property("placeholder", placeholder);
    return this;
  }

  /**
   * Marks the field as required
   * @param required Whether the field is required
   */
  required(required = true): APIKeyBuilder {
    this.authField.required(required);
    return this;
  }

  /**
   * Sets the field help text
   * @param helpText Help text
   */
  helpText(helpText: string): APIKeyBuilder {
    this.authField.helpText(helpText);
    return this;
  }

  /**
   * Sets the service ID for authentication
   * @param serviceId Service ID
   */
  serviceId(serviceId: string): APIKeyBuilder {
    this.authField.property("serviceId", serviceId);
    return this;
  }

  /**
   * Finalizes and returns the API key auth field
   * @returns Completed authentication field
   */
  build(): Field {
    return this.authField.build();
  }
}

/**
 * JWTBuilder provides a fluent API for creating JWT authentication fields
 */
export class JWTBuilder implements AuthFieldBuilderBase {
  private authField: FieldBuilder;

  /**
   * Creates a new JWT authentication field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    this.authField = new FieldBuilder(id, "auth", label);
    this.authField.property("authType", AuthStrategy.JWT);
  }

  /**
   * Sets the JWT secret key
   * @param key Secret key
   */
  secretKey(key: string): JWTBuilder {
    this.authField.property("secretKey", key);
    return this;
  }

  /**
   * Sets the JWT signing algorithm
   * @param algorithm Signing algorithm
   */
  algorithm(algorithm: string): JWTBuilder {
    this.authField.property("algorithm", algorithm);
    return this;
  }

  /**
   * Sets the JWT issuer claim
   * @param issuer Issuer claim
   */
  issuer(issuer: string): JWTBuilder {
    this.authField.property("issuer", issuer);
    return this;
  }

  /**
   * Sets the JWT audience claim
   * @param audience Audience claim
   */
  audience(audience: string): JWTBuilder {
    this.authField.property("audience", audience);
    return this;
  }

  /**
   * Sets the JWT token expiry time in seconds
   * @param seconds Expiry time in seconds
   */
  tokenExpiry(seconds: number): JWTBuilder {
    this.authField.property("expirySeconds", seconds);
    return this;
  }

  /**
   * Marks the field as required
   * @param required Whether the field is required
   */
  required(required = true): JWTBuilder {
    this.authField.required(required);
    return this;
  }

  /**
   * Sets the field help text
   * @param helpText Help text
   */
  helpText(helpText: string): JWTBuilder {
    this.authField.helpText(helpText);
    return this;
  }

  /**
   * Sets the service ID for authentication
   * @param serviceId Service ID
   */
  serviceId(serviceId: string): JWTBuilder {
    this.authField.property("serviceId", serviceId);
    return this;
  }

  /**
   * Finalizes and returns the JWT auth field
   * @returns Completed authentication field
   */
  build(): Field {
    return this.authField.build();
  }
}

/**
 * SAMLBuilder provides a fluent API for creating SAML authentication fields
 */
export class SAMLBuilder implements AuthFieldBuilderBase {
  private authField: FieldBuilder;

  /**
   * Creates a new SAML authentication field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    this.authField = new FieldBuilder(id, "auth", label);
    this.authField.property("authType", AuthStrategy.SAML);
  }

  /**
   * Sets the Identity Provider metadata URL
   * @param url Metadata URL
   */
  idPMetadataURL(url: string): SAMLBuilder {
    this.authField.property("idpMetadataUrl", url);
    return this;
  }

  /**
   * Sets the Identity Provider metadata XML
   * @param metadata Metadata XML
   */
  idPMetadata(metadata: string): SAMLBuilder {
    this.authField.property("idpMetadata", metadata);
    return this;
  }

  /**
   * Sets the Assertion Consumer Service URL
   * @param url ACS URL
   */
  assertionConsumerServiceURL(url: string): SAMLBuilder {
    this.authField.property("assertionConsumerServiceUrl", url);
    return this;
  }

  /**
   * Sets the Service Provider entity ID
   * @param entityId Entity ID
   */
  spEntityId(entityId: string): SAMLBuilder {
    this.authField.property("spEntityId", entityId);
    return this;
  }

  /**
   * Sets the SAML attribute mapping
   * @param mapping Attribute mapping
   */
  attributeMapping(mapping: Record<string, string>): SAMLBuilder {
    this.authField.property("attributeMapping", mapping);
    return this;
  }

  /**
   * Specifies whether to sign SAML requests
   * @param sign Whether to sign requests
   */
  signRequests(sign: boolean): SAMLBuilder {
    this.authField.property("signRequests", sign);
    return this;
  }

  /**
   * Marks the field as required
   * @param required Whether the field is required
   */
  required(required = true): SAMLBuilder {
    this.authField.required(required);
    return this;
  }

  /**
   * Sets the field help text
   * @param helpText Help text
   */
  helpText(helpText: string): SAMLBuilder {
    this.authField.helpText(helpText);
    return this;
  }

  /**
   * Sets the service ID for authentication
   * @param serviceId Service ID
   */
  serviceId(serviceId: string): SAMLBuilder {
    this.authField.property("serviceId", serviceId);
    return this;
  }

  /**
   * Finalizes and returns the SAML auth field
   * @returns Completed authentication field
   */
  build(): Field {
    return this.authField.build();
  }
}
