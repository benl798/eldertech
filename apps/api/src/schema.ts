import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Message {
    id: String!
    role: String!
    content: String!
    flagged: Boolean!
    createdAt: String!
  }

  type Conversation {
    id: String!
    userId: String!
    title: String!
    createdAt: String!
    messages: [Message!]!
  }

  input MessageInput {
    role: String!
    content: String!
  }

  type ChatResponse {
    reply: String!
    flagged: Boolean!
    flagReason: String
    conversationId: String!
  }

  type SummaryResponse {
    summary: String!
  }

  type Query {
    health: String!
    conversation(id: String!): Conversation
    conversations(userId: String!): [Conversation!]!
  }

  type Mutation {
    chat(
      messages: [MessageInput!]!
      companionName: String!
      userId: String!
      conversationId: String
    ): ChatResponse!

    summarise(messages: [MessageInput!]!): SummaryResponse!
  }
`;
