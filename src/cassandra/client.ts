import { Client } from 'cassandra-driver'
import { ContainerModule, interfaces } from 'inversify'

import { getEnvironmentVariable } from '../utils'

const client = new Client({
  contactPoints: [getEnvironmentVariable('CASSANDRA_DOMAIN')],
  credentials: {
    username: getEnvironmentVariable('CASSANDRA_USERNAME'),
    password: getEnvironmentVariable('CASSANDRA_PASSWORD')
  },
  localDataCenter: getEnvironmentVariable('CASSANDRA_DATACENTER'),
  keyspace: getEnvironmentVariable('CASSANDRA_KEYSPACE'),
  protocolOptions: {
    port: Number.parseInt(getEnvironmentVariable('CASSANDRA_PORT', '9042'), 10)
  }
})

client.connect()

export const cassandraModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(Client).toConstantValue(client)
})
