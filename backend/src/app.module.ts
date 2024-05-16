import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    //非同期（forRootAsync）でGraphQLモジュールを設定するための方法
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, AppModule],
      inject: [ConfigService], //ConfigServiceを注入する。これにより設定値をuseFactory関数内で利用できる
      driver: ApolloDriver, //Apolloのドライバーを使用してGraphQLサーバーを動かす
      useFactory: async (configService: ConfigService) => {
        //useFactory: 非同期かつ動的に設定オブジェクトを生成するための関数
        return {
          //GraphQL PlayGroundを有効にする。ブラウザ上でGraphQLクエリを試すことが可能
          playground: true,
          //GraphQLスキーマを自動生成してファイルに保存する。process.cwd()は現在の作業ディレクトリを指す
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          //スキーマをソートする。これにより生成されるスキーマファイルが一貫した順序で出力される
          sortSchema: true,
        };
      },
    }),
    ConfigModule.forRoot({
      //この設定によりConfigModuleがアプリケーション全体でグローバルに利用可能になるため、
      //他のモジュールでConfigServiceを個別にインポートする必要がなくなる
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
