import {User} from '../models/User'
import {pubsub} from '../app'
import {fromEvent, from} from 'rxjs'

export const UserChange = () => {
  // User.watch().on('change', (data) => console.log(data))
    User.watch()
      .on('change', (data) => {
        // console.log(data)
        pubsub.publish('HELLO', data.operationType)
          .catch(console.log)
      })

  const userObservable = User.watch()
  fromEvent(userObservable, 'change')
    .subscribe((data) => console.log('From event: ', data))

  const pubSubObservable = pubsub.asyncIterator(['HELLO'])

}

