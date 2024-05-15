import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //NestJSでCORSを有効にするための設定
  app.enableCors({
    origin: 'http://localhost:5173', //許可するリクエスト元を設定する
    credentials: true, //クレデンシャル（クッキーなど）を含むリクエストを許可する
    allowedHeaders: [
      //許可するリクエストヘッダーのリストを指定する
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'], //許可するリクエストメソッドのリストを指定する
  });

  //app.use(cookieParser()) を使用して、クッキーを解析するミドルウェアを適用
  //req.cookies を通じてリクエスト内のクッキー情報にアクセスできるようになる
  app.use(cookieParser());
  // 例: app.get('/', (req, res) => {
  //  console.log(req.cookies); // リクエスト内のクッキー情報を取得してコンソールに表示
  //  res.send('Hello World!');
  //});

  //GraphQL APIでファイルのアップロードを可能にするための設定
  app.use(graphqlUploadExpress({ maxFileSize: 10000000000, maxFiles: 1 }));
  //maxFileSize: アップロード可能なファイルの最大サイズをバイト単位で指定
  //maxFiles: 一度にアップロードできるファイルの最大数を指定

  app.useGlobalPipes(
    new ValidationPipe({
      //whitelist: true デコレータで定義されていないプロパティを無視する
      //DTOで定義されていないプロパティがリクエストに含まれた場合、これらのプロパティを無視し、
      //不正なデータが送信されるのを防ぐs
      whitelist: true,
      //transform: true データの変換を有効にする
      //文字列形式の数値を実際の数値に変換したり、文字列形式の日付をDateオブジェクトに変換できる
      //これにより、リクエストのデータをより使いやすい形式に変換可能
      transform: true,

      //バリデーションエラーが発生した時に呼び出されるコールバック関数
      //バリデーションエラーを受け取り、カスタムの例外オブジェクトを生成する
      //ここではerrorsを受け取り、BadRequestExceptionを生成している
      //formattedErrorsオブジェクトにはプロパティ毎にエラーメッセージが含まれている
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = Object.values(error.constraints).join(
            ', ',
          );
          return accumulator;
        }, {});

        throw new BadRequestException(formattedErrors);
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
