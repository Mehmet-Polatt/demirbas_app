import datetime
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.device import Device, DeviceCategory, DeviceStatus
from app.models.assignment import Assignment
from app.models.audit_log import AuditLog, AuditAction
from app.services.qr_service import generate_device_qr_code

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@itdemirbas.com").first():
            print("Veritabanı zaten örnek verilerle doldurulmuş.")
            return

        print("Örnek veriler oluşturuluyor...")

        # 1. Users
        admin = User(
            email="admin@itdemirbas.com",
            username="admin",
            full_name="Mehmet Polat (Sistem Yöneticisi)",
            hashed_password=get_password_hash("AdminPassword123!"),
            role=UserRole.ADMIN,
            department="IT & Sistem Yönetimi",
            phone_number="+90 532 100 0001",
            is_active=True
        )
        it_spec = User(
            email="it.destek@itdemirbas.com",
            username="itdestek",
            full_name="Caner Yıldız (IT Uzmanı)",
            hashed_password=get_password_hash("UserPassword123!"),
            role=UserRole.IT_SPECIALIST,
            department="IT & Bilgi İşlem",
            phone_number="+90 532 100 0002",
            is_active=True
        )
        staff1 = User(
            email="ahmet.yilmaz@itdemirbas.com",
            username="ahmetyilmaz",
            full_name="Ahmet Yılmaz",
            hashed_password=get_password_hash("UserPassword123!"),
            role=UserRole.STAFF,
            department="Yazılım Geliştirme",
            phone_number="+90 533 222 3344",
            is_active=True
        )
        staff2 = User(
            email="ayse.kaya@itdemirbas.com",
            username="aysekaya",
            full_name="Ayşe Kaya",
            hashed_password=get_password_hash("UserPassword123!"),
            role=UserRole.STAFF,
            department="İnsan Kaynakları",
            phone_number="+90 535 444 5566",
            is_active=True
        )
        staff3 = User(
            email="mehmet.demir@itdemirbas.com",
            username="mehmetdemir",
            full_name="Mehmet Demir",
            hashed_password=get_password_hash("UserPassword123!"),
            role=UserRole.STAFF,
            department="Pazarlama & Satış",
            phone_number="+90 536 777 8899",
            is_active=True
        )
        staff4 = User(
            email="zeynep.celik@itdemirbas.com",
            username="zeynepcelik",
            full_name="Zeynep Çelik",
            hashed_password=get_password_hash("UserPassword123!"),
            role=UserRole.STAFF,
            department="Finans & Muhasebe",
            phone_number="+90 537 999 0011",
            is_active=True
        )

        db.add_all([admin, it_spec, staff1, staff2, staff3, staff4])
        db.commit()
        for u in [admin, it_spec, staff1, staff2, staff3, staff4]:
            db.refresh(u)

        # 2. Devices
        devices_data = [
            {
                "asset_tag": "AST-2024-001",
                "serial_number": "C02G19JPMD6R",
                "category": DeviceCategory.LAPTOP,
                "brand": "Apple",
                "model": "MacBook Pro 16\" M3 Max",
                "specs": {"cpu": "Apple M3 Max 16-Core", "ram": "64 GB", "storage": "1 TB SSD", "os": "macOS Sonoma"},
                "status": DeviceStatus.ASSIGNED,
                "purchase_date": datetime.date(2024, 1, 15),
                "warranty_end_date": datetime.date(2027, 1, 15),
                "notes": "Yazılım ekibi liderine zimmetlendi. Çanta ve 140W şarj adaptörü dahil."
            },
            {
                "asset_tag": "AST-2024-002",
                "serial_number": "PF39X8K2",
                "category": DeviceCategory.LAPTOP,
                "brand": "Lenovo",
                "model": "ThinkPad X1 Carbon Gen 11",
                "specs": {"cpu": "Intel Core i7-1365U", "ram": "32 GB", "storage": "512 GB NVMe", "os": "Windows 11 Pro"},
                "status": DeviceStatus.ASSIGNED,
                "purchase_date": datetime.date(2024, 2, 10),
                "warranty_end_date": datetime.date(2027, 2, 10),
                "notes": "İK yöneticisi kullanımı."
            },
            {
                "asset_tag": "AST-2024-003",
                "serial_number": "8CG2401K9M",
                "category": DeviceCategory.LAPTOP,
                "brand": "Dell",
                "model": "Latitude 5540",
                "specs": {"cpu": "Intel Core i5-1335U", "ram": "16 GB", "storage": "512 GB SSD", "os": "Windows 11 Pro"},
                "status": DeviceStatus.AVAILABLE,
                "purchase_date": datetime.date(2024, 3, 1),
                "warranty_end_date": datetime.date(2027, 3, 1),
                "notes": "Boşta, yeni personel için hazır."
            },
            {
                "asset_tag": "AST-2024-004",
                "serial_number": "CN-0V7K3P-74261",
                "category": DeviceCategory.MONITOR,
                "brand": "Dell",
                "model": "UltraSharp U2723QE 27\" 4K",
                "specs": {"resolution": "3840x2160 4K", "panel": "IPS Black", "ports": "USB-C 90W PD, HDMI, DP"},
                "status": DeviceStatus.ASSIGNED,
                "purchase_date": datetime.date(2024, 1, 20),
                "warranty_end_date": datetime.date(2027, 1, 20),
                "notes": "Yazılım ekibi masasında."
            },
            {
                "asset_tag": "AST-2024-005",
                "serial_number": "LG-34WN-98112",
                "category": DeviceCategory.MONITOR,
                "brand": "LG",
                "model": "34WN80C-B 34\" UltraWide",
                "specs": {"resolution": "3440x1440 QHD", "curved": True, "usb_c": True},
                "status": DeviceStatus.AVAILABLE,
                "purchase_date": datetime.date(2024, 2, 5),
                "warranty_end_date": datetime.date(2026, 2, 5),
                "notes": "Depoda paketli."
            },
            {
                "asset_tag": "AST-2024-006",
                "serial_number": "DX3L8924MD6Q",
                "category": DeviceCategory.PHONE,
                "brand": "Apple",
                "model": "iPhone 15 Pro 128GB",
                "specs": {"color": "Doğal Titanyum", "storage": "128 GB", "battery_health": "100%"},
                "status": DeviceStatus.ASSIGNED,
                "purchase_date": datetime.date(2024, 4, 1),
                "warranty_end_date": datetime.date(2026, 4, 1),
                "notes": "Saha satış yöneticisi hattı takılı."
            },
            {
                "asset_tag": "AST-2024-007",
                "serial_number": "SRV-PE-R750-01",
                "category": DeviceCategory.SERVER,
                "brand": "Dell",
                "model": "PowerEdge R750 2U Rack",
                "specs": {"cpu": "2x Intel Xeon Gold 6330", "ram": "256 GB ECC", "storage": "8x 1.92TB SAS SSD RAID 10"},
                "status": DeviceStatus.AVAILABLE,
                "purchase_date": datetime.date(2023, 11, 10),
                "warranty_end_date": datetime.date(2028, 11, 10),
                "notes": "Sistem Odası Kabin 3, U12-U13."
            },
            {
                "asset_tag": "AST-2024-008",
                "serial_number": "FOC2510Y8L2",
                "category": DeviceCategory.NETWORK_DEVICE,
                "brand": "Cisco",
                "model": "Catalyst 9200L 48P PoE+",
                "specs": {"ports": "48x 1G PoE+, 4x 10G SFP+", "capacity": "176 Gbps"},
                "status": DeviceStatus.AVAILABLE,
                "purchase_date": datetime.date(2023, 12, 1),
                "warranty_end_date": datetime.date(2028, 12, 1),
                "notes": "Kat 2 Dağıtım Anahtarı."
            },
            {
                "asset_tag": "AST-2024-009",
                "serial_number": "HP-LJ-M404-551",
                "category": DeviceCategory.PRINTER,
                "brand": "HP",
                "model": "LaserJet Pro M404dn",
                "specs": {"speed": "38 ppm", "duplex": True, "ethernet": True},
                "status": DeviceStatus.AVAILABLE,
                "purchase_date": datetime.date(2024, 2, 15),
                "warranty_end_date": datetime.date(2026, 2, 15),
                "notes": "Ortak kullanım ağ yazıcısı."
            },
            {
                "asset_tag": "AST-2024-010",
                "serial_number": "C02H20K8MD6R",
                "category": DeviceCategory.LAPTOP,
                "brand": "Apple",
                "model": "MacBook Air 13\" M2",
                "specs": {"cpu": "Apple M2 8-Core", "ram": "16 GB", "storage": "256 GB SSD"},
                "status": DeviceStatus.FAULTY,
                "purchase_date": datetime.date(2023, 6, 1),
                "warranty_end_date": datetime.date(2025, 6, 1),
                "notes": "Ekran menteşesinde hasar var, yetkili servise gönderilmeyi bekliyor."
            }
        ]

        created_devices = []
        for d in devices_data:
            qr_rel, _ = generate_device_qr_code(
                d["asset_tag"],
                {"brand": d["brand"], "model": d["model"], "cat": d["category"].value}
            )
            device = Device(
                asset_tag=d["asset_tag"],
                serial_number=d["serial_number"],
                category=d["category"],
                brand=d["brand"],
                model=d["model"],
                specs=d["specs"],
                status=d["status"],
                purchase_date=d["purchase_date"],
                warranty_end_date=d["warranty_end_date"],
                qr_code_path=qr_rel,
                barcode=d["asset_tag"],
                notes=d["notes"]
            )
            db.add(device)
            created_devices.append(device)

        db.commit()
        for dev in created_devices:
            db.refresh(dev)

        # 3. Assignments
        # Assign MacBook Pro 16 to Ahmet Yilmaz
        asgn1 = Assignment(
            device_id=created_devices[0].id,
            user_id=staff1.id,
            assigned_by_id=admin.id,
            assigned_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=45),
            condition_at_assignment="Kutusu açılmamış, sıfır teslim edildi.",
            is_active=True,
            notes="140W Orijinal Şarj Cihazı, MagSafe kablosu ve Taşıma Çantası ile teslim edildi."
        )
        # Assign ThinkPad X1 to Ayse Kaya
        asgn2 = Assignment(
            device_id=created_devices[1].id,
            user_id=staff2.id,
            assigned_by_id=admin.id,
            assigned_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30),
            condition_at_assignment="Sıfır kutusunda.",
            is_active=True,
            notes="Type-C şarj adaptörü ve kablosuz mouse teslim edildi."
        )
        # Assign Dell Monitor to Ahmet Yilmaz
        asgn3 = Assignment(
            device_id=created_devices[3].id,
            user_id=staff1.id,
            assigned_by_id=admin.id,
            assigned_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=40),
            condition_at_assignment="Kusursuz, ölü piksel yok.",
            is_active=True,
            notes="Type-C ve HDMI bağlantı kabloları verildi."
        )
        # Assign iPhone 15 Pro to Mehmet Demir
        asgn4 = Assignment(
            device_id=created_devices[5].id,
            user_id=staff3.id,
            assigned_by_id=it_spec.id,
            assigned_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=15),
            condition_at_assignment="Sıfır jelatinli kutu, ekran koruyucu ve kılıf takıldı.",
            is_active=True,
            notes="Şirket GSM hattı ile teslim edildi."
        )
        # Completed (Returned) assignment for history
        asgn_returned = Assignment(
            device_id=created_devices[2].id, # Dell Latitude
            user_id=staff4.id,
            assigned_by_id=it_spec.id,
            assigned_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=120),
            returned_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10),
            condition_at_assignment="Sıfır",
            condition_at_return="Temiz, sorunsuz teslim alındı.",
            is_active=False,
            notes="Geçici proje zimmeti tamamlandı ve cihaz depoya iade edildi."
        )

        db.add_all([asgn1, asgn2, asgn3, asgn4, asgn_returned])
        db.commit()

        # 4. Audit Logs
        logs = [
            AuditLog(
                user_id=admin.id,
                action=AuditAction.CREATE,
                entity_type="SYSTEM",
                entity_id="1",
                description="Sistem ilk kurulumu tamamlandı ve süper yönetici hesabı oluşturuldu.",
                ip_address="127.0.0.1"
            ),
            AuditLog(
                user_id=admin.id,
                action=AuditAction.ASSIGN,
                entity_type="ASSIGNMENT",
                entity_id=str(asgn1.id),
                description=f"Demirbaş {created_devices[0].asset_tag} Ahmet Yılmaz personeline zimmetlendi.",
                ip_address="192.168.1.10"
            ),
            AuditLog(
                user_id=admin.id,
                action=AuditAction.ASSIGN,
                entity_type="ASSIGNMENT",
                entity_id=str(asgn2.id),
                description=f"Demirbaş {created_devices[1].asset_tag} Ayşe Kaya personeline zimmetlendi.",
                ip_address="192.168.1.10"
            ),
            AuditLog(
                user_id=it_spec.id,
                action=AuditAction.RETURN,
                entity_type="ASSIGNMENT",
                entity_id=str(asgn_returned.id),
                description=f"Demirbaş {created_devices[2].asset_tag} Zeynep Çelik personelinden iade alındı (Depoya eklendi).",
                ip_address="192.168.1.15"
            ),
            AuditLog(
                user_id=admin.id,
                action=AuditAction.STATUS_CHANGE,
                entity_type="DEVICE",
                entity_id=str(created_devices[9].id),
                description=f"Demirbaş {created_devices[9].asset_tag} durumu 'Arızalı' olarak güncellendi.",
                ip_address="192.168.1.10"
            )
        ]
        db.add_all(logs)
        db.commit()

        print("Örnek veriler ve QR kodlar başarıyla oluşturuldu!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
