import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Message {
    role: String!
    content: String!
  }

  input MessageInput {
    role: String!
    content: String!
  }

  type ChatResponse {
    reply: String!
    flagged: Boolean!
    flagReason: String
  }

  type Query {
    health: String!
  }

  type Mutation {
    chat(
      messages: [MessageInput!]!
      companionName: String!
      userId: String!
    ): ChatResponse!
  }
`
