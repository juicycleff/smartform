import { AuthStrategy, FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";

/**
 * Base class for auth field builders with common functionality
 */
abstract class AuthFieldBuilderBase extends FieldBuilder {
  /**
   * Set whether the field is required
   */
  public required(required: boolean = true): this {
    super.required(required);
    return this;
  }

  /**
   * Set the field help text
   */
  public helpText(helpText: string): this {
    super.helpText(helpText);
    return this;
  }

  /**
   * Set the service ID for authentication
   */
  public serviceId(serviceId: string): this {
    this.property("serviceId", serviceId);
    return this;
  }
}

/**
 * OAuth2 authentication field builder
 */
export class OAuth2Builder extends AuthFieldBuilderBase {
  constructor(id: string, label: string) {
    super(id, FieldType.AUTH, label);
    this.property("authType", AuthStrategy.OAUTH2);
  }

  /**
   * Set the OAuth2 client ID
   */
  public clientId(clientId: string): OAuth2Builder {
    this.property("clientId", clientId);
    return this;
  }

  /**
   * Set the OAuth2 client secret
   */
  public clientSecret(clientSecret: string): OAuth2Builder {
    this.property("clientSecret", clientSecret);
    return this;
  }

  /**
   * Set the OAuth2 authorization URL
   */
  public authorizationUrl(url: string): OAuth2Builder {
    this.property("authorizationUrl", url);
    return this;
  }

  /**
   * Set the OAuth2 token URL
   */
  public tokenUrl(url: string): OAuth2Builder {
    this.property("tokenUrl", url);
    return this;
  }

  /**
   * Set the OAuth2 scopes
   */
  public scopes(scopes: string[]): OAuth2Builder {
    this.property("scopes", scopes);
    return this;
  }

  /**
   * Set the OAuth2 redirect URI
   */
  public redirectUri(uri: string): OAuth2Builder {
    this.property("redirectUri", uri);
    return this;
  }

  /**
   * Set the OAuth2 response type (code or token)
   */
  public responseType(responseType: string): OAuth2Builder {
    this.property("responseType", responseType);
    return this;
  }

  /**
   * Set whether to use state parameter for CSRF protection
   */
  public state(useState: boolean): OAuth2Builder {
    this.property("useState", useState);
    return this;
  }

  /**
   * Set whether to use PKCE (Proof Key for Code Exchange)
   */
  public pkce(usePKCE: boolean): OAuth2Builder {
    this.property("usePKCE", usePKCE);
    return this;
  }

  /**
   * Set whether to auto-refresh tokens
   */
  public autoRefresh(autoRefresh: boolean): OAuth2Builder {
    this.property("autoRefresh", autoRefresh);
    return this;
  }
}

/**
 * Basic authentication field builder
 */
export class BasicAuthBuilder extends AuthFieldBuilderBase {
  constructor(id: string, label: string) {
    super(id, FieldType.AUTH, label);
    this.property("authType", AuthStrategy.BASIC);
  }

  /**
   * Set the username field configuration
   */
  public usernameField(label: string, placeholder: string): BasicAuthBuilder {
    this.property("usernameField", {
      label,
      placeholder,
    });
    return this;
  }

  /**
   * Set the password field configuration
   */
  public passwordField(label: string, placeholder: string): BasicAuthBuilder {
    this.property("passwordField", {
      label,
      placeholder,
    });
    return this;
  }

  /**
   * Add a "remember me" option
   */
  public rememberMe(label: string, defaultValue: boolean): BasicAuthBuilder {
    this.property("rememberMe", {
      label,
      defaultValue,
    });
    return this;
  }
}

/**
 * API key authentication field builder
 */
export class APIKeyBuilder extends AuthFieldBuilderBase {
  constructor(id: string, label: string) {
    super(id, FieldType.AUTH, label);
    this.property("authType", AuthStrategy.API_KEY);
  }

  /**
   * Set the API key name
   */
  public keyName(name: string): APIKeyBuilder {
    this.property("keyName", name);
    return this;
  }

  /**
   * Set where the API key should be placed (header, query, cookie)
   */
  public keyLocation(location: string): APIKeyBuilder {
    this.property("keyLocation", location);
    return this;
  }

  /**
   * Set the placeholder text for the API key input
   */
  public placeholder(placeholder: string): APIKeyBuilder {
    super.placeholder(placeholder);
    return this;
  }
}

/**
 * JWT authentication field builder
 */
export class JWTBuilder extends AuthFieldBuilderBase {
  constructor(id: string, label: string) {
    super(id, FieldType.AUTH, label);
    this.property("authType", AuthStrategy.JWT);
  }

  /**
   * Set the JWT secret key
   */
  public secretKey(key: string): JWTBuilder {
    this.property("secretKey", key);
    return this;
  }

  /**
   * Set the JWT signing algorithm
   */
  public algorithm(algorithm: string): JWTBuilder {
    this.property("algorithm", algorithm);
    return this;
  }

  /**
   * Set the JWT issuer claim
   */
  public issuer(issuer: string): JWTBuilder {
    this.property("issuer", issuer);
    return this;
  }

  /**
   * Set the JWT audience claim
   */
  public audience(audience: string): JWTBuilder {
    this.property("audience", audience);
    return this;
  }

  /**
   * Set the JWT token expiry time in seconds
   */
  public tokenExpiry(seconds: number): JWTBuilder {
    this.property("expirySeconds", seconds);
    return this;
  }
}

/**
 * SAML authentication field builder
 */
export class SAMLBuilder extends AuthFieldBuilderBase {
  constructor(id: string, label: string) {
    super(id, FieldType.AUTH, label);
    this.property("authType", AuthStrategy.SAML);
  }

  /**
   * Set the Identity Provider metadata URL
   */
  public idpMetadataUrl(url: string): SAMLBuilder {
    this.property("idpMetadataUrl", url);
    return this;
  }

  /**
   * Set the Identity Provider metadata XML
   */
  public idpMetadata(metadata: string): SAMLBuilder {
    this.property("idpMetadata", metadata);
    return this;
  }

  /**
   * Set the Assertion Consumer Service URL
   */
  public assertionConsumerServiceUrl(url: string): SAMLBuilder {
    this.property("assertionConsumerServiceUrl", url);
    return this;
  }

  /**
   * Set the Service Provider entity ID
   */
  public spEntityId(entityId: string): SAMLBuilder {
    this.property("spEntityId", entityId);
    return this;
  }

  /**
   * Set the SAML attribute mapping
   */
  public attributeMapping(mapping: Record<string, string>): SAMLBuilder {
    this.property("attributeMapping", mapping);
    return this;
  }

  /**
   * Specify whether to sign SAML requests
   */
  public signRequests(sign: boolean): SAMLBuilder {
    this.property("signRequests", sign);
    return this;
  }
}
