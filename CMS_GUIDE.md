# Panduan CMS LUVIN HOME

Panduan ini ditujukan untuk Hirency dan editor konten non-teknis. Semua perubahan dilakukan melalui Sanity Studio; tidak perlu membuka VS Code.

## 1. Login

1. Buka URL Sanity Studio LUVIN HOME.
2. Login menggunakan akun yang sudah diundang oleh Genesis.
3. Jangan membagikan password atau kode login kepada siapa pun.

## 2. Mengganti hero image

1. Buka **Homepage**.
2. Pilih tab **Hero**, lalu klik **Hero image**.
3. Upload gambar baru, atur crop/hotspot, dan isi **Alternative text**.
4. Klik **Publish** setelah preview dan teks alternatif sudah benar.

Rekomendasi hero: JPG/WebP, minimal 1920 × 1080 px, rasio mendatar, fokus utama tidak terlalu dekat ke tepi.

## 3. Mengganti hero text

Di **Homepage → Hero**, ubah eyebrow, judul, deskripsi, atau label tombol. Jangan membuat judul terlalu panjang; periksa tampilan mobile sebelum Publish.

## 4. Menambah produk

1. Buka **Products** lalu klik **Create**.
2. Isi nama, slug, SKU, collection, harga, deskripsi, material/benefit, gambar utama, dan status stok.
3. Gunakan status **Draft** selama data belum lengkap.
4. Pilih **Active** hanya setelah gambar utama, SKU, collection, harga, dan material/benefit tersedia.
5. Klik **Publish**.

## 5. Mengganti harga

Buka produk, ubah **Price**, lalu Publish. Isi **Compare-at price** hanya jika nilainya sama atau lebih besar daripada harga jual.

## 6. Upload gallery produk

Di produk, buka bagian **Images**, tambahkan beberapa **Gallery images**, isi alternative text setiap gambar, lalu susun urutannya dengan drag-and-drop.

Rekomendasi gambar produk: JPG/WebP, minimal 1600 px pada sisi panjang, pencahayaan konsisten, tanpa teks promosi di dalam gambar.

## 7. Memilih collection

Di halaman produk, pilih **Collection** yang sesuai. Jangan membuat collection baru bila kategori yang benar sudah tersedia.

## 8. Mengubah FAQ

Buka **FAQ**, pilih pertanyaan, perbaiki question/answer/category, lalu Publish. Gunakan bahasa singkat, jelas, dan tidak menjanjikan sesuatu yang belum dikonfirmasi.

## 9. Mengubah testimonial

Buka **Testimonials**. Untuk testimonial pelanggan, pilih tipe **Customer** dan aktifkan **Permission confirmed** hanya jika izin tertulis sudah tersedia. Konten placeholder harus diberi tipe **Editorial placeholder**.

## 10. Save Draft dan Publish

- **Draft** menyimpan pekerjaan tetapi tidak menampilkannya di website publik.
- **Publish** mengirim versi terbaru ke website publik.

Selalu simpan sebagai Draft bila konten masih menunggu pengecekan harga, izin, stok, atau gambar.

## 11. Memperbaiki typo

Buka dokumen terkait, perbaiki teks, baca ulang dalam konteks kalimat, lalu Publish. Jangan mengubah slug hanya untuk memperbaiki typo pada nama.

## 12. Mengarsipkan produk

Ubah status produk menjadi **Archived**, lalu Publish. Jangan menghapus produk yang mungkin masih dibutuhkan untuk riwayat konten.

## 13. Standar foto

- Hero: minimal 1920 × 1080 px, landscape.
- Produk: minimal 1600 px, latar dan warna konsisten.
- Inspired Spaces: minimal 1600 × 1200 px.
- Format: JPG atau WebP; hindari file mentah yang sangat besar.
- Selalu isi alternative text secara objektif.

## 14. Hal yang tidak boleh diubah

- Jangan memasukkan password, token, data kartu, atau data pribadi pelanggan ke CMS.
- Jangan mengganti nomor WhatsApp `6282298887298` tanpa persetujuan Genesis.
- Jangan mengaktifkan testimonial pelanggan tanpa izin.
- Jangan mengubah Site Settings, SEO, slug, atau struktur collection tanpa koordinasi.
- Jangan memilih paket berbayar, membeli domain, atau menghapus dataset/project.

## Menjalankan secara lokal (untuk Genesis/developer)

```bash
npm run dev
npm run studio
```

Website selalu memakai konten lokal sebagai fallback jika Sanity belum dikonfigurasi, belum publish, atau sedang tidak tersedia.
