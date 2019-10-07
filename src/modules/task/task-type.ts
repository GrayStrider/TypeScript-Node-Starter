import { Field, ID, Int, ObjectType, registerEnumType } from 'type-graphql'

export enum Priority {
  HIGH = 1,
  MED,
  LOW,
  NONE
}

export enum Tag {
  PERSONAL = 'Personal',
  JOB = 'Job'
}

registerEnumType(Tag, {
  name: 'Tag',
  description: 'Task Tags'
})


registerEnumType(Priority, {
  name: 'Priority',
  description: 'Task Priority'
})

export interface ITask {
  id: string
  title: string
  description: string
  tags: Tag[]
  priority: Priority
  dateCreated: Date
  dateModified?: Date
  numberArr?: number[]
  optionalNullable?: number

}

@ObjectType()
export class Task implements ITask {
  internal: number // hidden from GraphQL, no decorator

  @Field(returns => ID,)
  id: string
  @Field({ description: 'The title of the task' })
  title: string
  @Field()
  description: string
  @Field(returns => [Tag],) // need to provide info about generic type
  tags: Tag[]
  @Field(returns => Priority,)
  priority: Priority
  @Field(returns => Date)
  dateCreated: Date
  @Field({ nullable: true })
  dateModified: Date

  @Field(returns => [Int], { nullable: true })
  numberArr: number[]

  @Field(() => Int, { nullable: true })
  optionalNullable: number

}
