# EduSpace 🚀

EduSpace is a full-stack MERN-based EdTech platform designed to provide a seamless online learning experience for students, instructors, and administrators.

---

## 🔥 Features

* 🔐 Authentication & Authorization (JWT + OTP)
* 🎓 Course Creation & Management
* 📚 Structured Learning (Sections & Lectures)
* 💳 Payment Integration (Razorpay)
* ☁️ Media Upload (Cloudinary)
* 📊 Progress Tracking System
* 👨‍🏫 Instructor Dashboard
* 🔍 Course Search & Filtering

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Integrations

* Cloudinary (Media Storage)
* Razorpay (Payments)
* Nodemailer (Email Service)

---

## 📁 Project Structure

```bash
EduSpace/
├── server/        # Backend (Node + Express)
├── src/           # Frontend (React)
├── public/
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/EduSpace.git
cd EduSpace
```

---

### 2. Install dependencies

```bash
npm install
cd server
npm install
```

---

### 3. Setup Environment Variables

Create `.env` file in root and `server/`

Example:

```env
MONGODB_URL=your_mongodb_url
JWT_SECRET=your_secret
CLOUDINARY_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
RAZORPAY_KEY=xxx
RAZORPAY_SECRET=xxx
```

---

### 4. Run the project

```bash
# frontend
npm start

# backend
cd server
npm run dev
```

---

## 🚀 Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## 👨‍💻 Author

Team KKM(Kapil,Kshitij,Milan) – Full Stack Developer

---

## ⭐ Note

This project demonstrates a real-world scalable EdTech platform built using modern web technologies.
