// import Page from './page'
// import Theme from './theme'
// import Info from './info'

// export default class StoryOutline {
//   outlineVersion: string
//   info: Info
//   pages: Array<Page>
//   themes: Array<Theme>
//   title: string
//   description: string
//   storyId: string

//   constructor(outlineJson: any) {
//     this.outlineVersion = outlineJson.outlineVersion
//     this.info = outlineJson.info
//     this.pages = outlineJson.pages.map( (cur: any) => new Page(cur))
//     this.themes = outlineJson.themes?.length > 0 ? outlineJson.themes.map( (cur: any) => new Theme(cur)) : []
//     this.title = outlineJson.title
//     this.description = outlineJson.description
//     this.storyId = outlineJson.storyId
//   }

// }