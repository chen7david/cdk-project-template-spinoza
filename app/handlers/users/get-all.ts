import { UserRepository } from '../../repositories/users.repository'

export const handler = async () => {
    const users = UserRepository.getAll()
    return { users }
}