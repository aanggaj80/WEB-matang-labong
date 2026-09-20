/* ===========================================================
   Aspirasi Warga — sumber data: Google Form + Google Sheets
   Dengan sistem balasan admin & opsi anonim
   ===========================================================

   CARA SETUP (sekali saja, ±10 menit):

   BAGIAN 1 — Buat Google Form buat warga isi aspirasi

   1. Buka https://forms.google.com → buat form baru.
   2. Kasih judul, misal "Aspirasi Warga Desa Matang Labong".
   3. Buat pertanyaan persis seperti ini (urutan bebas):
        - Nama (jawaban singkat)
        - Tampilkan nama saya? (pilihan ganda: "Ya, tampilkan nama saya"
          atau "Tidak, tampilkan sebagai Anonim")
        - Kategori (pilihan ganda: Infrastruktur / Pelayanan /
          Lingkungan / Lainnya)
        - Isi Aspirasi (paragraf)
   4. Klik tab "Responses" (Tanggapan) di bagian atas form.
   5. Klik ikon Google Sheets hijau untuk membuat spreadsheet
      tujuan jawaban secara otomatis.
   6. Klik tombol "Send" (Kirim) → salin link form-nya.

   BAGIAN 2 — Pasang link form ke halaman web

   7. Buka file aspirasi.html, cari <div id="formEmbedWrap">.
      Ganti isinya dengan:
        <iframe src="LINK_FORM_KAMU?embedded=true"></iframe>
      (tambahkan "?embedded=true" di akhir link form kamu)

   BAGIAN 3 — Siapkan kolom moderasi & balasan di spreadsheet

   8. Buka spreadsheet jawaban yang otomatis terbuat tadi.
   9. Tambahkan 2 kolom baru di paling kanan, judulnya persis:
        - Tampilkan   (isi manual "Ya" kalau boleh tampil publik)
        - Balasan Admin   (isi manual dengan jawaban resmi desa)

      Aspirasi baru akan muncul di halaman "Aspirasi Warga" begitu
      kolom Tampilkan diisi "Ya" — walau kolom Balasan Admin masih
      kosong (dianggap "menunggu tanggapan").

      Begitu kolom Balasan Admin ikut diisi, aspirasi itu otomatis
      pindah ke halaman "Aspirasi Terjawab".

   BAGIAN 4 — Bagikan & sambungkan spreadsheet ke web

   10. Di spreadsheet, klik "Bagikan" → ubah jadi
       "Siapa saja yang memiliki link" → "Melihat".
   11. Salin SHEET_ID dari link spreadsheet-nya (bagian panjang
       di antara /d/ dan /edit).
   12. Tempel ke variabel SHEET_ID di bawah ini.

   CARA KERJA OPSI ANONIM:
   Nama tetap tersimpan di spreadsheet (buat referensi admin),
   tapi kalau warga jawab "Tidak, tampilkan sebagai Anonim" pada
   pertanyaan itu, situs otomatis menyembunyikan nama aslinya dan
   menggantinya dengan "Warga (Anonim)" — tanpa perlu admin ubah
   apa pun secara manual.
   =========================================================== */

const ASPIRASI_SHEET_ID = '1eP-ZdWYsu3sFUCwNhureog4_S1X55Tnd3Fib_TiGa-k';
const ASPIRASI_SHEET_NAME = 'Form Responses 1';


const ASPIRASI_DEMO = [
  {
    tanggal: 'Contoh — belum tersambung',
    nama: 'Panduan Setup',
    anonim: false,
    kategori: 'Info',
    isi: 'Buka assets/aspirasi.js, ikuti langkah di komentar bagian atas file untuk menyambungkan Google Form dan Google Sheets.',
    balasan: ''
  }
];

function parseCSVAspirasi(text){
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

function escapeHtmlAspirasi(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function displayName(item){
  if(item.anonim) return 'Warga (Anonim)';
  return item.nama && item.nama.trim() ? item.nama : 'Warga';
}

function renderAspirasi(items, targetId, emptyMsg, mode){
  const list = document.getElementById(targetId);
  if(!list) return;
  const filtered = mode === 'menunggu'
    ? items.filter(i => !i.balasan || !i.balasan.trim())
    : items.filter(i => i.balasan && i.balasan.trim());
  if(!filtered.length){
    list.innerHTML = `<div class="aspirasi-state">${emptyMsg}</div>`;
    return;
  }
  list.innerHTML = filtered.map(item => `
    <div class="aspirasi-card">
      <div class="aspirasi-meta">
        <span class="aspirasi-date">${escapeHtmlAspirasi(item.tanggal || '')}</span>
        ${item.kategori ? `<span class="aspirasi-cat">${escapeHtmlAspirasi(item.kategori)}</span>` : ''}
      </div>
      <div class="aspirasi-name">${escapeHtmlAspirasi(displayName(item))}</div>
      <div class="aspirasi-body">${escapeHtmlAspirasi(item.isi || '')}</div>
      ${item.balasan && item.balasan.trim() ? `
        <div class="aspirasi-reply">
          <span class="aspirasi-reply-label">💬 Tanggapan Perangkat Desa</span>
          <div class="aspirasi-reply-body">${escapeHtmlAspirasi(item.balasan)}</div>
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function loadAspirasi(){
  const isTerjawabPage = !!document.getElementById('aspirasiTerjawabList');
  const listTargetId = isTerjawabPage ? 'aspirasiTerjawabList' : 'aspirasiList';
  const mode = isTerjawabPage ? 'terjawab' : 'menunggu';
  const emptyMsg = isTerjawabPage
    ? 'Belum ada aspirasi yang sudah ditanggapi.'
    : 'Belum ada aspirasi yang ditampilkan.';

  const ASPIRASI_SHEET_ID = '1eP-ZdWYsu3sFUCwNhureog4_S1X55Tnd3Fib_TiGa-k';
    renderAspirasi(ASPIRASI_DEMO, listTargetId, emptyMsg, mode);
    return;
  }
  try{
    const res = await fetch(ASPIRASI_CSV_URL);
    if(!res.ok) throw new Error('Gagal mengambil data');
    const text = await res.text();
    const rows = parseCSVAspirasi(text);
    if(rows.length < 2){ renderAspirasi([], listTargetId, emptyMsg, mode); return; }
    const [header, ...dataRows] = rows;
    const norm = h => h.trim().toLowerCase();
    const idx = {
      tanggal: header.findIndex(h => norm(h) === 'timestamp' || norm(h) === 'tanggal'),
      nama: header.findIndex(h => norm(h) === 'nama'),
      anonim: header.findIndex(h => norm(h).includes('tampilkan nama')),
      kategori: header.findIndex(h => norm(h) === 'kategori'),
      isi: header.findIndex(h => norm(h).includes('aspirasi') || norm(h) === 'isi'),
      tampilkan: header.findIndex(h => norm(h) === 'tampilkan'),
      balasan: header.findIndex(h => norm(h).includes('balasan')),
    };
    const items = dataRows
      .filter(r => idx.tampilkan >= 0 && (r[idx.tampilkan] || '').trim().toLowerCase() === 'ya')
      .map(r => {
        const anonimRaw = idx.anonim >= 0 ? (r[idx.anonim] || '') : '';
        return {
          tanggal: idx.tanggal >= 0 ? r[idx.tanggal] : '',
          nama: idx.nama >= 0 ? r[idx.nama] : '',
          anonim: anonimRaw.toLowerCase().includes('anonim'),
          kategori: idx.kategori >= 0 ? r[idx.kategori] : '',
          isi: idx.isi >= 0 ? r[idx.isi] : '',
          balasan: idx.balasan >= 0 ? r[idx.balasan] : '',
        };
      })
      .reverse();
    renderAspirasi(items, listTargetId, emptyMsg, mode);
  }catch(err){
    const list = document.getElementById(listTargetId);
    if(list){
      list.innerHTML = `<div class="aspirasi-state">
        ⚠️ Belum bisa memuat aspirasi. Pastikan spreadsheet sudah dibagikan publik dan SHEET_ID di <code>assets/aspirasi.js</code> sudah benar.
      </div>`;
    }
  }
}

loadAspirasi();
