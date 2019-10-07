import { Field, InputType } from 'type-graphql'
import { ITask, Priority, Tag } from './task-type'

@InputType({ description: 'new task data' })
export class TaskInput implements Partial<ITask> {
  @Field()
  title: string

  @Field({ nullable: true })
  description: string

  @Field({ nullable: true })
  priority: Priority

  @Field(returns => [Tag], { nullable: true })
  tags: Tag[]
}
