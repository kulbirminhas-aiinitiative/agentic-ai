import os
import logging
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.embeddings.openai import OpenAIEmbedding
from sentence_transformers import CrossEncoder
from pinecone import Pinecone, ServerlessSpec

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_pinecone_index():
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
    PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "llamaindex-demo")
    if not PINECONE_API_KEY or not PINECONE_ENVIRONMENT:
        raise ValueError("Pinecone API key or environment not set.")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index_names = pc.list_indexes().names()
    if PINECONE_INDEX_NAME not in index_names:
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region=PINECONE_ENVIRONMENT
            )
        )
    return pc.Index(PINECONE_INDEX_NAME)

def get_retrieve_rerank_engine(data_dir='data', reranker_model="cross-encoder/ms-marco-MiniLM-L-6-v2"):
    if not os.path.exists(data_dir) or not os.listdir(data_dir):
        raise FileNotFoundError(f"No documents found in directory: {data_dir}")
    pinecone_index = get_pinecone_index()
    vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
    embed_model = OpenAIEmbedding()
    documents = SimpleDirectoryReader(data_dir).load_data()
    if not documents:
        raise ValueError("No documents loaded for indexing.")
    index = VectorStoreIndex.from_documents(documents, vector_store=vector_store, embed_model=embed_model)
    retriever = VectorIndexRetriever(index=index, similarity_top_k=8)
    return retriever, documents

def run_retrieve_rerank_query(query, data_dir='data', reranker_model="cross-encoder/ms-marco-MiniLM-L-6-v2"):
    logger.info(f"Running Retrieve & Rerank RAG query: {query}")
    retriever, documents = get_retrieve_rerank_engine(data_dir, reranker_model)
    # Retrieve top-k candidates
    retrieved_nodes = retriever.retrieve(query)
    if not retrieved_nodes:
        logger.warning("No documents retrieved.")
        return "No relevant documents found."
    # Prepare pairs for reranking
    pairs = [(query, node.get_content()) for node in retrieved_nodes]
    cross_encoder = CrossEncoder(reranker_model)
    scores = cross_encoder.predict(pairs)
    # Sort by rerank score
    reranked = sorted(zip(retrieved_nodes, scores), key=lambda x: x[1], reverse=True)
    best_node, best_score = reranked[0]
    logger.info(f"Best node score: {best_score}")
    logger.info(f"Best node content: {best_node.get_content()}")
    return best_node.get_content()

if __name__ == "__main__":
    result = run_retrieve_rerank_query("What is this project about?")
    print(result)
