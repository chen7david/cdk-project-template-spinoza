import { randomUUID } from 'crypto'
import { padStart, padEnd } from 'lodash'

export type TUserEntity = {
    id: string
    username: string
    email: string
    password: string
    serial: string
}

const generateUser = (): TUserEntity => ({
    id: randomUUID(),
    username: `username-${randomUUID()}`,
    email: `email-${randomUUID()}`,
    password: `${padStart(randomUUID(), 10, '*')}`,
    serial: `${padStart(padEnd(), 10, '*')}`
})

export const UserRepository = {
    getAll: (amount: number = 100) => {
        const items = new Array(amount).fill(null)
        return items.map(() => generateUser())
    },
    getOne: () => generateUser()
}