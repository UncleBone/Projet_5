import { describe, it, expect, vi } from 'vitest';
import { UserService } from './user.service'; // adaptez le chemin si besoin
import { UserRepo } from '../repository/user.repo';
import { RegisterSchema } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { generateToken } from '../lib/jwt';
import { faker } from '@faker-js/faker';

const ser = new UserService();

const fakeUserId = faker.number.int();
const fakeUser = {
  id: fakeUserId,
  username: faker.internet.username(),
  email: faker.internet.email(),
};

const fakeUpdatedUserWithPassword = {
  ...fakeUser,
  password: faker.internet.password(),
};

describe('UserService', () => {
  describe('getUserSubscriptions', () => {
    it('récupère les abonnements d’un utilisateur', async () => {
      const fakeSubs = [{ id: 1, name: 'Topic1' }, { id: 2, name: 'Topic2' }];
      vi.spyOn(UserRepo.prototype, 'getSubscriptions').mockResolvedValue(fakeSubs);

      const subs = await ser.getUserSubscriptions(fakeUserId);

      expect(UserRepo.prototype.getSubscriptions).toHaveBeenCalledWith(fakeUserId);
      expect(subs).toEqual(fakeSubs);
    });
  });

  describe('getUserInfo', () => {
    it('récupère les infos utilisateur par id', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserById').mockResolvedValue(fakeUser);

      const user = await ser.getUserInfo(fakeUserId);

      expect(UserRepo.prototype.getUserById).toHaveBeenCalledWith(fakeUserId);
      expect(user).toEqual(fakeUser);
    });
  });

  describe('addSubscription', () => {
    it('ajoute une subscription', async () => {
      const addSpy = vi.spyOn(UserRepo.prototype, 'addSubscription').mockResolvedValue(undefined);

      await ser.addSubscription(fakeUserId, 123);

      expect(addSpy).toHaveBeenCalledWith(fakeUserId, 123);
    });
  });

  describe('removeSubscription', () => {
    it('supprime une subscription', async () => {
      const removeSpy = vi.spyOn(UserRepo.prototype, 'removeSubscription').mockResolvedValue(undefined);

      await ser.removeSubscription(fakeUserId, 123);

      expect(removeSpy).toHaveBeenCalledWith(fakeUserId, 123);
    });
  });

  describe('update', () => {
    it('met à jour l’utilisateur avec succès et renvoie AuthResponse', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(null);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue(null);
      vi.spyOn(RegisterSchema, 'parse').mockImplementation((data) => data);
      vi.spyOn(UserRepo.prototype, 'updateUser').mockResolvedValue(fakeUpdatedUserWithPassword);
      const updateBody = {

        username: fakeUser.username,
        email: fakeUser.email,
        password: 'password',
      };

      const result = await ser.update(fakeUserId, updateBody);

      expect(UserRepo.prototype.getUserByUsername).toHaveBeenCalledWith(updateBody.username);
      expect(UserRepo.prototype.getUserByEmail).toHaveBeenCalledWith(updateBody.email);
      expect(RegisterSchema.parse).toHaveBeenCalledWith(updateBody);

      const token = generateToken(fakeUser);
      expect(result).toMatchObject({ id: fakeUser.id, username: fakeUser.username, email: fakeUser.email, token });
    });

    it("lance une erreur si le nom d'utilisateur est déjà pris", async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue({ id: 999 });

      await expect(ser.update(fakeUserId, {
        username: 'takenUser',
        email: 'mail@example.com',
        password: 'pass',
      })).rejects.toEqual({ status: 400, message: "Ce nom d'utilisateur existe déjà" });
    });

    it("lance une erreur si l'email est déjà pris", async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(null);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue({ id: 999 });

      await expect(ser.update(fakeUserId, {
        username: 'user',
        email: 'taken@example.com',
        password: 'pass',
      })).rejects.toEqual({ status: 400, message: "Cet email existe déjà" });
    });
  });
});