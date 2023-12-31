import { handler } from '../../../handlers/users/get-all'

describe('handlers:users', () => {
    it('should return an object', async () => {
        const result = await handler()
        console.log(result.users)
    })
})