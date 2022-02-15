import { getBoolean, getString, getUnknownChildObject, getDate, propertyIsNull, getNumber } from '../util'
import { has } from 'lodash-es'
import { v4 } from 'uuid'
import Jsonable from '../jsonable'
import { strict as assert } from 'assert'

export const allowedSearchParams = ['resourceId', 'userId', 'id', 'minTimestamp', 'maxTimestamp', 'type']

export class EventQueryParameters{
  resourceId: string | null
  userId: string | null
  id: string | null
  minTimestamp: Date | null
  maxTimestamp: Date | null
  type: string | null

  constructor(params: unknown) {
    assert(typeof params === 'object')
    assert(params !== null)
    Object.keys(params).forEach( (key: string) =>  {
      if (!allowedSearchParams.includes(key)) {
        throw new Error(`${key} is not allowed event search parameter.  Search parameters can be any of: "resourceId", "userId', "id", "minTimeStamp", "maxTimestamp", or "type"`)
      }
    })
    this.resourceId = has(params, "resourceId") && !propertyIsNull(params, "resourceId") ? getString(params, "resourceId") : null
    this.userId = has(params, "userId") && !propertyIsNull(params, "userId") ? getString(params, "userId") : null 
    this.id = has(params, "id") && !propertyIsNull(params, "id") ? getString(params, "id") : null
    this.minTimestamp = has(params, "minTimestamp") && !propertyIsNull(params, "minTimestamp") ? getDate(params, "minTimeStamp") : null
    this.maxTimestamp = has(params, "maxTimestamp") && !propertyIsNull(params, "maxTimestamp") ? getDate(params, "maxTimestamp") : null
    this.type = has(params, "type") && !propertyIsNull(params, "type") ? getString(params, "type") : null
  }

}


export default class EventQuery extends Jsonable{
  id: string
  limit: number | null
  returnModel: boolean
  queryParameters: EventQueryParameters

  constructor(query: unknown, returnModel?: boolean, limit?: number | null, id?: string) {
    super()
    this.id =typeof id === 'string' ? id : v4()
    this.limit = typeof limit === 'number' ? limit : null
    this.returnModel = typeof returnModel === 'boolean' ? returnModel : false
    this.queryParameters = new EventQueryParameters(query)
  }

  static fromJSON(obj: unknown) {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error('The "EventQuery.fromJSON(obj)" static method argument must be an object and cannot be null')
    }
    const limit = has(obj, "limit") && !propertyIsNull(obj, "limit") ? getNumber(obj, "limit") : null
    const id = getString(obj, "id")
    const returnModel = getBoolean(obj, "returnModel", false)
    const query = getUnknownChildObject(obj, "queryParameters")
    return new EventQuery(query, returnModel, limit, id)
  }
}

