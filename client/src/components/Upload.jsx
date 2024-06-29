// src/components/Upload.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';


const Upload = ({ handlePdfUpload, handlePdfSubmit }) => {
  const [fileName, setFileName] = useState('');

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      handlePdfUpload(event);
    }
  };

  return (
    <div className="upload-container">
      <label htmlFor="file-upload" className="custom-file-upload">
        <FontAwesomeIcon icon={faPaperclip} />
      </label>
      <input id="file-upload" type="file" onChange={onFileChange} />
      {fileName && <span className="file-name">{fileName}</span>}
      <button onClick={handlePdfSubmit}>Upload PDF</button>
    </div>
  );
};

export default Upload;
