import { gql } from "@apollo/client";

export const CHAT_MUTATION = gql`
  mutation Chat(
    $messages: [MessageInput!]!
    $companionName: String!
    $userId: String!
  ) {
    chat(messages: $messages, companionName: $companionName, userId: $userId) {
      reply
      flagged
      flagReason
    }
  }
`;
