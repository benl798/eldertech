import { Box, Flex, Text } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '../hooks/useChat'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <Flex justify={isUser ? 'flex-end' : 'flex-start'} mb={4}>
      <Box
        maxW="75%"
        bg={isUser ? 'blue.500' : 'white'}
        color={isUser ? 'white' : 'gray.800'}
        px={5}
        py={4}
        borderRadius={isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'}
        boxShadow="sm"
        borderWidth={isUser ? 0 : 1}
        borderColor="gray.100"
        fontSize="md"
        lineHeight="tall"
      >
        {message.flagged && (
          <Text fontSize="xs" color="orange.400" mb={2} fontWeight="600">
            ⚠ Flagged for review
          </Text>
        )}
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </Box>
    </Flex>
  )
}