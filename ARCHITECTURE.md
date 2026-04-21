# System Architecture

**End-to-End Flow:**
1. **Data Ingestion:** `csv-parser` reads `reviews.csv`.
2. **Chunking:** `RecursiveCharacterTextSplitter` breaks text into smaller chunks.
3. **Embedding & Storage:** Custom `FastLocalEmbeddings` generates vectors, stored in Langchain's `MemoryVectorStore`.
4. **Retrieval Agent:** User query is vectorized, top 5 similar chunks are retrieved.
5. **Output Synthesis:** Retrieved context + User query is sent to `ChatGroq` (Llama 3.1) to generate the final response.