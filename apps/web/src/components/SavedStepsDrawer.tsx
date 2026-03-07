import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Box,
  Text,
  Button,
  Flex,
  Badge,
  Link,
} from '@chakra-ui/react'
import type { SavedStep } from '../hooks/useSavedSteps'

interface Props {
  isOpen: boolean
  onClose: () => void
  steps: SavedStep[]
  onDelete: (id: string) => void
  onLoadConversation: (conversationId: string) => void
}

export function SavedStepsDrawer({ isOpen, onClose, steps, onDelete, onLoadConversation }: Props) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth={1}>
          <Flex align="center" gap={3}>
            <Text>My Saved Steps</Text>
            {steps.length > 0 && (
              <Badge colorScheme="blue" borderRadius="full" px={2}>
                {steps.length}
              </Badge>
            )}
          </Flex>
        </DrawerHeader>
        <DrawerBody py={6}>
          {steps.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="3xl" mb={3}>📋</Text>
              <Text color="gray.500" fontSize="sm">
                No saved steps yet. Complete a task and your companion will offer to save the steps for you.
              </Text>
            </Box>
          ) : (
            steps.map((step, i) => (
              <Box
                key={step.id}
                mb={5}
                pb={5}
                borderBottomWidth={i < steps.length - 1 ? 1 : 0}
                borderColor="gray.100"
              >
                <Flex justify="space-between" align="flex-start" mb={1}>
                  <Text fontSize="xs" color="gray.400">
                    {formatDate(step.createdAt)}
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete(step.id)}
                  >
                    Remove
                  </Button>
                </Flex>
                <Text fontWeight="700" fontSize="md" color="gray.800" mb={2}>
                  {step.title}
                </Text>
                <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap" lineHeight="tall" mb={3}>
                  {step.summary}
                </Text>
                <Link
                  fontSize="xs"
                  color="blue.500"
                  fontWeight="600"
                  cursor="pointer"
                  onClick={() => {
                    onLoadConversation(step.conversationId)
                    onClose()
                  }}
                >
                  → View original conversation
                </Link>
              </Box>
            ))
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}