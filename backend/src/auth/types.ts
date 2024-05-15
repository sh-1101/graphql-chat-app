import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.type';

//RegisterResponseというGraphQLのオブジェクトタイプを定義
@ObjectType() //@ObjectTypeデコレータはこのクラスがGraphQLのオブジェクトタイプであることを示している
export class RegisterResponse {
  //@Fieldデコレータはそのオブジェクトタイプのフィールドを定義する。
  //ここではuserというフィールドを定義している。
  //@Field(() => User, { nullable: true })はuserフィールドがUserオブジェクトであることを指定している
  //{ nullable: true } を指定することで、userフィールドが null になり得ることを示している
  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class LoginResponse {
  //userフィールドが必須であることを示すため、{ nullable: true}オプションは使用しない
  @Field(() => User)
  user: User;
}
