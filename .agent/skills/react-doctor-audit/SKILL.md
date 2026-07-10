---
name: react-doctor-audit
description: Kiểm tra sức khỏe codebase React/Next.js/React Native bằng React Doctor CLI - phát hiện anti-pattern, lỗi hiệu năng, bảo mật, accessibility và dead code.
---

# React Doctor Audit Skill

## Mục đích
Dùng khi người dùng yêu cầu: "kiểm tra dự án", "audit code React", "chấm điểm chất lượng codebase",
hoặc trước khi merge PR lớn / sau khi agent tự sinh nhiều code React.

## Quy trình (Pipeline)

### Bước 1: Phát hiện domain
Xác nhận dự án là React/Next.js/Vite/React Native (kiểm tra package.json có "react").
Nếu không phải React → dừng, thông báo skill này chỉ áp dụng cho React.

### Bước 2: Chạy scan cơ bản
Chạy lệnh tại root dự án:
    npx -y react-doctor@latest . --json > react-doctor-report.json

Nếu cần chi tiết đường dẫn/dòng lỗi, thêm --verbose.
Nếu chỉ muốn xem điểm nhanh: --score.

### Bước 3: Phân tích kết quả
Đọc file report.json, trích xuất:
- Tổng điểm (score) và nhãn (Great/Needs work/Critical)
- Số lỗi (errors) và cảnh báo (warnings)
- Số file/export không dùng (dead code)
- Nhóm rule bị vi phạm nhiều nhất (ví dụ: no-derived-useState, no-array-index-as-key)

### Bước 4: Ưu tiên sửa lỗi
Sắp xếp theo mức độ nghiêm trọng:
1. Errors trong nhóm State & Effects (derived state, cascading setState, missing cleanup)
2. Security & Accessibility errors
3. Next.js/React Native framework-specific errors
4. Performance warnings
5. Dead code (unused files/exports)

Với mỗi lỗi: giải thích nguyên nhân gốc, đề xuất fix cụ thể (code diff), không tự sửa hàng loạt
nếu chưa được xác nhận.

### Bước 5: Áp dụng sửa (nếu được yêu cầu)
- Với lỗi rõ ràng (ví dụ key={i} → key={item.id}): sửa trực tiếp.
- Với false-positive nghi ngờ (rerender-state-only-in-handlers, rn-no-raw-text trên wrapper
  component): đề xuất thêm vào ignore.overrides trong config react-doctor, KHÔNG dùng ignore.files
  (vì nó tắt toàn bộ rule của file, mất coverage).

### Bước 6: Tái kiểm tra
Sau khi sửa, chạy lại:
    npx -y react-doctor@latest . --diff main

để chỉ quét các file đã thay đổi, xác nhận điểm số tăng.

## Lệnh tham khảo nhanh
| Mục đích | Lệnh |
|---|---|
| Scan toàn bộ | npx -y react-doctor@latest . |
| Chỉ lấy điểm | npx -y react-doctor@latest . --score |
| Xuất JSON | npx -y react-doctor@latest . --json |
| Chỉ file thay đổi | npx -y react-doctor@latest . --diff main |
| Chỉ file staged (pre-commit) | npx -y react-doctor@latest . --staged |
| Bỏ qua dead-code pass (nhanh hơn) | npx -y react-doctor@latest . --no-dead-code |
| Giải thích 1 lỗi cụ thể | npx -y react-doctor@latest --explain <file:line> |
| Cài skill cho agent khác (Cursor, Claude Code...) | npx -y react-doctor@latest install |

## Lưu ý quan trọng
- Điểm số KHÔNG so sánh tuyệt đối giữa các dự án khác nhau (bị chuẩn hóa theo kích thước codebase).
- Ưu tiên dùng ignore.overrides thay vì ignore.files khi cần tắt rule cho 1 file.
- Với dự án Bun monorepo dùng workspaces.catalogs, cần react-doctor >= 0.1.5.
- Coi warning là gợi ý (advisory) trong vài tuần đầu, chỉ set --fail-on error khi noise rate thấp.
- Kết hợp CI (GitHub Action millionco/react-doctor@main) + skill agent để vừa chặn code mới,
  vừa dọn code cũ.
