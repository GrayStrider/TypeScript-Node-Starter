import {User} from '../models/User'
import {pubsub} from '../app'

export const UserChange = () =>
  // User.watch().on('change', (data) => console.log(data))
  User.watch().on('change', (data) => {
    // console.log(data)
    pubsub.publish('HELLO', data.operationType)
      .catch(console.log)
  })

