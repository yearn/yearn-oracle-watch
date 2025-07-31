import { KongDataSource } from 'src/datasources/KongDataSource'
import { YDaemonDataSource } from 'src/datasources/YDaemonDataSource'
import { SdkContext } from '../types'

export class CoreDataSource {
  public readonly kong: KongDataSource
  public readonly yDaemon: YDaemonDataSource

  constructor(context: SdkContext) {
    this.kong = new KongDataSource(context, 'kong')
    this.yDaemon = new YDaemonDataSource(context, 'yDaemon')
  }

  async initialize(): Promise<void> {
    await Promise.all([this.kong.initialize(), this.yDaemon.initialize()])
  }

  dispose(): void {
    this.kong.dispose()
    this.yDaemon.dispose()
  }

  // getAprOracle(chainId: number): Promise<any> {
  //   return this.kong.getVaultsData()
  // }
}
