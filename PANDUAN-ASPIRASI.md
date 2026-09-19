# Panduan: Aspirasi Warga (Google Form + Sheets + Balasan Admin)

Sistem aspirasi punya 3 bagian:
1. **Form isian** (`aspirasi.html`) — tempat warga kirim aspirasi
2. **Halaman "Aspirasi Warga"** — nampilin aspirasi yang menunggu tanggapan
3. **Halaman "Aspirasi Terjawab"** (`aspirasi-terjawab.html`) — nampilin aspirasi yang sudah dibalas resmi

## Setup (±10 menit)

### 1. Buat Google Form
Buka [forms.google.com](https://forms.google.com) → buat form baru, judul **"Aspirasi Warga Desa Matang Labong"**.

Buat 4 pertanyaan:
| Pertanyaan | Tipe |
|---|---|
| Nama | Jawaban singkat |
| Tampilkan nama saya? | Pilihan ganda: "Ya, tampilkan nama saya" / "Tidak, tampilkan sebagai Anonim" |
| Kategori | Pilihan ganda: Infrastruktur / Pelayanan / Lingkungan / Lainnya |
| Isi Aspirasi | Paragraf |

### 2. Hubungkan ke Sheets
Tab **Responses** → klik ikon Sheets hijau → otomatis bikin spreadsheet jawaban.

### 3. Pasang form ke web
Klik **Send** di form → salin link. Buka `aspirasi.html`, cari:
```html
<div class="form-embed" id="formEmbedWrap">
```
Ganti isinya jadi:
```html
<iframe src="LINK_FORM_KAMU?embedded=true"></iframe>
```

### 4. Tambah 2 kolom moderasi di spreadsheet
Di spreadsheet jawaban, tambah 2 kolom baru paling kanan, judul persis:
- **`Tampilkan`** — isi `Ya` kalau boleh tampil publik
- **`Balasan Admin`** — isi dengan jawaban resmi desa

**Cara kerja otomatis:**
- Kolom `Tampilkan` kosong/bukan "Ya" → aspirasi **tidak tampil sama sekali**
- Kolom `Tampilkan` = "Ya" + `Balasan Admin` kosong → muncul di halaman **"Aspirasi Warga"** (menunggu)
- Kolom `Tampilkan` = "Ya" + `Balasan Admin` terisi → otomatis pindah ke halaman **"Aspirasi Terjawab"**

### 5. Bagikan spreadsheet
**Bagikan** → "Siapa saja yang memiliki link" → "Melihat".

### 6. Sambungkan ke kode
Salin SHEET_ID dari URL spreadsheet, tempel ke `assets/aspirasi.js`:
```js
const ASPIRASI_SHEET_ID = 'GANTI_DENGAN_SHEET_ID_KAMU';
```

## Alur kerja harian admin

1. Warga isi form → masuk spreadsheet otomatis
2. Kamu baca aspirasi yang masuk
3. Kalau layak tampil, isi `Tampilkan` = `Ya`
4. Kalau sudah ada jawabannya, isi juga `Balasan Admin` dengan tanggapan resmi
5. Situs otomatis update sendiri — tidak perlu edit kode atau upload ulang

## Soal Anonim
Nama tetap tersimpan di spreadsheet untuk referensi admin. Kalau warga pilih "Tampilkan sebagai Anonim", situs otomatis mengganti nama yang tampil ke publik jadi **"Warga (Anonim)"** — tidak perlu diubah manual.
