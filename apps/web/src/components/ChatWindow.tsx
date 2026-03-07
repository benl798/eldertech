import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Textarea,
  Button,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from '@chakra-ui/react'
import { useChat } from '../hooks/useChat'
import { useSavedSteps } from '../hooks/useSavedSteps'
import { MessageBubble } from './MessageBubble'
import { SavedStepsDrawer } from './SavedStepsDrawer'
import { SaveStepPrompt } from './SaveStepPrompt'

const NAME_KEY = 'eldertech_companion_name'

export function ChatWindow() {
  const [companionName, setCompanionName] = useState(
    localStorage.getItem(NAME_KEY) || ''
  )
  const [nameInput, setNameInput] = useState(companionName)
  const [stepsSaved, setStepsSaved] = useState(false)

  const settingsModal = useDisclosure({ defaultIsOpen: !companionName })
  const stepsDrawer = useDisclosure()

  const { messages, sendMessage, loading, resetMessages, addMessage, conversationId } = useChat(companionName || 'Your Companion')
  const { steps, saveStep, deleteStep } = useSavedSteps()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const last = messages[messages.length - 1]
  const savePromptContent =
    !stepsSaved &&
      last?.role === 'assistant' &&
      /(shall i save|would you like me to save|want me to save|save these steps)/i.test(last.content)
      ? last.content
      : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const saveName = () => {
    const name = nameInput.trim() || 'Your Companion'
    setCompanionName(name)
    localStorage.setItem(NAME_KEY, name)
    resetMessages(name)
    setStepsSaved(false)
    settingsModal.onClose()
  }

  const handleSaveStep = async (title: string) => {
    if (!conversationId) return
    setStepsSaved(true)
    await saveStep(title, messages.map(m => ({ role: m.role, content: m.content })), conversationId)
    addMessage({
      role: 'assistant',
      content: `Lovely — I've saved those steps as "${title}" in your personal library. You can find them anytime by clicking "My Steps" at the top.`,
    })
  }

  const handleLoadConversation = (loadConversationId: string) => {
    // For now just log — full conversation loading comes next
    console.log('Load conversation:', loadConversationId)
  }

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
      <Box px={6} py={4} bg="white" borderBottomWidth={1} borderColor="gray.200" boxShadow="sm">
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              {companionName || 'Your Companion'}
            </Text>
            <Text fontSize="sm" color="gray.500">Always here to help</Text>
          </Box>
          <Flex gap={2}>
            <Button size="sm" variant="outline" colorScheme="gray" onClick={stepsDrawer.onOpen}>
              📋 My Steps {steps.length > 0 && `(${steps.length})`}
            </Button>
            <Button size="sm" variant="outline" colorScheme="gray" onClick={settingsModal.onOpen}>
              ⚙ Settings
            </Button>
          </Flex>
        </Flex>
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
        {savePromptContent && (
          <SaveStepPrompt
            suggestedContent={savePromptContent}
            onSave={handleSaveStep}
            onDismiss={() => setStepsSaved(true)}
          />
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box px={6} py={4} bg="white" borderTopWidth={1} borderColor="gray.200">
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

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.onClose}
        isCentered
        closeOnOverlayClick={!!companionName}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Name your companion</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Give your companion a name — it can be anything that feels warm and familiar.
            </Text>
            <Input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="e.g. Ben, Evie, Max..."
              size="lg"
              onKeyDown={e => e.key === 'Enter' && saveName()}
              autoFocus
            />
          </ModalBody>
          <ModalFooter gap={3}>
            {companionName && (
              <Button variant="ghost" onClick={settingsModal.onClose}>Cancel</Button>
            )}
            <Button colorScheme="blue" onClick={saveName}>
              {companionName ? 'Save' : 'Get Started'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Saved Steps Drawer */}
      <SavedStepsDrawer
        isOpen={stepsDrawer.isOpen}
        onClose={stepsDrawer.onClose}
        steps={steps}
        onDelete={deleteStep}
        onLoadConversation={handleLoadConversation}
      />
    </Flex>
  )
}