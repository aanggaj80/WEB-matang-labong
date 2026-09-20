/* ===========================================================
   ASPIRASI WARGA - GOOGLE SHEETS
   =========================================================== */

const ASPIRASI_SHEET_ID =
  '1QLTCe8BuyisnJR82NSkue6NbU2NQQAG7V_NJ6qdH-2k';

const ASPIRASI_SHEET_NAME = 'Form Responses 1';

const ASPIRASI_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${ASPIRASI_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(ASPIRASI_SHEET_NAME)}`;


/* =========================
   PARSE CSV
========================= */

function parseCSVAspirasi(text) {
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
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (c !== '\r') {
        field += c;
      }
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter(row =>
    row.length && row.some(cell => cell.trim() !== '')
  );
}


/* =========================
   AMANKAN HTML
========================= */

function escapeHtmlAspirasi(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}


/* =========================
   NAMA
========================= */

function displayName(item) {
  if (item.anonim) {
    return 'Warga (Anonim)';
  }

  return item.nama && item.nama.trim()
    ? item.nama
    : 'Warga';
}


/* =========================
   TAMPILKAN DATA
========================= */

function renderAspirasi(
  items,
  targetId,
  emptyMsg,
  mode
) {
  const list = document.getElementById(targetId);

  if (!list) return;

  const filtered =
    mode === 'menunggu'
      ? items.filter(
          item => !item.balasan || !item.balasan.trim()
        )
      : items.filter(
          item => item.balasan && item.balasan.trim()
        );

  if (!filtered.length) {
    list.innerHTML = `
      <div class="aspirasi-state">
        ${emptyMsg}
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(item => `
    <div class="aspirasi-card">

      <div class="aspirasi-meta">

        <span class="aspirasi-date">
          ${escapeHtmlAspirasi(item.tanggal || '')}
        </span>

        ${
          item.kategori
            ? `
              <span class="aspirasi-cat">
                ${escapeHtmlAspirasi(item.kategori)}
              </span>
            `
            : ''
        }

      </div>

      <div class="aspirasi-name">
        ${escapeHtmlAspirasi(displayName(item))}
      </div>

      <div class="aspirasi-body">
        ${escapeHtmlAspirasi(item.isi || '')}
      </div>

      ${
        item.balasan && item.balasan.trim()
          ? `
            <div class="aspirasi-reply">

              <span class="aspirasi-reply-label">
                💬 Tanggapan Perangkat Desa
              </span>

              <div class="aspirasi-reply-body">
                ${escapeHtmlAspirasi(item.balasan)}
              </div>

            </div>
          `
          : ''
      }

    </div>
  `).join('');
}


/* =========================
   LOAD DATA
========================= */

async function loadAspirasi() {

  const isTerjawabPage =
    !!document.getElementById('aspirasiTerjawabList');

  const listTargetId =
    isTerjawabPage
      ? 'aspirasiTerjawabList'
      : 'aspirasiList';

  const mode =
    isTerjawabPage
      ? 'terjawab'
      : 'menunggu';

  const emptyMsg =
    isTerjawabPage
      ? 'Belum ada aspirasi yang sudah ditanggapi.'
      : 'Belum ada aspirasi yang ditampilkan.';

  const list = document.getElementById(listTargetId);

  try {

    list.innerHTML = `
      <div class="aspirasi-state">
        <div class="spinner"></div>
        Memuat aspirasi...
      </div>
    `;

    const response = await fetch(
      ASPIRASI_CSV_URL,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        'Google Sheets tidak dapat diakses'
      );
    }

    const text = await response.text();

    const rows = parseCSVAspirasi(text);

    if (rows.length < 2) {

      renderAspirasi(
        [],
        listTargetId,
        emptyMsg,
        mode
      );

      return;
    }

    const header = rows[0];
    const dataRows = rows.slice(1);

    const norm = value =>
      String(value || '')
        .trim()
        .toLowerCase();

    const idx = {

      tanggal: header.findIndex(
        h =>
          norm(h) === 'timestamp' ||
          norm(h) === 'tanggal'
      ),

      nama: header.findIndex(
        h => norm(h) === 'nama'
      ),

      anonim: header.findIndex(
        h =>
          norm(h).includes('tampilkan nama')
      ),

      kategori: header.findIndex(
        h => norm(h) === 'kategori'
      ),

      isi: header.findIndex(
        h =>
          norm(h).includes('aspirasi') ||
          norm(h) === 'isi'
      ),

      tampilkan: header.findIndex(
        h => norm(h) === 'tampilkan'
      ),

      balasan: header.findIndex(
        h => norm(h).includes('balasan')
      )

    };

    const items = dataRows

      .filter(row => {

        if (idx.tampilkan < 0) {
          return false;
        }

        return (
          String(row[idx.tampilkan] || '')
            .trim()
            .toLowerCase() === 'ya'
        );

      })

      .map(row => {

        const anonimRaw =
          idx.anonim >= 0
            ? row[idx.anonim] || ''
            : '';

        return {

          tanggal:
            idx.tanggal >= 0
              ? row[idx.tanggal]
              : '',

          nama:
            idx.nama >= 0
              ? row[idx.nama]
              : '',

          anonim:
            anonimRaw
              .toLowerCase()
              .includes('anonim'),

          kategori:
            idx.kategori >= 0
              ? row[idx.kategori]
              : '',

          isi:
            idx.isi >= 0
              ? row[idx.isi]
              : '',

          balasan:
            idx.balasan >= 0
              ? row[idx.balasan]
              : ''

        };

      })

      .reverse();

    renderAspirasi(
      items,
      listTargetId,
      emptyMsg,
      mode
    );

  } catch (error) {

    console.error(
      'Error Aspirasi:',
      error
    );

    if (list) {

      list.innerHTML = `
        <div class="aspirasi-state">

          ⚠️ Gagal memuat data aspirasi.

          <br><br>

          Pastikan Google Sheets sudah
          <b>dibagikan sebagai "Siapa saja yang memiliki link"</b>
          dengan akses <b>Pelihat</b>.

        </div>
      `;

    }

  }

}


/* =========================
   JALANKAN
========================= */

document.addEventListener(
  'DOMContentLoaded',
  loadAspirasi
);
