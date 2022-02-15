/* eslint-disable no-unused-vars */
import eventTypes from './eventTypes.json'
import { getUnknownChildObject, getString } from '@/objects/util'
import { strict as assert } from 'assert'

export enum EventTypeName {
  StoryCreated = "story.created"
}

export default class EventType {
  type: string
  shortName: string
  descriptionTemplate: string
  icon: string
  color: string

  constructor(typeName: EventTypeName) {
    this.type = typeName
    const data: unknown = getUnknownChildObject(eventTypes, typeName)
    assert(typeof data === 'object')
    this.shortName = getString(data, "shortName")
    this.descriptionTemplate = getString(data, "descriptionTemplate")
    this.icon = getString(data, "icon")
    this.color = getString(data, "color")
  }
}