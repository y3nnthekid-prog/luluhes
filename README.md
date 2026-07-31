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

Pertanyaan dipecah menjadi kelompok istilah — satu singkatan beserta bentangannya
dihitung sebagai **satu** konsep — lalu dicocokkan ke basis pengetahuan yang
dibangun otomatis dari seluruh JSON: FAQ, tahapan, syarat, dokumen, langkah,
tenggat, tips, template, jadwal ujian, dan nomenklatur SKPI. Sekitar 230 entri.

Yang dipahaminya, di luar kata kunci lurus:

| Kemampuan | Contoh |
| --- | --- |
| Salah ketik | "turnitn", "yudisum", "komprehensip", "propsal" |
| Singkatan dan bahasa gaul | "kompre", "dosbing", "ttd", "kpn sempro dibuka" |
| Imbuhan | "pendaftaran"↔"daftar", "perpustakaan"↔"pustaka", "diulang"↔"mengulang" |
| Maksud pertanyaan | "kapan …" mengutamakan Jadwal, "dokumen apa …" mengutamakan Dokumen |
| Urutan tahap | "habis sidang ngapain", "sebelum sempro harus apa" |
| Pertanyaan sambungan | "terus?" menyambung ke topik yang barusan dijawab |
| Satu kata | "sempro" membuka ringkasan tahapnya, bukan FAQ sempit |
| Basa-basi | "halo kak aku mau tanya dong soal …" tetap terbaca |

Pemenggal imbuhannya dipakai **sama persis** pada pertanyaan dan pada basis
pengetahuan. Yang dikejar simetri, bukan ketepatan linguistik: kalau sebuah kata
terpotong keliru, ia terpotong keliru dengan cara yang sama di kedua sisi dan
tetap bertemu.

Delapan aturan yang menjaganya tidak asal menjawab:

1. **Pencocokan per kata, bukan substring.** "kopi" tidak boleh cocok dengan
   "fotokopi".
2. **Tiga tingkat keyakinan.** Ejaan persis bernilai penuh, bentangan singkatan
   0,6, tebakan salah ketik 0,45.
3. **Bentangan singkatan berupa frasa harus cocok seluruhnya.** "SKPI" menjadi
   "surat keterangan pendamping ijazah"; entri yang cuma menyebut "ijazah"
   tidak boleh dianggap menjawab pertanyaan tentang SKPI.
4. **Tebakan salah ketik tidak pernah berdiri sendiri.** Harus ada kecocokan
   lain yang bukan tebakan, atau kecocokan itu ada di judul.
5. **Judul jawaban wajib menyinggung sesuatu yang ditanyakan.** Kecocokan yang
   cuma nyempil di badan teks tidak pernah cukup.
6. **Kata struktural saja tidak cukup** begitu ada kata asing di pertanyaan.
   "jadwal" ada di "jadwal ujian komprehensif" dan di "jadwal sholat"; yang
   membedakan justru kata satunya.
7. **Kata yang asing bagi basis pengetahuan berbobot ganda** di penyebut
   cakupan — pertanyaan yang pokok bahasannya tak dikenal memang harus lebih
   sulit lolos.
8. **Cakupan minimal 33%** dari kelompok istilah pertanyaan.

Pembetulan salah ketik sengaja dibuat pelit — huruf pertama wajib sama, selisih
panjang dibatasi, kata di bawah lima huruf tidak dibetulkan sama sekali.
Pembetulan yang murah hati membuat pertanyaan di luar topik ikut terjawab, dan
itu kesalahan yang paling merugikan di sini.

Menambah pengetahuan berarti menambah data di `src/data` — basis pengetahuannya
ikut terbarui sendiri. Untuk menambah singkatan baru, isi peta `aliases`.

### Mengukur mutunya

```bash
npm test
```

`src/lib/assistant.test.ts` berisi 84 pertanyaan berlabel yang ditulis meniru
cara mahasiswa benar-benar mengetik, dibagi delapan kelompok: pertanyaan
langsung, salah ketik, singkatan, maksud tersirat, urutan tahap, satu kata,
temuan audit, dan di luar topik.

Tiga kelompok yang paling penting:

- **Di luar topik tapi memakai kata pemicu** — "syarat bikin sim c", "jadwal
  sholat hari ini", "kapan gaji karyawan cair". Memakai kata yang sama dengan
  pertanyaan sah, tetapi wajib **ditolak**. Lima belas kasus.
- **Uji lepas** — ditulis setelah mesinnya selesai disetel dan tidak dipakai
  menyetel, supaya ketahuan kalau perbaikannya cuma hafalan.
- **Temuan audit** — kasus yang semula salah, ditemukan dengan menjalankan
  sembilan puluh pertanyaan baru lalu membaca jawabannya satu per satu.

Skor saat ini **84/84**. Sebelum perbaikan: 31/46. Kalau menyentuh mesinnya,
jalankan tes ini dulu — hampir setiap aturan di sana dipasang justru karena
satu perbaikan sempat merusak jawaban yang tadinya sudah benar.

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

Jalur `langsung` dan `tidak-tahu` tidak sekadar mengembalikan potongan data
mentah. `susunJawaban` di `src/lib/assistant.ts` merangkainya: isi entri yang
paling cocok, ditutup satu baris "Setelah ini: Tahap N — …" bila entrinya
berasal dari sebuah tahap, ditambah dua topik terkait yang judulnya dipastikan
tidak kembar. Kalau tidak ada yang cocok sama sekali, penolakannya disertai
tawaran topik terdekat, bukan jalan buntu.

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

## Ruang Main

Empat permainan di `/main`, semuanya merakit isinya dari data yang sama dengan
halaman tahapan — jadi menang di sini berarti hafal alurnya, bukan hafal soalnya.

| Permainan | Isi | Logika |
| --- | --- | --- |
| Lari Menuju Wisuda | Menghindari rintangan bertema tenggat | `src/lib/runner.ts` |
| Blast Berkas | Menata potongan berkas di papan 8×8 | `src/lib/blast.ts` |
| Susun Alur | Mengurutkan 11 tahap | `src/lib/games.ts` |
| Tebak Tahap | Menebak asal sebuah syarat | `src/lib/games.ts` |

Dua yang pertama memisahkan seluruh aturan mainnya ke berkas lib yang tidak
menyentuh DOM, React, maupun waktu nyata: langkah waktu dan sumber acaknya
disuntikkan dari luar. Itu disengaja supaya fisikanya bisa diuji tanpa layar —
`requestAnimationFrame` tidak selalu tersedia di lingkungan pengembangan, dan
menguji permainan lewat tangkapan layar tidak pernah bisa diandalkan.

### Papan skor global

`/api/skor` menyimpan tujuh skor tertinggi tiap permainan di Upstash Redis,
memakai sorted set dengan `ZADD GT` sehingga satu nama hanya punya satu baris:
skor terbaiknya. Yang tersimpan cuma nama yang diketik pemain dan angkanya.

Kalau `KV_REST_API_URL` dan `KV_REST_API_TOKEN` belum diisi — atau Redis-nya
sedang tidak bisa dihubungi — panel beralih ke papan lokal di peramban
masing-masing dan menuliskannya terus terang lewat label **"Perangkat ini
saja"**. Menampilkan papan lokal seolah-olah itu peringkat sedunia jauh lebih
buruk daripada mengaku.

Memasangnya: **Vercel → Storage → Upstash Redis → Create**, pilih project ini.
Vercel memasang kedua variabelnya sendiri; setelah itu **Redeploy**.

Skornya dikirim dari peramban, jadi tidak ada cara membuktikannya benar-benar
diperoleh dengan bermain. Yang ada hanya penjaga sederhana: rate limit per IP,
nama dibersihkan dari karakter kendali dan dipangkas 16 huruf, serta batas atas
skor 100.000 supaya papan tetap terbaca kalau ada yang mengirim angka konyol.

## Dukungan

Bagian **Dukung & beri masukan** di `/tentang#dukungan` memuat dua hal:
formulir kritik dan saran, serta QRIS donasi.

Formulirnya tidak mengirim apa pun ke server mana pun — ia menyusun surel lalu
menyerahkannya ke aplikasi surel perangkat. Konsekuensinya jujur: tidak ada
basis data yang perlu dijaga, dan pengirim melihat persis apa yang dikirim
sebelum menekan kirim. Alamat tujuannya di `site.json` pada `dukungan.email`;
alamat itu tampil publik, jadi ganti di sana kalau ingin dialihkan.

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
