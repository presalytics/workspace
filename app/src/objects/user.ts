import store from '@/store'

interface IAppMetadata {
  apiUserId: string
  privacyPolicyVersion: number
  roles: Array<string>
  termsOfUserVersion: number
}

interface IUserMetadata {
  timezone: string
}

interface IStoreUserData {
  appMetadata: IAppMetadata
  userMetadata: IUserMetadata
  picture: string
  email: string
  emailVerified: boolean
  familyName: string
  givenName: string
  loginsCount: number
  name: string
  lastIp: string
  locale: string
  nickname: string
  createdAt: string
  updatedAt: string
}

export default class User {
  id: string
  picture: string
  email: string
  emailVerified: boolean
  familyName: string
  givenName: string
  loginsCount: number
  name: string
  lastIp: string
  locale: string
  nickname: string
  createdAt: Date
  updatedAt: Date
  appMetadata: IAppMetadata
  userMetadata: IUserMetadata

  constructor(userData: IStoreUserData) {
    this.id = userData.appMetadata.apiUserId
    this.picture = userData.picture
    this.email = userData.email
    this.emailVerified = userData.emailVerified
    this.familyName = userData.familyName
    this.givenName = userData.givenName
    this.loginsCount = userData.loginsCount
    this.appMetadata = userData.appMetadata
    this.userMetadata = userData.userMetadata
    this.name = userData.name
    this.lastIp = userData.lastIp
    this.locale = userData.locale
    this.nickname = userData.nickname
    this.createdAt = new Date(userData.createdAt)
    this.updatedAt = new Date(userData.updatedAt)
  }

  public getFriendlyName() {
    if (this.givenName && this.familyName) {
      return this.givenName + " " + this.familyName
    } else if (this.nickname) {
      return this.nickname
    } else {
      return this.name
    }
  }
}

export function getUser(userId: string): User {
  const userData = store.getters['users/getUser'](userId)
  return new User(userData)
}