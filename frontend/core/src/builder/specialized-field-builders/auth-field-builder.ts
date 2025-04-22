import { FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";

/**
 * Authentication field builder for creating authentication fields
 */
export class AuthFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.AUTH, label);
  }

  /**
   * Set the authentication type
   */
  public authType(authType: string): AuthFieldBuilder {
    this.property("authType", authType);
    return this;
  }

  /**
   * Set the service ID for authentication
   */
  public serviceId(serviceId: string): AuthFieldBuilder {
    this.property("serviceId", serviceId);
    return this;
  }
}
