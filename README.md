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

## Triển khai trên Render.com

Để triển khai ứng dụng trên Render.com và đảm bảo tính năng tạo quiz bằng AI hoạt động, hãy làm theo các bước sau:

1. **Tạo dịch vụ Web Service cho Backend:**
   - Liên kết repository GitHub của bạn
   - Chọn thư mục `server` làm thư mục gốc
   - Đặt Build Command: `npm install`
   - Đặt Start Command: `node server.js`

2. **Tạo dịch vụ Static Site cho Frontend:**
   - Liên kết cùng repository GitHub
   - Chọn thư mục `client` làm thư mục gốc
   - Đặt Build Command: `npm install && npm run build`
   - Đặt Publish Directory: `dist`

3. **Cấu hình biến môi trường cho Backend:**
   - Trong dịch vụ Backend, vào phần Environment
   - Thêm các biến môi trường sau:
     ```
     NODE_ENV=production
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     CLIENT_URL=https://your-frontend-url.render.com
     GOOGLE_GEMINI_KEY=your_gemini_api_key_here
     ```

4. **Khắc phục lỗi tạo quiz bằng AI trên Render:**
   - Đảm bảo bạn đã cấu hình `GOOGLE_GEMINI_KEY` với API key hợp lệ từ Google AI Studio
   - Kiểm tra log của server để tìm thông báo lỗi
   - Nếu vẫn gặp lỗi, hãy thử:
     - Tạo API key mới từ Google AI Studio
     - Cập nhật API key trong biến môi trường của Render
     - Khởi động lại dịch vụ

**Lưu ý quan trọng:** Nếu bạn nhận được lỗi `404 Not Found` khi gọi endpoint `/api/quizzes/ai`, hãy kiểm tra xem:
1. Backend service đã được khởi động thành công
2. Biến môi trường `GOOGLE_GEMINI_KEY` đã được cấu hình đúng
3. CORS đã được cấu hình để chấp nhận yêu cầu từ domain frontend của bạn

