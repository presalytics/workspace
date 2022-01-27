import { getUnknownChildObject } from "../util"
import { IStoryTheme } from './interfaces'
import StoryElement from "./story-element"

export default class StoryTheme<T = unknown> extends StoryElement implements IStoryTheme<T>{
  data: T
  
  constructor(data: unknown) {
    super(data)
    this.data = getUnknownChildObject(data, "data") as T
  }
}