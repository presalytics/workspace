import { get, has } from 'lodash-es'
import { strict as assert } from 'assert'
import { getString } from './util'
import Jsonable from './jsonable'

export interface IApiResource {
  id: string
  createdAt: Date
  createdById: string | null
  updatedAt: Date | null
  updatedById: string | null
}

export default abstract class ApiResource extends Jsonable implements IApiResource{
  id: string
  createdAt: Date
  createdById: string | null
  updatedAt: Date | null
  updatedById: string | null

  constructor(data: unknown) {
    super()
    assert(typeof data === 'object')
    assert(data !== null)
    this.id = getString(data, "id")
    if (!has(data, "createdAt")) {
      throw new Error('Data missing "createdAt" property')
    }
    const createdAt = get(data, "createdAt")
    if (typeof createdAt === "object") {
      this.createdAt = createdAt as Date
    } else {
      this.createdAt = new Date(createdAt)
    }
    if (!has(data, "createdById")) {
      throw new Error('Data missing "createdById" property')
    }
    const createdById = get(data, "createdById")
    this.createdById = createdById == null ? null : getString(data, "createdById")
    if (has(data, "updatedAt")) {
      const updatedAt = get(data, "updatedAt")
      if (typeof updatedAt === "object") {
        this.updatedAt = updatedAt as Date
      } else {
        this.updatedAt = new Date(updatedAt)
      }
    } else {
      this.updatedAt = null
    }
    if (!has(data, "updatedById")) {
      throw new Error('Data missing "createdById" property')
    }
    const updatedById = get(data, "updatedById")
    this.updatedById = updatedById == null ? null : getString(data, "createdById")
  }
}