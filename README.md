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
| `src/data/stages.json` | 12 tahapan: syarat, dokumen, langkah, checklist, tenggat, tips, FAQ, link |
| `src/data/downloads.json` | Metadata template dan tautan Google Drive |
| `src/data/faq.json` | FAQ umum (FAQ per tahapan ada di `stages.json`) |
| `src/data/wizard.json` | Pertanyaan wizard "Saya sedang di tahap mana?" |
| `src/data/site.json` | Nama, disclaimer, kontak, sumber resmi, folder Drive |

Tipe datanya ada di `src/lib/types.ts`. Menambah field berarti menambahkannya di
tipe tersebut lebih dulu.

### Mengaktifkan tombol unduh

File template **tidak disimpan di repository ini** — hanya metadatanya. Unggah file
ke Google Drive, lalu:

1. Isi `url` pada entri terkait di `src/data/downloads.json` dengan tautan Drive,
   dan ubah `status` menjadi `"tersedia"`.
2. Isi juga `version`, `format`, `size`, dan `updatedAt` supaya kartunya informatif.
3. Untuk tombol **Download semua template**, isi `driveFolderUrl` di
   `src/data/site.json` dengan tautan folder Drive.

Selama `url` masih `null`, kartunya tetap tampil dengan status
`"menunggu-unggah"` dan tombol nonaktif — jadi pengguna tahu template itu ada,
tetapi belum bisa diunduh.

Nilai `status` yang tersedia:

- `tersedia` — file sudah diunggah, tombol unduh aktif
- `menunggu-unggah` — metadata sudah ada, file belum diunggah
- `perlu-verifikasi` — ada, tetapi kemungkinan sudah berubah

### Menambah tahapan

1. Tambahkan objek baru di `stages.json` dengan `order` dan `slug` unik.
2. Perbarui `previousStage` / `nextStage` pada tahap sekitarnya agar rantainya nyambung.
3. Kalau memakai ikon baru, daftarkan di `src/lib/icons.ts`.
4. Tambahkan pertanyaan yang sesuai di `wizard.json` bila tahap itu perlu dideteksi.

Halaman `/tahapan/[slug]` dan roadmap otomatis mengikuti — tidak ada daftar tahapan
yang di-hardcode di komponen.

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
