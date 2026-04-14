# Infrastructure (Hạ tầng Dự án)

Thư mục này đóng vai trò như một hòm lưu trữ (Vault) chứa tất cả cấu hình cần thiết để xây dựng và duy trì hạ tầng vận hành của Discord Counselor.

## Vai trò của Thư mục

Trong một hệ thống được thiết kế hoàn thiện (Production-ready), mã nguồn ứng dụng (App Source) và cấu hình máy chủ/đám mây nên được tách biệt.
`infrastructure/` phục vụ cho mô hình **IaaS** (Infrastructure as Code) hoặc chứa các lệnh khởi tạo hạ tầng tĩnh để chuẩn bị môi trường chạy các App Node. Không chứa logic xử lý nghiệp vụ hay Discord API.

## Cấu trúc (Dự kiến mở rộng)

- `terraform/`: Chứa các script `*.tf` dùng để gọi AWS/GCP/Render API khởi tạo tự động các cụm Database, Redis, Node mà không cần thiết lập thủ công bằng giao diện.
- `k8s/`: Chứa `*.yaml` nếu dự án được scale out ngang và chạy trên cụm Kubernetes Cluster phân tán.
- `scripts/`: Điển hình là các file `.sh` (Bash Scripts) để thiết lập quyền (Permissions), khởi động pm2, hay cấu hình SSL/Nginx khi tự duy trì Server (Self-Hosting trên VPS Ubuntu/Debian).

## Lưu ý cho DevOps / Người vận hành

Bất cứ thay đổi nào liên quan đến Port mạng nội bộ, tài nguyên RAM giới hạn cho Node hoặc thay hình thức quản lý phiên bản nên được cập nhật tại thư mục này để đảm bảo rằng các kỹ sư khác có thể tái tạo hoàn chỉnh môi trường của bạn.
