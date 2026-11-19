# VL_NCC_BE (frontend)

Angular 22, Angular Material 22 (MDC), NgRx 22, RxJS 7, TypeScript 6. Build bằng `@angular/build:application` (esbuild). Thư viện bên thứ ba đã lên bản cho Angular 22 (trừ Chart.js 2.9, cố ý giữ); danh sách ở plan nâng cấp.

## Yêu cầu

- Node `^22.22.3` hoặc `>= 24.15.0` (yêu cầu của Angular 22)
- yarn 1.22 (`.yarnrc` đã bật `ignore-engines`)

```bash
yarn install
```

## Chạy dev

```bash
yarn start
```

Mở `http://localhost:3105/`.

## Build

| Lệnh | Cấu hình | Thư mục output |
|---|---|---|
| `yarn build` | `production` | `build/prod_260428` |
| `yarn build-test` | `test` | `build/ncc_test` |
| `yarn build-prod` | `prod` | `build/ncc_dev` |
| `yarn build-kg` | `prod_KG` | `build/proKG_210817` |
| `yarn build-sotbvl` | `prod_SOTBVL` | `build/prodSOTBVL_260427` |

Kiểm tra nhanh, không ghi đè thư mục output thật: `yarn verify:dev`, `yarn verify:prod` (ra `build/_verify_*`).

## Lint

```bash
yarn lint
```

Cấu hình ở `eslint.config.js`, giữ bộ rule cũ (bộ khuyến nghị của angular-eslint, prefix `kt`/`m`). Code hiện còn khoảng 400 lỗi lint có từ trước, chủ yếu `template/eqeqeq`; lint không chặn build.

## Lịch sử nâng cấp

Nâng từ Angular 13 lên 22 theo `docs/plan/2026-11-14-angular-22-implementation-plan.md`; các chỗ làm khác plan và việc còn lại ghi trong file đó (mục "Tiếp tục từ đâu"). **Chưa nghiệm thu:** chưa smoke test với backend (chưa đăng nhập vào app lần nào sau nâng cấp). Checklist kiểm tra tay: `docs/plan/angular_22_smoke_checklist.md`. Test e2e: `tools/e2e/README.md`.
