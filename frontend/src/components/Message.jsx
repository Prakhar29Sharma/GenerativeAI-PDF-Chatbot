// src/components/Message.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';


const Message = ({ text, sender }) => {
  const messageClass = sender === 'user' ? 'user-message' : 'bot-message';

  return (
    <div className={`message ${messageClass}`}>
      {sender === 'user' && (
        <FontAwesomeIcon icon={faUser} className="user-icon" />
      )}
      {sender === 'bot' && (
        <img src="./ai logo.png" alt="Bot Logo" className="bot-logo" />
      )}
      <span className="message-text">{text}</span>
    </div>
  );
};

export default Message;
