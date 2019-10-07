import { Field, InputType } from 'type-graphql'
import { ITask } from './task-type'

@InputType({ description: 'new task data' })
export class TaskInput implements Partial<ITask> {
  @Field()
  title: string

  @Field()
  description: string
}
