import type { UsersRepository } from '@database/users-repository.ts';
import { User } from '@models/aggregates/user.ts';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getOrCreateUser(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (user) {
      return user;
    }
    await this.createUser(email);

    return await this.usersRepository.findByEmail(email);
  }

  async createUser(email: string) {
    const userId = crypto.randomUUID();
    const user = new User(userId, email);
    await this.usersRepository.save(user);
    return userId;
  }
}
