import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Textarea,
  Button,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'

export function ChatWindow() {
  const { messages, sendMessage, loading } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Flex direction="column" h="100vh" bg="gray.50">
      {/* Header */}
      <Box
        px={6}
        py={4}
        bg="white"
        borderBottomWidth={1}
        borderColor="gray.200"
        boxShadow="sm"
      >
        <Text fontSize="xl" fontWeight="bold" color="gray.800">
          Your Companion
        </Text>
        <Text fontSize="sm" color="gray.500">
          Always here to help
        </Text>
      </Box>

      {/* Messages */}
      <Box flex={1} overflowY="auto" px={6} py={6}>
        {messages.map((message, i) => (
          <MessageBubble key={i} message={message} />
        ))}
        {loading && (
          <Flex justify="flex-start" mb={4}>
            <Box
              bg="white"
              px={5}
              py={4}
              borderRadius="18px 18px 18px 4px"
              boxShadow="sm"
              borderWidth={1}
              borderColor="gray.100"
            >
              <Spinner size="sm" color="blue.400" />
            </Box>
          </Flex>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box
        px={6}
        py={4}
        bg="white"
        borderTopWidth={1}
        borderColor="gray.200"
      >
        <Flex gap={3} align="flex-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here… press Enter to send"
            resize="none"
            rows={2}
            fontSize="md"
            borderRadius="xl"
            borderColor="gray.300"
            _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
          />
          <Button
            colorScheme="blue"
            borderRadius="xl"
            size="lg"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            px={6}
          >
            Send
          </Button>
        </Flex>
        <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
          Press Enter to send · Shift+Enter for a new line
        </Text>
      </Box>
    </Flex>
  )
}