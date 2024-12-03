//Import Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Initialize the Express App and Storage
const app = express();
app.use(bodyParser.json()); // Middleware for parsing JSON

let articles = []; // In-memory storage
const dataFile = './data.json'; // File for optional persistence

// Load articles from file if available
if (fs.existsSync(dataFile)) {
  articles = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
}

// Utility to save articles to file
const saveToFile = () => {
  fs.writeFileSync(dataFile, JSON.stringify(articles, null, 2));
};

//Add the POST /articles Endpoint


app.post('/articles', (req, res) => {
    const { title, content, tags } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }
  
    const id = articles.length + 1;
    const newArticle = { id, title, content, tags: tags || [], createdAt: new Date() };
    articles.push(newArticle);
  
    saveToFile();
    res.status(201).json({ message: 'Article added successfully.', article: newArticle });
  });

  //Add the GET /articles/search Endpoint
  app.get('/articles/search', (req, res) => {
    const { keyword, sortBy = 'relevance' } = req.query;
  
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required for search.' });
    }
  
    const keywordLower = keyword.toLowerCase();
    const results = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(keywordLower) ||
        article.content.toLowerCase().includes(keywordLower)
    );
  
    const scoredResults = results.map((article) => {
      const titleMatches = (article.title.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
      const contentMatches = (article.content.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
      return { ...article, relevance: titleMatches + contentMatches };
    });
  
    if (sortBy === 'relevance') {
      scoredResults.sort((a, b) => b.relevance - a.relevance);
    } else if (sortBy === 'date') {
      scoredResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  
    res.json(scoredResults);
  });


  //Add the GET /articles/:id Endpoint  
  app.get('/articles/:id', (req, res) => {
    const { id } = req.params;
    const article = articles.find((a) => a.id === parseInt(id));
  
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }
  
    res.json(article);
  });

  //starting the server
  const PORT = 3000;
app.listen(PORT, () => console.log(`Mini Search Engine running on port ${PORT}`));
