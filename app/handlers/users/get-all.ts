import { APIGatewayEvent } from 'aws-lambda'
import { UserRepository } from '../../repositories/users.repository'
import { response } from '../../utils/http.utils'

export const handler = async (event: APIGatewayEvent) => {
    const tableName = process.env.TABLE_NAME
    const users = await UserRepository.getAll(tableName)
    const jwtHeaders = event.headers['Authorization']
    return response({users, jwtHeaders})
}