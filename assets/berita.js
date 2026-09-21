/* ===========================================================
   BERITA & PENGUMUMAN
   Sumber data: Google Sheets
   =========================================================== */

const SHEET_ID = '1HWgusOceGDg6WzWG_V6cK307vlSYQRucbdRPT59H8og';

// Pastikan nama tab Google Sheets sama persis
const SHEET_NAME = 'Sheet1';

// URL untuk mengambil data Google Sheets sebagai CSV
const CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


// ===========================================================
// DATA DEMO JIKA GOOGLE SHEETS BELUM TERHUBUNG
// ===========================================================

const DEMO_DATA = [
  {
    tanggal: 'Belum ada data',
    kategori: 'Informasi',
    judul: 'Belum ada berita',
    isi: 'Data berita belum tersedia dari Google Sheets.'
  }
];


// ===========================================================
// PARSE CSV
// ===========================================================

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {

      if (c === '"' && next === '"') {
        field += '"';
        i++;
      }

      else if (c === '"') {
        inQuotes = false;
      }

      else {
        field += c;
      }

    } else {

      if (c === '"') {
        inQuotes = true;
      }

      else if (c === ',') {
        row.push(field);
        field = '';
      }

      else if (c === '\n') {
        row.push(field);
        rows.push(row);

        row = [];
        field = '';
      }

      else if (c === '\r') {
        // Abaikan
      }

      else {
        field += c;
      }
    }
  }

  // Masukkan baris terakhir
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter(row =>
    row.length &&
    row.some(cell => cell.trim() !== '')
  );
}


// ===========================================================
// ESCAPE HTML
// Supaya isi Google Sheets tidak bisa merusak HTML
// ===========================================================

function escapeHtml(str) {

  const div = document.createElement('div');

  div.textContent = String(str ?? '');

  return div.innerHTML;
}


// ===========================================================
// RENDER BERITA
// ===========================================================

function renderNews(items) {

  const list = document.getElementById('newsList');

  if (!list) {
    console.error('Elemen #newsList tidak ditemukan.');
    return;
  }


  // Tidak ada data
  if (!items.length) {

    list.innerHTML = `
      <div class="news-state">
        Belum ada berita yang ditambahkan.
      </div>
    `;

    return;
  }


  // Tampilkan berita
  list.innerHTML = items.map(item => {

    return `
      <div class="news-card">

        <div class="news-meta">

          ${
            item.tanggal
              ? `<span class="news-date">
                  ${escapeHtml(item.tanggal)}
                </span>`
              : ''
          }

          ${
            item.kategori
              ? `<span class="news-cat">
                  ${escapeHtml(item.kategori)}
                </span>`
              : ''
          }

        </div>

        <div class="news-title">
          ${escapeHtml(item.judul || '(Tanpa judul)')}
        </div>

        <div class="news-body">
          ${escapeHtml(item.isi || '')}
        </div>

      </div>
    `;

  }).join('');
}


// ===========================================================
// LOAD DATA GOOGLE SHEETS
// ===========================================================

async function loadNews() {

  const list = document.getElementById('newsList');

  if (!list) {
    console.error('Elemen #newsList tidak ditemukan.');
    return;
  }


  // Loading
  list.innerHTML = `
    <div class="news-state">
      Memuat berita...
    </div>
  `;


  // Pastikan SHEET_ID tersedia
  if (!SHEET_ID) {

    console.warn('SHEET_ID belum diisi.');

    renderNews(DEMO_DATA);

    return;
  }


  try {

    console.log('Mengambil data dari Google Sheets...');
    console.log(CSV_URL);


    const response = await fetch(CSV_URL, {
      method: 'GET',
      cache: 'no-cache'
    });


    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}`
      );
    }


    const text = await response.text();


    console.log('Data Google Sheets:', text);


    // Kalau Google mengembalikan halaman error
    if (
      text.includes('<html') ||
      text.includes('<!DOCTYPE')
    ) {

      throw new Error(
        'Google Sheets tidak mengembalikan CSV.'
      );
    }


    const rows = parseCSV(text);


    console.log('Jumlah baris:', rows.length);


    // Minimal header + 1 data
    if (rows.length < 2) {

      renderNews([]);

      return;
    }


    // Header
    const header = rows[0].map(h =>
      h.trim().toLowerCase()
    );


    console.log('Header:', header);


    // Cari posisi kolom
    const tanggalIndex =
      header.indexOf('tanggal');

    const kategoriIndex =
      header.indexOf('kategori');

    const judulIndex =
      header.indexOf('judul');

    const isiIndex =
      header.indexOf('isi');


    // Cek header
    if (
      tanggalIndex === -1 &&
      kategoriIndex === -1 &&
      judulIndex === -1 &&
      isiIndex === -1
    ) {

      throw new Error(
        'Kolom Google Sheets tidak sesuai. Gunakan: Tanggal | Kategori | Judul | Isi'
      );
    }


    const dataRows = rows.slice(1);


    // Ubah CSV menjadi object
    const items = dataRows
      .map(row => {

        return {

          tanggal:
            tanggalIndex >= 0
              ? row[tanggalIndex] || ''
              : '',

          kategori:
            kategoriIndex >= 0
              ? row[kategoriIndex] || ''
              : '',

          judul:
            judulIndex >= 0
              ? row[judulIndex] || ''
              : '',

          isi:
            isiIndex >= 0
              ? row[isiIndex] || ''
              : ''

        };

      })

      // Hapus baris kosong
      .filter(item =>
        item.tanggal ||
        item.kategori ||
        item.judul ||
        item.isi
      );


    // Berita paling baru berada di atas
    items.reverse();


    console.log('Berita berhasil dimuat:', items);


    renderNews(items);


  } catch (error) {

    console.error(
      'Gagal mengambil berita:',
      error
    );


    list.innerHTML = `
      <div class="news-state">

        ⚠️ <strong>Berita belum bisa dimuat.</strong>

        <br><br>

        Pastikan:

        <br>1. Google Sheets sudah dibuat publik.

        <br>2. Akses diatur menjadi
        <strong>Siapa saja yang memiliki link → Pelihat</strong>.

        <br>3. Nama tab adalah
        <strong>${escapeHtml(SHEET_NAME)}</strong>.

        <br>4. Header menggunakan:
        <strong>Tanggal, Kategori, Judul, Isi</strong>.

        <br><br>

        <small>
          Error: ${escapeHtml(error.message)}
        </small>

      </div>
    `;

  }

}


// ===========================================================
// JALANKAN
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {

  loadNews();

});
