# Rencana Peningkatan Sistem: Alur Persetujuan Bertingkat & Workspace Adaptif 12 Role

Penyempurnaan sistem ERP KontraktorPro Multi-PT & Konstruksi Terpadu dengan menerapkan alur persetujuan bertingkat (multi-tier approvals) berbasis limit nominal wewenang jabatan, serta pengalaman antarmuka adaptif otomatis yang menyesuaikan modul dan KPI dashboard secara presisi untuk setiap 12 role pengguna.

> [!IMPORTANT]
> **Keputusan Pengguna yang Telah Dikonfirmasi:**
> 1. **Prioritas Utama**: Memperketat alur persetujuan bertingkat (multi-tier verification & approval) dan penegakan batas limit nominal rupiah untuk setiap role.
> 2. **Pengalaman Antarmuka (UX)**: Menyesuaikan dashboard, KPI cards, dan navigasi modul default secara otomatis setiap kali role pengguna aktif dialihkan.

---

## 1. Ikhtisar & Nilai Manfaat

Aplikasi KontraktorPro dirancang untuk mengakomodasi tata kelola proyek konstruksi skala multi-PT dengan pembagian tugas yang jelas (segregation of duties) sesuai standar tata kelola kontraktor dan regulasi perpajakan/PUPR di Indonesia.

Penyempurnaan ini memastikan:
- **Zero Unauthorized Disbursements**: Tidak ada pencairan kas, SPB material, atau SPK upah yang melompati wewenang otorisasi struktural.
- **Role-Centric Efficiency**: Setiap role pengguna (Direktur, PM Teknik, SM, Pelaksana, Logistik, hingga Admin Keuangan) langsung disambut dengan tampilan kerja yang relevan dengan tugas hariannya tanpa terdistraksi data yang bukan kewenangannya.
- **Audit Trail & Akuntabilitas Penuh**: Setiap persetujuan, penyesuaian volume/nominal, maupun penolakan tercatat dengan timestamp, role penanggung jawab, dan catatan resmi.

---

## 2. Arsitektur Alur Persetujuan Bertingkat & Limit Nominal

### Hierarki Limit Persetujuan (Nominal Authorization Tiers)

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: DIREKSI / DIREKTUR UTAMA (Limit: s/d Rp 10.000.000.000)       │
│ • Otorisasi final RAP & revisi pagu anggaran proyek                    │
│ • Approval PO & pengeluaran di atas Rp 500.000.000                     │
│ • Addendum kontrak, deviasi margin kritis, & kebijakan holding multi-PT │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ jika > Rp 500 Jt
┌───────────────────────────────────┴────────────────────────────────────┐
│ LEVEL 3: PROJECT MANAGER (PM) TEKNIK (Limit: s/d Rp 500.000.000)       │
│ • Validasi teknis RAB & pemetaan formula AHS PUPR                      │
│ • Persetujuan SPB Material & pengadaan PO proyek                       │
│ • Persetujuan SPK Borongan & klaim upah mandor mingguan                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ jika > Rp 75 Jt / Rp 150 Jt
┌───────────────────────────────────┴────────────────────────────────────┐
│ LEVEL 2: SITE MANAGER (SM) / PM LAPANGAN (Limit: s/d Rp 75 Jt - 150 Jt)│
│ • Verifikasi fisik opname lapangan (cek mutu & volume aktual)          │
│ • Verifikasi awal SPB material lapangan                                │
│ • Review Laporan Harian Proyek (LHR) & kondisi cuaca/alat              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│ LEVEL 1: PELAKSANA / ADMIN LAPANGAN / ESTIMATOR (Limit: Rp 0 / Draft)  │
│ • Input volume harian fisik (LHR) & dokumentasi slump/pembesian        │
│ • Pengajuan SPB kebutuhan material mendesak & absensi mandays          │
│ • Tidak memiliki wewenang approval pencairan dana                      │
└────────────────────────────────────────────────────────────────────────┘
```

### Otorisasi Finansial Khusus: Admin Keuangan (Limit: s/d Rp 100.000.000)
- Menangani antrean tagihan yang sudah lolos BAST (material) atau validasi PM (upah).
- Otorisasi transfer bank langsung untuk nilai $\le$ Rp 100 Jt.
- Untuk tagihan di atas Rp 100 Jt, sistem mewajibkan verifikasi ganda (Co-approval) bersama Direktur.

---

## 3. Desain Antarmuka & Workspace Adaptif per Role

### Matriks Orientasi Default Modul & Dashboard per Role

| Role Pengguna | Modul Default Saat Switch | KPI Cards Utama yang Ditampilkan | Aksi Cepat (Quick Actions) |
| :--- | :--- | :--- | :--- |
| **Direktur** | Dashboard Eksekutif Multi-PT | Portofolio Kontrak, Margin Holding, SPI/CPI Proyek, Peringatan Kritis | Review RAP Proyek, Setujui PO Besar, Tambah PT/Proyek |
| **PM Teknik** | Dashboard / Kurva S Progres | Deviasi Jadwal (SV), Serapan RAP (AC), Antrean SPB, Klaim Upah PM | Setujui SPB, Validasi Upah, Mitigasi Jadwal Kurva S |
| **Admin Teknik** | RAB & Master AHS | Total RAB Kontrak, Item Terpetakan AHS, Item Pending Mapping | Import RAB Excel, Petakan Formula PUPR, Buat Draf RAP |
| **Estimator** | Master AHS PUPR & SNI | Total Standar AHS, Harga Bahan SHBJ Lokal, Koefisien Tenaga | Analisa Harga Satuan Baru, Update HSD Bahan & Upah |
| **Procurement** | Logistik & PO Supplier | SPB Menunggu PO, PO Berjalan Vendor, Estimasi Kedatangan Barang | Terbitkan PO Supplier, Negosiasi Harga & Pajak PPN 11% |
| **Logistik Kantor**| Logistik / Stok Kantor | Buffer Stok Pusat, Permintaan Kirim Proyek, Surat Jalan Aktif | Alokasi Stok Pusat, Terbitkan Surat Jalan Transfer |
| **PM Lapangan** | Dashboard Lapangan / Upah | Progres Fisik Site, SPB Mendesak Site, Rekap Mandor Lapangan | Approval SPB Site, Validasi Opname Mandor |
| **Site Manager** | Progres & Kurva S / Upah | Target Cor Harian, Review LHR Pelaksana, Klaim Opname Mandor | Verifikasi LHR, Verifikasi Opname Borong, Review SPB |
| **Pelaksana** | Mode Lapangan (PWA Mobile) | Progres Fisik Zona, Sisa Stok Lapangan, Cuaca & Kendala | Input LHR Harian, Ambil Foto Slump/Decking, SPB Kilat |
| **Admin Lapangan** | Upah / Absensi Tenaga Kerja | Total Mandays Pekerja, Tukang Hadir, Pengajuan Upah Harian | Input Absensi Mandays, Rekap Biaya Operasional Kas Kecil |
| **Logistik Lapangan**| Logistik / Penerimaan BAST | Stok Gudang Site, Buffer Kritis Semen/Besi, BAST Masuk | Input BAST Penerimaan Barang, Catat Pemakaian WBS |
| **Admin Keuangan** | Keuangan & Antrean Otomatis | Kas Masuk Termin, Kas Keluar Realisasi, Saldo Kas Proyek, PPh/PPN | Cairkan PO Supplier, Bayar Upah Mandor, Catat Termin |

### Mekanisme Interaktif Baru yang Dibangun:
1. **Interactive Multi-Level Approval Center**:
   - Komponen terintegrasi untuk meninjau detail item, batas limit nominal peninjau, riwayat level persetujuan, input catatan alasan, dan tombol eksekusi: *Setujui*, *Eskalasi ke Level Berikutnya*, atau *Tolak / Kembalikan ke Draf*.
   - Peringatan visual jika nominal transaksi melampaui limit wewenang role yang sedang aktif.
2. **Auto-Role Workspace Switcher**:
   - Saat role pengguna berganti via selector navbar, sistem secara mulus mengatur `activeTab` dan prioritas data yang sesuai.
   - Banner penjelas wewenang jabatan yang ringkas dan informatif.
3. **Pusat Rekonsiliasi & Dokumen Status**:
   - Status terperinci pada setiap dokumen: `DRAFT` $\rightarrow$ `DIVERIFIKASI_SM` $\rightarrow$ `DISETUJUI_PM` $\rightarrow$ `SIAP_BAYAR` $\rightarrow$ `LUNAS`.

---

## 4. Diagram Arsitektur & Alur Data

```
┌────────────────────────────────────────────────────────────────────────┐
│                           ROLE SWITCHER & CONTEXT                      │
│                (activeRole, activePTId, activeProjectId)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     ROLE-ADAPTIVE WORKSPACE   │         │    MULTI-TIER APPROVAL ENGINE │
│  • Dynamic Dashboard Cards    │         │  • Level 1: SM Check (≤ 75Jt) │
│  • Auto Tab Navigation        │         │  • Level 2: PM Approval (≤500M│
│  • Strict Menu RBAC Filtering │         │  • Level 3: Finance / Director│
│  • Quick Actions per Persona  │         │  • Limit Enforcement & Escalate│
└──────────────┬────────────────┘         └───────────────┬───────────────┘
               │                                          │
               ▼                                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SHARED DOMAIN STATE & STORAGE                     │
│  • Projects & Multi-PT Data  • RAB & AHS PUPR Engine  • RAP & Margin    │
│  • Logistic & Stock (Dual)   • Wages & PPh 21         • Financial Ledger│
│  • Daily Reports (LHR)       • Audit Trail Logs       • Risk Warnings   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Rencana Pengujian & Verifikasi

1. **Simulasi Role Lapangan (Pelaksana & Logistik Lapangan)**:
   - Mengajukan SPB dan menginput Laporan Harian (LHR) dari mode mobile/desktop. Memastikan role ini tidak dapat menyetujui transaksi sendiri.
2. **Simulasi Role Pengawas (Site Manager & PM Teknik)**:
   - Meninjau pengajuan SPB dan klaim upah mandor. Memverifikasi alur limit nominal: SM menyetujui tahap 1, dilanjutkan PM menyetujui tahap 2.
3. **Simulasi Role Finansial & Direksi (Admin Keuangan & Direktur)**:
   - Memeriksa antrean pembayaran otomatis. Memastikan tagihan $\le$ Rp 100 Jt dapat dicairkan Keuangan, dan tagihan bernilai besar $\ge$ Rp 500 Jt memerlukan otorisasi Direktur.
4. **Validasi Kompilasi & Kode**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk memastikan TypeScript clean tanpa error.
