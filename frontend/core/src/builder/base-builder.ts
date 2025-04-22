/**
 * Base builder abstract class with common functionality
 */
export abstract class BaseBuilder<T> {
  protected buildTarget: any;

  constructor(buildTarget: any) {
    this.buildTarget = buildTarget;
  }

  /**
   * Build and return the target object
   */
  public build(): T {
    return this.buildTarget as T;
  }
}
