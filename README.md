# Lulus HES

Navigator kelulusan untuk mahasiswa Program Studi Hukum Ekonomi Syariah, Fakultas
Syariah dan Hukum, UIN Syarif Hidayatullah Jakarta.

> **Bukan website resmi kampus.** Inisiatif pribadi alumni. Tidak berada di bawah
> pengelolaan Program Studi, Fakultas, maupun Universitas.

## Dasar informasi

Persyaratan dan tenggat berlabel **Resmi** di dalam website mengacu pada:

> Surat Dekan Fakultas Syariah dan Hukum UIN Syarif Hidayatullah Jakarta
> No. **B-252/F4/PP.01.1/01/2024** tanggal **23 Januari 2024** tentang
> *Alur Seminar Proposal, Pendaftaran Munaqosah, dan Pendaftaran Ujian Komprehensif*
> (Lampiran 1–3).

Informasi berlabel **Alumni** berasal dari praktik umum dan pengalaman, bukan dari
surat tersebut. Setiap item ditandai di halaman tahapan agar pembaca tahu mana yang
punya dasar tertulis dan mana yang perlu dikonfirmasi ke Prodi.

## Menjalankan secara lokal

```bash
npm install
```

```bash
npm run dev
```

Buka http://localhost:3000.

## Mengisi konten

Seluruh isi website berasal dari JSON di `src/data`. Tidak ada teks tahapan yang
ditulis langsung di komponen — mengubah konten berarti mengubah JSON, bukan JSX.

| File | Isi |
| --- | --- |
| `src/data/stages.json` | 11 tahapan: syarat, dokumen, langkah, checklist, tenggat, tips, FAQ, link |
| `src/data/downloads.json` | Metadata template beserta tautannya |
| `src/data/schedule.json` | Siklus ujian bulanan, pola tenggat, dan tautan Google Form |
| `src/data/faq.json` | FAQ umum (FAQ per tahapan ada di `stages.json`) |
| `src/data/wizard.json` | Pertanyaan wizard "Saya sedang di tahap mana?" |
| `src/data/site.json` | Nama, disclaimer, kontak, sumber resmi, folder Drive |
| `src/data/skpi.json` | Nomenklatur SKPI untuk diinput ke AIS |

Tipe datanya ada di `src/lib/types.ts`. Menambah field berarti menambahkannya di
tipe tersebut lebih dulu.

### Dua cara menyajikan berkas

**1. Dari dalam website (`public/template/`).** Tujuh dokumen resmi dari Prodi
plus dua template penulisan buatan sendiri disimpan langsung di sini dan tombol
unduhnya sudah aktif. Ini menyimpang dari rencana awal yang menyebut semua berkas
ditaruh di Google Drive — dilakukan supaya Download Center langsung berguna tanpa
menunggu proses unggah. Ukurannya kecil (total di bawah 1,5 MB). Kalau kamu lebih
suka pola Drive-only, pindahkan filenya ke Drive lalu ganti `url`-nya.

Dua berkas yang dibuat sendiri, bukan dokumen resmi Prodi:

| Berkas | Isi |
| --- | --- |
| `template-proposal-skripsi.docx` | Kerangka proposal, sebelas komponen wajib menurut Pedoman FSH 2017 Bab II A |
| `template-penulisan-skripsi.docx` | Kerangka naskah skripsi, sampul sampai lampiran, format menurut Pedoman FSH 2017 Bab III |

Keduanya disetel pada kertas kuarto 21,5 × 28 cm, margin 4/3/4/3 cm, Times New
Roman 12, spasi 1,5, dan dua skema penomoran halaman (Romawi kecil tengah bawah
untuk bagian awal; angka Arab kanan atas untuk bagian isi, kecuali halaman
berjudul bab yang nomornya di tengah bawah). Penomoran bab dan sub bab memakai
daftar bertingkat bawaan Word — `BAB I` → `A.` → `1.` → `a.` → `1)` → `a)` —
dengan satu instance daftar per bab supaya huruf `A.` kembali dari awal di setiap
bab. Tidak ada nomor yang diketik tangan.

Setiap bagian memuat blok petunjuk berisi penjelasan singkat apa yang seharusnya
tertulis di sana beserta rujukan pasal pedomannya. Blok itu dimaksudkan untuk
dihapus mahasiswa sebelum naskah diserahkan.

Lembar persetujuan pembimbing, pengesahan panitia ujian, dan pernyataan keaslian
**tidak** disertakan di dalam template. Berkasnya sudah ada tersendiri di folder
ini dan baru digabungkan setelah skripsi selesai, jadi memasukkannya ke template
hanya akan menggandakan dokumen yang sama. Karena bagian awal template memakai
penomoran yang melanjutkan section sebelumnya, nomor halaman menyesuaikan sendiri
begitu lembar-lembar itu disisipkan.

**2. Dari Google Drive.** Untuk sisanya. Unggah file ke Drive, lalu:

1. Isi `url` pada entri terkait di `src/data/downloads.json` dengan tautan Drive,
   dan ubah `status` menjadi `"tersedia"`.
2. Isi juga `version`, `format`, `size`, dan `updatedAt` supaya kartunya informatif.
3. Untuk tombol **Download semua template**, isi `driveFolderUrl` di
   `src/data/site.json` dengan tautan folder Drive.

Selama `url` masih `null`, kartunya tetap tampil dengan status
`"menunggu-unggah"` dan tombol nonaktif — jadi pengguna tahu template itu ada,
tetapi belum bisa diunduh.

Nilai `status` yang tersedia:

- `tersedia` — file sudah ada, tombol unduh aktif
- `menunggu-unggah` — metadata sudah ada, file belum diunggah
- `perlu-verifikasi` — ada, tetapi kemungkinan sudah berubah

Kartu unduhan menyesuaikan diri sendiri: `url` yang diawali `/` diperlakukan
sebagai berkas lokal dan diunduh langsung, sedangkan tautan lain dibuka di tab
baru. Entri dengan `format: "Google Form"` tombolnya berbunyi "Buka form".

## Sistem warna

Palet pink. Token intinya di `src/app/globals.css`:

| Token | Peran |
| --- | --- |
| `--brand` | Magenta tua `#9C0F50` untuk tombol, tautan, dan progres |
| `--pop` | Pink terang `#FF4FA3` untuk sorotan |
| `--blush` | Pink lembut `#FFC2DE` untuk bidang besar |
| `--surface-accent` | Aksen tetap di atas `.surface-brand`, **tidak dibalik** di mode gelap |

Empat fase dibaca sebagai satu gradasi yang makin pekat — blush → pink → magenta
→ magenta tua. Pemetaannya di `src/lib/phase.ts`, bukan disebar di komponen.

Dua aturan yang menjaga keterbacaan:

1. **Pink terang selalu berpasangan dengan teks gelap**, tidak pernah putih.
   Sudah dikodekan pada token `*-foreground` masing-masing.
2. **`.surface-brand` tampil sama di mode terang maupun gelap.** Bidang itu
   selalu pink cerah, jadi teks di atasnya memakai `--pop-foreground` dan
   `--surface-accent` yang tidak ikut membalik. Memakai `--brand` di sana akan
   membuatnya hilang di mode gelap.

Setiap menambah kombinasi warna baru, cek rasio kontrasnya terhadap ambang WCAG
AA: 4.5:1 untuk teks biasa, 3:1 untuk teks besar.

### Menambah tahapan

1. Tambahkan objek baru di `stages.json` dengan `order` dan `slug` unik.
2. Perbarui `previousStage` / `nextStage` pada tahap sekitarnya agar rantainya nyambung.
3. Kalau memakai ikon baru, daftarkan di `src/lib/icons.ts`.
4. Tambahkan pertanyaan yang sesuai di `wizard.json` bila tahap itu perlu dideteksi.

Halaman `/tahapan/[slug]` dan roadmap otomatis mengikuti — tidak ada daftar tahapan
yang di-hardcode di komponen.

## Asisten tanya jawab

Tombol **Tanya** di pojok kanan bawah membuka asisten yang menjawab dari data
website ini. Ada dua lapis: mesin pencari berbasis aturan di
`src/lib/assistant.ts`, dan model bahasa yang dipanggil lewat `/api/tanya`.

### Mesin pencarinya

Pertanyaan dipecah menjadi kelompok istilah — satu singkatan beserta ekspansinya
dihitung sebagai **satu** konsep — lalu dicocokkan ke basis pengetahuan yang
dibangun otomatis dari seluruh JSON: FAQ, tahapan, syarat, dokumen, langkah,
tenggat, tips, template, jadwal ujian, dan nomenklatur SKPI. Total 211 entri.

Tiga aturan yang menjaganya tidak asal menjawab:

1. **Pencocokan per kata, bukan substring.** "kopi" tidak boleh cocok dengan
   "fotokopi".
2. **Harus ada kecocokan di judul, atau minimal dua kecocokan.** Satu kata umum
   yang kebetulan muncul di badan teks tidak cukup.
3. **Cakupan minimal 40%** dari kelompok istilah pertanyaan.

Menambah pengetahuan berarti menambah data di `src/data` — basis pengetahuannya
ikut terbarui sendiri. Untuk menambah singkatan baru, isi peta `aliases`.

### Empat jalur jawaban

`src/lib/ai/context.ts` memilih jalur termurah yang masih benar:

| Jalur | Kapan dipakai | Biaya |
| --- | --- | --- |
| `cache` | Pertanyaan serupa pernah dijawab dalam 24 jam | Nol |
| `langsung` | Satu entri FAQ/Tenggat cocok telak (skor ≥ 5,5 dan unggul ≥ 1,6× dari pesaingnya) | Nol |
| `model` | Ada bahan relevan, tapi perlu dirangkai | Satu panggilan |
| `tidak-tahu` | Retrieval tidak menemukan apa pun | Nol |

Jalur `tidak-tahu` **sengaja tidak memanggil model.** Tanpa bahan, model hanya
bisa menjawab dari ingatannya sendiri — untuk urusan administrasi kelulusan,
jawaban seperti itu berbahaya sekaligus percuma. Jadi kebetulan jalur teraman
juga jalur termurah.

Diuji dengan 16 pertanyaan campuran: 3 dijawab langsung, 3 ditolak, 10 ke model.
**37% pertanyaan tidak berbiaya sama sekali.**

### Kenapa retrieval, bukan seluruh data

Seluruh basis pengetahuan berukuran ~56.500 karakter. Mengirimkannya utuh setiap
pertanyaan membuat satu jawaban berbiaya puluhan kali lipat. Konteks yang benar-
benar dikirim rata-rata **1.319 karakter** (maksimum 2.327) — sekitar 43× lebih
kecil, dan jawabannya justru lebih tajam karena model tidak perlu menyaring
sendiri.

Prompt caching **tidak** dipakai. Untuk situs bertrafik rendah, penalti tulis
1,25× dengan TTL 5 menit lebih mahal daripada manfaatnya.

### Penjaga biaya

`src/lib/ai/guard.ts`, tiga lapis:

- **Cache jawaban** — 500 entri, TTL 24 jam, kunci dinormalkan sehingga
  "Resep rendang enak!" dan "resep rendang enak" dianggap sama.
- **Rate limit** — 20 permintaan per 10 menit per IP, membalas `429` beserta
  header `Retry-After`.
- **Budget harian** — batas panggilan model per hari (`ASISTEN_LIMIT_HARIAN`,
  bawaan 150). Jatah dikembalikan kalau panggilannya gagal.

Semuanya disimpan di memori proses. Di Vercel, fungsi serverless bisa berjalan
pada beberapa instance sekaligus dan memorinya hilang saat instance dingin —
jadi penjaga ini efektif untuk pemakaian normal dan serangan dari satu sumber,
tetapi **bukan batas keras**. Batas keras yang sesungguhnya adalah **spend limit
di Console Anthropic**; itu yang wajib diisi.

### Kalau kuncinya tidak ada

Asisten tetap jalan. Tanpa `ANTHROPIC_API_KEY`, route mengembalikan isi entri
paling relevan apa adanya. Kalau route-nya sendiri tidak bisa dihubungi,
komponennya menghitung jawaban di browser memakai mesin pencari yang sama. Jadi
tidak ada keadaan di mana tombol Tanya berhenti berguna.

### Memasang kuncinya

1. Buat kunci di [console.anthropic.com](https://console.anthropic.com) →
   **API Keys**.
2. Di **Settings → Limits**, pasang **spend limit** bulanan. Ini satu-satunya
   batas yang benar-benar keras.
3. Di Vercel: **Settings → Environment Variables**, tambah `ANTHROPIC_API_KEY`.
   Pilih ketiga environment, lalu **Redeploy**.
4. Cek dengan membuka `/api/tanya` di browser — balasannya menyebut
   `kunciTerpasang` dan sisa jatah hari ini.

Kuncinya hanya dibaca di server (`src/app/api/tanya/route.ts`). Ia tidak pernah
masuk ke bundel browser dan tidak pernah ditulis di repository.

Variabel yang tersedia ada di `.env.example`.

## Progres pengguna

Checklist dan penanda posisi disimpan di **Local Storage** browser pengguna. Tidak
ada akun, tidak ada login, tidak ada server penyimpan data. Implementasinya di
`src/lib/progress.tsx` dan `src/lib/local-store.ts`, memakai `useSyncExternalStore`
agar render di server dan klien tetap konsisten.

Kunci penyimpanan:

- `lulus-hes:progress:v1` — checklist dan tahap yang dipilih
- `lulus-hes:disclaimer:v1` — persetujuan disclaimer

Kalau struktur datanya berubah tidak kompatibel, naikkan angka versinya supaya data
lama tidak salah dibaca.

## Deploy ke Vercel

1. Push repository ini ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new), impor repository-nya.
3. Vercel mendeteksi Next.js otomatis — tidak ada environment variable yang perlu
   diisi. Klik **Deploy**.

Setiap `git push` berikutnya ter-deploy otomatis. Untuk domain sendiri, buka
**Settings → Domains** di dashboard Vercel.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) ·
Lucide · Framer Motion · next-themes

## Perintah

```bash
npm run build
```

```bash
npm run lint
```
