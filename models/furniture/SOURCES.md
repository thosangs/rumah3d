# Sumber aset furnitur (models/furniture)

Semua file di folder ini sudah dikompres dengan `@gltf-transform/cli optimize` (meshopt + WebP 1k, FurniMesh juga disederhanakan 35%).

## bl_*.glb — dibuat sendiri di Blender
Dihasilkan oleh `scripts/blender/build_furniture.py` (Blender 5.2 headless), gaya mengikuti render konsep DED. Bebas dipakai.

## ph_*.glb — Poly Haven (lisensi CC0, https://polyhaven.com/license)
| File | Aset | Pembuat |
|---|---|---|
| ph_potted_plant_02.glb | https://polyhaven.com/a/potted_plant_02 | Rico Cilliers |
| ph_potted_plant_04.glb | https://polyhaven.com/a/potted_plant_04 | James Ray Cock |
| ph_pachira_aquatica_01.glb | https://polyhaven.com/a/pachira_aquatica_01 | Rob Tuytel, Rico Cilliers |
| ph_modern_ceiling_lamp_01.glb | https://polyhaven.com/a/modern_ceiling_lamp_01 | James Ray Cock |
| ph_modern_wooden_cabinet.glb | https://polyhaven.com/a/modern_wooden_cabinet | Patrik Pangerl |
| ph_dining_chair_02.glb | https://polyhaven.com/a/dining_chair_02 | James Ray Cock |
| ph_coffee_table_round_01.glb | https://polyhaven.com/a/coffee_table_round_01 | Ulan Cabanilla |
| ph_side_table_01.glb | https://polyhaven.com/a/side_table_01 | James Ray Cock |
| ph_mid_century_lounge_chair.glb | https://polyhaven.com/a/mid_century_lounge_chair | Kuutti Siitonen |
| ph_throw_pillows_01.glb | https://polyhaven.com/a/throw_pillows_01 | Serhii Khromov |
| ph_hanging_picture_frame_01.glb | https://polyhaven.com/a/hanging_picture_frame_01 | James Ray Cock |
| ph_wooden_display_shelves_01.glb | https://polyhaven.com/a/wooden_display_shelves_01 | James Ray Cock |

## fm_*.glb — FurniMesh library (https://furnimesh.com/library/, model AI dari foto, unduhan gratis)
Halaman model menyatakan "Free Download"; FurniMesh menyebut hasil generasinya berlisensi komersial tanpa atribusi. Cek ulang syarat di https://furnimesh.com/terms/ sebelum dipakai di luar proyek ini.

| File | Judul | Halaman |
|---|---|---|
| fm_sofa_grey.glb | Modern Dark Grey Sofa | https://furnimesh.com/library/sofas/sofa/a-modern-threeseater-sofa-featuring-a-dark-be1vgv/ |
| fm_armchair_boucle.glb | Boucle Tufted Modular Armchair | https://furnimesh.com/library/seating/armchair/an-offwhite-deeply-tufted-armless-modular-lounge-82kslv/ |
| fm_dining_chair_oak.glb | Light Oak Upholstered Chair | https://furnimesh.com/library/seating/chair/a-modern-side-chair-featuring-a-curved-5lsa2k/ |
| fm_dining_table_charcoal.glb | Contemporary Charcoal Desk | https://furnimesh.com/library/tables/desk/a-sleek-contemporary-rectangular-conference-table-featuring-k9qi0x/ |
| fm_coffee_table_oak.glb | Contemporary Dark Oak Coffee Table | https://furnimesh.com/library/tables/coffee-table/a-circular-coffee-table-featuring-a-darkstained-amdjt7/ |
| fm_bed_beige.glb | Modern Upholstered Bed | https://furnimesh.com/library/beds/bed/a-modern-platform-bed-featuring-a-fully-walb75/ |
| fm_bed_grey.glb | Upholstered Modern Bed | https://furnimesh.com/library/beds/bed/a-modern-upholstered-platform-bed-featuring-a-i7u3r2/ |
| fm_bed_darkwood.glb | Modern Dark Wood Bed | https://furnimesh.com/library/beds/bed/a-modern-platform-bed-featuring-a-clean-bt86e3/ |
| fm_wardrobe_mirror.glb | Fluted Mirrored Contemporary Wardrobe | https://furnimesh.com/library/storage/wardrobe/a-contemporary-threedoor-wardrobe-featuring-a-central-j47eoj/ |
| fm_wardrobe_grey.glb | Modern Wood-Grain Wardrobe | https://furnimesh.com/library/storage/wardrobe/a-tall-rectangular-freestanding-wardrobe-cabinet-featuring-nzutif/ |
| fm_tv_console_walnut.glb | Modern Walnut TV Stand | https://furnimesh.com/library/storage/tv-stand/a-sleek-modern-floating-media-console-crafted-bok0dk/ |
| fm_desk_walnut.glb | Walnut Waterfall Desk | https://furnimesh.com/library/tables/desk/a-modern-desk-featuring-a-distinctive-waterfall-fboct1/ |
| fm_office_chair_mesh.glb | Contemporary Black Mesh Office Chair | https://furnimesh.com/library/seating/office-chair/a-contemporary-black-chair-featuring-a-breathable-9o84qz/ |
| fm_dresser_wood.glb | Contemporary Wood Dresser | https://furnimesh.com/library/storage/dresser/a-threedrawer-dresser-with-rounded-corners-and-kznzyz/ |
| fm_olive_tree.glb | Realistic Potted Plant (faux olive tree) | https://furnimesh.com/library/decor/plant/a-faux-olive-tree-presented-in-a-kdkvhn/ |
| fm_olive_tree2.glb | Modern Concrete Potted Plant (artificial olive tree) | https://furnimesh.com/library/decor/plant/an-artificial-olive-tree-presented-in-a-pxobbm/ |

## BlenderKit (CC0)

| File | Judul | Pembuat | Lisensi | Halaman |
|---|---|---|---|---|
| bk_simon82.glb | Set switch & socket Simon 82 (stop kontak schuko + saklar 1 tuts + port USB; dipakai bagian E_Socket & E_switch) | Agustin Paternoster | CC0 | https://www.blenderkit.com/asset-gallery-detail/d20f4d59-a52f-4d1b-b174-b786e7dd3a22 |

Diunduh lewat API BlenderKit (file glTF yang disediakan pembuat), lalu dikonversi Draco → meshopt dengan gltf-transform.

## Dibuat sendiri di Blender (scripts/blender/build_furniture.py)

`bl_mcb_box.glb` (box MCB 4 group), `bl_kwh_meter.glb` (kWh meter prabayar), `bl_sconce.glb` (lampu dinding outdoor), `bl_ac_indoor.glb` (unit AC indoor), `bl_water_heater.glb` (water heater tangki 15 L), `bl_closet_duduk.glb` (kloset duduk monoblok), `bl_closet_jongkok.glb` (kloset jongkok), `bl_washbasin.glb` (wastafel gantung, belum dipakai) — tidak ada model residensial yang layak dan berlisensi bebas di Poly Haven/BlenderKit (yang ada panel industri besar/berkarat), jadi dibuat parametrik mengikuti ukuran produk umum.
