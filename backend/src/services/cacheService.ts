import client from '../lib/redis'


export class CacheService {
    async setKey(key: string, data: any, limit: number) {
        await client.set(key, JSON.stringify(data), 'EX', limit)
    }

    async getKey(key: string) {
        // return await client.get(key)
        return null
    }

    async deleteKey(key: string) {
        // await client.del(key)
    }

    generateKey(baseKey: string, params: any) {
        // const sortedKeys = Object.keys(params).sort();
        // const paramString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
        // return `${baseKey}:${paramString}`;
        return baseKey
    }
}
