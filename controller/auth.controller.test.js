import { describe, it, expect, vi } from 'vitest'
import { AuthController } from './auth.controller' // adaptez le chemin

const cont = new AuthController();

describe('AuthController', () => {

  it('should call authService.login with correct body and return result', async () => {
    const loginDto = { username: 'user1', password: 'pass' }
    const loginResult = { token: 'jwt-token' }

    const mockLogin = vi.spyOn(cont['authService'],'login').mockResolvedValue(loginResult)

    const result = await cont.login(loginDto)

    expect(mockLogin).toHaveBeenCalledWith(loginDto)
    expect(result).toBe(loginResult)
  })

  it('should call authService.register with correct body and return result', async () => {
    const registerDto = { username: 'newuser', email: 'a@b.com', password: 'pass' }
    const registerResult = { id: 1, username: 'newuser' }

    const mockRegister = vi.spyOn(cont['authService'],'register').mockResolvedValue(registerResult);

    const result = await cont.register(registerDto)

    expect(mockRegister).toHaveBeenCalledWith(registerDto)
    expect(result).toBe(registerResult)
  })
})