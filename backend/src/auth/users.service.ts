import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class UsersService {
  // Mock user data with hashed passwords
  private readonly users = [
    { id: 1, username: 'admin', password: '34d1f91fb2e514b8576fab1a75a89a6b' }, //password hash of 'go'
    { id: 2, username: 'user', password: 'ab86a1e1ef70dff97959067b723c5c24' }, //password hash of 'me'
  ];

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.users.find((u) => u.username === username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password before returning the user object
    const { password: _, ...result } = user;
    return result;
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
