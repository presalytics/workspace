import { getString, getUnknownChildArray, getUnknownChildObject } from "../util"
import { has } from 'lodash-es'
import StoryPage from "./story-page"
import StoryTheme from "./story-theme"

export interface IStoryOutlineInfo{
  updatedAt: string
  createdAt: string
  outlineType: string
}

export default class StoryOutlineDocument{
  title: string
  outlineVersion: string
  info: IStoryOutlineInfo
  pages: Array<StoryPage>
  themes: Array<StoryTheme>
  
  constructor(data: unknown) {
    this.title = getString(data, "title")
    this.outlineVersion = getString(data, "outlineVersion")
    this.info = getUnknownChildObject(data, "info") as IStoryOutlineInfo
    const pageDataArray = getUnknownChildArray(data, "pages")
    this.pages = pageDataArray.map( (page ) => new StoryPage(page))
    if (has(data, "theme")) {
      const themeData = getUnknownChildArray(data, "theme") 
      this.themes = themeData.map( (t) => new StoryTheme(t)) as Array<StoryTheme>
    } else {
      this.themes = []
    }
  }
}