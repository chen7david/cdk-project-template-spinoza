import { UserRepository } from '../../repositories/users.repository'

export const handler = async () => {
    return {
        user: UserRepository.getOne(),
        users: UserRepository.getAll(),
    }
}