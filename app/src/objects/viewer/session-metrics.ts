import { v4 } from 'uuid'
import { getString } from '@/objects/util'

interface ISessionMetrics{
  sessionStartTime: Date
  activeStartTime: Date
  id: string
  activeTime: number
  storyId: string
  userId: string
  resourceId: string
  isVisible: boolean
}


export default class SessionMetrics implements ISessionMetrics{
  sessionStartTime: Date
  activeStartTime: Date
  id: string
  activeTime: number
  storyId: string
  userId: string
  resourceId: string
  isVisible: boolean

  constructor(data: unknown) {
    this.id = v4().toString()
    this.sessionStartTime = new Date()
    this.activeStartTime = new Date()
    this.activeTime = 0
    this.storyId = getString(data, "storyId")
    this.resourceId = this.storyId
    this.isVisible = true
    this.userId = getString(data, "userId")
  }

  jsonify(): ISessionMetrics {
    return JSON.parse(JSON.stringify(this)) as ISessionMetrics
  }

  setVisibility(isVisible: boolean): void {
    this.updateActiveTime()
    this.isVisible = isVisible
  }

  updateActiveTime(): void {
    if (this.isVisible) {
      const moreMilliseconds = Date.now() - this.activeStartTime.getMilliseconds() 
      this.activeTime += moreMilliseconds
      this.activeStartTime = new Date()
    }
  }



}