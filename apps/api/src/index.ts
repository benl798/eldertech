import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import dotenv from 'dotenv'

dotenv.config()

async function start() {
  const server = new ApolloServer({ typeDefs, resolvers })

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
  })

  console.log(`🚀 ElderTech API running at ${url}`)
}

start().catch(console.error)
