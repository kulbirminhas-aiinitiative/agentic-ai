# Agentic AI Platform

A modern, full-stack AI agent management platform built with Next.js, FastAPI, and Pinecone for RAG workflows.

## Features

- **Agent Management**: Create, configure, and deploy AI agents
- **Knowledge Base**: Upload files, connect databases, integrate APIs
- **RAG Workflow**: Document chunking, embedding, and retrieval with Pinecone
- **Multi-Channel Deployment**: Outlook, Gmail, WhatsApp, Slack integration
- **Advanced Configuration**: Temperature, Top-P, Top-K, and more LLM parameters
- **Analytics & Monitoring**: Conversation logs, performance metrics, cost tracking
- **Agent Behavior**: Intent management, response templates, actions/tools

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React
- **Backend**: Node.js API Routes, FastAPI (Python)
- **Vector Database**: Pinecone
- **LLM Integration**: OpenAI GPT-4o
- **Document Processing**: LlamaIndex

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agentic-ai.git
   cd agentic-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```
   PINECONE_API_KEY=your-pinecone-key
   PINECONE_ENVIRONMENT=your-pinecone-env
   PINECONE_INDEX_NAME=llamaindex-demo
   OPENAI_API_KEY=your-openai-key
   ```

4. **Start the development servers**
   ```bash
   # Frontend (Next.js)
   npm run dev
   
   # Backend (FastAPI)
   uvicorn rag_backend:app --reload
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Project Structure

```
agentic-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── chat/             # Chat interface
├── rag_backend.py         # FastAPI backend
├── config.py             # Configuration
├── plan.md               # Project roadmap
└── RAG_WF.ipynb          # RAG workflow notebook
```

## API Endpoints

- `/api/upload` - File upload
- `/api/chat` - Chat with agent
- `/api/channels` - Channel management
- `/api/analytics` - Analytics data
- `/api/agent-behavior` - Agent configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/route.ts`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API Routes

This directory contains example API routes for the headless API app.

For more details, see [route.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/route).
