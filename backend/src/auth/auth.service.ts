import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh_token']; //クライアントから送信されたリフレッシュトークンをクッキーから取得

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    let payload;

    try {
      //jwtService.verifyを使ってリフレッシュトークンを検証する
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    //リフレッシュトークンのペイロードからUserId(payload.sub)を取得し、DBに対象ユーザーが存在するか確認する
    const userExists = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!userExists) {
      throw new BadRequestException('User no longer exists');
    }

    const expiresIn = 15000;
    const expiration = Math.floor(Date.now() / 1000) * expiresIn;
    //新しいアクセストークンを生成する。有効期限は現在時刻からexpiresIn秒後に設定する。
    const accessToken = this.jwtService.sign(
      { ...payload, exp: expiration },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      },
    );

    //生成したアクセストークンをクッキーに保存し、httpOnlyオプションを有効にしてクライアント側に
    //JavaScriptからアクセスできないようにする
    res.cookie('access_token', accessToken, { httpOnly: true });

    return accessToken;
  }
}
