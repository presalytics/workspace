export default interface EventData<T = unknown> {
  resourceId: string
  userId: string
  model: T
}
