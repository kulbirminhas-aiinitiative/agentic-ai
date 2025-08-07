
import os
import logging
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# Load environment variables from .env file
load_dotenv()

# Set up verbose logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_pinecone_index():
    try:
        PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
        PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "llamaindex-demo")
        logger.debug(f"Pinecone config: key={'set' if PINECONE_API_KEY else 'unset'}, env={PINECONE_ENVIRONMENT}, index={PINECONE_INDEX_NAME}")
        if not PINECONE_API_KEY or not PINECONE_ENVIRONMENT:
            logger.error("PINECONE_API_KEY or PINECONE_ENVIRONMENT is not set.")
            raise ValueError("Pinecone API key or environment not set.")
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index_names = pc.list_indexes().names()
        logger.debug(f"Existing Pinecone indexes: {index_names}")
        if PINECONE_INDEX_NAME not in index_names:
            logger.info(f"Creating Pinecone index: {PINECONE_INDEX_NAME}")
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",  # or "gcp" if that's your deployment
                    region=PINECONE_ENVIRONMENT
                )
            )
        else:
            logger.info(f"Using existing Pinecone index: {PINECONE_INDEX_NAME}")
        return pc.Index(PINECONE_INDEX_NAME)
    except Exception as e:
        logger.exception(f"Error initializing Pinecone index: {e}")
        raise

def get_llama_index(data_dir='data'):
    try:
        logger.debug(f"Loading documents from directory: {data_dir}")
        if not os.path.exists(data_dir) or not os.listdir(data_dir):
            logger.error(f"No documents found in directory: {data_dir}")
            raise FileNotFoundError(f"No documents found in directory: {data_dir}")
        index = get_pinecone_index()
        vector_store = PineconeVectorStore(pinecone_index=index)
        documents = SimpleDirectoryReader(data_dir).load_data()
        logger.debug(f"Loaded {len(documents)} documents.")
        if not documents:
            logger.error("No documents loaded for indexing.")
            raise ValueError("No documents loaded for indexing.")
        llama_index = VectorStoreIndex.from_documents(documents, vector_store=vector_store)
        return llama_index
    except Exception as e:
        logger.exception(f"Error building LlamaIndex: {e}")
        raise

def run_rag_query(query, data_dir='data'):
    try:
        logger.info(f"Running RAG query: {query}")
        llama_index = get_llama_index(data_dir)
        query_engine = llama_index.as_query_engine()
        response = query_engine.query(query)
        logger.info(f"RAG response: {response}")
        return response
    except Exception as e:
        logger.exception(f"Error running RAG query: {e}")
        return f"Error: {e}"

if __name__ == "__main__":
    # Example: Query the RAG system with a dummy value
    result = run_rag_query("What is this project about?")
    print(result)
