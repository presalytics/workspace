import { has } from "lodash-es"
import { getString, getUnknownChildObject, getUnknownChildArray } from "../util"
import { IStoryPlugin } from "./interfaces"

export default class StoryPlugin<T = unknown> implements IStoryPlugin<T>{
  id: string
  elementName: string
  kind: string 
  config: T | undefined
  plugins: IStoryPlugin<unknown>[];

  constructor(data: unknown) {
    this.id = getString(data, "id")
    this.elementName = getString(data, "name")
    this.kind = getString(data, "kind")
    if (has(data, "config")) {
      this.config = getUnknownChildObject(data, "config") as T
    } else {
      this.config = undefined
    }
    if (has(data, "plugins")) {
      this.plugins = getUnknownChildArray(data, "plugins").map( (p) => new StoryPlugin(p))
    } else {
      this. plugins = []
    }

  }

}