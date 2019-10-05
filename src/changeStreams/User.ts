import {User} from '../models/User'

export const UserChange = () =>
  User.watch().on('change', (data) => console.log(data))

