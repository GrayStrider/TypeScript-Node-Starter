import { Field, ID, Int, ObjectType, registerEnumType } from 'type-graphql'

enum Priorities {
  HIGH,
  MED,
  LOW,
  NONE
}

enum Tag {
  PERSONAL = 'Personal',
  JOB = 'Job'
}

registerEnumType(Tag, {
  name: 'Tag',
  description: 'Task Tags'
})

@ObjectType()
export class Task {
  internal: number // hidden from GraphQL, no decorator

  @Field(returns => ID, { nullable: true })
  id?: string
  @Field({ description: 'The title of the task', defaultValue: 'Untitled', nullable: true })
  title?: string
  @Field({ defaultValue: 'No description.', nullable: true })
  description?: string
  @Field(returns => Tag, { nullable: true }) // need to provide info about generic type
  tags?: Tag
  @Field({ defaultValue: Priorities.NONE, nullable: true })
  priority?: Priorities
  @Field({ nullable: true })
  dateCreated?: Date
  @Field({ nullable: true })
  dateModified?: Date

  @Field(returns => [Int], { nullable: true })
  numberArr?: number[]
  @Field(() => Int, { nullable: true })
  optionalNullable?: number

}
