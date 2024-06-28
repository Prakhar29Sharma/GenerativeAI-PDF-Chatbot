from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
import os
import fitz  # PyMuPDF for PDF handling
import google.generativeai as genai  # Import generativeai module
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as per your frontend URL in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_uri = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(mongo_uri)
db = client["pdf_qa_db"]
collection = db["documents"]

# Configure Gemini Langchain API
genai.configure(api_key=os.getenv("GEMINI_LANGCHAIN_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Serve static files like favicon.ico
app.mount("/static", StaticFiles(directory="static"), name="static")

# Models
class PDFDocument(BaseModel):
    filename: str
    text: str

class Question(BaseModel):
    question: str

# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    pdf_text = ""
    try:
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pdf_text += page.get_text()
        doc.close()
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")
    
    return pdf_text

# Function to save PDF document to MongoDB
async def save_pdf_to_db(file: UploadFile):
    try:
        # Save uploaded PDF file to server
        file_path = os.path.join("uploads", file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        # Extract text from PDF
        pdf_text = extract_text_from_pdf(file_path)

        # Save PDF metadata and text to MongoDB
        document = PDFDocument(filename=file.filename, text=pdf_text)
        await collection.insert_one(document.dict())

        return file.filename, pdf_text
    except Exception as e:
        logging.error(f"Failed to process PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

# Function to generate response using Gemini Langchain API
def generate_response(question, pdf_text):
    try:
        # Combine the question and PDF text as context
        prompt = f"Context: {pdf_text}\n\nQuestion: {question}\n\nAnswer:"

        # Generate content based on the combined prompt
        response = model.generate_content(prompt)

        # Check if response contains the text field
        if hasattr(response, 'text'):
            return format_response(response.text)
        else:
            logging.error("No text found in the response")
            raise HTTPException(status_code=500, detail="Failed to generate response: No text found in the response")

    except Exception as e:
        logging.error(f"Failed to generate response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

# Function to format response
def format_response(response_text):
    formatted_response = response_text.replace("*", "")
    # Add more formatting rules if needed
    return formatted_response

# Routes
@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        filename, pdf_text = await save_pdf_to_db(file)
        return {"message": "PDF uploaded and processed successfully.", "filename": filename, "pdf_text": pdf_text}
    except Exception as e:
        logging.error(f"Failed to process PDF: {str(e)}")
        return {"error": f"Failed to process PDF: {str(e)}"}

@app.post("/ask-question/")
async def ask_question(question_data: Question):
    try:
        question = question_data.question

        # Find the most recently uploaded PDF (assuming this is what you want to use)
        recent_document = await collection.find_one(sort=[("_id", -1)])
        if recent_document:
            pdf_text = recent_document["text"]

            # Generate response using Gemini Langchain API
            response_text = generate_response(question, pdf_text)

            return {"output_text": response_text}
        else:
            logging.error("No PDF document found in database.")
            return {"error": "No PDF document found in database."}
    
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {"error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
