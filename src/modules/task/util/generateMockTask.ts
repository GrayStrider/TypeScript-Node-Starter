import { plainToClass } from 'class-transformer'
import { ITask, Priority, Task } from '../task-type'
import cuid from 'cuid'
import Chance from 'chance'

const chance = new Chance()

export const generateMockTask = () =>
  plainToClass<Task, ITask>(Task, {
      dateCreated: new Date(),
      description: chance.sentence({ words: chance.integer({ min: 3, max: 10 }), punctuation: false }),
      id: cuid(),
      priority: chance.pickone([Priority.NONE, Priority.LOW, Priority.MED, Priority.HIGH]),
      tags: [],
      title: chance.sentence({ words: chance.integer({ min: 1, max: 3 }), punctuation: false }),
    }
  )
