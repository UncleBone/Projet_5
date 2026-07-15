import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service'; // adaptez le chemin
import { UserRepo } from '../repository/user.repo';
import * as bcrypt from 'bcrypt';
import { generateToken } from '../lib/jwt';
import { faker } from '@faker-js/faker';
import { RegisterSchema } from '../dto/user.dto';

const ser = new AuthService;

const fakeUser = {
    id: faker.number.int(),
    email: faker.internet.email(),
    username: faker.internet.username(),
}
const fakeUserWithPassword = { ...fakeUser, password: faker.internet.password() };

vi.mock(import("bcrypt"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
  compare: vi.fn(),
  }
})

describe('AuthService', () => {

  describe('login', () => {
    it('renvoie 401 si login inconnu', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(null);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue(null);
      await expect(
          ser.login({ })
      ).rejects.toEqual({ status: 401, message: 'Identifiants invalides' });
    });

    it('renvoie 401 si mot de passe incorrect', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(fakeUser);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue(null);
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(
        ser.login({ login: 'user', password: 'badpass' })
      ).rejects.toMatchObject({ status: 401, message: 'Mot de passe incorrect' });
    });

    it('renvoie user info si identifiants valides', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(fakeUser);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue(null);
      bcrypt.compare.mockResolvedValueOnce(true);

      const token = generateToken(fakeUser);

      const result = await ser.login({ login: 'user', password: 'goodpass' });
      expect(result).toMatchObject({ ...fakeUser, token });
    });
  });

  describe('register', () => {
    it('renvoie 400 si champs vide', async () => {
      await expect(
          ser.register({ })
      ).rejects.toEqual({ status: 400, message: 'Veuillez remplir tous les champs' });
    });

    it('renvoie 400 si username existe déjà', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(fakeUser);
      await expect(
          ser.register(fakeUserWithPassword)
      ).rejects.toEqual({ status: 400, message: "Ce nom d'utilisateur existe déjà" });
    });

    it('renvoie 400 si email existe déjà', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(null);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue(fakeUser);
      await expect(
          ser.register(fakeUserWithPassword)
      ).rejects.toEqual({ status: 400, message: "Cet email existe déjà" });
    });

    it('crée un nouvel utilisateur et renvoie AuthResponse avec token', async () => {
      vi.spyOn(UserRepo.prototype, 'getUserByUsername').mockResolvedValue(null);
      vi.spyOn(UserRepo.prototype, 'getUserByEmail').mockResolvedValue(null);
      vi.spyOn(RegisterSchema, 'parse').mockImplementationOnce((data) => data);
      vi.spyOn(UserRepo.prototype, 'createUser').mockResolvedValue(fakeUserWithPassword);

      const token = generateToken(fakeUser);
      const result = await ser.register(fakeUserWithPassword);
      expect(result).toMatchObject({ ...fakeUser, token });
    });
  });
});