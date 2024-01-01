import { UserRepository } from '../../repositories/users.repository'
import { createResponse } from '../../utils/http.utils'

export const handler = async () => {
    const users = UserRepository.getAll(6)
    return createResponse(200, users)
}