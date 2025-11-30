# 🍽️ Smart Restaurant AI Assistant
An intelligent AI-powered assistant designed to help restaurants automate tasks, handle customer queries, and provide a smart, interactive dining experience.

---

## 🚀 Features

- **AI Chat Assistant** powered by Google Gemini / LangChain
- **Menu Recommendation System**
- **Order Assistance**: Helps customers place orders via chat
- **Restaurant FAQs** (timings, address, delivery options, etc.)
- **Voice and Text Support** (optional)
- **Smart Intent Detection**
- **User-friendly Frontend**
- **Express.js Backend**
- **Environment-safe with .env protection**
- Supports future expansion: Table booking, payment queries, staff support, etc.

---

## 🛠️ Tech Stack

### Backend:
- Node.js
- Express.js
- LangChain
- Google Generative AI (Gemini)
- dotenv
- JavaScript (ES Modules)

### Frontend:
- HTML
- CSS
- JavaScript
## 📂 Project Structure

smart-restaurant-assistant/
│
├── public/
│ └── index.html # Frontend UI
├── server.js # Node.js backend with AI logic
├── .env # API keys (ignored from Git)
├── .gitignore
├── package.json
└── uploads/ # (If used for voice/image uploads)

yaml
Copy code

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/samiksha-lande/smart-restaurant-assistant-.git
cd smart-restaurant-assistant-
2️⃣ Install dependencies
bash
Copy code
npm install
3️⃣ Add your API Key
Create a .env file:

ini
Copy code
GOOGLE_API_KEY=your_key_here
4️⃣ Start the server
bash
Copy code
node server.js
5️⃣ Open the frontend
Go to:

arduino
Copy code
http://localhost:3000
🤖 How It Works
User messages → sent to server

Server processes input through LangChain + Gemini

Assistant detects intent (menu, order, FAQ, booking)

Generates a smart reply

Response displayed to user in chat window

📌 Future Improvements
Add database for menu and orders

Add table booking system

Add multi-language support

Deploy to Render / Vercel

Admin dashboard for restaurant owners

Voice assistant mode

WhatsApp / Telegram bot integration

🧑‍💻 Author

Samiksha Lande
AI Intern & Full-Stack Developer
Passionate about building real-world AI projects 🚀
## 📂 Project Structure

