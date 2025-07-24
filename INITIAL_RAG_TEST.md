# Instructions: Initial End-to-End RAG Workflow Test

1. Start the FastAPI backend:
   ```powershell
   uvicorn rag_backend:app --reload
   ```
   (Ensure your .env is set with Pinecone credentials and the backend is running on port 8000)

2. Start your Next.js frontend:
   ```powershell
   npm run dev
   ```

3. In the web UI:
   - Go to "Knowledge Base / Data Sources"
   - Upload a file (PDF, TXT, etc.)
   - Wait for the upload and processing message
   - Click the link to "Agent Chat (RAG)"
   - Ask a question about your uploaded document

4. Observe the response. If you see a relevant answer, the pipeline is working!

5. Troubleshooting:
   - If you see errors about backend connection, ensure FastAPI is running and accessible at http://localhost:8000
   - Check the terminal for error logs from either server

---

You can now iterate on chunking, embedding, and RAG logic in the Python backend for more advanced workflows.
