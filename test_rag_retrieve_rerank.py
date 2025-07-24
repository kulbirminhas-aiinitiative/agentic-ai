import unittest
from unittest.mock import patch, MagicMock
import os

# Patch environment variables for Pinecone
os.environ["PINECONE_API_KEY"] = "test-key"
os.environ["PINECONE_ENVIRONMENT"] = "test-region"
os.environ["PINECONE_INDEX_NAME"] = "test-index"

import rag_retrieve_rerank


class TestRetrieveRerankRAG(unittest.TestCase):
    @patch("os.path.exists", return_value=True)
    @patch("os.listdir", return_value=["dummy.txt"])
    @patch("rag_retrieve_rerank.Pinecone")
    @patch("rag_retrieve_rerank.PineconeVectorStore")
    @patch("rag_retrieve_rerank.SimpleDirectoryReader")
    @patch("rag_retrieve_rerank.VectorStoreIndex")
    @patch("rag_retrieve_rerank.VectorIndexRetriever")
    @patch("rag_retrieve_rerank.CrossEncoder")
    def test_run_retrieve_rerank_query(self, mock_cross_encoder, mock_retriever, mock_index, mock_reader, mock_vector_store, mock_pinecone, mock_listdir, mock_exists):
        # Mock document loading
        mock_reader.return_value.load_data.return_value = [MagicMock()]
        # Mock Pinecone index
        mock_pinecone.return_value.list_indexes.return_value.names.return_value = ["test-index"]
        mock_pinecone.return_value.Index.return_value = MagicMock()
        # Mock index creation
        mock_index.from_documents.return_value = "mock_index"
        # Mock retriever
        mock_retriever.return_value = MagicMock(retrieve=MagicMock(return_value=[MagicMock(get_content=MagicMock(return_value="doc content"))]))
        # Mock CrossEncoder
        mock_cross_encoder.return_value.predict.return_value = [0.9]
        # Run the function
        result = rag_retrieve_rerank.run_retrieve_rerank_query("test query", data_dir="test_data")
        self.assertEqual(result, "doc content")

    def test_no_documents(self):
        with patch("os.path.exists", return_value=True), \
             patch("os.listdir", return_value=[]):
            with self.assertRaises(FileNotFoundError):
                rag_retrieve_rerank.get_retrieve_rerank_engine(data_dir="empty_data")

if __name__ == "__main__":
    unittest.main()
