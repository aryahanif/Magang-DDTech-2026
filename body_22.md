## 📌 Context / Tujuan Tugas
Berdasarkan dokumen PRD MVP Bagian 9 (Security Requirements) dan definisi tabel `users`, sistem harus membatasi akses endpoint berdasarkan peran pengguna (`admin`, `sales`, `viewer`). Saat ini semua endpoint admin terbuka untuk siapa saja yang memiliki token JWT valid.

**User Story:**
> *As a System Owner, I want strict role-based access control, so that Viewers cannot accidentally edit or delete lead data, and only Admins can change system AI settings.*

## ✅ Acceptance Criteria (AC)
- [ ] **AC 1:** Dibuat sebuah `RolesGuard` dan decorator `@Roles()` di NestJS.
- [ ] **AC 2:** Pengguna dengan role `viewer` HANYA bisa mengakses endpoint `GET` (Melihat Leads & Dashboard). Semua request `POST/PATCH/DELETE` akan ditolak dengan `403 Forbidden`.
- [ ] **AC 3:** Pengguna dengan role `sales` bisa melihat dan memperbarui status leads, tetapi tidak boleh mengakses menu `Settings` atau `Users Management`.
- [ ] **AC 4:** Pengguna dengan role `admin` memiliki hak akses penuh ke seluruh fitur.

---

## 🛠️ Technical Implementation Plan
*Bagian ini ditulis khusus sebagai instruksi teknis terstruktur agar mudah dibaca oleh Programmer atau Model AI (seperti GPT/Claude/Gemini/Cursor).*

### 1. Pembuatan Roles Decorator & Guard
*   **Target File:** `src/common/decorators/roles.decorator.ts` & `src/common/guards/roles.guard.ts`
*   **Instruksi:**
    1. Buat custom decorator `@Roles(...roles: string[])` menggunakan `SetMetadata`.
    2. Buat `RolesGuard` yang meng-implements `CanActivate`. Guard ini bertugas mengekstrak `user.role` dari token JWT di dalam request, lalu mencocokkannya dengan meta-data roles dari decorator endpoint.

### 2. Penerapan Guard ke Controller
*   **Target File:** `src/modules/leads/admin-leads.controller.ts`, `src/modules/settings/settings.controller.ts`
*   **Instruksi:**
    1. Pasang `@UseGuards(JwtAuthGuard, RolesGuard)` di tingkat controller atau route spesifik.
    2. Tambahkan `@Roles('admin', 'sales')` di rute yang mengubah data lead (`PATCH /:id`, `POST /:id/notes`).
    3. Tambahkan `@Roles('admin')` di rute konfigurasi pengaturan (`PATCH /api/settings/ai-rules`).
