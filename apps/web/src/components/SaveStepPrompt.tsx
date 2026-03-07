import { useState } from 'react'
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
} from '@chakra-ui/react'

interface Props {
  suggestedContent: string
  onSave: (title: string) => void
  onDismiss: () => void
}

export function SaveStepPrompt({ onSave, onDismiss }: Props) {
  const [title, setTitle] = useState('')

  return (
    <Box
      bg="blue.50"
      border="1.5px solid"
      borderColor="blue.200"
      borderRadius="xl"
      p={4}
      mb={4}
    >
      <Text fontSize="sm" fontWeight="600" color="blue.700" mb={3}>
        💾 Save these steps to your personal library?
      </Text>
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Give these steps a name, e.g. 'How to send an email'"
        size="sm"
        bg="white"
        mb={3}
        onKeyDown={e => e.key === 'Enter' && title.trim() && onSave(title.trim())}
      />
      <Flex gap={2}>
        <Button
          size="sm"
          colorScheme="blue"
          disabled={!title.trim()}
          onClick={() => onSave(title.trim())}
        >
          Save steps
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Not now
        </Button>
      </Flex>
    </Box>
  )
}