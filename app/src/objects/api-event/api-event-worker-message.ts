/* eslint-disable no-unused-vars */
import { has } from 'lodash-es'
import ApiEvent from "."
import Jsonable from "../jsonable"
import EventQuery from "./event-query"
import { getString, getUnknownChildArray, getUnknownChildObject, propertyIsNull } from "../util"


export enum ApiEventWorkerResponseType{
  NewEvent = "api_events.new_event",
  QueryResult = "api_events.query_result" 
}

export interface IApiEventWorkerMessage{
  type: ApiEventWorkerResponseType
  events: Array<ApiEvent>
  query: EventQuery | null
}

export default class ApiEventWorkerMessage extends Jsonable implements IApiEventWorkerMessage{
  type: ApiEventWorkerResponseType
  events: Array<ApiEvent>
  query: EventQuery | null

  constructor(type: ApiEventWorkerResponseType, events: Array<ApiEvent>, query?: EventQuery | null) {
    super()
    this.type = type
    this.events = events
    this.query = typeof query === 'undefined' ? null : query
  }

  static fromJSON(obj: unknown) {
    const type = getString(obj, "type") as ApiEventWorkerResponseType
    if (Object.values(ApiEventWorkerResponseType).indexOf(type) === -1) {
      throw new Error(`"${type}" is not a valid member of the ApiEventWorkerResponseType enum`)
    }
    const rawEvtArray = getUnknownChildArray(obj, "events")
    const events = rawEvtArray.map( (obj: unknown) => new ApiEvent(obj))
    const query = has(obj, "query") && !propertyIsNull(obj, "query") ? EventQuery.fromJSON(getUnknownChildObject(obj, "query")) : null
    return new ApiEventWorkerMessage(type, events, query)
  }
}
