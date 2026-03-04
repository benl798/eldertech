import { Box, Text } from '@chakra-ui/react'
import type { Message } from '../hooks/useChat'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <Box
      display="flex"
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      mb={4}
    >
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
        outline={message.flagged ? '2px solid' : 'none'}
        outlineColor={message.flagged ? 'orange.400' : 'none'}
      >
        <Text
          fontSize="lg"
          lineHeight="tall"
          whiteSpace="pre-wrap"
        >
          {message.content}
        </Text>
        {message.flagged && (
          <Text fontSize="xs" color="orange.500" mt={2} fontWeight="semibold">
            ⚠ This message has been flagged for review
          </Text>
        )}
      </Box>
    </Box>
  )
}