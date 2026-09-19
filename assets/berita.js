/* ===========================================================
   Berita & Pengumuman — sumber data: Google Sheets
   ===========================================================

   CARA SETUP (sekali saja, 5 menit):

   1. Buka https://sheets.google.com, buat spreadsheet baru.
   2. Buat 4 kolom di baris pertama (harus persis, huruf besar-kecil
      bebas tapi urutannya HARUS sama):
         Tanggal | Kategori | Judul | Isi
      Contoh baris ke-2:
         7 September 2026 | Pengumuman | Perbaikan Jalan Dusun Sidang | Pekerjaan perbaikan jalan akan berlangsung 10-15 September.

   3. Klik tombol "Bagikan" (Share) di kanan atas → ubah akses jadi
      "Siapa saja yang memiliki link" → "Melihat" (Viewer). Ini WAJIB,
      kalau tidak datanya tidak akan bisa diambil situs.

   4. Lihat alamat spreadsheet di address bar browser, formatnya:
      https://docs.google.com/spreadsheets/d/SHEET_ID_DI_SINI/edit
      Copy bagian SHEET_ID_DI_SINI itu (deretan huruf/angka panjang).

   5. Tempel SHEET_ID itu ke variabel SHEET_ID di bawah ini,
      lalu simpan file ini dan upload ulang ke GitHub.

   6. Setiap kali mau update berita, TINGGAL EDIT SPREADSHEET-nya
      saja (tambah baris baru) — situs akan otomatis ikut berubah,
      tidak perlu sentuh kode lagi.
   =========================================================== */

const SHEET_ID = '1HWgusOceGDg6WzWG_V6cK307vlSYQRucbdRPT59H8og';
const SHEET_NAME = 'Sheet1';                      // <-- nama tab sheet-nya (default "Sheet1")

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

// Data contoh yang tampil selama SHEET_ID belum diisi/diganti
const DEMO_DATA = [
  {
    tanggal: 'Contoh — belum tersambung ke Google Sheets',
    kategori: 'Panduan',
    judul: 'Halaman ini siap dihubungkan ke Google Sheets',
    isi: 'Buka file assets/berita.js, ganti SHEET_ID di bagian atas dengan ID spreadsheet kamu sendiri. Setelah itu, setiap baris baru yang kamu tambahkan di spreadsheet akan otomatis muncul di sini — tanpa perlu edit kode.'
  }
];

function parseCSV(text){
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for(let i = 0; i < text.length; i++){
    const c = text[i], next = text[i+1];
    if(inQuotes){
      if(c === '"' && next === '"'){ field += '"'; i++; }
      else if(c === '"'){ inQuotes = false; }
      else{ field += c; }
    }else{
      if(c === '"'){ inQuotes = true; }
      else if(c === ','){ row.push(field); field = ''; }
      else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ''; }
      else if(c === '\r'){ /* skip */ }
      else{ field += c; }
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows.filter(r => r.length && r.some(c => c.trim() !== ''));
}

function renderNews(items){
  const list = document.getElementById('newsList');
  if(!list) return;
  if(!items.length){
    list.innerHTML = '<div class="news-state">Belum ada berita yang ditambahkan.</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="news-card">
      <span class="news-date">${escapeHtml(item.tanggal || '')}</span>
      ${item.kategori ? `<span class="news-cat">${escapeHtml(item.kategori)}</span>` : ''}
      <div class="news-title">${escapeHtml(item.judul || '(Tanpa judul)')}</div>
      <div class="news-body">${escapeHtml(item.isi || '')}</div>
    </div>
  `).join('');
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadNews(){
  if(SHEET_ID === 'GANTI_DENGAN_SHEET_ID_KAMU' || !SHEET_ID){
    renderNews(DEMO_DATA);
    return;
  }
  try{
    const res = await fetch(CSV_URL);
    if(!res.ok) throw new Error('Gagal mengambil data');
    const text = await res.text();
    const rows = parseCSV(text);
    if(rows.length < 2){ renderNews([]); return; }
    const [header, ...dataRows] = rows;
    const idx = {
      tanggal: header.findIndex(h => h.trim().toLowerCase() === 'tanggal'),
      kategori: header.findIndex(h => h.trim().toLowerCase() === 'kategori'),
      judul: header.findIndex(h => h.trim().toLowerCase() === 'judul'),
      isi: header.findIndex(h => h.trim().toLowerCase() === 'isi'),
    };
    const items = dataRows.map(r => ({
      tanggal: idx.tanggal >= 0 ? r[idx.tanggal] : '',
      kategori: idx.kategori >= 0 ? r[idx.kategori] : '',
      judul: idx.judul >= 0 ? r[idx.judul] : '',
      isi: idx.isi >= 0 ? r[idx.isi] : '',
    })).reverse(); // berita terbaru (baris terbawah) tampil di atas
    renderNews(items);
  }catch(err){
    const list = document.getElementById('newsList');
    if(list){
      list.innerHTML = `<div class="news-state">
        ⚠️ Belum bisa memuat berita dari Google Sheets.<br>
        Pastikan link spreadsheet sudah diatur "Siapa saja yang memiliki link → Melihat", dan SHEET_ID di <code>assets/berita.js</code> sudah benar.
      </div>`;
    }
  }
}

loadNews();
