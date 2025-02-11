import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { envs } from 'src/config/envs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-auth.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interface/jw-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateUserDto) {
    try {
      const { password, ...userData } = createAuthDto;

      const existingUser = await this.userRepository.findOne({
        where: [{ email: userData.email }, { username: userData.username }],
      });

      if (existingUser) {
        throw new BadRequestException(
          existingUser.email === userData.email
            ? 'El correo electrónico ya está registrado'
            : 'El nombre de usuario ya está en uso',
        );
      }

      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hash(password, 10),
      });

      await this.userRepository.save(user);

      const tokens = this.generateToken({ id: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          roles: user.roles,
        },
        ...tokens,
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(dto: LoginUserDto) {
    const { email, password } = dto;

    try {
      // Buscar usuario
      const user = await this.userRepository.findOne({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          username: true,
          fullName: true,
          roles: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      if (!user.isActive) {
        throw new UnauthorizedException(
          'Usuario inactivo. Contacte al administrador',
        );
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      await this.userRepository.update(
        { id: user.id },
        { lastLoginAt: new Date() },
      );

      delete user.password;

      return {
        user,
        ...this.generateToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: envs.jwtRefreshSecret,
        },
      );

      const user = await this.userRepository.findOne({
        where: { id: payload.id, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no válido');
      }

      return this.generateToken({ id: user.id });
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }

  private generateToken(payload: JwtPayload) {
    const [accessToken, refreshToken] = [
      this.jwtService.sign(payload, {
        secret: envs.jwtSecret,
        expiresIn: '24h',
      }),
      this.jwtService.sign(payload, {
        secret: envs.jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ];

    return {
      accessToken,
      refreshToken,
    };
  }

  private handleDBError(error: any): never {
    console.error(error);

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    if (error.code === '23505') {
      throw new BadRequestException('El usuario ya existe en la base de datos');
    }

    throw new InternalServerErrorException(
      'Por favor contacte al administrador',
    );
  }
}
