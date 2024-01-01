import { UserRepository } from '../../repositories/users.repository'
import { response } from '../../utils/http.utils'

export const handler = async () => {
    const tableName = process.env.TABLE_NAME
    const users = await UserRepository.getAll(tableName)
    return response(users)
}