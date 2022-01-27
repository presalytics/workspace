import { has } from 'lodash-es'
import { getString, getUnknownChildArray } from "../util";
import { IStoryElement } from "./interfaces";
import StoryPlugin from './story-plugin'


export default abstract class StoryElement implements IStoryElement{
  id: string
  elementName: string
  kind: string 
  plugins: Array<StoryPlugin>
  
  constructor(data: unknown) {
    this.id = getString(data, "id")
    this.elementName = getString(data, "name")
    this.kind = getString(data, "kind")
    if (has(data, "plugins")) {
      this.plugins = getUnknownChildArray(data, "plugins").map( (p) => new StoryPlugin(p))
    } else {
      this. plugins = []
    }
  }
}