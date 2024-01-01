import { randomUUID } from 'crypto'
import { padStart, padEnd } from 'lodash'
import { TUserEntity } from '../../repositories/users.repository.types'

const generateUser = (): TUserEntity => ({
    id: randomUUID(),
    username: `username-${randomUUID()}`,
    email: `email-${randomUUID()}`,
    password: `${padStart(randomUUID(), 10, '*')}`,
    serial: `${padStart(padEnd(), 10, '*')}`
})