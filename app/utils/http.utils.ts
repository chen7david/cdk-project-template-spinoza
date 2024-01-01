export type TCustomResponseHeaders = Record<string, string>

export type TErrorResponseOptoins = {
    customResponseHeaders?: TCustomResponseHeaders,
    details?: any
}

export type TSuccessResponseOptoins = {
    customResponseHeaders?: TCustomResponseHeaders,
    code?: number
}

export const response = <T>(body: T, ErrorResponseOptoins?: TSuccessResponseOptoins) => ({
    statusCode: ErrorResponseOptoins?.code || 200,
    headers: {
        'Content-type': 'application/json',
        ...(ErrorResponseOptoins?.customResponseHeaders || {})
    },
    isBase64Encoded: true,
    body: JSON.stringify(body)
})

export const errorResponse = (code: number, message: string, ErrorResponseOptoins?: TErrorResponseOptoins) => ({
    statusCode: code,
    headers: {
        'Content-type': 'application/json',
        ...(ErrorResponseOptoins?.customResponseHeaders || {})
    },
    isBase64Encoded: true,
    message: JSON.stringify(message),
    ...({ details: ErrorResponseOptoins?.details } || {})
})