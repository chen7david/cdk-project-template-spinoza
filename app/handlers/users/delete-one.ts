import { APIGatewayEvent } from "aws-lambda"
import { UserRepository } from '../../repositories/users.repository'
import { response, errorResponse } from '../../utils/http.utils'

export const handler = async (event: APIGatewayEvent) => {
    const tableName = process.env.TABLE_NAME
    const group_id = event.pathParameters?.group_id
    const user_id = event.pathParameters?.user_id
    if(!group_id) return errorResponse(404, 'group_id is required')
    if(!user_id) return errorResponse(404, 'user_id is required')
    const user = await UserRepository.deleteOne(tableName, {
        pk: group_id,
        sk: user_id
    })
    if(!user) return errorResponse(404, 'invalid resource id')
    return response(user)
}