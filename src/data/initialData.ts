import {
  PT,
  Project,
  Client,
  MasterAHS,
  RABItem,
  RAPItem,
  MaterialRequest,
  PurchaseOrder,
  StockItem,
  StockTransaction,
  WageRecord,
  DailyReport,
  FinancialEntry,
  WarningAlert,
  AuditLog,
  RoleInfo,
  UserRole,
  AppUser,
  MasterAdminSettings,
  RevenueRecognition
} from '../types';

export const INITIAL_ADMIN_SETTINGS: MasterAdminSettings = {
  ownerName: 'Ir. Hendra Gunawan (Super Administrator)',
  ownerEmail: 'modezty.jaya.abadi@gmail.com',
  isSecurityLocked: false,
  adminPin: '1234',
  systemName: 'KontraktorPro Enterprise ERP'
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    fullName: 'Ir. Hendra Gunawan, M.T.',
    email: 'modezty.jaya.abadi@gmail.com',
    phone: '0812-9988-7766',
    assignedRole: 'direktur',
    companyId: 'pt-1',
    isActive: true,
    isSuperAdmin: true,
    createdAt: '2026-01-01',
    lastLogin: '2026-10-21 22:30'
  },
  {
    id: 'usr-2',
    fullName: 'Ir. Ahmad Zarkasih, M.Sc.',
    email: 'zarkasih.pm@wkpm-konstruksi.co.id',
    phone: '0813-1122-3344',
    assignedRole: 'pm_teknik',
    companyId: 'pt-1',
    projectId: 'prj-1',
    isActive: true,
    createdAt: '2026-01-15',
    lastLogin: '2026-10-21 16:45'
  },
  {
    id: 'usr-3',
    fullName: 'Deni Kurniawan, S.T.',
    email: 'deni.sm@wkpm-konstruksi.co.id',
    phone: '0815-5566-7788',
    assignedRole: 'site_manager',
    companyId: 'pt-1',
    projectId: 'prj-1',
    isActive: true,
    createdAt: '2026-01-15',
    lastLogin: '2026-10-21 17:10'
  },
  {
    id: 'usr-4',
    fullName: 'Budi Santoso',
    email: 'budi.lapangan@wkpm-konstruksi.co.id',
    phone: '0818-4433-2211',
    assignedRole: 'pelaksana',
    companyId: 'pt-1',
    projectId: 'prj-1',
    isActive: true,
    createdAt: '2026-01-20',
    lastLogin: '2026-10-21 08:30'
  },
  {
    id: 'usr-5',
    fullName: 'Rangga Wijaya',
    email: 'procurement@wkpm-konstruksi.co.id',
    phone: '0817-7788-9900',
    assignedRole: 'procurement',
    companyId: 'pt-1',
    isActive: true,
    createdAt: '2026-01-10',
    lastLogin: '2026-10-21 11:20'
  },
  {
    id: 'usr-6',
    fullName: 'Siti Rahmawati, S.E., Ak.',
    email: 'finance@wkpm-konstruksi.co.id',
    phone: '0812-3344-5566',
    assignedRole: 'admin_keuangan',
    companyId: 'pt-1',
    isActive: true,
    createdAt: '2026-01-05',
    lastLogin: '2026-10-21 15:40'
  },
  {
    id: 'usr-7',
    fullName: 'Herman Susanto',
    email: 'gudang.site@wkpm-konstruksi.co.id',
    phone: '0819-2233-4455',
    assignedRole: 'logistik_lapangan',
    companyId: 'pt-1',
    projectId: 'prj-1',
    isActive: true,
    createdAt: '2026-01-20',
    lastLogin: '2026-10-21 14:15'
  }
];

export const INITIAL_REVENUE_RECOGNITIONS: RevenueRecognition[] = [
  {
    id: 'rev-rec-1',
    companyId: 'pt-1',
    projectId: 'prj-1',
    periodYear: 2026,
    periodMonth: 8,
    recognitionNo: 'PSAK72-202608-0001',
    contractValue: 18_500_000_000,
    progressPercent: 15.0,
    revenueToDate: 2_775_000_000,
    revenueRecognized: 0,
    revenueThisMonth: 2_775_000_000,
    journalId: 'JV-PSAK72-202608-001',
    status: 'POSTED',
    postedAt: '2026-08-31 17:00:00',
    postedById: 'usr-1',
    notes: 'Pengakuan Pendapatan PSAK 72 Periode Agustus 2026 (Progres Fisik 15.0%)',
    createdAt: '2026-08-31 17:00:00',
    updatedAt: '2026-08-31 17:00:00'
  },
  {
    id: 'rev-rec-2',
    companyId: 'pt-1',
    projectId: 'prj-1',
    periodYear: 2026,
    periodMonth: 9,
    recognitionNo: 'PSAK72-202609-0001',
    contractValue: 18_500_000_000,
    progressPercent: 28.0,
    revenueToDate: 5_180_000_000,
    revenueRecognized: 2_775_000_000,
    revenueThisMonth: 2_405_000_000,
    journalId: 'JV-PSAK72-202609-001',
    status: 'POSTED',
    postedAt: '2026-09-30 18:00:00',
    postedById: 'usr-1',
    notes: 'Pengakuan Pendapatan PSAK 72 Periode September 2026 (Progres Fisik 28.0%)',
    createdAt: '2026-09-30 18:00:00',
    updatedAt: '2026-09-30 18:00:00'
  }
];


export const ROLES: RoleInfo[] = [
  {
    id: 'direktur',
    title: 'Direktur / Direksi',
    department: 'Eksekutif Holding',
    crossPT: true,
    canApprove: true,
    approvalLimit: 10_000_000_000,
    description: 'Akses penuh lintas seluruh PT & proyek. Memantau portfolio profitabilitas, deviasi biaya/jadwal, dan menyetujui transaksi bernilai tinggi.',
    allowedTabs: ['dashboard', 'ahs', 'rab', 'rap', 'logistik', 'upah', 'progres', 'keuangan', 'laporan', 'audit'],
    defaultTab: 'dashboard',
    canView: [
      'Portofolio konsolidasi seluruh PT & Proyek',
      'Nilai kontrak, RAB, RAP, realisasi biaya, dan margin laba',
      'Kurva S kumulatif & deviasi jadwal (SPI/CPI)',
      'Radar peringatan proyek berisiko & deviasi anggaran',
      'Laporan keuangan, arus kas, dan kewajiban pajak'
    ],
    canInput: [
      'Target margin laba proyek (% dan nominal)',
      'Kebijakan anggaran dan batas pagu RAP',
      'Penetapan penanggung jawab proyek (PM/SM)',
      'Pengaturan limit wewenang approval nominal seluruh role'
    ],
    canApproveItems: [
      'Final RAP & revisi pagu anggaran proyek',
      'PO bernilai besar di atas limit PM (> Rp 500 Jt)',
      'Perubahan kontrak / Addendum pekerjaan',
      'Pencairan dana khusus / deviasi kritis'
    ],
    financialAutomation: 'Melihat ringkasan laba rugi otomatis dan menyetujui pencairan di atas wewenang operasional.',
    quickActions: [
      { label: 'Otorisasi PO Supplier (> Rp 500 Jt)', actionId: 'auth_po', targetTab: 'logistik', isUrgent: true },
      { label: 'Atur Batas Limit Nominal 12 Role', actionId: 'config_limits', targetTab: 'dashboard' },
      { label: 'Review Target Laba & Plafon RAP', actionId: 'review_rap', targetTab: 'rap' },
      { label: 'Cetak Laporan Konsolidasi BAPP', actionId: 'print_bapp', targetTab: 'laporan' }
    ]
  },
  {
    id: 'pm_teknik',
    title: 'Project Manager (PM) Teknik',
    department: 'Teknik & Operasional',
    crossPT: false,
    canApprove: true,
    approvalLimit: 500_000_000,
    description: 'Memimpin pelaksanaan proyek teknis, memvalidasi RAB/RAP, menyetujui SPB material & SPK borong, serta memitigasi deviasi.',
    allowedTabs: ['dashboard', 'ahs', 'rab', 'rap', 'logistik', 'upah', 'progres', 'laporan', 'audit'],
    defaultTab: 'progres',
    canView: [
      'RAB kontrak dan rincian AHS pekerjaan',
      'RAP internal (anggaran bahan, upah, alat, overhead)',
      'Kurva S mingguan (rencana vs fisik aktual vs serapan)',
      'Status SPB lapangan dan Purchase Order pengadaan',
      'Klaim upah mandor yang telah diperiksa SM'
    ],
    canInput: [
      'Penyesuaian metode kerja dan koefisien teknis',
      'Instruksi mitigasi keterlambatan jadwal pada LHR',
      'Catatan evaluasi mutu dan checklist pekerjaan'
    ],
    canApproveItems: [
      'RAB teknis yang disusun Admin Teknik',
      'Surat Permintaan Bahan (SPB) dari lapangan (s/d Rp 500 Jt)',
      'SPK Borongan & klaim upah mandor (s/d Rp 500 Jt)',
      'Laporan kemajuan fisik mingguan untuk BAPP'
    ],
    financialAutomation: 'Persetujuan PM atas klaim upah otomatis meneruskan data ke Bagian Keuangan dengan status "Siap Bayar".',
    quickActions: [
      { label: 'Persetujuan Final SPB Lapangan', actionId: 'approve_spb', targetTab: 'logistik', isUrgent: true },
      { label: 'Validasi Klaim Upah Mandor (Tahap 2)', actionId: 'approve_wage', targetTab: 'upah', isUrgent: true },
      { label: 'Analisis Deviasi Kurva S (SPI/CPI)', actionId: 'analyze_scurve', targetTab: 'progres' },
      { label: 'Verifikasi Pemetaan AHS PUPR', actionId: 'map_ahs', targetTab: 'rab' }
    ]
  },
  {
    id: 'admin_teknik',
    title: 'Admin Teknik',
    department: 'Engineering & Estimating',
    crossPT: false,
    canApprove: false,
    approvalLimit: 0,
    description: 'Mengunggah & validasi RAB Excel, menghubungkan AHS PUPR, menyusun draf RAP, dan mengelola dokumen teknis.',
    allowedTabs: ['dashboard', 'ahs', 'rab', 'rap', 'progres', 'laporan'],
    defaultTab: 'rab',
    canView: [
      'File RAB Excel yang diimpor dari klien/estimator',
      'Database master AHS PUPR dan SNI',
      'Draf RAP dan perbandingan volume pekerjaan',
      'Laporan progres teknis mingguan'
    ],
    canInput: [
      'Import dan upload RAB format Excel (.xlsx, .csv)',
      'Pemetaan kolom WBS, uraian, volume, satuan, harga',
      'Menghubungkan item pekerjaan ke formula AHS PUPR',
      'Input data draf rincian kebutuhan material & upah'
    ],
    canApproveItems: [
      'Tidak memiliki wewenang approval transaksi (Hanya draf teknis)'
    ],
    financialAutomation: 'Input AHS dan RAB otomatis menghasilkan kalkulasi kebutuhan belanja material & anggaran upah untuk RAP internal.',
    quickActions: [
      { label: 'Upload & Parse RAB Excel AI', actionId: 'import_rab', targetTab: 'rab', isUrgent: true },
      { label: 'Hubungkan Item ke AHS PUPR', actionId: 'map_ahs', targetTab: 'rab' },
      { label: 'Hitung Volume & Draf RAP', actionId: 'calc_rap', targetTab: 'rap' }
    ]
  },
  {
    id: 'admin_keuangan',
    title: 'Admin Keuangan & Pajak',
    department: 'Finance & Accounting',
    crossPT: false,
    canApprove: true,
    approvalLimit: 100_000_000,
    description: 'Mencatat penerimaan termin klien, memverifikasi tagihan PO & upah, mencairkan pembayaran, serta membukukan PPN & PPh Final.',
    allowedTabs: ['dashboard', 'keuangan', 'upah', 'logistik', 'laporan', 'audit'],
    defaultTab: 'keuangan',
    canView: [
      'Antrean tagihan otomatis dari PO supplier yang barangnya sudah diterima (BAST)',
      'Klaim upah mandor yang disetujui PM (lengkap dengan PPh 21)',
      'Jurnal buku besar, arus kas proyek, dan serapan anggaran vs RAP',
      'Status penagihan termin klien, retensi 5%, dan PPN 11%',
      'Laporan perpajakan kontraktor (PPh Final PP 9/2022)'
    ],
    canInput: [
      'Pencatatan Penerimaan Termin Klien (DP, Termin 1, Termin 2, Retensi)',
      'Nomor Faktur Pajak PPN 11% & Bukti Potong PPh Final Konstruksi',
      'Biaya overhead lapangan & kas kecil (petty cash)',
      'Bukti transfer bank dan tanggal pencairan dana'
    ],
    canApproveItems: [
      'Pencairan dana pembayaran PO dan Upah (s/d Rp 100 Jt)',
      'Verifikasi kelengkapan dokumen penagihan'
    ],
    financialAutomation: 'OTOMATIS menerima antrean tagihan dari PO disetujui dan SPK upah tervalidasi. Bagian Keuangan hanya perlu memeriksa rekening & memposting pencairan.',
    quickActions: [
      { label: 'Cairkan Antrean Tagihan PO Supplier', actionId: 'disburse_po', targetTab: 'keuangan', isUrgent: true },
      { label: 'Bayar Upah Mandor (Net PPh 21)', actionId: 'disburse_wage', targetTab: 'keuangan', isUrgent: true },
      { label: 'Input Penerimaan Termin Klien', actionId: 'record_term', targetTab: 'keuangan' },
      { label: 'Rekapitulasi Pajak PPN & PPh Final', actionId: 'tax_recap', targetTab: 'keuangan' }
    ]
  },
  {
    id: 'estimator',
    title: 'Estimator (QS)',
    department: 'Tender & Estimating',
    crossPT: true,
    canApprove: false,
    approvalLimit: 0,
    description: 'Menghitung take-off volume, simulasi harga tender, analisa AHS PUPR, dan pembaruan database harga dasar.',
    allowedTabs: ['dashboard', 'ahs', 'rab', 'rap', 'laporan'],
    defaultTab: 'ahs',
    canView: [
      'Seluruh master AHS PUPR & SNI beserta koefisien',
      'Riwayat harga beli material dari PO terdahulu',
      'Daftar RAB tender dan simulasi margin tender'
    ],
    canInput: [
      'Item pekerjaan baru dan take-off volume tender',
      'Pembaruan harga dasar satuan material & upah lokal',
      'Formula AHS khusus proyek bila ada spesifikasi khusus'
    ],
    canApproveItems: [
      'Tidak memiliki wewenang approval transaksi'
    ],
    financialAutomation: 'Perhitungan estimasi otomatis menjadi dasar penawaran RAB ke klien dan pembentukan RAP internal.',
    quickActions: [
      { label: 'Eksplorasi Koefisien AHS PUPR', actionId: 'inspect_ahs', targetTab: 'ahs' },
      { label: 'Simulasi Margin Laba Tender', actionId: 'sim_margin', targetTab: 'rap' },
      { label: 'Download Database AHS ke Excel', actionId: 'export_ahs', targetTab: 'ahs' }
    ]
  },
  {
    id: 'procurement',
    title: 'Procurement / Pengadaan',
    department: 'Logistik & Purchasing',
    crossPT: true,
    canApprove: false,
    approvalLimit: 250_000_000,
    description: 'Memproses SPB dari lapangan yang stoknya kurang, membandingkan penawaran vendor, menerbitkan PO, dan mengontrol jadwal pengiriman.',
    allowedTabs: ['dashboard', 'logistik', 'ahs', 'laporan'],
    defaultTab: 'logistik',
    canView: [
      'Daftar SPB lapangan yang berstatus "Diteruskan ke PO"',
      'Data stok buffer kantor dan stok lapangan',
      'Riwayat harga beli supplier dan terms pembayaran',
      'Status PO berjalan dan estimasi kedatangan barang'
    ],
    canInput: [
      'Penerbitan formulir Purchase Order (PO) ke supplier',
      'Negosiasi harga satuan, diskon, dan PPN 11%',
      'Penetapan tujuan kirim (Gudang Kantor vs Langsung Lapangan)',
      'Update jadwal kedatangan pengiriman armada vendor'
    ],
    canApproveItems: [
      'Rekomendasi pemilihan supplier (PO di-approve oleh PM/Direktur)'
    ],
    financialAutomation: 'PO yang diterbitkan otomatis mengikat komitmen anggaran biaya material proyek dan diteruskan ke bagian keuangan setelah BAST penerimaan terbit.',
    quickActions: [
      { label: 'Terbitkan PO Supplier Baru', actionId: 'create_po', targetTab: 'logistik', isUrgent: true },
      { label: 'Proses SPB Kebutuhan Material', actionId: 'process_spb', targetTab: 'logistik' },
      { label: 'Monitor Jadwal Pengiriman Vendor', actionId: 'vendor_delivery', targetTab: 'logistik' }
    ]
  },
  {
    id: 'logistik_kantor',
    title: 'Logistik Gudang Kantor',
    department: 'Logistik Pusat',
    crossPT: true,
    canApprove: false,
    approvalLimit: 50_000_000,
    description: 'Mengelola buffer stok gudang pusat kantor, memproses pemenuhan SPB proyek via Surat Jalan transfer, dan penerimaan retur.',
    allowedTabs: ['dashboard', 'logistik', 'laporan'],
    defaultTab: 'logistik',
    canView: [
      'Stok fisik gudang kantor pusat dan ambang batas minimum',
      'Permintaan material dari berbagai proyek aktif',
      'Riwayat mutasi transfer gudang kantor ke proyek'
    ],
    canInput: [
      'Alokasi stok kantor untuk pemenuhan SPB',
      'Penerbitan Surat Jalan (SJ) pengiriman material ke proyek',
      'Pencatatan penerimaan stok masuk dari PO supplier di kantor',
      'Penyesuaian stok kantor / stok opname bulanan'
    ],
    canApproveItems: [
      'Disposisi pengeluaran stok kantor untuk dikirim ke lapangan'
    ],
    financialAutomation: 'Transfer material dari kantor ke lapangan tidak langsung menjadi beban realisasi pekerjaan sampai material tersebut dicatat pemakaiannya per item WBS oleh tim lapangan.',
    quickActions: [
      { label: 'Kirim Stok Kantor via Surat Jalan', actionId: 'transfer_stock', targetTab: 'logistik' },
      { label: 'Cek Ambang Minimum Buffer Kantor', actionId: 'check_office_stock', targetTab: 'logistik' },
      { label: 'Laporan Mutasi Barang Pusat', actionId: 'stock_mutation', targetTab: 'logistik' }
    ]
  },
  {
    id: 'pm_lapangan',
    title: 'PM Lapangan',
    department: 'Site Management',
    crossPT: false,
    canApprove: true,
    approvalLimit: 150_000_000,
    description: 'Memimpin koordinasi operasional site, memvalidasi klaim progres mingguan mandor, dan menyetujui pengajuan mendesak di lapangan.',
    allowedTabs: ['dashboard', 'progres', 'logistik', 'upah', 'laporan'],
    defaultTab: 'progres',
    canView: [
      'Kondisi lapangan, cuaca, absensi tenaga kerja',
      'S-Curve proyek dan deviasi progres mingguan',
      'Stok material gudang lapangan & daftar SPB mendesak',
      'Rekapitulasi klaim upah borong & harian'
    ],
    canInput: [
      'Instruksi percepatan dan koordinasi dengan konsultan MK',
      'Verifikasi opname fisik bersama pengawas klien'
    ],
    canApproveItems: [
      'SPB mendesak lapangan (s/d Rp 150 Jt)',
      'Klaim upah mandor mingguan (s/d Rp 150 Jt)',
      'Laporan Harian Proyek (LHR)'
    ],
    financialAutomation: 'Persetujuan PM Lapangan mengesahkan volume opname yang menjadi acuan resmi pencairan upah mandor.',
    quickActions: [
      { label: 'Approval SPB Mendesak Site', actionId: 'approve_spb_site', targetTab: 'logistik', isUrgent: true },
      { label: 'Sahkan Opname Fisik Bersama Klien', actionId: 'opname_approval', targetTab: 'upah' },
      { label: 'Instruksi Percepatan Schedule', actionId: 'schedule_mitigation', targetTab: 'progres' }
    ]
  },
  {
    id: 'site_manager',
    title: 'Site Manager (SM)',
    department: 'Site Execution',
    crossPT: false,
    canApprove: true,
    approvalLimit: 75_000_000,
    description: 'Mengatur schedule harian, mengawasi mutu beton/pembesian, memeriksa laporan harian, dan memverifikasi klaim upah awal.',
    allowedTabs: ['dashboard', 'progres', 'logistik', 'upah', 'ahs'],
    defaultTab: 'upah',
    canView: [
      'Schedule pelaksanaan harian dan target volume',
      'Laporan harian yang dikirim pelaksana lapangan',
      'Stok material di lokasi proyek (gudang lapangan)',
      'Pengajuan upah mandor borongan/harian'
    ],
    canInput: [
      'Verifikasi volume opname fisik mandor',
      'Instruksi teknis dan penanganan kendala pada LHR',
      'Checklist mutu pengecoran / pembesian'
    ],
    canApproveItems: [
      'Verifikasi awal SPB material lapangan (s/d Rp 75 Jt)',
      'Verifikasi awal klaim upah mandor sebelum diajukan ke PM',
      'Review Laporan Harian (LHR)'
    ],
    financialAutomation: 'Hasil opname yang diverifikasi SM menjadi dasar perhitungan tagihan upah borongan.',
    quickActions: [
      { label: 'Verifikasi Awal Opname Mandor', actionId: 'verify_wage_sm', targetTab: 'upah', isUrgent: true },
      { label: 'Verifikasi Kebutuhan SPB Semen/Besi', actionId: 'verify_spb_sm', targetTab: 'logistik', isUrgent: true },
      { label: 'Review & Checklist Mutu LHR', actionId: 'review_lhr', targetTab: 'progres' }
    ]
  },
  {
    id: 'pelaksana',
    title: 'Pelaksana Lapangan',
    department: 'Site Execution',
    crossPT: false,
    canApprove: false,
    approvalLimit: 0,
    description: 'Input progres fisik harian via mobile/desktop, mengajukan kebutuhan material (SPB), dan mencatat pemakaian material.',
    allowedTabs: ['dashboard', 'progres', 'logistik', 'upah'],
    defaultTab: 'progres',
    canView: [
      'Daftar item pekerjaan WBS di zona penugasannya',
      'Sisa stok material di gudang lapangan',
      'Status SPB yang pernah diajukan'
    ],
    canInput: [
      'Input volume capaian pekerjaan harian (LHR)',
      'Input kondisi cuaca (pagi/siang/sore) & jumlah tenaga kerja',
      'Pengajuan Surat Permintaan Bahan (SPB) kilat',
      'Unggah foto dokumentasi slump test, perakitan besi, cor',
      'Catatan pemakaian material per item pekerjaan'
    ],
    canApproveItems: [
      'Tidak memiliki wewenang approval (Hanya input & pengajuan lapangan)'
    ],
    financialAutomation: 'Input pemakaian material oleh pelaksana otomatis menambah realisasi biaya material pada RAP item pekerjaan terkait.',
    quickActions: [
      { label: 'Buka Mode Pendamping Lapangan (Mobile)', actionId: 'open_mobile', targetTab: 'progres', isUrgent: true },
      { label: 'Input Capaian Cor Hari Ini (LHR)', actionId: 'input_lhr', targetTab: 'progres' },
      { label: 'Kirim SPB Bahan Mendesak', actionId: 'create_spb', targetTab: 'logistik' }
    ]
  },
  {
    id: 'admin_lapangan',
    title: 'Admin Lapangan',
    department: 'Site Administration',
    crossPT: false,
    canApprove: false,
    approvalLimit: 0,
    description: 'Mencatat absensi mandor/tukang harian (mandays), input rekap administrasi lapangan, dan pengarsipan bukti fisik.',
    allowedTabs: ['dashboard', 'progres', 'upah', 'logistik'],
    defaultTab: 'upah',
    canView: [
      'Data absensi pekerja dan mandor',
      'Daftar surat jalan penerimaan barang di site',
      'Dokumen administrasi lapangan'
    ],
    canInput: [
      'Absensi tenaga kerja harian (jumlah mandays tukang & pekerja)',
      'Draf pengajuan upah harian mandays',
      'Penginputan data cuaca dan peralatan kerja di site'
    ],
    canApproveItems: [
      'Tidak memiliki wewenang approval'
    ],
    financialAutomation: 'Absensi mandays yang diinput otomatis menghitung nilai upah kotor (mandays x tarif) dan potongan PPh 21 (2%).',
    quickActions: [
      { label: 'Input Absensi Mandays Harian', actionId: 'input_mandays', targetTab: 'upah', isUrgent: true },
      { label: 'Rekap Kas Kecil Operasional Site', actionId: 'petty_cash_site', targetTab: 'upah' }
    ]
  },
  {
    id: 'logistik_lapangan',
    title: 'Logistik Lapangan',
    department: 'Site Logistics',
    crossPT: false,
    canApprove: false,
    approvalLimit: 0,
    description: 'Menerima dan memeriksa material masuk di lokasi proyek (BAST), mencatat pemakaian per item WBS, dan melaporkan stok menipis.',
    allowedTabs: ['dashboard', 'logistik'],
    defaultTab: 'logistik',
    canView: [
      'Stok real-time gudang lapangan proyek',
      'Daftar PO yang ditujukan langsung ke lokasi proyek',
      'Surat Jalan kiriman dari gudang kantor pusat'
    ],
    canInput: [
      'Penerimaan fisik barang (BAST Penerimaan Barang)',
      'Catatan selisih barang (rusak/kurang vs surat jalan)',
      'Pencatatan pemakaian material fisik yang keluar gudang site',
      'Laporan stok menipis / buffer habis'
    ],
    canApproveItems: [
      'Tanda terima barang (BAST Lapangan)'
    ],
    financialAutomation: 'Penerimaan BAST oleh logistik lapangan memicu status PO menjadi "Diterima Lengkap" sehingga siap ditagihkan/dibayarkan oleh Keuangan.',
    quickActions: [
      { label: 'Input BAST Penerimaan Barang Fisik', actionId: 'receive_goods', targetTab: 'logistik', isUrgent: true },
      { label: 'Catat Pengeluaran Material ke WBS', actionId: 'record_usage', targetTab: 'logistik' },
      { label: 'Peringatan Buffer Semen Menipis', actionId: 'warn_buffer', targetTab: 'logistik' }
    ]
  },
  {
    id: 'k3_lapangan',
    title: 'Petugas K3 & Safety',
    department: 'HSE (K3L)',
    crossPT: false,
    canApprove: false,
    approvalLimit: 0,
    description: 'Inspeksi keselamatan kerja, patroli APD, tool box meeting, identifikasi bahaya, dan investigasi insiden kerja.',
    allowedTabs: ['dashboard', 'progres', 'laporan'],
    defaultTab: 'progres',
    canView: [
      'Data keselamatan kerja dan checklist K3',
      'Jumlah pekerja aktif di lapangan per hari',
      'Laporan insiden atau near-miss'
    ],
    canInput: [
      'Checklist inspeksi harian K3 & kepatuhan APD',
      'Catatan tool box meeting pagi hari',
      'Laporan temuan kondisi tidak aman / unsafe acts'
    ],
    canApproveItems: [
      'Izin kerja risiko tinggi (Work Permit pengecoran/ketinggian)'
    ],
    financialAutomation: 'Kebutuhan APD dan safety sign diajukan melalui SPB ke logistik.',
    quickActions: [
      { label: 'Checklist K3 & Patroli APD Pagi', actionId: 'k3_inspection', targetTab: 'progres' },
      { label: 'Pengajuan Tambahan APD & Rambu', actionId: 'request_safety', targetTab: 'logistik' }
    ]
  }
];

export const INITIAL_PTS: PT[] = [
  {
    id: 'pt-1',
    code: 'WKPM',
    name: 'PT Wijaya Karya Prima Mandiri',
    legalName: 'PT Wijaya Karya Prima Mandiri Kontraktor Tbk',
    npwp: '01.345.678.9-012.000',
    address: 'Jl. TB Simatupang No. 88, Cilandak, Jakarta Selatan',
    phone: '(021) 789-5432',
    email: 'corporate@wkpm-konstruksi.co.id',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%230f172a"/><path d="M22 68L38 32L52 68L66 32L80 68" stroke="%23f59e0b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="51" cy="22" r="5" fill="%2338bdf8"/><text x="50" y="90" fill="%23cbd5e1" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">WKPM</text></svg>',
    directorName: 'Ir. Hendra Gunawan, M.T.',
    activeProjectsCount: 2,
    isMain: true
  },
  {
    id: 'pt-2',
    code: 'CGP',
    name: 'PT Cipta Graha Perkasa',
    legalName: 'PT Cipta Graha Perkasa Konstruksi',
    npwp: '02.987.654.3-015.000',
    address: 'Kawasan Niaga Boulevard Blok C-12, Gading Serpong, Tangerang',
    phone: '(021) 542-1100',
    email: 'info@ciptagraha.co.id',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="%23064e3b"/><path d="M50 20L78 38V72L50 85L22 72V38L50 20Z" stroke="%2334d399" stroke-width="6" stroke-linejoin="round"/><path d="M50 20V85" stroke="%2334d399" stroke-width="4"/><circle cx="50" cy="48" r="9" fill="%23f59e0b"/><text x="50" y="94" fill="%23a7f3d0" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">CGP</text></svg>',
    directorName: 'Bambang Sudiro, S.T.',
    activeProjectsCount: 1,
    isMain: false
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl-1',
    companyId: 'pt-1',
    code: 'CLI-SGI',
    name: 'PT Sudirman Graha Investama',
    type: 'SWASTA',
    taxId: '01.222.333.4-011.000',
    address: 'Menara Sudirman Lt. 28, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan',
    phone: '(021) 522-9090',
    email: 'procurement@sudirmangraha.com',
    contactPerson: 'Hendro Wijaya (Project Director)',
    notes: 'Klien properti komersial premium kelas A. Pembayaran termin lancar (Net 30).',
    isActive: true
  },
  {
    id: 'cl-2',
    companyId: 'pt-1',
    code: 'CLI-CLM',
    name: 'PT Cikarang Logistik Megah',
    type: 'SWASTA',
    taxId: '02.444.555.6-022.000',
    address: 'Delta Silicon Industrial Park 5, Cikarang Pusat, Kab. Bekasi',
    phone: '(021) 899-7711',
    email: 'finance@cikaranglogistik.co.id',
    contactPerson: 'Ir. Suryanto (VP Operations)',
    notes: 'Klien pergudangan logistik & cold storage multinasional.',
    isActive: true
  },
  {
    id: 'cl-3',
    companyId: 'pt-1',
    code: 'CLI-PUPR-JBR',
    name: 'Dinas Bina Marga & Penataan Ruang Provinsi Jawa Barat',
    type: 'PEMERINTAH',
    taxId: '00.123.456.7-401.000',
    address: 'Jl. Asia Afrika No. 79, Kota Bandung, Jawa Barat',
    phone: '(022) 420-1122',
    email: 'ppk.infrastruktur@jabarprov.go.id',
    contactPerson: 'Dr. Ir. Kosasih, M.T. (PPK Infrastruktur)',
    notes: 'Proyek APBD Jawa Barat. Syarat BAPP bertingkat & verifikasi konsultan pengawas.',
    isActive: true
  },
  {
    id: 'cl-4',
    companyId: 'pt-1',
    code: 'CLI-KIEC',
    name: 'PT Krakatau Industrial Estate Cilegon',
    type: 'BUMN',
    taxId: '01.789.012.3-055.000',
    address: 'Gedung Wisma Krakatau Lt. 3, Jl. KH Yasin Beji No. 6, Cilegon',
    phone: '(0254) 391-234',
    email: 'tender@kiec.co.id',
    contactPerson: 'Raden Santoso (Kepala Divisi Proyek)',
    notes: 'BUMN Kluster Industri Baja. Memerlukan audit BPKP dan jaminan pelaksanaan bank garansi.',
    isActive: true
  },
  {
    id: 'cl-5',
    companyId: 'pt-2',
    code: 'CLI-SMLD',
    name: 'Sentul Mountain Land Development',
    type: 'SWASTA',
    taxId: '03.999.888.7-033.000',
    address: 'Sentul Highlands Boulevard Kav. 1, Babakan Madang, Bogor',
    phone: '(021) 879-5000',
    email: 'contracts@sentulland.com',
    contactPerson: 'Amanda Clarissa, B.Arch. (Owner Representative)',
    notes: 'Developer perumahan elit & villa terpadu.',
    isActive: true
  },
  {
    id: 'cl-6',
    companyId: 'pt-2',
    code: 'CLI-PDAM-BOGOR',
    name: 'Perumda Air Minum Tirta Kahuripan Kab. Bogor',
    type: 'BUMN',
    taxId: '01.555.666.7-412.000',
    address: 'Jl. Tegar Beriman No. 1, Cibinong, Bogor',
    phone: '(021) 875-2233',
    email: 'pengadaan@tirtakahuripan.co.id',
    contactPerson: 'Bpk. Teguh Widodo (Manajer Teknik)',
    notes: 'BUMD penyedia utilitas perpipaan dan IPA.',
    isActive: true
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-1',
    ptId: 'pt-1',
    clientId: 'cl-1',
    code: 'PRJ-2026-001',
    shortCode: 'GSD-5L',
    name: 'Pembangunan Gedung Kantor 5 Lantai Grand Sudirman',
    description: 'Proyek gedung perkantoran 5 lantai dengan struktur beton bertulang, basement parkir, dan facade kaca curtain wall.',
    clientName: 'PT Sudirman Graha Investama',
    location: 'Kav. 45 Jl. Jend. Sudirman, Jakarta Pusat',
    contractValue: 18_500_000_000,
    currency: 'IDR',
    defaultTargetProfitPercent: 25.0,
    targetProfitPercent: 18.0,
    targetProfitNominal: 3_330_000_000,
    startDate: '2026-01-15',
    endDate: '2026-11-30',
    status: 'berjalan',
    pmName: 'Ir. Ahmad Zarkasih, M.Sc.',
    siteManagerName: 'Deni Kurniawan, S.T.',
    plannedProgressPercent: 44.5,
    actualProgressPercent: 41.2, // Minor delay
    totalRapBudget: 15_170_000_000,
    totalCostRealized: 6_450_000_000,
    totalPaidOut: 5_920_000_000,
    unpaidCommitments: 1_280_000_000,
    isTaxable: true,
    ppnEnabled: true,
    ppnPercent: 11,
    pphFinalEnabled: true,
    pphFinalPercent: 2.65,
    taxNotes: 'PPh Final Jasa Pelaksanaan Konstruksi Berkualifikasi Menengah (PP 9/2022)'
  },
  {
    id: 'prj-2',
    ptId: 'pt-1',
    clientId: 'cl-2',
    code: 'PRJ-2026-002',
    shortCode: 'CKR-WRH',
    name: 'Pembangunan Kompleks Pergudangan & Workshop Cikarang',
    description: 'Konstruksi gudang bentang lebar struktur baja WF, lantai heavy duty floor hardener, dan area loading dock container.',
    clientName: 'PT Cikarang Logistik Megah',
    location: 'Kawasan Industri GIIC Blok AD, Cikarang Pusat, Bekasi',
    contractValue: 24_200_000_000,
    currency: 'IDR',
    defaultTargetProfitPercent: 25.0,
    targetProfitPercent: 16.5,
    targetProfitNominal: 3_993_000_000,
    startDate: '2026-02-01',
    endDate: '2026-12-20',
    status: 'berjalan',
    pmName: 'Wahyudi Pratama, S.T.',
    siteManagerName: 'Eko Prasetyo, S.T.',
    plannedProgressPercent: 28.0,
    actualProgressPercent: 29.5, // Ahead
    totalRapBudget: 20_207_000_000,
    totalCostRealized: 5_810_000_000,
    totalPaidOut: 5_200_000_000,
    unpaidCommitments: 1_950_000_000,
    isTaxable: true,
    ppnEnabled: true,
    ppnPercent: 11,
    pphFinalEnabled: true,
    pphFinalPercent: 2.65,
    taxNotes: 'PPh Final Pelaksanaan Konstruksi PP 9/2022'
  },
  {
    id: 'prj-3',
    ptId: 'pt-2',
    clientId: 'cl-5',
    code: 'PRJ-2026-003',
    shortCode: 'PNH-SNT',
    name: 'Cluster Residensial Pine Hills Sentul (32 Unit)',
    description: 'Pembangunan 32 unit rumah tinggal 2 lantai tipe 120/150, jalan paving block lingkungan, dan saluran drainase tertutup.',
    clientName: 'Sentul Mountain Land Development',
    location: 'Sentul City Hills Sector 7, Bogor',
    contractValue: 9_200_000_000,
    currency: 'IDR',
    defaultTargetProfitPercent: 25.0,
    targetProfitPercent: 21.0,
    targetProfitNominal: 1_932_000_000,
    startDate: '2026-03-01',
    endDate: '2026-10-15',
    status: 'berjalan',
    pmName: 'Farhan Maulana, S.T.',
    siteManagerName: 'Rian Hidayat, A.Md.',
    plannedProgressPercent: 15.0,
    actualProgressPercent: 14.2,
    totalRapBudget: 7_268_000_000,
    totalCostRealized: 1_120_000_000,
    totalPaidOut: 980_000_000,
    unpaidCommitments: 450_000_000,
    isTaxable: true,
    ppnEnabled: true,
    ppnPercent: 11,
    pphFinalEnabled: true,
    pphFinalPercent: 2.65,
    taxNotes: 'PPh Final Usaha Konstruksi Berijin (PP 9/2022)'
  }
];

export const INITIAL_AHS_LIST: MasterAHS[] = [
  {
    id: 'ahs-1',
    code: 'A.4.1.1.25',
    name: '1 m3 Membuat Beton Mutu f\'c = 19.3 MPa (K-250) Slump (12±2) cm',
    category: 'Struktur Beton',
    unit: 'm3',
    version: 'Permen PUPR No. 1/2022 Standar SNI 7394:2008',
    effectiveDate: '2026-01-01',
    isActive: true,
    overheadPercent: 10,
    sourcePrice: 'SHBJ DKI Jakarta & Jabodetabek 2026 Q1',
    materials: [
      { materialId: 'mat-1', materialName: 'Semen Portland (PC) Type I (40kg)', unit: 'kg', coefficient: 384, unitPrice: 1750, subtotal: 672000 },
      { materialId: 'mat-2', materialName: 'Pasir Beton / Cor Bersih', unit: 'kg', coefficient: 692, unitPrice: 280, subtotal: 193760 },
      { materialId: 'mat-3', materialName: 'Kerikil / Split Cor 2/3 cm', unit: 'kg', coefficient: 1039, unitPrice: 320, subtotal: 332480 },
      { materialId: 'mat-4', materialName: 'Air Bersih Proyek', unit: 'liter', coefficient: 215, unitPrice: 75, subtotal: 16125 }
    ],
    labors: [
      { laborType: 'Pekerja', coefficient: 1.65, unitPrice: 145000, subtotal: 239250 },
      { laborType: 'Tukang', coefficient: 0.275, unitPrice: 175000, subtotal: 48125 },
      { laborType: 'Kepala Tukang', coefficient: 0.028, unitPrice: 195000, subtotal: 5460 },
      { laborType: 'Mandor', coefficient: 0.083, unitPrice: 210000, subtotal: 17430 }
    ],
    equipments: [
      { equipmentName: 'Concrete Vibrator', unit: 'sewa/jam', coefficient: 0.25, unitPrice: 65000, subtotal: 16250 }
    ],
    materialTotal: 1214365,
    laborTotal: 310265,
    equipmentTotal: 16250,
    overheadAmount: 154088,
    totalUnitPrice: 1694968
  },
  {
    id: 'ahs-2',
    code: 'A.4.1.1.17',
    name: '10 kg Pembesian dengan Besi Tulangan Ulir (BJTD-40)',
    category: 'Struktur Beton',
    unit: '10kg',
    version: 'Permen PUPR No. 1/2022',
    effectiveDate: '2026-01-01',
    isActive: true,
    overheadPercent: 10,
    sourcePrice: 'Pabrik Krakatau Steel (KS) Distributor 2026',
    materials: [
      { materialId: 'mat-5', materialName: 'Besi Beton Ulir SNI BJTD-40', unit: 'kg', coefficient: 10.5, unitPrice: 14500, subtotal: 152250 },
      { materialId: 'mat-6', materialName: 'Kawat Beton (Bendrat)', unit: 'kg', coefficient: 0.15, unitPrice: 25000, subtotal: 3750 }
    ],
    labors: [
      { laborType: 'Pekerja', coefficient: 0.07, unitPrice: 145000, subtotal: 10150 },
      { laborType: 'Tukang', coefficient: 0.07, unitPrice: 175000, subtotal: 12250 },
      { laborType: 'Kepala Tukang', coefficient: 0.007, unitPrice: 195000, subtotal: 1365 },
      { laborType: 'Mandor', coefficient: 0.004, unitPrice: 210000, subtotal: 840 }
    ],
    equipments: [
      { equipmentName: 'Bar Cutter & Bar Bender Listrik', unit: 'jam', coefficient: 0.05, unitPrice: 45000, subtotal: 2250 }
    ],
    materialTotal: 156000,
    laborTotal: 24605,
    equipmentTotal: 2250,
    overheadAmount: 18286,
    totalUnitPrice: 201141
  },
  {
    id: 'ahs-3',
    code: 'A.4.1.1.21',
    name: '1 m2 Pasang Bekisting untuk Balok & Kolom Beton',
    category: 'Struktur Beton',
    unit: 'm2',
    version: 'Permen PUPR No. 1/2022',
    effectiveDate: '2026-01-01',
    isActive: true,
    overheadPercent: 10,
    sourcePrice: 'Supplier Kayu & Triplek Meranti 2026',
    materials: [
      { materialId: 'mat-7', materialName: 'Kayu Kelas III (Balok 5/7)', unit: 'm3', coefficient: 0.04, unitPrice: 2800000, subtotal: 112000 },
      { materialId: 'mat-8', materialName: 'Multiplek Film Face 12 mm', unit: 'lembar', coefficient: 0.35, unitPrice: 185000, subtotal: 64750 },
      { materialId: 'mat-9', materialName: 'Paku 5 - 10 cm', unit: 'kg', coefficient: 0.40, unitPrice: 22000, subtotal: 8800 },
      { materialId: 'mat-10', materialName: 'Minyak Bekisting (Form Oil)', unit: 'liter', coefficient: 0.20, unitPrice: 32000, subtotal: 6400 }
    ],
    labors: [
      { laborType: 'Pekerja', coefficient: 0.32, unitPrice: 145000, subtotal: 46400 },
      { laborType: 'Tukang', coefficient: 0.33, unitPrice: 175000, subtotal: 57750 },
      { laborType: 'Kepala Tukang', coefficient: 0.033, unitPrice: 195000, subtotal: 6435 },
      { laborType: 'Mandor', coefficient: 0.016, unitPrice: 210000, subtotal: 3360 }
    ],
    equipments: [],
    materialTotal: 191950,
    laborTotal: 113945,
    equipmentTotal: 0,
    overheadAmount: 30589,
    totalUnitPrice: 336484
  },
  {
    id: 'ahs-4',
    code: 'A.4.4.1.9',
    name: '1 m2 Pasangan Dinding Bata Ringan (AAC / Hebel) Tebal 10 cm Mortar Instan',
    category: 'Dinding & Plesteran',
    unit: 'm2',
    version: 'Permen PUPR 2022 Modern Wall',
    effectiveDate: '2026-01-01',
    isActive: true,
    overheadPercent: 10,
    sourcePrice: 'Supplier Bata Ringan Grand Elephant / Blesscon 2026',
    materials: [
      { materialId: 'mat-11', materialName: 'Bata Ringan Hebel (60x20x10 cm)', unit: 'm3', coefficient: 0.105, unitPrice: 650000, subtotal: 68250 },
      { materialId: 'mat-12', materialName: 'Semen Mortar Perekat Hebel (Thinbed 40kg)', unit: 'kg', coefficient: 4.2, unitPrice: 2400, subtotal: 10080 }
    ],
    labors: [
      { laborType: 'Pekerja', coefficient: 0.15, unitPrice: 145000, subtotal: 21750 },
      { laborType: 'Tukang', coefficient: 0.10, unitPrice: 175000, subtotal: 17500 },
      { laborType: 'Kepala Tukang', coefficient: 0.01, unitPrice: 195000, subtotal: 1950 },
      { laborType: 'Mandor', coefficient: 0.008, unitPrice: 210000, subtotal: 1680 }
    ],
    equipments: [],
    materialTotal: 78330,
    laborTotal: 42880,
    equipmentTotal: 0,
    overheadAmount: 12121,
    totalUnitPrice: 133331
  },
  {
    id: 'ahs-5',
    code: 'A.4.4.2.4',
    name: '1 m2 Plesteran Dinding Mortar Instan Tebal 10 mm + Acian',
    category: 'Dinding & Plesteran',
    unit: 'm2',
    version: 'Permen PUPR 2022 / SNI',
    effectiveDate: '2026-01-01',
    isActive: true,
    overheadPercent: 10,
    sourcePrice: 'Distributor Mortar Utama (MU) 2026',
    materials: [
      { materialId: 'mat-13', materialName: 'Semen Mortar Plesteran & Acian Instan (MU-301/MU-200)', unit: 'kg', coefficient: 18.0, unitPrice: 2100, subtotal: 37800 }
    ],
    labors: [
      { laborType: 'Pekerja', coefficient: 0.20, unitPrice: 145000, subtotal: 29000 },
      { laborType: 'Tukang', coefficient: 0.15, unitPrice: 175000, subtotal: 26250 },
      { laborType: 'Kepala Tukang', coefficient: 0.015, unitPrice: 195000, subtotal: 2925 },
      { laborType: 'Mandor', coefficient: 0.01, unitPrice: 210000, subtotal: 2100 }
    ],
    equipments: [],
    materialTotal: 37800,
    laborTotal: 60275,
    equipmentTotal: 0,
    overheadAmount: 9808,
    totalUnitPrice: 107883
  },
  {
    id: 'ahs-6',
    code: 'A.4.7.1.10',
    name: '1 m2 Pengecatan Tembok Interior 1 Lapis Plamir, 1 Lapis Cat Dasar, 2 Lapis Cat Penutup',
    category: 'Finishing & Cat',
    unit: 'm2',
    version: 'Permen PUPR SNI 2022',
    effectiveDate: '2026-01-01',
    isActive: true,
    overheadPercent: 10,
    sourcePrice: 'Dulux / Mowilex Proffesional Series 2026',
    materials: [
      { materialId: 'mat-14', materialName: 'Plamir Tembok Acrylic', unit: 'kg', coefficient: 0.10, unitPrice: 28000, subtotal: 2800 },
      { materialId: 'mat-15', materialName: 'Cat Dasar Alkali Sealer', unit: 'kg', coefficient: 0.11, unitPrice: 38000, subtotal: 4180 },
      { materialId: 'mat-16', materialName: 'Cat Tembok Interior Acrylic Emulsion', unit: 'kg', coefficient: 0.26, unitPrice: 52000, subtotal: 13520 }
    ],
    labors: [
      { laborType: 'Pekerja', coefficient: 0.04, unitPrice: 145000, subtotal: 5800 },
      { laborType: 'Tukang', coefficient: 0.06, unitPrice: 175000, subtotal: 10500 },
      { laborType: 'Kepala Tukang', coefficient: 0.006, unitPrice: 195000, subtotal: 1170 },
      { laborType: 'Mandor', coefficient: 0.003, unitPrice: 210000, subtotal: 630 }
    ],
    equipments: [],
    materialTotal: 20500,
    laborTotal: 18100,
    equipmentTotal: 0,
    overheadAmount: 3860,
    totalUnitPrice: 42460
  }
];

export const INITIAL_RAB_ITEMS: RABItem[] = [
  {
    id: 'rab-1',
    projectId: 'prj-1',
    wbsCode: 'I.1',
    section: 'I. PEKERJAAN STRUKTUR BAWAH (SUBSTRUCTURE)',
    description: 'Pekerjaan Beton Pile Cap & Tie Beam Mutu K-250',
    volume: 385,
    unit: 'm3',
    unitPrice: 2150000, // Kontrak
    totalPrice: 827750000,
    ahsCode: 'A.4.1.1.25',
    hasAhsMapped: true,
    targetProfitPercent: 22.75, // Manual override
    status: 'disetujui'
  },
  {
    id: 'rab-2',
    projectId: 'prj-1',
    wbsCode: 'I.2',
    section: 'I. PEKERJAAN STRUKTUR BAWAH (SUBSTRUCTURE)',
    description: 'Pekerjaan Pembesian Besi Ulir BJTD-40 Pondasi & Tie Beam',
    volume: 48500, // 48.500 kg
    unit: 'kg',
    unitPrice: 24500,
    totalPrice: 1188250000,
    ahsCode: 'A.4.1.1.17',
    hasAhsMapped: true,
    targetProfitPercent: 20.47, // Manual override
    status: 'disetujui'
  },
  {
    id: 'rab-3',
    projectId: 'prj-1',
    wbsCode: 'I.3',
    section: 'I. PEKERJAAN STRUKTUR BAWAH (SUBSTRUCTURE)',
    description: 'Pemasangan Bekisting Pondasi & Balok Tie Beam',
    volume: 1240,
    unit: 'm2',
    unitPrice: 385000,
    totalPrice: 477400000,
    ahsCode: 'A.4.1.1.21',
    hasAhsMapped: true,
    targetProfitPercent: 14.05, // Manual override
    status: 'disetujui'
  },
  {
    id: 'rab-4',
    projectId: 'prj-1',
    wbsCode: 'II.1',
    section: 'II. PEKERJAAN STRUKTUR ATAS (UPPER STRUCTURE)',
    description: 'Pengecoran Beton Kolom & Balok Lt. 1 s/d Lt. 5 Mutu K-250',
    volume: 1420,
    unit: 'm3',
    unitPrice: 2180000,
    totalPrice: 3095600000,
    ahsCode: 'A.4.1.1.25',
    hasAhsMapped: true,
    targetProfitPercent: 23.35, // Manual override
    status: 'disetujui'
  },
  {
    id: 'rab-5',
    projectId: 'prj-1',
    wbsCode: 'II.2',
    section: 'II. PEKERJAAN STRUKTUR ATAS (UPPER STRUCTURE)',
    description: 'Pekerjaan Pembesian Balok, Kolom, & Plat Lantai BJTD-40',
    volume: 182000,
    unit: 'kg',
    unitPrice: 24500,
    totalPrice: 4459000000,
    ahsCode: 'A.4.1.1.17',
    hasAhsMapped: true,
    targetProfitPercent: 20.47, // Manual override
    status: 'disetujui'
  },
  {
    id: 'rab-6',
    projectId: 'prj-1',
    wbsCode: 'II.3',
    section: 'II. PEKERJAAN STRUKTUR ATAS (UPPER STRUCTURE)',
    description: 'Bekisting Balok & Plat Lantai Sistem Multiplek 12mm & Scaffolding',
    volume: 5800,
    unit: 'm2',
    unitPrice: 395000,
    totalPrice: 2291000000,
    ahsCode: 'A.4.1.1.21',
    hasAhsMapped: true,
    targetProfitPercent: null, // Menggunakan Project default (25.0%)
    status: 'disetujui'
  },
  {
    id: 'rab-7',
    projectId: 'prj-1',
    wbsCode: 'III.1',
    section: 'III. PEKERJAAN ARSITEKTUR & PASANGAN',
    description: 'Pasangan Dinding Bata Ringan Hebel t = 10 cm',
    volume: 6400,
    unit: 'm2',
    unitPrice: 165000,
    totalPrice: 1056000000,
    ahsCode: 'A.4.4.1.9',
    hasAhsMapped: true,
    targetProfitPercent: 25.0, // Project default
    status: 'disetujui'
  },
  {
    id: 'rab-8',
    projectId: 'prj-1',
    wbsCode: 'III.2',
    section: 'III. PEKERJAAN ARSITEKTUR & PASANGAN',
    description: 'Plesteran + Acian Dinding Luar dan Dalam Mortar Instan',
    volume: 12800,
    unit: 'm2',
    unitPrice: 135000,
    totalPrice: 1728000000,
    ahsCode: 'A.4.4.2.4',
    hasAhsMapped: true,
    targetProfitPercent: null, // Project default 25.0%
    status: 'disetujui'
  },
  {
    id: 'rab-9',
    projectId: 'prj-1',
    wbsCode: 'III.3',
    section: 'III. PEKERJAAN ARSITEKTUR & PASANGAN',
    description: 'Pengecatan Dinding Interior Acrylic Emulsion (2 Lapis)',
    volume: 11500,
    unit: 'm2',
    unitPrice: 55000,
    totalPrice: 632500000,
    ahsCode: 'A.4.7.1.10',
    hasAhsMapped: true,
    targetProfitPercent: 30.0, // Manual override
    status: 'disetujui'
  },
  {
    id: 'rab-10',
    projectId: 'prj-1',
    wbsCode: 'IV.1',
    section: 'IV. PEKERJAAN MEKANIKAL ELEKTRIKAL',
    description: 'Pengadaan & Pemasangan Lift Penumpang 1000kg (2 Unit)',
    volume: 2,
    unit: 'unit',
    unitPrice: 725000000,
    totalPrice: 1450000000,
    ahsCode: undefined, // Belum terhubung AHS (Specialist / Subkon)
    hasAhsMapped: false,
    targetProfitPercent: null,
    status: 'diperiksa'
  }
];

export const INITIAL_RAP_ITEMS: RAPItem[] = [
  {
    id: 'rap-1',
    projectId: 'prj-1',
    rabItemId: 'rab-1',
    wbsCode: 'I.1',
    section: 'I. PEKERJAAN STRUKTUR BAWAH',
    description: 'Pekerjaan Beton Pile Cap & Tie Beam Mutu K-250',
    volume: 385,
    unit: 'm3',
    ahsCode: 'A.4.1.1.25',
    contractUnitPrice: 2150000,
    contractTotalPrice: 827750000,
    rabUnitPrice: 2150000,
    rabTotalPrice: 827750000,
    targetProfitPercent: 22.75,
    marginPercent: 22.75,
    marginAmount: 188311200,
    budgetMaterialUnit: 1214365,
    budgetLaborUnit: 310265,
    budgetEquipmentUnit: 16250,
    budgetOverheadUnit: 120000,
    rapUnitPrice: 1660880,
    rapTotalPrice: 639438800,
    realizedMaterialCost: 468000000,
    realizedLaborCost: 119500000,
    realizedEquipmentCost: 6200000,
    totalCostRealized: 593700000,
    projectedProfit: 188311200,
    projectedProfitPercent: 22.7,
    status: 'disetujui'
  },
  {
    id: 'rap-2',
    projectId: 'prj-1',
    rabItemId: 'rab-2',
    wbsCode: 'I.2',
    section: 'I. PEKERJAAN STRUKTUR BAWAH',
    description: 'Pekerjaan Pembesian Besi Ulir BJTD-40 Pondasi & Tie Beam',
    volume: 48500,
    unit: 'kg',
    ahsCode: 'A.4.1.1.17',
    contractUnitPrice: 24500,
    contractTotalPrice: 1188250000,
    rabUnitPrice: 24500,
    rabTotalPrice: 1188250000,
    targetProfitPercent: 20.47,
    marginPercent: 20.47,
    marginAmount: 243227500,
    budgetMaterialUnit: 15600,
    budgetLaborUnit: 2460,
    budgetEquipmentUnit: 225,
    budgetOverheadUnit: 1200,
    rapUnitPrice: 19485,
    rapTotalPrice: 945022500,
    realizedMaterialCost: 756600000,
    realizedLaborCost: 118000000,
    realizedEquipmentCost: 10900000,
    totalCostRealized: 885500000,
    projectedProfit: 243227500,
    projectedProfitPercent: 20.4,
    status: 'disetujui'
  },
  {
    id: 'rap-3',
    projectId: 'prj-1',
    rabItemId: 'rab-3',
    wbsCode: 'I.3',
    section: 'I. PEKERJAAN STRUKTUR BAWAH',
    description: 'Pemasangan Bekisting Pondasi & Balok Tie Beam',
    volume: 1240,
    unit: 'm2',
    ahsCode: 'A.4.1.1.21',
    contractUnitPrice: 385000,
    contractTotalPrice: 477400000,
    rabUnitPrice: 385000,
    rabTotalPrice: 477400000,
    targetProfitPercent: 14.05,
    marginPercent: 14.05,
    marginAmount: 67090200,
    budgetMaterialUnit: 191950,
    budgetLaborUnit: 113945,
    budgetEquipmentUnit: 0,
    budgetOverheadUnit: 25000,
    rapUnitPrice: 330895,
    rapTotalPrice: 410309800,
    realizedMaterialCost: 238000000,
    realizedLaborCost: 141200000,
    realizedEquipmentCost: 0,
    totalCostRealized: 379200000,
    projectedProfit: 67090200,
    projectedProfitPercent: 14.0,
    status: 'disetujui'
  },
  {
    id: 'rap-4',
    projectId: 'prj-1',
    rabItemId: 'rab-4',
    wbsCode: 'II.1',
    section: 'II. PEKERJAAN STRUKTUR ATAS',
    description: 'Pengecoran Beton Kolom & Balok Lt. 1 s/d Lt. 5 Mutu K-250',
    volume: 1420,
    unit: 'm3',
    ahsCode: 'A.4.1.1.25',
    contractUnitPrice: 2180000,
    contractTotalPrice: 3095600000,
    rabUnitPrice: 2180000,
    rabTotalPrice: 3095600000,
    targetProfitPercent: 23.35,
    marginPercent: 23.35,
    marginAmount: 722950400,
    budgetMaterialUnit: 1214365,
    budgetLaborUnit: 310265,
    budgetEquipmentUnit: 16250,
    budgetOverheadUnit: 130000,
    rapUnitPrice: 1670880,
    rapTotalPrice: 2372649600,
    realizedMaterialCost: 960000000,
    realizedLaborCost: 245000000,
    realizedEquipmentCost: 12800000,
    totalCostRealized: 1217800000,
    projectedProfit: 722950400,
    projectedProfitPercent: 23.3,
    status: 'disetujui'
  },
  {
    id: 'rap-5',
    projectId: 'prj-1',
    rabItemId: 'rab-5',
    wbsCode: 'II.2',
    section: 'II. PEKERJAAN STRUKTUR ATAS',
    description: 'Pekerjaan Pembesian Balok, Kolom, & Plat Lantai BJTD-40',
    volume: 182000,
    unit: 'kg',
    ahsCode: 'A.4.1.1.17',
    contractUnitPrice: 24500,
    contractTotalPrice: 4459000000,
    rabUnitPrice: 24500,
    rabTotalPrice: 4459000000,
    targetProfitPercent: 20.47,
    marginPercent: 20.47,
    marginAmount: 912730000,
    budgetMaterialUnit: 15600,
    budgetLaborUnit: 2460,
    budgetEquipmentUnit: 225,
    budgetOverheadUnit: 1200,
    rapUnitPrice: 19485,
    rapTotalPrice: 3546270000,
    realizedMaterialCost: 1420000000,
    realizedLaborCost: 224000000,
    realizedEquipmentCost: 20500000,
    totalCostRealized: 1664500000,
    projectedProfit: 912730000,
    projectedProfitPercent: 20.4,
    status: 'disetujui'
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'mat-1',
    code: 'MAT-SMN-01',
    name: 'Semen Portland (PC) Type I (40kg)',
    category: 'Semen',
    unit: 'sak',
    officeStock: 450,
    minOfficeStock: 100,
    fieldStocks: {
      'prj-1': 180, // Target minimum 250 -> Alert warning!
      'prj-2': 320,
      'prj-3': 120
    },
    minFieldStock: 250,
    avgBuyPrice: 70000, // per 40kg sak (~Rp 1.750/kg)
    lastUpdated: '2026-10-20'
  },
  {
    id: 'mat-5',
    code: 'MAT-BSI-16',
    name: 'Besi Beton Ulir D16 BJTD-40 (12m)',
    category: 'Besi & Baja',
    unit: 'batang',
    officeStock: 220,
    minOfficeStock: 50,
    fieldStocks: {
      'prj-1': 420,
      'prj-2': 650,
      'prj-3': 110
    },
    minFieldStock: 150,
    avgBuyPrice: 228000,
    lastUpdated: '2026-10-21'
  },
  {
    id: 'mat-2',
    code: 'MAT-AGR-01',
    name: 'Pasir Cor / Pasir Pasang Bersih',
    category: 'Agregat & Pasir',
    unit: 'm3',
    officeStock: 15,
    minOfficeStock: 10,
    fieldStocks: {
      'prj-1': 65,
      'prj-2': 110,
      'prj-3': 30
    },
    minFieldStock: 40,
    avgBuyPrice: 380000,
    lastUpdated: '2026-10-20'
  },
  {
    id: 'mat-3',
    code: 'MAT-AGR-02',
    name: 'Batu Pecah / Split Cor 2/3 cm',
    category: 'Agregat & Pasir',
    unit: 'm3',
    officeStock: 0, // Direct to site usually
    minOfficeStock: 0,
    fieldStocks: {
      'prj-1': 45,
      'prj-2': 85,
      'prj-3': 20
    },
    minFieldStock: 35,
    avgBuyPrice: 420000,
    lastUpdated: '2026-10-19'
  },
  {
    id: 'mat-8',
    code: 'MAT-TPL-01',
    name: 'Multiplek Film Face 12 mm (1.22 x 2.44 m)',
    category: 'Kayu & Bekisting',
    unit: 'lembar',
    officeStock: 310,
    minOfficeStock: 80,
    fieldStocks: {
      'prj-1': 140,
      'prj-2': 290,
      'prj-3': 60
    },
    minFieldStock: 100,
    avgBuyPrice: 185000,
    lastUpdated: '2026-10-21'
  },
  {
    id: 'mat-11',
    code: 'MAT-HBL-10',
    name: 'Bata Ringan Hebel (60 x 20 x 10 cm)',
    category: 'Bata & Dinding',
    unit: 'm3',
    officeStock: 0,
    minOfficeStock: 0,
    fieldStocks: {
      'prj-1': 85,
      'prj-2': 40,
      'prj-3': 15
    },
    minFieldStock: 30,
    avgBuyPrice: 650000,
    lastUpdated: '2026-10-18'
  }
];

export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'stx-1',
    timestamp: '2026-10-20 09:30',
    type: 'transfer_office_to_field',
    materialId: 'mat-1',
    materialName: 'Semen Portland (PC) Type I (40kg)',
    location: 'gudang_kantor',
    qty: -150,
    unit: 'sak',
    unitPrice: 70000,
    refDocument: 'SJ-2026-088',
    performedBy: 'Joko Widodo (Logistik Kantor)',
    reason: 'Transfer pemenuhan SPB-2026-001 ke Proyek Grand Sudirman'
  },
  {
    id: 'stx-2',
    timestamp: '2026-10-20 14:15',
    type: 'receive_at_field',
    materialId: 'mat-1',
    materialName: 'Semen Portland (PC) Type I (40kg)',
    location: 'prj-1',
    qty: 150,
    unit: 'sak',
    unitPrice: 70000,
    refDocument: 'BAST-2026-042',
    performedBy: 'Herman Susanto (Logistik Lapangan)',
    reason: 'Penerimaan kiriman dari gudang kantor lengkap'
  },
  {
    id: 'stx-3',
    timestamp: '2026-10-21 08:00',
    type: 'field_usage',
    materialId: 'mat-1',
    materialName: 'Semen Portland (PC) Type I (40kg)',
    location: 'prj-1',
    qty: -80,
    unit: 'sak',
    unitPrice: 70000,
    refDocument: 'LHR-2026-10-21',
    performedBy: 'Herman Susanto (Logistik Lapangan)',
    reason: 'Pemakaian pengecoran balok bordes tangga Lt. 2',
    wbsItemDescription: 'II.1 Pengecoran Balok & Kolom Lt. 2'
  }
];

export const INITIAL_MATERIAL_REQUESTS: MaterialRequest[] = [
  {
    id: 'spb-1',
    requestNumber: 'SPB-2026-001',
    projectId: 'prj-1',
    ptId: 'pt-1',
    requestedBy: 'Budi Santoso',
    role: 'Pelaksana Lapangan',
    requestDate: '2026-10-18',
    requiredDate: '2026-10-22',
    wbsSection: 'II.1 Pengecoran Balok Lt. 2',
    urgency: 'urgent',
    status: 'diproses_gudang',
    items: [
      {
        materialId: 'mat-1',
        materialName: 'Semen Portland (PC) Type I (40kg)',
        unit: 'sak',
        requestedQty: 300,
        approvedQty: 250,
        fulfilledFromOfficeQty: 150,
        fulfilledFromPOQty: 100,
        notes: '150 sak dikirim dari kantor, 100 sak PO supplier terusan'
      },
      {
        materialId: 'mat-8',
        materialName: 'Multiplek Film Face 12 mm',
        unit: 'lembar',
        requestedQty: 60,
        approvedQty: 60,
        fulfilledFromOfficeQty: 60,
        fulfilledFromPOQty: 0,
        notes: 'Langsung kirim via armada ekspedisi kantor'
      }
    ],
    approvalHistory: [
      { role: 'Pelaksana Lapangan', action: 'Mengajukan SPB', date: '2026-10-18 10:00', notes: 'Kebutuhan mendesak cor hari Sabtu' },
      { role: 'Site Manager', action: 'Menyetujui & Menyesuaikan Qty Semen', date: '2026-10-18 13:40', notes: 'Semen disesuaikan 250 sak sesuai hitungan opname' },
      { role: 'PM Teknik', action: 'Final Approval', date: '2026-10-18 16:20', notes: 'Disetujui untuk diproses logistik & PO' }
    ]
  },
  {
    id: 'spb-2',
    requestNumber: 'SPB-2026-002',
    projectId: 'prj-2',
    ptId: 'pt-1',
    requestedBy: 'Fajar Nugroho',
    role: 'Pelaksana Lapangan',
    requestDate: '2026-10-21',
    requiredDate: '2026-10-25',
    wbsSection: 'I.2 Pembesian Kolom Pedestal',
    urgency: 'normal',
    status: 'diajukan',
    items: [
      {
        materialId: 'mat-5',
        materialName: 'Besi Beton Ulir D16 BJTD-40 (12m)',
        unit: 'batang',
        requestedQty: 200,
        approvedQty: 0,
        fulfilledFromOfficeQty: 0,
        fulfilledFromPOQty: 0,
        notes: 'Menunggu review SM'
      }
    ],
    approvalHistory: [
      { role: 'Pelaksana Lapangan', action: 'Mengajukan SPB', date: '2026-10-21 08:30', notes: 'Tahap fabrikasi besi kolom area B' }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-004',
    requestId: 'spb-1',
    supplierId: 'sup-1',
    supplierName: 'PT Semen Gresik Distributor Jaya',
    projectId: 'prj-1',
    ptId: 'pt-1',
    orderDate: '2026-10-19',
    expectedDeliveryDate: '2026-10-23',
    deliveryDestination: 'lokasi_proyek',
    status: 'dikirim_supplier',
    createdBy: 'Rangga Wijaya (Procurement)',
    approvedBy: 'Ir. Ahmad Zarkasih, M.Sc. (PM)',
    paymentTerms: 'Tempo 30 Hari (Bilyet Giro)',
    subtotal: 7000000,
    ppnPercent: 11,
    ppnAmount: 770000,
    grandTotal: 7770000,
    items: [
      {
        materialId: 'mat-1',
        materialName: 'Semen Portland (PC) Type I (40kg)',
        unit: 'sak',
        qty: 100,
        unitPrice: 70000,
        subtotal: 7000000,
        receivedQty: 0
      }
    ]
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-003',
    supplierId: 'sup-2',
    supplierName: 'PT Adhimix Precast Indonesia',
    projectId: 'prj-1',
    ptId: 'pt-1',
    orderDate: '2026-10-10',
    expectedDeliveryDate: '2026-10-14',
    deliveryDestination: 'lokasi_proyek',
    status: 'diterima_lengkap',
    createdBy: 'Rangga Wijaya (Procurement)',
    approvedBy: 'Ir. Hendra Gunawan (Direktur)',
    paymentTerms: 'DP 30%, Pelunasan 14 Hari',
    subtotal: 185000000,
    ppnPercent: 11,
    ppnAmount: 20350000,
    grandTotal: 205350000,
    items: [
      {
        materialId: 'mat-17',
        materialName: 'Ready Mix Beton K-250 Slump 12',
        unit: 'm3',
        qty: 150,
        unitPrice: 1233333,
        subtotal: 185000000,
        receivedQty: 150
      }
    ],
    approvalHistory: [
      { role: 'Procurement', action: 'Diterbitkan', date: '2026-10-10 11:00', notes: 'PO pengadaan beton cor batching plant' },
      { role: 'Direktur Utama', action: 'Approval', date: '2026-10-10 14:30', notes: 'Disetujui untuk pengecoran lantai dasar' }
    ]
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-005',
    supplierId: 'sup-3',
    supplierName: 'PT Krakatau Steel Distribution',
    projectId: 'prj-1',
    ptId: 'pt-1',
    orderDate: '2026-10-21',
    expectedDeliveryDate: '2026-10-26',
    deliveryDestination: 'lokasi_proyek',
    status: 'diajukan',
    createdBy: 'Rangga Wijaya (Procurement)',
    paymentTerms: 'Tempo 45 Hari (Bilyet Giro)',
    subtotal: 558000000,
    ppnPercent: 11,
    ppnAmount: 61380000,
    grandTotal: 619380000,
    requiresDirectorApproval: true,
    items: [
      {
        materialId: 'mat-5',
        materialName: 'Besi Beton Ulir D16 BJTD-40 (12m)',
        unit: 'batang',
        qty: 2450,
        unitPrice: 228000,
        subtotal: 558000000,
        receivedQty: 0
      }
    ],
    approvalHistory: [
      { role: 'Procurement', action: 'Pengajuan PO', date: '2026-10-21 10:15', notes: 'PO bernilai Rp 619,38 Jt melebihi batas limit PM (Rp 500 Jt), memerlukan otorisasi Direktur Utama.' }
    ]
  }
];

export const INITIAL_WAGE_RECORDS: WageRecord[] = [
  {
    id: 'wage-1',
    recordNumber: 'SPK-BORONG-2026-008',
    projectId: 'prj-1',
    ptId: 'pt-1',
    wbsCode: 'II.1',
    workDescription: 'Pengecoran & Bekisting Balok Plat Lt. 1 (Opname Tahap 2)',
    wageType: 'borongan',
    periodStart: '2026-10-07',
    periodEnd: '2026-10-14',
    mandorName: 'Mandor Sukarno (Tim 16 Pekerja)',
    workerCount: 16,
    volumeDone: 180,
    unit: 'm3',
    unitRate: 165000,
    grossAmount: 29700000,
    pph21Percent: 2.0, // PPh 21 Tenaga Ahli/Mandor Lepas
    pph21Amount: 594000,
    netPayable: 29106000,
    status: 'siap_bayar',
    submittedBy: 'Budi Santoso (Pelaksana)',
    verifiedBy: 'Deni Kurniawan (SM)',
    paymentMethod: 'Transfer Bank'
  },
  {
    id: 'wage-2',
    recordNumber: 'ABS-HARIAN-2026-W42',
    projectId: 'prj-1',
    ptId: 'pt-1',
    wbsCode: 'I.1',
    workDescription: 'Galian Parit, Bobok Kepala Tiang & Pembersihan Lokasi',
    wageType: 'harian',
    periodStart: '2026-10-12',
    periodEnd: '2026-10-17',
    mandorName: 'Mandor Tarjo',
    workerCount: 8,
    mandaysTotal: 48, // 8 org x 6 hari
    dailyRateAvg: 150000,
    grossAmount: 7200000,
    pph21Percent: 2.0,
    pph21Amount: 144000,
    netPayable: 7056000,
    status: 'lunas',
    submittedBy: 'Dedi Irawan (Admin Lapangan)',
    verifiedBy: 'Ir. Ahmad Zarkasih (PM)',
    paidDate: '2026-10-18',
    paymentMethod: 'Kas Lapangan (Petty Cash)'
  }
];

export const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: 'lhr-1',
    reportNumber: 'LHR-2026-10-21',
    projectId: 'prj-1',
    ptId: 'pt-1',
    date: '2026-10-21',
    dayNumber: 279,
    weather: {
      pagi: 'Cerah',
      siang: 'Berawan',
      sore: 'Hujan Ringan'
    },
    manpower: {
      pekerja: 28,
      tukang: 22,
      kepalaTukang: 4,
      mandor: 3,
      operator: 2
    },
    heavyEquipments: [
      { name: 'Tower Crane 45m', qty: 1, hoursOperated: 7.5, status: 'Operasional' },
      { name: 'Mobile Concrete Pump', qty: 1, hoursOperated: 5.0, status: 'Operasional' },
      { name: 'Bar Cutter Elektrik', qty: 2, hoursOperated: 8.0, status: 'Operasional' }
    ],
    workProgress: [
      {
        rabItemId: 'rab-4',
        wbsCode: 'II.1',
        description: 'Pengecoran Kolom Zona Barat Lt. 2',
        volumeToday: 18.5,
        unit: 'm3',
        cumulativeVolume: 560,
        totalPlanVolume: 1420,
        percentComplete: 39.4
      },
      {
        rabItemId: 'rab-5',
        wbsCode: 'II.2',
        description: 'Fabrikasi dan Perakitan Besi Plat Lantai 3',
        volumeToday: 1850,
        unit: 'kg',
        cumulativeVolume: 74200,
        totalPlanVolume: 182000,
        percentComplete: 40.7
      }
    ],
    materialUsages: [
      { materialId: 'mat-1', materialName: 'Semen PC Type I', qty: 80, unit: 'sak', wbsCode: 'II.1' },
      { materialId: 'mat-5', materialName: 'Besi Ulir D16', qty: 110, unit: 'batang', wbsCode: 'II.2' },
      { materialId: 'mat-6', materialName: 'Kawat Bendrat', qty: 15, unit: 'kg', wbsCode: 'II.2' }
    ],
    obstacles: 'Hujan ringan mulai pukul 16:30 sedikit memperlambat pengecoran balok ujung timur. Dilakukan penutupan terpal proteksi.',
    instructions: 'Pastikan vibrator digetarkan maksimal pada pertemuan kolom dan balok untuk menghindari keropos (honeycomb).',
    photoNotes: ['Dokumentasi slum test 12cm', 'Pemasangan decking beton tebal 3cm plat lt 3'],
    submittedBy: 'Budi Santoso (Pelaksana)',
    reviewedBy: 'Deni Kurniawan (Site Manager)',
    status: 'submitted'
  }
];

export const INITIAL_FINANCIAL_ENTRIES: FinancialEntry[] = [
  {
    id: 'fin-1',
    ptId: 'pt-1',
    projectId: 'prj-1',
    date: '2026-03-15',
    code: 'TRM-01',
    category: 'pendapatan_termin',
    description: 'Penerimaan Pembayaran Uang Muka (DP 20%) Proyek Gedung Grand Sudirman',
    amount: 3_700_000_000,
    type: 'masuk',
    refDoc: 'INV-2026-001',
    payeeOrPayer: 'PT Sudirman Graha Investama (Klien)',
    taxDetails: {
      ppnRate: 11,
      ppnAmount: 407_000_000,
      pphFinalRate: 2.65, // PPh Final Usaha Jasa Konstruksi Menengah
      pphFinalAmount: 98_050_000
    },
    status: 'selesai'
  },
  {
    id: 'fin-2',
    ptId: 'pt-1',
    projectId: 'prj-1',
    date: '2026-07-20',
    code: 'TRM-02',
    category: 'pendapatan_termin',
    description: 'Penerimaan Termin I (Progres Fisik 35%) Dikurangi Angsuran DP',
    amount: 4_625_000_000,
    type: 'masuk',
    refDoc: 'INV-2026-015',
    payeeOrPayer: 'PT Sudirman Graha Investama (Klien)',
    taxDetails: {
      ppnRate: 11,
      ppnAmount: 508_750_000,
      pphFinalRate: 2.65,
      pphFinalAmount: 122_562_500
    },
    status: 'selesai'
  },
  {
    id: 'fin-3',
    ptId: 'pt-1',
    projectId: 'prj-1',
    date: '2026-10-15',
    code: 'EXP-MAT-042',
    category: 'beban_material',
    description: 'Pembayaran PO Ready Mix Beton K-250 Batching Plant',
    amount: 205_350_000,
    type: 'keluar',
    refDoc: 'PO-2026-003',
    payeeOrPayer: 'PT Adhimix Precast Indonesia',
    taxDetails: {
      ppnRate: 11,
      ppnAmount: 20_350_000
    },
    status: 'selesai'
  },
  {
    id: 'fin-4',
    ptId: 'pt-1',
    projectId: 'prj-1',
    date: '2026-10-18',
    code: 'EXP-UPH-019',
    category: 'beban_upah',
    description: 'Pencairan Kas Operasional Upah Harian Lapangan Minggu ke-42',
    amount: 7_056_000,
    type: 'keluar',
    refDoc: 'ABS-HARIAN-2026-W42',
    payeeOrPayer: 'Mandor Tarjo & Tim',
    taxDetails: {
      pphFinalRate: 2.0,
      pphFinalAmount: 144_000
    },
    status: 'selesai'
  }
];

export const INITIAL_WARNINGS: WarningAlert[] = [
  {
    id: 'wrn-1',
    projectId: 'prj-1',
    projectName: 'Pembangunan Gedung Kantor 5 Lantai Grand Sudirman',
    ptId: 'pt-1',
    type: 'stock_critical',
    title: 'Stok Semen Lapangan di Bawah Batas Buffer',
    message: 'Stok Semen PC di gudang lapangan tersisa 180 sak (Batas minimum: 250 sak). Potensi hambatan jadwal cor lantai 2.',
    severity: 'critical',
    assignedRoles: ['logistik_lapangan', 'site_manager', 'logistik_kantor', 'procurement'],
    actionLabel: 'Kirim SPB / Terbitkan PO',
    actionModule: 'logistik',
    createdAt: '2026-10-21 07:15',
    status: 'open'
  },
  {
    id: 'wrn-2',
    projectId: 'prj-1',
    projectName: 'Pembangunan Gedung Kantor 5 Lantai Grand Sudirman',
    ptId: 'pt-1',
    type: 'progress_delay',
    title: 'Deviasi Progres Fisik Negatif (-3.3%)',
    message: 'Progres fisik aktual 41.2% berbanding target rencana 44.5%. Terhambat cuaca hujan dan keterlambatan izin angkut trailer besi.',
    severity: 'warning',
    assignedRoles: ['direktur', 'pm_teknik', 'site_manager', 'pelaksana'],
    actionLabel: 'Lihat Kurva S & Mitigasi',
    actionModule: 'progres',
    createdAt: '2026-10-20 18:00',
    status: 'open'
  },
  {
    id: 'wrn-3',
    projectId: 'prj-1',
    projectName: 'Pembangunan Gedung Kantor 5 Lantai Grand Sudirman',
    ptId: 'pt-1',
    type: 'unmapped_rab',
    title: 'Item RAB IV.1 Belum Terhubung Master AHS',
    message: 'Item Pekerjaan Lift Penumpang 1000kg (2 Unit) senilai Rp 1.450.000.000 belum memiliki analisa AHS atau subkon terverifikasi.',
    severity: 'warning',
    assignedRoles: ['admin_teknik', 'estimator', 'pm_teknik'],
    actionLabel: 'Hubungkan AHS / Spesifikasi',
    actionModule: 'rab',
    createdAt: '2026-10-19 11:20',
    status: 'open'
  },
  {
    id: 'wrn-4',
    projectId: 'prj-1',
    projectName: 'Pembangunan Gedung Kantor 5 Lantai Grand Sudirman',
    ptId: 'pt-1',
    type: 'unverified_wage',
    title: 'Klaim Upah Borongan Siap Dibayar (Rp 29.106.000)',
    message: 'SPK-BORONG-2026-008 Mandor Sukarno telah diverifikasi Site Manager dan membutuhkan validasi PM Teknik & Keuangan.',
    severity: 'info',
    assignedRoles: ['pm_teknik', 'admin_keuangan'],
    actionLabel: 'Periksa & Cairkan Upah',
    actionModule: 'upah',
    createdAt: '2026-10-21 09:10',
    status: 'open'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-21 08:30:12',
    userName: 'Budi Santoso',
    userRole: 'pelaksana',
    action: 'Pengajuan SPB',
    entityType: 'MaterialRequest',
    entityId: 'SPB-2026-002',
    ptId: 'pt-1',
    projectId: 'prj-2',
    details: 'Mengajukan permintaan 200 batang Besi D16 untuk Proyek Pergudangan Cikarang'
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-20 16:45:00',
    userName: 'Ir. Ahmad Zarkasih, M.Sc.',
    userRole: 'pm_teknik',
    action: 'Persetujuan RAP',
    entityType: 'RAP',
    entityId: 'rap-1',
    ptId: 'pt-1',
    projectId: 'prj-1',
    details: 'Menyetujui revisi koefisien material RAP Pekerjaan Beton K-250'
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-20 14:15:33',
    userName: 'Herman Susanto',
    userRole: 'logistik_lapangan',
    action: 'Penerimaan Gudang Lapangan',
    entityType: 'StockItem',
    entityId: 'mat-1',
    ptId: 'pt-1',
    projectId: 'prj-1',
    details: 'Menerima 150 sak Semen PC dari armada Logistik Kantor (Surat Jalan SJ-2026-088)'
  },
  {
    id: 'aud-4',
    timestamp: '2026-10-19 10:20:11',
    userName: 'Ir. Hendra Gunawan, M.T.',
    userRole: 'direktur',
    action: 'Approval Kontrak & Margin Target',
    entityType: 'Project',
    entityId: 'prj-1',
    ptId: 'pt-1',
    projectId: 'prj-1',
    details: 'Menetapkan target margin laba proyek Gedung Sudirman sebesar 18.0% (Rp 3,33 Miliar)'
  }
];
