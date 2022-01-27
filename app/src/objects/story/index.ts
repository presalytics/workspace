import { getString, getBoolean, getUnknownChildArray } from '@/objects/util'
import ApiResource from '../api-resource';


export default class Story extends ApiResource{
  isPublic: boolean
  collaborators: Array<string>
  ooxmlDocuments: Array<string>
  outline: string
  title: string


  constructor(data: unknown) {
    super(data)
    this.id = getString(data, "id")
    this.isPublic = getBoolean(data, "isPublic")
    this.collaborators = getUnknownChildArray(data, "collaborators") as Array<string>    
    this.ooxmlDocuments = getUnknownChildArray(data, "ooxmlDocuments") as Array<string>
    this.outline = getString(data, "outline")
    this.title = getString(data, "title")
  }
}