// src/components/ChatBox.jsx
import React from 'react';
import Message from './Message';

const ChatBox = ({ messages }) => {
  return (
    <div className="chat-container">
      {messages.map((msg, idx) => (
        <Message key={idx} text={msg.text} sender={msg.sender} />
      ))}
    </div>
  );
};

export default ChatBox;
