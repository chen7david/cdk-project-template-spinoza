import { randomUUID } from 'crypto'
import { padStart, padEnd } from 'lodash'
export type Tuser = {
    id: string
    username: string
    email: string
    password: string
    serial: string
}

const generateUser = (): Tuser => ({
    id: randomUUID(),
    username: `username-${randomUUID()}`,
    email: `email-${randomUUID()}`,
    password: `${padStart(randomUUID(), 10, '*')}`,
    serial: `${padStart(padEnd(), 10, '*')}`
})

export const UserRepository = {
    getAll: (amount: number = 100) => new Array(amount).map(() => generateUser()),
    getOne: (id: number = 1) => generateUser()
}