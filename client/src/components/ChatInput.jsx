// src/components/ChatInput.jsx
import React from 'react';

const ChatInput = ({ question, handleQuestionChange, handleAskQuestion }) => {
  return (
    <div className="question-input">
      <input
        type="text"
        value={question}
        onChange={handleQuestionChange}
        placeholder="Ask a question"
        className="question-text"
      />
      <button onClick={handleAskQuestion} className="question-button">
        Ask Question
      </button>
    </div>
  );
};

export default ChatInput;
