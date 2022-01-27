export interface IStoryElement {
  id: string
  elementName: string
  kind: string
  plugins: Array<IStoryPlugin<unknown>>
}

export interface IStoryPage extends IStoryElement {
  widgets: Array<IStoryWidget<unknown>>
}

export interface IStoryWidget<T> extends IStoryElement {
  data: T
}

export interface IStoryPlugin<T> extends IStoryElement{
  config: T | undefined
}

export interface IStoryTheme<T> extends IStoryElement{
  data: T
}