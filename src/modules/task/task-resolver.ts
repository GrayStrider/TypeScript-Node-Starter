import { Arg, Args, ArgsType, Field, Int, Mutation, Query, Resolver } from 'type-graphql'
import { ITask, Priority, Task } from './task-type'
import { Max, Min } from 'class-validator'
import { TaskInput } from './task-input'
import { plainToClass } from 'class-transformer'
import cuid from 'cuid'


@ArgsType()
class GetTaskArgs {
  @Field(type => Int, { defaultValue: 0 })
  @Min(0)
  skip: number

  @Field(type => Int)
  @Min(1)
  @Max(50)
  take = 25

  @Field({ nullable: true })
  title?: string

  // helpers - index calculations
  startIndex = this.skip
  endIndex = this.skip + this.take
}


@Resolver(of => Task)
export class TaskResolver {
  private taskCollection: Task[] = []

  @Query(returns => [Task])
  async tasks() { // no await, since not a promise
    return this.taskCollection
  }


  @Query(returns => [Task])
  async tasksAdvanced(@Args() { title, startIndex, endIndex }: GetTaskArgs) {
    let tasks = this.taskCollection
    if (title) {
      tasks = tasks.filter(task => task.title === title)
    }

    return tasks.slice(startIndex, endIndex)
  }


  @Mutation(returns => Task)
  async addTask(@Arg('task') { description, title, priority, tags }: TaskInput) {

    const task = plainToClass<Task, ITask>(Task, {
        id: cuid(),
        tags: tags || [],
        priority: priority || Priority.NONE,
        title: title,
        description: description || '',
        dateCreated: new Date(),

      },
    )

    await this.taskCollection.push(task)
    return task
  }
}
