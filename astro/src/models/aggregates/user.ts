export class User {
  private readonly _email: string;

  constructor(
    public readonly id: string,
    email: string,
  ) {
    this._email = email;
  }

  get email(): string {
    return this._email;
  }

  static reconstitute(id: string, email: string): User {
    return new User(id, email);
  }
}
