import { interfaces } from 'inversify'
import { fluentProvide } from 'inversify-binding-decorators'

export function provideSingleton<T>(
  identifier: interfaces.ServiceIdentifier<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return fluentProvide(identifier).inSingletonScope().done()
}
