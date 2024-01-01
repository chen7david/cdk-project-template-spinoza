import { handler } from '../../../handlers/users/get-all'

describe('handlers:users', () => {
    it('should return an object', async () => {
        const result = await handler()
        expect(result.statusCode).toEqual(200)
        expect(result.body).toBeInstanceOf(Array)
    })
})