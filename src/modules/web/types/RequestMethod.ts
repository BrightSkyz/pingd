
export class RequestMethod {
  static readonly DELETE = new RequestMethod("DELETE", 1);
  static readonly GET = new RequestMethod("GET", 2);
  static readonly HEAD = new RequestMethod("HEAD", 3);
  static readonly PATCH = new RequestMethod("PATCH", 4);
  static readonly POST = new RequestMethod("POST", 5);
  static readonly PUT = new RequestMethod("PUT", 6);

  private readonly key: string;
  private readonly code: number;

  private constructor(key: string, code: number) {
    this.key = key;
    this.code = code;
  }

  getKey(): string {
    return this.key;
  }

  getCode(): number {
    return this.code;
  }

  toString(): string {
    return this.key;
  }
}