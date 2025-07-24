import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat - Agentic AI',
  description: 'Chat with your AI agent',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}