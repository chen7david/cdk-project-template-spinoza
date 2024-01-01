import { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

export const client: DynamoDBClient = new DynamoDBClient({
    region: 'us-east-1',
})

export type TDBCompositeKey = {
  pk: string
  sk: string
}

export const createItem = async <T extends object>(tableName: string, item: T) => {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: marshall(item, { removeUndefinedValues: true }),
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)'
      })
    return client.send(command)
}

export const scanItem = async (tableName: string) => {
    const command = new ScanCommand({
      TableName: tableName,
    })
    const items = await client.send(command)
    return items.Items.map((item) => unmarshall(item)) 
}

export const getItem = async (tableName: string, key: TDBCompositeKey) => {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall(key),
    })
    const item = await client.send(command)
    return unmarshall(item.Item)
}

export const putItem = async <T extends object>(tableName: string, item: T) => {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: marshall(item, { removeUndefinedValues: true }),
      })
    return client.send(command)
}

export const deleteItem = async (tableName: string, key: TDBCompositeKey) => {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    })
    return client.send(command)
}
