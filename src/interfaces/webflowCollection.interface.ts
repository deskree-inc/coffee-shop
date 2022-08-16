export interface WebflowCollectionResponseInterface {
    count: 1
    items: Array<Record<string, any>>
    author: string
    name: string
    "created-by": string
    "created-on": string
    "published-by": string | null
    "published-on": string | null
    slug: string
    "updated-by": string
    "updated-on": string
    _archived: boolean
    _cid: string
    _draft: boolean
    _id: string
    limit: number
    offset: number
    total: number
}