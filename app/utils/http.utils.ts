export type TCustomResponseHeaders = Record<string, string>

export type TErrorOptoins = {
    customResponseHeaders?: TCustomResponseHeaders,
    details?: any
}

export const createResponse = <T>(code: number = 200, body: T, customResponseHeaders?: TCustomResponseHeaders) => ({
    statusCode: code,
    headers: {
        'Content-type': 'application/json',
        ...(customResponseHeaders || {})
    },
    isBase64Encoded: true,
    body: JSON.stringify(body)
})

export const createErrorResponse = (code: number, message: string, ErrorOptoins?: TErrorOptoins) => ({
    statusCode: code,
    headers: {
        'Content-type': 'application/json',
        ...(ErrorOptoins?.customResponseHeaders || {})
    },
    isBase64Encoded: true,
    message: JSON.stringify(message),
    ...({ details: ErrorOptoins?.details } || {})
})