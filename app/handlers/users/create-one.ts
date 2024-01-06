import { APIGatewayEvent } from "aws-lambda"
import { UserRepository } from '../../repositories/users.repository'
import { response, errorResponse } from '../../utils/http.utils'

export const handler = async (event: APIGatewayEvent) => {
    const parsedBody = JSON.parse(event.body)
    if(!parsedBody) return errorResponse(404, 'request body is required')
    const tableName = process.env.TABLE_NAME
    const group_id = event.pathParameters?.group_id
    const user_id = event.pathParameters?.user_id
    const user = await UserRepository.createOne(tableName, parsedBody)
    return response(user)
}