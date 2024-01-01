import { TDBCompositeKey, createItem, deleteItem, getItem, putItem, scanItem } from "../utils/dynamodb-client.utils"

export const UserRepository = {
    getAll: async (tableName: string) => scanItem(tableName),
    putOne: async <T extends object>(tableName: string, item: T) => putItem(tableName, item),
    getOne: (tableName: string, compositeKey: TDBCompositeKey) => getItem(tableName, compositeKey),
    createOne: async <T extends object>(tableName: string, item: T) => createItem(tableName, item),
    deleteOne: async (tableName: string, compositeKey: TDBCompositeKey) =>  deleteItem(tableName, compositeKey),
}