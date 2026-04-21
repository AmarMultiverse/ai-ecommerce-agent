# E-Commerce Analytics AI Agent

## 1. Dataset Description
- **Source:** Kaggle Women's E-Commerce Clothing Reviews
- **Size:** 10,500 rows processed (Meets >10K requirement)
- **Preprocessing:** Filtered empty reviews, concatenated Title and Review Text, split into chunks of 1000 characters with 200 overlap.

## 2. Setup Instructions
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and add your Groq API key: `GROQ_API_KEY=your_key_here`
4. Run the agent using `node src/index.js`