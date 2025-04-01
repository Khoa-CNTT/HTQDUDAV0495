# Dynamic Quiz System Using AI And Gamification For Interactive Learning

## Description
🔹The Dynamic Quiz System leverages AI and gamification to create an engaging, interactive learning experience. It enables users to participate in quizzes, create custom questions, and compete with friends in real-time.

## Installation
1. Clone the Repository
    git clone https://github.com/your-username/dynamic-quiz-system.git
    cd dynamic-quiz-system

2. Environment Variables
🔹Create a .env file in the server folder with the following variables:
    PORT=5000
    MONGO_URI=<your_mongodb_connection_string>

3. Backend Setup
    cd server
    npm install
🔹Ensure MongoDB is running and update MONGO_URI in .env.
🔹Run the server: npm start

4. Frontend Setup
    cd client
    npm install
🔹Run the client: npm run dev

## Usage
🔹Start the backend: npm start
🔹Start the frontend: npm run dev

## Troubleshooting
🔹 MongoDB connection error: Ensure MongoDB is running locally or provide a correct remote connection string.
🔹 CORS issues: Modify backend CORS settings if facing frontend-backend communication errors.
🔹 Environment variables not loading: Double-check the .env file and restart the server.