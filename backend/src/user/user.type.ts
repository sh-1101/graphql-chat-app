import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  // ?:はTypeScript におけるオプショナルなプロパティを示す構文
  //そのプロパティが存在しない可能性があることを示す

  @Field({ nullable: true })
  id?: number;

  @Field()
  fullname: string;

  @Field()
  email?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
