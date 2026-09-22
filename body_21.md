## 📌 Context / Tujuan Tugas
Berdasarkan dokumen PRD MVP Bagian 6 (Backend Process) dan Bagian 12 (Phase 2), sistem harus bisa mendeteksi pendaftaran duplikat. Jika ada email atau nama perusahaan yang sama mendaftar lebih dari satu kali, sistem tidak boleh asal menimpanya, melainkan harus menandainya (flagging) agar tim sales tahu bahwa ini adalah duplikat.

**User Story:**
> *As a Sales Team, I want duplicate submissions to be flagged automatically, so I don't waste time reviewing the same prospect twice or overwriting existing CRM data.*

## ✅ Acceptance Criteria (AC)
- [ ] **AC 1:** Sebelum menyimpan lead baru, sistem mengecek apakah ada `email` atau `company_name` yang sama di database.
- [ ] **AC 2:** Jika ditemukan duplikat, lead baru tetap disimpan, namun sistem akan membuat *Note* otomatis dan penanda khusus di log bahwa data tersebut duplikat.
- [ ] **AC 3:** Aktivitas deteksi duplikat dicatat dalam `lead_activity_logs` dengan tipe `DUPLICATE_FLAGGED`.

---

## 🛠️ Technical Implementation Plan
*Bagian ini ditulis khusus sebagai instruksi teknis terstruktur agar mudah dibaca oleh Programmer atau Model AI (seperti GPT/Claude/Gemini/Cursor).*

### 1. Modifikasi Logika createLead
*   **Target File:** `src/modules/leads/leads.service.ts`
*   **Instruksi:**
    1. Di awal fungsi `createLead`, lakukan query `findFirst` berdasarkan `email` atau `company_name`.
    2. Jika ditemukan kesamaan, simpan data pendaftar lama di memori sementara.
    3. Eksekusi pembuatan `lead` baru seperti biasa.

### 2. Catat Log Aktivitas & Notes
*   **Target File:** `src/modules/leads/leads.service.ts`
*   **Instruksi:**
    1. Jika poin 1 mendeteksi adanya duplikat, langsung buatkan satu record di tabel `LeadNote` untuk `lead` yang baru dibuat, berisikan: `"System Alert: Duplicate entry detected matching an existing lead in the database."`
    2. Buat record di tabel `LeadActivityLog` dengan `activity_type` berupa `DUPLICATE_FLAGGED`.
