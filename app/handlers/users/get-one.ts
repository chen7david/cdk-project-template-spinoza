import { UserRepository } from '../../repositories/users.repository'
import { createResponse, createErrorResponse } from '../../utils/http.utils'

export const handler = async () => {
    const user = UserRepository.getOne()
    if(!user) return createErrorResponse(404, 'invalid resource id')
    return createResponse(200, user)
}