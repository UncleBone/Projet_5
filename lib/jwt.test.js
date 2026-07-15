import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from './jwt'
import { faker } from '@faker-js/faker';

// const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const fakeUser = {
  id: faker.number.int(),
  username: faker.internet.username(),
  email: faker.internet.email(),
};

describe('jwt utils', () => {
    it('generateToken should return token', () => {
        expect(generateToken(fakeUser)).toBeTypeOf('string')
    })

    it('verifyToken should return user id who generated token', () => {
        const token = generateToken(fakeUser);
        const verify = verifyToken(token)
        expect(verify).toMatchObject(fakeUser)
    })

    it('verifyToken of invalid token should return null', () => {
        const token = generateToken(fakeUser);
        const verify = verifyToken(token+"abc")
        expect(verify).toBe(null)
    })
})