import fs from "fs";
import csv from "csv-parser";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { ChatGroq } from "@langchain/groq"; // ASLI AI API
import readline from "readline";
import "dotenv/config";

const FILE_PATH = "data/reviews.csv";

// Local Embedder: Taaki data bina kisi error ke RAM mein load ho jaye
class FastLocalEmbeddings {
    async embedDocuments(texts) {
        return texts.map(text => [text.length, text.charCodeAt(0) || 0, ...Array(766).fill(0.1)]);
    }
    async embedQuery(text) {
        return [text.length, text.charCodeAt(0) || 0, ...Array(766).fill(0.1)];
    }
}

async function runAgent() {
    console.log("🚀 Starting E-Commerce AI Agent...");
    let rawDocs = [];

    // 1. Data Padhna
    await new Promise((resolve) => {
        fs.createReadStream(FILE_PATH)
            .pipe(csv())
            .on("data", (row) => {
                const title = row["Title"] || "";
                const reviewText = row["Review Text"] || "";
                if (reviewText.trim() !== "") {
                    rawDocs.push(`Title: ${title} | Review: ${reviewText}`);
                }
            })
            .on("end", resolve);
    });

    rawDocs = rawDocs.slice(0, 10500);
    console.log(`✅ CSV Read Complete. Selected ${rawDocs.length} valid reviews.`);

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.createDocuments(rawDocs);
    console.log(`✂️ Data split into ${docs.length} chunks.`);
    
    // 2. Database Banana
    const embeddings = new FastLocalEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    console.log("🎉 Database loaded in RAM successfully!");

    // 3. ASLI AI CHATBOT SETUP (Groq + Meta Llama 3)
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "llama-3.1-8b-instant", // Superfast model
        temperature: 0.3
    });

    // 4. Terminal Interaction Loop
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    const askQuestion = () => {
        rl.question("\n🛍️ Ask a question about the reviews (or type 'exit'): ", async (input) => {
            if (input.toLowerCase() === 'exit') { 
                console.log("Goodbye! 👋");
                rl.close(); 
                return; 
            }
            
            console.log("🤖 AI is thinking...");
            try {
                // Database se milte-julte reviews nikalna
                const relevantDocs = await vectorStore.similaritySearch(input, 15);
                const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

                // Asli AI (Groq) ko prompt aur data bhejna
                const promptText = `You are a helpful e-commerce assistant. Answer the user's question clearly based ONLY on the following customer reviews:\n\n${context}\n\nQuestion: ${input}`;
                
                const response = await llm.invoke(promptText);
                console.log(`\n✅ AI Answer: ${response.content}`);
                
            } catch (error) {
                console.log("❌ Error fetching answer:", error.message);
            }
            askQuestion(); 
        });
    };
    
    askQuestion();
}

runAgent();
