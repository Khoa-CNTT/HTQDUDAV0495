# Dynamic Quiz System Using AI And Gamification For Interactive Learning

## Description
🔹The Dynamic Quiz System leverages AI and gamification to create an engaging, interactive learning experience. It enables users to participate in quizzes, create custom questions, and compete with friends in real-time.

## Installation
1. Clone the Repository
   ```bash
   git clone https://github.com/Khoa-CNTT/HTQDUDAV0495.git
   cd HTQDUDAV0495
   ```

2. Environment Variables

   🔹Create a `.env` file in the **server** folder with the following variables:
   ```ini
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   ```

3. Backend Setup:
   ```bash
   cd server
   npm install
   ```

   🔹Ensure MongoDB is running and update `MONGO_URI` in `.env`.  

   🔹Run the server:  
   ```bash
   npm start
   ```

4. Frontend Setup:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Usage

🔹Start the backend:  
```bash
npm start
```

🔹Start the frontend:  
```bash
npm run dev
```

## Troubleshooting
🔹 **MongoDB connection error**: Ensure MongoDB is running locally or provide a correct remote connection string.  
🔹 **CORS issues**: Modify backend CORS settings if facing frontend-backend communication errors.  
🔹 **Environment variables not loading**: Double-check the `.env` file and restart the server.

## AI Quiz Generation

This application uses Google's Gemini API to generate quiz questions automatically. To ensure this feature works properly in your deployment, follow these steps:

1. **Get a Google Gemini API Key:**
   - Visit [Google AI Studio](https://ai.google.dev/) and sign up/log in
   - Navigate to the API keys section and create a new API key
   - Copy the API key for the next step

2. **Configure Your Environment:**
   - For local development: Add the API key to your `.env` file:
     ```
     GOOGLE_GEMINI_KEY=your_api_key_here
     ```
   - For Render deployment:
     - Go to your Render dashboard → Select your service
     - Navigate to "Environment" section
     - Add a new environment variable:
       - Key: `GOOGLE_GEMINI_KEY`
       - Value: `your_api_key_here`
     - Click "Save Changes" and redeploy your application

3. **Troubleshooting AI Quiz Generation:**
   - If you encounter errors with AI quiz generation:
     - Check your console logs for API-related errors
     - Verify that your API key is correctly set in your environment variables
     - Make sure your server has internet access to connect to Google's API
     - If all else fails, the application will use fallback quiz questions

### API Rate Limits

Note that Google Gemini API has rate limits that may affect your ability to generate quizzes frequently. If you encounter rate limit errors, wait a few minutes before trying again.

