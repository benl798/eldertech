import { gql } from "graphql-tag";

export const CHAT_MUTATION = gql`
  mutation Chat(
    $messages: [MessageInput!]!
    $companionName: String!
    $userId: String!
    $conversationId: String
  ) {
    chat(
      messages: $messages
      companionName: $companionName
      userId: $userId
      conversationId: $conversationId
    ) {
      reply
      flagged
      flagReason
      conversationId
    }
  }
`;

export const SUMMARISE_MUTATION = gql`
  mutation Summarise($messages: [MessageInput!]!) {
    summarise(messages: $messages) {
      summary
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($id: String!) {
    conversation(id: $id) {
      id
      title
      createdAt
      messages {
        id
        role
        content
        flagged
        createdAt
      }
    }
  }
`;
