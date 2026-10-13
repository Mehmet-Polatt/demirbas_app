# 🏢 IT Demirbaş ve Zimmet Yönetim Sistemi

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <strong>Kurumsal BT Envanteri, Otomatik QR Kod / Barkod Etiketleme ve Personel Zimmet Takip Platformu</strong>
</p>

[Özellikler](#-öne-çıkan-özellikler) •
[Mimarisi & Veritabanı](#-veritabanı-ve-ilişki-şeması) •
[Yerel Kurulum](#-yerel-geliştirme-kurulumu) •
[Docker ile Başlatma](#-docker--docker-compose-ile-çalıştırma) •
[API Dokümantasyonu](#-api-uç-noktaları) •
[Test Hesapları](#-hazır-test-kullanıcıları)

</div>

---

## 📌 Proje Genel Bakış

Bu proje; kurumsal şirketlerin bilgisayar, monitör, sunucu, telefon, yazıcı ve ağ ekipmanları gibi tüm IT donanımlarını dijital ortamda kayıt altına almalarını, cihaz durumlarını anlık takip etmelerini ve personele zimmetleme / iade süreçlerini **QR Kod** desteği ile yönetmelerini sağlayan tam kapsamlı **Full-Stack** bir yönetim sistemidir.

### ✨ Öne Çıkan Özellikler

- 🌙 **Modern Koyu (Dark Mode) UI:** Yüksek kaliteli glassmorphism ve sezgisel gösterge paneli (KPI kartları, donanım dağılım grafikleri, gerçek zamanlı hareketler).
- 🏷️ **Otomatik QR Kod / Barkod Üretimi:** Her yeni cihaz eklendiğinde benzersiz QR etiket görseli üretilir, sistemde saklanır, tek tıkla yazdırılabilir veya PNG olarak indirilebilir.
- 📱 **Saha QR Tarayıcı Simülatörü:** El terminali veya mobil cihazlar için sahada kamerayla QR okutma, cihaz detaylarını anında ekrana getirme, tek tıkla personele zimmetleme, depoya iade alma veya anlık arıza bildirme.
- 👥 **Çoklu Rol ve Yetkilendirme:** 
  - **Admin:** Kullanıcı, rol ve tam sistem yönetimi.
  - **IT Uzmanı:** Envanter, QR kod, zimmet atama ve iade işlemleri.
  - **Personel:** Kendi üzerine zimmetli donanımları görüntüleme (Kişisel Zimmet Ekranı).
- 📜 **Tam Kapsamlı Denetim Günlüğü (Audit Trail):** Tüm zimmetleme, iade, cihaz silme, durum değiştirme ve giriş/çıkış hareketleri kullanıcı ve IP bilgisiyle JSON farklarıyla loglanır.

---

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+ / FastAPI | Yüksek performanslı asenkron REST API, Pydantic v2, JWT Auth, Bcrypt |
| **Veritabanı** | MySQL 8.0 (`zimmet_db`) | PyMySQL & AIOMySQL sürücüleri ile SQLAlchemy 2.0 ORM entegrasyonu |
| **Frontend** | Next.js (App Router) / React | TypeScript, Tailwind CSS, Lucide Icons, Responsive tasarım |
| **QR / Barkod** | Python QRCode & Pillow | Yüksek çözünürlüklü dinamik QR ve barkod üretimi |
| **Konteyner** | Docker & Docker Compose | MySQL, Backend ve Frontend için çok aşamalı (multi-stage) build |

---

## 🗄️ Veritabanı ve İlişki Şeması

Proje **MySQL (`zimmet_db`)** üzerinde 4 temel ilişkisel tablo üzerine kuruludur:

```mermaid
erDiagram
    USERS ||--o{ ASSIGNMENTS : "zimmetlenir"
    USERS ||--o{ ASSIGNMENTS : "teslim eder (admin/it)"
    USERS ||--o{ AUDIT_LOGS : "işlem yapar"
    DEVICES ||--o{ ASSIGNMENTS : "atanır"

    USERS {
        int id PK
        string email UK
        string username UK
        string full_name
        string hashed_password
        enum role "ADMIN, IT_SPECIALIST, STAFF"
        string department
        string phone_number
        boolean is_active
        datetime created_at
    }

    DEVICES {
        int id PK
        string asset_tag UK "AST-2024-001 vb."
        string serial_number UK
        enum category "LAPTOP, DESKTOP, MONITOR, SERVER, PHONE..."
        string brand
        string model
        json specs "CPU, RAM, Disk"
        enum status "AVAILABLE, ASSIGNED, FAULTY, IN_REPAIR, SCRAPPED"
        date purchase_date
        date warranty_end_date
        string qr_code_path
        text notes
        datetime created_at
    }

    ASSIGNMENTS {
        int id PK
        int device_id FK
        int user_id FK "Zimmetlenen personel"
        int assigned_by_id FK "Zimmeti veren yetkili"
        datetime assigned_at
        datetime returned_at "İade anında dolar"
        string condition_at_assignment
        string condition_at_return
        boolean is_active
        text notes
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        enum action "CREATE, UPDATE, DELETE, ASSIGN, RETURN, STATUS_CHANGE, AUTH_LOGIN"
        string entity_type "DEVICE, ASSIGNMENT, USER"
        string entity_id
        string description
        json changes "JSON Diff"
        string ip_address
        datetime created_at
    }
```

---

## 🚀 Yerel Geliştirme Kurulumu

### 1. Gereksinimler
- Python 3.10 veya üzeri
- Node.js 18 veya 20+
- MySQL Server (3306 portunda çalışan `zimmet_db` veritabanı)

### 2. Backend Kurulumu ve Başlatma
```bash
# 1. Backend dizinine geçin
cd backend

# 2. Python bağımlılıklarını yükleyin
pip install -r requirements.txt

# 3. .env dosyasını kontrol edin / oluşturun
# DATABASE_URL="mysql+pymysql://root:156473mP*@localhost:3306/zimmet_db"

# 4. Veritabanı tablolarını ve örnek hazır verileri MySQL'e aktarın
python app/db/seed.py

# 5. Sunucuyu başlatın
uvicorn app.main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Etkileşimli Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### 3. Frontend Kurulumu ve Başlatma
Yeni bir terminal sekmesinde:
```bash
# 1. Frontend dizinine geçin
cd frontend

# 2. Node paketlerini yükleyin
npm install

# 3. Next.js geliştirme sunucusunu başlatın
npm run dev
```
- **Web Arayüzü:** [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker & Docker Compose ile Çalıştırma

Tüm sistemi (MySQL 8.0, FastAPI ve Next.js) sıfırdan tek komutla ayağa kaldırmak için:

```bash
docker compose up --build
```

Konteynerleri arka planda çalıştırmak için:
```bash
docker compose up -d --build
```

Durdurmak için:
```bash
docker compose down
```

---

## 🔑 Hazır Test Kullanıcıları

Giriş ekranında yer alan **"Hızlı Hesap Seç"** butonlarıyla tek tıkla formları doldurabilir veya aşağıdaki kimlik bilgilerini kullanabilirsiniz:

| Rol | E-Posta | Şifre | Yetki Kapsamı |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@itdemirbas.com` | `AdminPassword123!` | Kullanıcı, cihaz ve zimmet ekleme/silme, tüm logları inceleme |
| **🛠️ IT Uzmanı** | `it.destek@itdemirbas.com` | `UserPassword123!` | Cihaz kaydı, QR oluşturma, zimmetleme, iade ve arıza yönetimi |
| **👤 Personel** | `ahmet.yilmaz@itdemirbas.com` | `UserPassword123!` | Kendi üzerine zimmetli donanımları inceleme, arıza bildirme |

---

## 📡 API Uç Noktaları

| Modül | Metot | Endpoint | Açıklama |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login-json` | JSON formatında giriş ve JWT token üretimi |
| **Auth** | `GET` | `/api/v1/auth/me` | Aktif oturum açmış kullanıcı profili |
| **Dashboard**| `GET` | `/api/v1/dashboard/stats` | Envanter, zimmet ve arıza istatistikleri |
| **Envanter** | `GET` | `/api/v1/devices` | Cihaz listesi (Arama, kategori ve durum filtreleri) |
| **Envanter** | `POST` | `/api/v1/devices` | Yeni cihaz kaydı & otomatik QR kod üretimi |
| **Envanter** | `GET` | `/api/v1/devices/by-tag/{tag}` | QR kod ile cihaz sorgulama (Saha tarayıcı) |
| **Envanter** | `PATCH`| `/api/v1/devices/{id}/status` | Hızlı durum güncelleme (Arızalı, Bakımda vs.) |
| **Zimmet** | `POST` | `/api/v1/assignments` | Cihazı personele zimmetleme |
| **Zimmet** | `POST` | `/api/v1/assignments/{id}/return` | Cihazı depoya iade alma |
| **Zimmet** | `GET` | `/api/v1/assignments/my` | Personelin kendi zimmetli cihazları |
| **Kullanıcı**| `GET` | `/api/v1/users` | Kullanıcı listesi (Admin) |
| **Loglar** | `GET` | `/api/v1/audit-logs` | Tüm sistem denetim kayıtları |

---

## 📱 Mobil Entegrasyon (Flutter Ready)

Uygulamanın Backend mimarisi Flutter mobil uygulamalarıyla doğrudan uyumludur:
- Mobil uygulamanın kamera modülü okuduğu QR etiketini `GET /api/v1/devices/by-tag/{asset_tag}` uç noktasına gönderir.
- Gelen cihaz kartında tek tuşla **"Personele Zimmetle"** veya **"İade Al"** işlemi yapılır.
- Personel kendi telefonunda oturum açtığında sadece `GET /api/v1/assignments/my` üzerinden kendi zimmetlerini görüntüler.

---

## 📄 Lisans

Bu proje MIT lisansı altında geliştirilmiştir.