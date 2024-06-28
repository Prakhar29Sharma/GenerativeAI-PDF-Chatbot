// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import your custom CSS file
import Upload from './components/Upload';
import ChatInput from './components/ChatInput';
import ChatBox from './components/ChatBox';

const App = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  const handlePdfUpload = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handlePdfSubmit = async () => {
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const res = await axios.post('https://generativeai-pdf-chatbot.onrender.com/upload-pdf/', formData);
      alert('PDF uploaded and processed successfully.');
      setMessages([...messages, { text: 'PDF uploaded and processed successfully.', sender: 'system' }]);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF.');
    }
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleAskQuestion = async () => {
    try {
      const res = await axios.post('https://generativeai-pdf-chatbot.onrender.com/ask-question/', { question });
      setMessages([...messages, { text: question, sender: 'user' }, { text: res.data.output_text, sender: 'bot' }]);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to get response.');
    }
  };

  return (
    <div className="app-container">
      <div className="header">
      <img src="./logo.png" alt="Logo" className="logo" />  
        <Upload handlePdfUpload={handlePdfUpload} handlePdfSubmit={handlePdfSubmit} />
      </div>
      <ChatBox messages={messages} />
      <ChatInput
        question={question}
        handleQuestionChange={handleQuestionChange}
        handleAskQuestion={handleAskQuestion}
      />
    </div>
  );
};

export default App;
