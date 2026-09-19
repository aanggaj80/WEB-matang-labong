# Panduan: Menghubungkan Berita ke Google Sheets

Halaman **Berita & Pengumuman** (`berita.html`) di situs ini mengambil datanya langsung dari Google Sheets. Artinya, untuk menambah/mengubah berita, kamu (atau siapa pun pengelola desa) **cukup edit spreadsheet** — tidak perlu sentuh kode atau upload ulang ke GitHub sama sekali.

## Langkah setup (sekali saja, ±5 menit)

### 1. Buat spreadsheet baru
Buka [sheets.google.com](https://sheets.google.com), buat spreadsheet kosong baru.

### 2. Buat 4 kolom di baris pertama
Ketik persis seperti ini di baris 1 (header):

| Tanggal | Kategori | Judul | Isi |
|---|---|---|---|

Lalu isi data berita mulai baris ke-2, contoh:

| Tanggal | Kategori | Judul | Isi |
|---|---|---|---|
| 7 September 2026 | Pengumuman | Perbaikan Jalan Dusun Sidang | Pekerjaan perbaikan jalan akan berlangsung mulai 10 hingga 15 September 2026. Warga dimohon berhati-hati. |
| 5 September 2026 | Kegiatan | Gotong Royong Bersih Desa | Kegiatan gotong royong akan dilaksanakan setiap hari Minggu pagi mulai pukul 07.00 WIB. |

Berita paling baru sebaiknya ditambahkan di **baris paling bawah** — situs otomatis akan menampilkannya di paling atas.

### 3. Bagikan spreadsheet-nya
Klik tombol **Bagikan** (Share) di kanan atas → ubah menjadi **"Siapa saja yang memiliki link"** dengan akses **"Melihat" (Viewer)**.

⚠️ Langkah ini **wajib** — kalau tidak diubah, situs tidak akan bisa mengambil datanya.

### 4. Salin ID spreadsheet
Lihat alamat (URL) spreadsheet kamu di browser, bentuknya seperti ini:

```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/edit
                                       └──────────────── ini SHEET_ID-nya ────────────────┘
```

Salin bagian tengah itu (deretan huruf/angka panjang).

### 5. Tempel ke kode situs
Buka file `assets/berita.js`, cari baris ini di bagian atas:

```js
const SHEET_ID = 'GANTI_DENGAN_SHEET_ID_KAMU';
```

Ganti `GANTI_DENGAN_SHEET_ID_KAMU` dengan ID yang sudah kamu salin tadi, misalnya:

```js
const SHEET_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890';
```

Simpan file itu, lalu upload ulang ke GitHub (timpa file `assets/berita.js` yang lama).

### 6. Selesai!
Buka halaman **Berita** di situs — data dari spreadsheet akan otomatis muncul.

## Update berita selanjutnya

Setiap kali mau menambah berita baru, **tinggal buka spreadsheet-nya dan tambah baris baru** di bagian bawah. Tidak perlu edit kode, tidak perlu upload ulang ke GitHub — situs akan otomatis menampilkan berita terbaru begitu halaman dibuka/di-refresh.

## Catatan

- Nama tab sheet default adalah `Sheet1`. Kalau kamu mengganti nama tabnya, sesuaikan juga variabel `SHEET_NAME` di `assets/berita.js`.
- Kolom `Kategori` boleh dikosongkan kalau tidak perlu.
- Karena situs ini statis (GitHub Pages), Google Sheets di sini berfungsi sebagai "database ringan" yang gratis dan mudah dikelola siapa saja tanpa perlu keahlian coding.
