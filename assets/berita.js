// ==========================================================
// BERITA & PENGUMUMAN DESA MATANG LABONG
// Data otomatis dari Google Sheets
// ==========================================================

const SHEET_ID = "1HWgusOceGDg6WzWG_V6cK307vlSYQRucbdRPT59H8og";
const SHEET_NAME = "Sheet1";

const CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}


// ==========================================================
// PARSE CSV
// ==========================================================

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (quotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        quotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char !== "\r") {
        field += char;
      }
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}


// ==========================================================
// TAMPILKAN BERITA
// ==========================================================

function renderNews(data) {

  const newsList = document.getElementById("newsList");

  if (!newsList) return;


  if (data.length === 0) {
    newsList.innerHTML = `
      <div class="news-state">
        Belum ada berita atau pengumuman.
      </div>
    `;
    return;
  }


  newsList.innerHTML = data.map(item => {

    return `
      <article class="news-card">

        <div>
          <span class="news-date">
            ${escapeHtml(item.tanggal)}
          </span>

          ${
            item.kategori
              ? `
                <span class="news-cat">
                  ${escapeHtml(item.kategori)}
                </span>
              `
              : ""
          }
        </div>

        <div class="news-title">
          ${escapeHtml(item.judul || "Tanpa judul")}
        </div>

        <div class="news-body">
          ${escapeHtml(item.isi)}
        </div>

      </article>
    `;

  }).join("");
}


// ==========================================================
// AMBIL DATA GOOGLE SHEETS
// ==========================================================

async function loadNews() {

  const newsList = document.getElementById("newsList");

  if (!newsList) return;


  newsList.innerHTML = `
    <div class="news-state">
      <div class="spinner"></div>
      Memuat berita terbaru...
    </div>
  `;


  try {

    const response = await fetch(CSV_URL, {
      cache: "no-store"
    });


    if (!response.ok) {
      throw new Error("Google Sheets tidak dapat diakses.");
    }


    const csvText = await response.text();


    const rows = parseCSV(csvText);


    if (rows.length < 2) {
      renderNews([]);
      return;
    }


    // Header Google Sheets
    const header = rows[0].map(column =>
      column.trim().toLowerCase()
    );


    const tanggalIndex = header.indexOf("tanggal");
    const kategoriIndex = header.indexOf("kategori");
    const judulIndex = header.indexOf("judul");
    const isiIndex = header.indexOf("isi");


    if (
      tanggalIndex === -1 ||
      kategoriIndex === -1 ||
      judulIndex === -1 ||
      isiIndex === -1
    ) {

      throw new Error(
        "Header harus: Tanggal, Kategori, Judul, Isi"
      );

    }


    // Ambil semua berita
    const berita = rows
      .slice(1)
      .map(row => ({

        tanggal:
          row[tanggalIndex]?.trim() || "",

        kategori:
          row[kategoriIndex]?.trim() || "",

        judul:
          row[judulIndex]?.trim() || "",

        isi:
          row[isiIndex]?.trim() || ""

      }))
      .filter(item =>
        item.tanggal ||
        item.kategori ||
        item.judul ||
        item.isi
      );


    // Berita paling bawah = berita terbaru
    berita.reverse();


    renderNews(berita);


  } catch (error) {

    console.error("ERROR BERITA:", error);


    newsList.innerHTML = `
      <div class="news-state">

        ⚠️ <strong>Berita belum dapat dimuat.</strong>

        <br><br>

        Pastikan Google Sheets sudah disetel:

        <br>

        <strong>
          Bagikan → Akses umum →
          Siapa saja yang memiliki link →
          Pelihat
        </strong>

        <br><br>

        Pastikan nama tab spreadsheet adalah:

        <strong>${escapeHtml(SHEET_NAME)}</strong>

      </div>
    `;

  }

}


// ==========================================================
// JALANKAN SETELAH HTML SELESAI DIMUAT
// ==========================================================

document.addEventListener("DOMContentLoaded", loadNews);
