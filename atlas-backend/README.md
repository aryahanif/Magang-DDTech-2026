# Atlas Backend MVP

Sistem backend untuk platform **Atlas (AI Workforce Platform)** dari DDTech. Backend ini dibangun menggunakan **NestJS**, **Prisma ORM**, dan **PostgreSQL** dengan dukungan Docker untuk local development.

## 🚀 Persiapan Awal (Setup)

Pastikan Anda telah menginstal aplikasi berikut di laptop/PC Anda:
- **Node.js** (versi 18 atau ke atas disarankan)
- **Docker Desktop** (untuk database lokal)

### 1. Clone & Install Dependencies
Lakukan clone repository ini dan jalankan instalasi library:
```bash
git clone https://github.com/aryahanif/Magang-DDTech-2026.git
cd Magang-DDTech-2026/atlas-backend
npm install
```

### 2. Konfigurasi Environment (File `.env`)
Buat file `.env` baru dengan menyalin contoh yang sudah ada:
```bash
cp .env.example .env
```
Anda bisa mengubah isi rahasia di dalam file `.env` tersebut. File `.env` ini **tidak akan di-commit** ke Git demi keamanan.

### 3. Menjalankan Database Lokal (Docker)
Proyek ini sudah dilengkapi dengan `docker-compose.yml` untuk menjalankan PostgreSQL versi 15 di port `5433`.
Jalankan perintah ini untuk menyalakan database di background:
```bash
docker-compose up -d
```
*(Untuk mematikan database, gunakan perintah `docker-compose down`)*

### 4. Setup Prisma Schema
Setelah database berjalan, sinkronkan skema tabel ke dalam database tersebut menggunakan Prisma:
```bash
npx prisma db push
```
*(Anda bisa menggunakan `npx prisma studio` untuk melihat dan mengedit isi database langsung melalui browser)*.

---

## 🏃‍♂️ Menjalankan Aplikasi Backend

Setelah semua persiapan di atas selesai, jalankan server backend NestJS:

```bash
# Mode development (live reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Server backend akan berjalan di `http://localhost:3000` (atau port lain sesuai isi `.env`).

## 📁 Struktur Modul
Sesuai spesifikasi proyek, backend ini disusun dengan konsep modular:
- `leads`: Menangani penerimaan form leads dari website publik.
- `qualification`: Mesin penilaian prospek & integrasi AI (OpenAI).
- `email`: Notifikasi internal untuk tim DDTech.
- `admin` & `dashboard`: Endpoint khusus manajemen leads dan statistik CRM.
- `auth`: Otentikasi JWT untuk akses admin.
