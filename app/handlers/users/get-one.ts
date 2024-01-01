import { APIGatewayEvent } from "aws-lambda"
import { UserRepository } from '../../repositories/users.repository'
import { createResponse, createErrorResponse } from '../../utils/http.utils'

export const handler = async (event: APIGatewayEvent) => {
    const user_id = event.pathParameters?.user_id
    if(!user_id) return createErrorResponse(404, 'user_id is required')
    const user = UserRepository.getOne()
    if(!user) return createErrorResponse(404, 'invalid resource id')
    return createResponse(200, user)
}