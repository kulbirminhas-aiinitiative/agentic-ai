import os
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
import pinecone
import shutil
from config import MODEL_NAME
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "llamaindex-demo")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize Pinecone using the new SDK style
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key=PINECONE_API_KEY)
if PINECONE_INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")  # Adjust as needed
    )
index = pc.Index(PINECONE_INDEX_NAME)
vector_store = PineconeVectorStore(pinecone_index=index)

def get_llama_index():
    documents = SimpleDirectoryReader('data').load_data()
    return VectorStoreIndex.from_documents(documents, vector_store=vector_store, model_name=MODEL_NAME)

@app.post("/process-file/")
async def process_file(file: UploadFile = File(...)):
    os.makedirs("data", exist_ok=True)
    file_path = os.path.join("data", file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Rebuild index after new file
    get_llama_index()
    return {"status": "processed", "filename": file.filename, "model": MODEL_NAME}


from fastapi import Body
from typing import Optional

@app.post("/query/")
async def query_rag(request: Request, query: Optional[str] = Form(None)):
    # Try to get 'query' from form or JSON
    if query is None:
        try:
            data = await request.json()
            query = data.get("query")
        except Exception:
            query = None
    if not query:
        return {"error": "No query provided."}
    llama_index = get_llama_index()
    query_engine = llama_index.as_query_engine()
    response = query_engine.query(query)
    return {"response": str(response), "model": MODEL_NAME}

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    query = data.get("query")
    if not query:
        return {"error": "No query provided."}
    llama_index = get_llama_index()
    query_engine = llama_index.as_query_engine()
    response = query_engine.query(query)
    return {"response": str(response), "model": MODEL_NAME}

@app.get("/")
def read_root():
    return {"status": "ok", "model": MODEL_NAME}
