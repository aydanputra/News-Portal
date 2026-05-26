# Homepage Block Config Migration

## Tujuan
Menormalkan key legacy di `HomepageBlock.config` agar konsisten ke key canonical terbaru.

Script:
- `scripts/normalize-homepage-block-config-keys.ts`
- `scripts/restore-homepage-block-config-backup.ts`

## Key yang Dinormalisasi
- `showMeta` -> `showMetaInfo`
- `tabletShowMeta` -> `tabletShowMetaInfo`
- `mobileShowMeta` -> `mobileShowMetaInfo`
- `categoryTextColor` -> `categoryLabelColor`
- `tabletCategoryTextColor` -> `tabletCategoryLabelColor`
- `mobileCategoryTextColor` -> `mobileCategoryLabelColor`
- `categoryBgColor` -> `categoryLabelBgColor`
- `tabletCategoryBgColor` -> `tabletCategoryLabelBgColor`
- `mobileCategoryBgColor` -> `mobileCategoryLabelBgColor`
- `categoryFontSize` -> `categoryLabelFontSize`
- `tabletCategoryFontSize` -> `tabletCategoryLabelFontSize`
- `mobileCategoryFontSize` -> `mobileCategoryLabelFontSize`
- `categoryBorderRadius` -> `categoryLabelBorderRadius`
- `tabletCategoryBorderRadius` -> `tabletCategoryLabelBorderRadius`
- `mobileCategoryBorderRadius` -> `mobileCategoryLabelBorderRadius`

## Cara Jalankan
ulley### Opsi Shortcut via npm scripts

```bash
npm run migrate:homepage-config
npm run migrate:homepage-config:apply
npm run rollback:homepage-config -- --file=scripts/backups/homepage-block-config-backup-YYYY-MM-DDTHH-MM-SS-sssZ.json
```

Dengan shortcut ini tim tidak perlu mengetik path script panjang, cukup fokus ke argumen penting seperti `--file`, `--apply`, atau `--limit`.

### Opsi langsung via ts-node
Dry run terlebih dahulu:

```bash
npx ts-node scripts/normalize-homepage-block-config-keys.ts
```

Apply perubahan:

```bash
npx ts-node scripts/normalize-homepage-block-config-keys.ts --apply
```

Apply tanpa menghapus key legacy:

```bash
npx ts-node scripts/normalize-homepage-block-config-keys.ts --apply --keep-legacy
```

Filter tema/lokasi:

```bash
npx ts-node scripts/normalize-homepage-block-config-keys.ts --apply --theme=pranala --location=home
```

## Backup & Report
Script otomatis membuat:
- report detail: `scripts/backups/homepage-block-config-normalize-report-*.json`
- backup sebelum update (mode apply): `scripts/backups/homepage-block-config-backup-*.json`

## Rollback Ringan
Dry run rollback dari file backup:

```bash
npx ts-node scripts/restore-homepage-block-config-backup.ts --file=scripts/backups/homepage-block-config-backup-YYYY-MM-DDTHH-MM-SS-sssZ.json
```

Apply rollback:

```bash
npx ts-node scripts/restore-homepage-block-config-backup.ts --file=scripts/backups/homepage-block-config-backup-YYYY-MM-DDTHH-MM-SS-sssZ.json --apply
```

Rollback sebagian untuk verifikasi:

```bash
npx ts-node scripts/restore-homepage-block-config-backup.ts --file=scripts/backups/homepage-block-config-backup-YYYY-MM-DDTHH-MM-SS-sssZ.json --apply --limit=5
```

Praktik aman:
- Jalankan dulu di staging
- Simpan backup file di tempat aman
- Setelah apply, cek admin homepage pada desktop/tablet/mobile
