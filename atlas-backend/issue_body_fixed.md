# [BE-13] Setup and Implement Automated Testing for MVP Features

## 📌 Context / Tujuan Tugas
Berdasarkan dokumen MVP (Bab 17: Testing Requirements), sebuah proyek belum dapat dianggap selesai jika tidak memiliki *Minimum Tests*. Tugas ini secara spesifik berfokus pada pembuatan dan implementasi pengujian otomatis untuk modul **Auth** (Admin Authentication).

**User Story:**
> *As a Developer, I want automated tests covering core functionalities so that I can deploy updates safely without breaking existing features.*

## ✅ Acceptance Criteria (AC)
- [x] **Admin Authentication:** Tes login (keberhasilan menghasilkan Token JWT dan penolakan *Unauthorized* ketika kredensial salah).

---
## 🛠️ Technical Implementation Plan
- Gunakan modul bawaan `@nestjs/testing` dan *Jest*.
- Buat file `auth.controller.spec.ts` untuk memastikan fitur login Admin berjalan dengan sempurna dan aman.
