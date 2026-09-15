# Deploy walkthrough 3D ke GitHub Pages (3D saja)

Situs ini murni file statis (HTML + JS + .glb), jadi bisa dihosting gratis di GitHub Pages.
`node scripts/build-pages.mjs` membuat folder **`dist/`** yang isinya **hanya tampilan 3D** —
tanpa panel hitungan, gambar kerja, atau file berat (`.skp` 31 MB & `rumah-raw.glb` 96 MB tidak ikut).
Total `dist/` ± 7,4 MB, aman untuk GitHub Pages.

Alamat hasilnya: `https://<username>.github.io/<nama-repo>/`. Semua path relatif, jadi jalan di sub-folder repo.

---

## Cara A — Actions (otomatis, direkomendasikan)

Repo memuat seluruh project; setiap `git push` membangun ulang `dist/` dan men-deploy-nya.

```bash
cd rumah-alfi-3d
git init -b main
git add -A                       # rumah-raw.glb & .skp otomatis diabaikan (.gitignore)
git commit -m "Walkthrough 3D rumah Mbak Alfi"
git remote add origin https://github.com/<username>/rumah-alfi-3d.git
git push -u origin main
```

Lalu di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Workflow `.github/workflows/deploy-pages.yml` menjalankan build dan publish otomatis.
Tunggu 1–2 menit, link muncul di tab **Actions** atau **Settings → Pages**.

> Catatan: `models/rumah.glb` (4,2 MB) **harus** ikut ter-commit karena itu model yang dimuat.
> Yang diabaikan hanya `rumah-raw.glb`, `*.skp`, dan `dist/` (dibangun ulang oleh Actions).

## Cara B — publish folder dist/ langsung (paling ketat "3D saja")

Hanya isi `dist/` yang masuk GitHub, tidak ada file lain sama sekali.

```bash
cd rumah-alfi-3d
node scripts/build-pages.mjs
cd dist
git init -b main
git add -A && git commit -m "Walkthrough 3D"
git remote add origin https://github.com/<username>/rumah-alfi-3d.git
git push -u origin main
```

Di GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`**.

Kalau ada revisi, jalankan ulang `node scripts/build-pages.mjs`, lalu `git add -A && git commit && git push` dari dalam `dist/`.

---

## Alternatif tanpa GitHub

`dist/` bisa di-drag-drop ke **Netlify Drop** (app.netlify.com/drop) atau **Cloudflare Pages** —
langsung online tanpa perlu git.

## Cek lokal sebelum deploy

```bash
cd dist && python3 -m http.server 8080
```

Buka <http://localhost:8080>. Kalau di sini jalan, di Pages juga jalan.
