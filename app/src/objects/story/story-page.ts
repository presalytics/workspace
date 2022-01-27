import { IStoryPage } from './interfaces'
import StoryElement from './story-element'
import StoryWidget from './story-widget'
import { getUnknownChildArray } from '@/objects/util'

export default class StoryPage extends StoryElement implements IStoryPage{
  widgets: Array<StoryWidget>

  constructor(data: unknown) {
    super(data)
    this.widgets = getUnknownChildArray(data, "widgets") as Array<StoryWidget>
  }
}