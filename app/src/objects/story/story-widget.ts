import StoryElement from "./story-element"
import { IStoryWidget } from "./interfaces"
import { getUnknownChildObject } from "../util"


export default class StoryWidget<T = unknown> extends StoryElement implements IStoryWidget<T>{
  data: T

  constructor(data: unknown) {
    super(data)
    this.data = getUnknownChildObject(data, "data") as T
  }
}