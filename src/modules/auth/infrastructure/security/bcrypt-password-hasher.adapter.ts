import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';

@Injectable()
export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  constructor(private readonly configService: ConfigService) {}

  hash(value: string): Promise<string> {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
    return bcrypt.hash(value, rounds);
  }

  compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
