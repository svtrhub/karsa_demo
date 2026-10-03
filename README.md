# Karsa — Pendamping Belajar & Portofolio AI Siswa Indonesia 🚀

**Karsa** adalah aplikasi pendamping edtech berbasis AI yang membantu siswa Indonesia merancang strategi kompetisi, ritme belajar, dan portofolio masa depan bersama 5 persona Sobat Karsa (Karsa, Ara, Arka, Sekar, dan Rangga).

---

## ✨ Fitur Utama

- **Onboarding Interaktif**: Penyesuaian jenjang pendidikan, target minat/bakat, dan ritme belajar pribadi.
- **5 Persona AI (Sobat Karsa)**:
  - **Karsa**: Mentor Utama & Strategi Belajar
  - **Ara**: Pendamping Emosional & Motivasi
  - **Arka**: Eksplorasi Sains, Teknik & Koding
  - **Sekar**: Seni, Desain & Penulisan Kreatif
  - **Rangga**: Kepemimpinan, Bisnis & Sosial
- **Interaksi Real-time**: Diskusi dengan AI yang disesuaikan dengan konteks profil siswa.
- **Proteksi API Key**: Endpoint backend terisolasi dengan rate limiting dan validasi CORS.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Bahasa**: TypeScript, React 19
- **Styling**: Tailwind CSS, Framer Motion
- **AI Engine**: Vercel AI SDK (`@ai-sdk/google`) dengan Google Gemini
- **Icons**: Lucide React

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Clone Repository
```bash
git clone <URL-REPOSITORY-ANDA>
cd karsa_demo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root direktori project dan tambahkan API Key Google Gemini Anda:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Jalankan Dev Server
```bash
npm run dev
```
Buka `http://localhost:3000` di browser Anda.

---

## 🔒 Keamanan & Variabel Lingkungan

Pastikan **TIDAK** mengunggah file `.env` atau `.env.local` yang berisi kredensial asli ke repository publik. File tersebut sudah masuk dalam daftar `.gitignore`.
