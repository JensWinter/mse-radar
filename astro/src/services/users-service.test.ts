import { expect, suite, test, vi } from 'vitest';
import { UsersService } from '@services/users-service.ts';
import { type UsersRepository } from '@database/users-repository.ts';
import { User } from '@models/aggregates/user.ts';

suite('UserService', () => {
  suite('getOrCreateUser()', () => {
    test('returns existing user if user already exists', async () => {
      // Arrange
      const email = 'existing@example.com';
      const userId = 'user-123';
      const user = new User(userId, email);
      const mockRepository: UsersRepository = {
        save: vi.fn(),
        existsByEmail: vi.fn(),
        findByEmail: vi.fn().mockResolvedValue(user),
        findById: vi.fn(),
      };
      const usersService = new UsersService(mockRepository);

      // Act
      const result = await usersService.getOrCreateUser(email);

      // Assert
      expect(result).toBe(user);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    test('creates and returns a new user if user does not exist', async () => {
      // Arrange
      const email = 'new@example.com';

      const mockRepository: UsersRepository = {
        save: vi.fn(),
        existsByEmail: vi.fn(),
        findByEmail: vi
          .fn()
          .mockResolvedValueOnce(null)
          .mockImplementationOnce(
            async (_: string) => (mockRepository.save as any).mock.calls[0][0],
          ),
        findById: vi.fn(),
      };
      const usersService = new UsersService(mockRepository);

      // Act
      const result = await usersService.getOrCreateUser(email);

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe(email);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.findByEmail).toHaveBeenCalledTimes(2);
      expect(mockRepository.findByEmail).toHaveBeenNthCalledWith(1, email);
      expect(mockRepository.findByEmail).toHaveBeenNthCalledWith(2, email);
    });
  });

  suite('createUser()', () => {
    test('creates a new user with hashed password', async () => {
      // Arrange
      const mockRepository: UsersRepository = {
        save: vi.fn().mockResolvedValue(undefined),
        existsByEmail: vi.fn().mockResolvedValue(false),
        findByEmail: vi.fn(),
        findById: vi.fn(),
      };
      const usersService = new UsersService(mockRepository);
      const email = 'laura@example.com';

      // Act
      const userId = await usersService.createUser(email);

      // Assert
      expect(userId).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedUser = (mockRepository.save as any).mock.calls[0][0] as User;
      expect(savedUser.id).toBe(userId);
      expect(savedUser.email).toBe(email);
    });
  });
});
