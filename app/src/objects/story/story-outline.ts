import ApiResource from '../api-resource'
import { getNumber, getString, getUnknownChildObject } from '../util'
import StoryOutlineDocument from './story-outline-document'


export default class StoryOutline extends ApiResource {
  id: string
  lastestPatchSequence: number
  document: StoryOutlineDocument


  constructor(outlineData: unknown) {
    super(outlineData)
    this.id = getString(outlineData, "id")
    this.lastestPatchSequence = getNumber(outlineData, "latestPatchSequence")
    const document = getUnknownChildObject(outlineData, "document")
    this.document = new StoryOutlineDocument(document)
  }
}