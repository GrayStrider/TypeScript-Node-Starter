import { Field, InputType } from 'type-graphql'
import { Task } from './task-type'

@InputType({ description: 'new task data' })
export class TaskInput implements Partial<Task> {
  @Field()
  title: string

  @Field()
  description: string
}
