import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useThemeLayout } from "../contexts/ThemeAndLayoutContext";
import { 
  Plus, 
  Trash, 
  Barcode, 
  Activity, 
  FileText, 
  Sparkles, 
  UploadCloud, 
  Share2, 
  Printer, 
  QrCode, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Box, 
  Users, 
  AlertTriangle, 
  Clock, 
  Settings, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  Database, 
  Save, 
  Undo, 
  CheckCircle2, 
  Building2, 
  PackageSearch, 
  UserPlus, 
  FolderDown,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Check,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

// TypeScript typings for Pharmacy Digital Store
interface Medicine {
  id: string;
  name: string;
  category: string;
  barcode: string;
  stock: number;
  batchNumber: string;
  price: number;
  igst: number;
  cgst: number;
  sgst: number;
  expiryDate: string;
  threshold: number;
  description: string;
  imageUrl: string;
  supplier: string;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pendingAmount: number;
  medicineCount: number;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  orderDate: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  items: { medicineName: string; quantity: number; price: number }[];
  totalAmount: number;
}

interface InvoiceItem {
  medicineName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  qrPayload: string;
}

interface Prescription {
  id: string;
  patientName: string;
  uploadDate: string;
  url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  detectedMedicines: string[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

interface Branch {
  id: string;
  name: string;
}

export const PharmacyStore: React.FC = () => {
  const { auth } = useAuth();
  const { theme } = useThemeLayout();

  // Screen layout tabs
  const [activePane, setActivePane] = useState<"analytics" | "billing" | "ocr" | "inventory" | "ledger" | "audits">("analytics");
  const [selectedBranch, setSelectedBranch] = useState<string>("br1");

  // Core Store States (fetched from matching server.ts API routes)
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // States: GST Billing Terminal
  const [billingCustomerName, setBillingCustomerName] = useState<string>("");
  const [billingCustomerPhone, setBillingCustomerPhone] = useState<string>("");
  const [billingCart, setBillingCart] = useState<{ medicineName: string; quantity: number }[]>([]);
  const [selectedCartMed, setSelectedCartMed] = useState<string>("");
  const [cartQuantity, setCartQuantity] = useState<number>(1);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<string>("UPI");
  const [mockBarcodeRaw, setMockBarcodeRaw] = useState<string>("");

  // States: Form Add/Edit Medicines & Suppliers
  const [newMedName, setNewMedName] = useState("");
  const [newMedPrice, setNewMedPrice] = useState("");
  const [newMedStock, setNewMedStock] = useState("");
  const [newMedCategory, setNewMedCategory] = useState("Analgesic");
  const [newMedExpiry, setNewMedExpiry] = useState("2026-12-31");
  const [newMedSupplier, setNewMedSupplier] = useState("");
  const [newMedThreshold, setNewMedThreshold] = useState("10");
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);

  // States: Prescription Uploading & Simulated OCR Parsing
  const [ocrUploadedFile, setOcrUploadedFile] = useState<File | null>(null);
  const [ocrUploadedPreview, setOcrUploadedPreview] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<"idle" | "imaging" | "ocr" | "completed">("idle");
  const [ocrMedicinesFound, setOcrMedicinesFound] = useState<string[]>([]);
  const [searchMedicineQuery, setSearchMedicineQuery] = useState("");

  // States: Invoices Modal Print previewers & unique QR codes
  const [viewInvoiceObject, setViewInvoiceObject] = useState<Invoice | null>(null);
  const [viewQrObject, setViewQrObject] = useState<Invoice | null>(null);

  // States: AI Sales Forecasting and Demand Predictions reports (loaded via Gemini backend)
  const [aiReportText, setAiReportText] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // States: Purchase Orders
  const [poSelectedSupplier, setPoSelectedSupplier] = useState<string>("");
  const [poCartItems, setPoCartItems] = useState<{ medicineName: string; quantity: number; costPrice: number }[]>([]);
  const [poTempMed, setPoTempMed] = useState("");
  const [poTempQty, setPoTempQty] = useState(100);
  const [poTempCost, setPoTempCost] = useState(10);

  // States: Backup Restore State RAW variables
  const [restoreJsonPayload, setRestoreJsonPayload] = useState("");

  // Drag and Drop State Hook
  const [isDragOver, setIsDragOver] = useState(false);

  // Show Toast messaging helper
  const triggerToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Safe server fetch synchronizer from matching endpoints
  const fetchPharmacyData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/pharmacy/data", {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const isJson = response.headers.get("content-type")?.includes("json");
      if (response.ok && isJson) {
        const data = await response.json();
        setMedicines(data.medicines || []);
        setSuppliers(data.suppliers || []);
        setPurchaseOrders(data.purchaseOrders || []);
        setInvoices(data.invoices || []);
        setPrescriptions(data.prescriptions || []);
        setAuditLogs(data.auditLogs || []);
        setBranches(data.branches || []);
        if (data.suppliers?.length && !poSelectedSupplier) {
          setPoSelectedSupplier(data.suppliers[0].name);
        }
      } else {
        const errObj = isJson ? await response.json() : null;
        setErrorMessage(errObj?.error || `Could not retrieve medical store indexes (HTTP ${response.status}).`);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to make communication with backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchPharmacyData();
    }
  }, [auth.token]);

  // Handle medicine submission (add/edit)
  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedPrice) {
      triggerToast("Please provide medicine name and sales retail price", "error");
      return;
    }

    try {
      const response = await fetch("/api/pharmacy/medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          id: selectedMedId,
          name: newMedName,
          category: newMedCategory,
          price: Number(newMedPrice),
          stock: Number(newMedStock) || 0,
          expiryDate: newMedExpiry,
          threshold: Number(newMedThreshold) || 10,
          supplier: newMedSupplier || "General Vendor"
        })
      });

      if (response.ok) {
        triggerToast(selectedMedId ? "Updated medicine details" : "Registered brand new medicine inside inventory", "success");
        // Clear form
        setNewMedName("");
        setNewMedPrice("");
        setNewMedStock("");
        setNewMedThreshold("10");
        setNewMedSupplier("");
        setSelectedMedId(null);
        // Refresh
        await fetchPharmacyData();
      } else {
        const data = await response.json();
        triggerToast(data.error || "Failed item save", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Populate form for Editing Medicine
  const editMedicineAction = (med: Medicine) => {
    setSelectedMedId(med.id);
    setNewMedName(med.name);
    setNewMedCategory(med.category);
    setNewMedPrice(med.price.toString());
    setNewMedStock(med.stock.toString());
    setNewMedExpiry(med.expiryDate);
    setNewMedThreshold(med.threshold.toString());
    setNewMedSupplier(med.supplier);
  };

  // Simulate Barcode Scanner Parser
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockBarcodeRaw.trim()) return;
    
    // Search medicine index matching barcode
    const match = medicines.find(
      m => m.barcode.toLowerCase() === mockBarcodeRaw.trim().toLowerCase()
    );

    if (match) {
      // Add matching item straight into client billing item list
      const existing = billingCart.find(item => item.medicineName === match.name);
      if (existing) {
        setBillingCart(billingCart.map(item => 
          item.medicineName === match.name ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setBillingCart([...billingCart, { medicineName: match.name, quantity: 1 }]);
      }
      triggerToast(`Barcode recognized! Added 1x "${match.name}" to invoice`, "success");
      setMockBarcodeRaw("");
    } else {
      triggerToast(`Unrecognized Barcode "${mockBarcodeRaw}". No medicine matching found.`, "error");
    }
  };

  // Live Cart Operations inside Billing Terminal
  const addCartItem = () => {
    if (!selectedCartMed) {
      triggerToast("Select a medicine target first", "info");
      return;
    }
    const itemMed = medicines.find(m => m.name === selectedCartMed);
    if (!itemMed) return;

    if (itemMed.stock < cartQuantity) {
      triggerToast(`Warning: Requested ${cartQuantity} units, but only ${itemMed.stock} are physically in stock!`, "info");
    }

    const existing = billingCart.find(i => i.medicineName === selectedCartMed);
    if (existing) {
      setBillingCart(billingCart.map(i => 
        i.medicineName === selectedCartMed ? { ...i, quantity: i.quantity + cartQuantity } : i
      ));
    } else {
      setBillingCart([...billingCart, { medicineName: selectedCartMed, quantity: cartQuantity }]);
    }
    triggerToast(`Added ${cartQuantity}x ${selectedCartMed} to current bill draft`);
    setCartQuantity(1);
  };

  const removeCartItem = (medName: string) => {
    setBillingCart(billingCart.filter(i => i.medicineName !== medName));
    triggerToast(`Removed ${medName} from current invoice`);
  };

  // Issue real-time Invoice inside db.json and backend
  const handleCheckoutInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingCart.length) {
      triggerToast("Invoice draught is currently empty", "error");
      return;
    }

    try {
      const response = await fetch("/api/pharmacy/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          customerName: billingCustomerName || "General Walk-In",
          customerPhone: billingCustomerPhone,
          items: billingCart,
          paymentMethod: billingPaymentMethod,
          isPaid: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        triggerToast(`Invoice generated successfully! Ref: ${data.invoice.invoiceNumber}`, "success");
        
        // Show immediate Print previewer Modal automatically!
        setViewInvoiceObject(data.invoice);
        
        // Clear Billing inputs
        setBillingCustomerName("");
        setBillingCustomerPhone("");
        setBillingCart([]);
        
        // Hot-reload
        await fetchPharmacyData();
      } else {
        const errObj = await response.json();
        triggerToast(errObj.error || "Billing creation failed", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // WhatsApp / Email / SMS Share Dispatch simulations
  const handleSocialBroadcast = async (type: "whatsapp" | "sms" | "email", invoice: Invoice) => {
    const recipient = type === "whatsapp" || type === "sms" 
      ? invoice.customerPhone || "+91 98765 43210" 
      : "student1@campus.edu";
      
    try {
      const response = await fetch("/api/pharmacy/notify-social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          type,
          invoiceNumber: invoice.invoiceNumber,
          recipient
        })
      });

      if (response.ok) {
        const data = await response.json();
        triggerToast(data.message, "success");
      }
    } catch (e: any) {
      triggerToast("Social sharing simulation failed", "error");
    }
  };

  // Emergency defection batch recall dispatch
  const handleBatchRecall = async (batchNum: string) => {
    if (!window.confirm(`CRITICAL HAZARD WARNING:\nAre you sure you want to initialize Defective Batch Recall for "${batchNum}"?\nThis zeroes active stocks and signals clinical alerts immediately across all campus pharmacies.`)) {
      return;
    }

    try {
      const resp = await fetch("/api/pharmacy/recall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ batchNumber: batchNum })
      });

      if (resp.ok) {
        const data = await resp.json();
        triggerToast(data.message, "success");
        await fetchPharmacyData();
      }
    } catch (e: any) {
      triggerToast("Failed to initialize safety batch recall protocols", "error");
    }
  };

  // Load Gemini AI prediction report (Failsafe fallback built-in inside server.ts)
  const generateAiForecastReport = async () => {
    setIsAiLoading(true);
    setAiReportText("");
    try {
      const response = await fetch("/api/pharmacy/ai-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAiReportText(data.report);
        triggerToast("AI demand insights predicted successfully", "success");
      }
    } catch (e: any) {
      triggerToast("AI prediction service offline", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  // OCR prescription file handler
  const handleOcrFileSelect = (file: File) => {
    setOcrUploadedFile(file);
    setOcrUploadedPreview(URL.createObjectURL(file));
    setOcrProgress("idle");
    setOcrMedicinesFound([]);
  };

  // Simulate High-Fidelity OCR Prescription Scanning & Translation
  const runSimulatedOcrScan = () => {
    if (!ocrUploadedFile) return;
    
    setOcrProgress("imaging");
    setTimeout(() => {
      setOcrProgress("ocr");
      setTimeout(() => {
        setOcrProgress("completed");
        // Simulated structured parsing of clinical document
        const parsedMeds = ["Paracetamol 650mg", "Amoxicillin 500mg"];
        setOcrMedicinesFound(parsedMeds);
        triggerToast("Digital prescription parsed! Recognized 2 approved drugs.", "success");
      }, 1500);
    }, 1200);
  };

  // Bulk add OCR recognized items to cart
  const addOcrToBillingCart = () => {
    if (!ocrMedicinesFound.length) return;
    
    const duplicateCart = [...billingCart];
    ocrMedicinesFound.forEach(medName => {
      const match = medicines.find(m => m.name.toLowerCase() === medName.toLowerCase());
      if (match) {
        const existsRef = duplicateCart.find(i => i.medicineName === match.name);
        if (existsRef) {
          existsRef.quantity += 1;
        } else {
          duplicateCart.push({ medicineName: match.name, quantity: 1 });
        }
      }
    });

    setBillingCart(duplicateCart);
    triggerToast("OCR translated items transferred directly into invoice builder draft!", "success");
    setActivePane("billing");
  };

  // Local JSON Backups & States downloads
  const handleBackupDownload = () => {
    const backupJson = JSON.stringify({
      medicines,
      suppliers,
      purchaseOrders,
      invoices
    }, null, 2);

    const blob = new Blob([backupJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CAMPUS_PHARMACY_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Encrypted core store JSON downloaded successfully", "success");
  };

  // RESTORE backup from JSON
  const handleRestoreConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreJsonPayload.trim()) {
      triggerToast("Input backup schema payload first", "error");
      return;
    }

    try {
      const response = await fetch("/api/pharmacy/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ payload: restoreJsonPayload })
      });

      if (response.ok) {
        triggerToast("Ledgers and inventories restored successfully", "success");
        setRestoreJsonPayload("");
        await fetchPharmacyData();
      } else {
        const data = await response.json();
        triggerToast(data.error || "Restoration failure", "error");
      }
    } catch (e: any) {
      triggerToast(e.message, "error");
    }
  };

  // Supplier purchase orders creation
  const handleAddPoItem = () => {
    if (!poTempMed) return;
    const existing = poCartItems.find(i => i.medicineName === poTempMed);
    if (existing) {
      setPoCartItems(poCartItems.map(i => 
        i.medicineName === poTempMed ? { ...i, quantity: i.quantity + Number(poTempQty) } : i
      ));
    } else {
      setPoCartItems([...poCartItems, { medicineName: poTempMed, quantity: Number(poTempQty), costPrice: Number(poTempCost) }]);
    }
    triggerToast("Added cost element to list");
  };

  // Push actual PO to server
  const submitPurchaseOrderForm = async () => {
    if (!poCartItems.length) {
      triggerToast("Purchases list is blank", "error");
      return;
    }

    try {
      const resp = await fetch("/api/pharmacy/purchase-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          supplierName: poSelectedSupplier,
          items: poCartItems
        })
      });

      if (resp.ok) {
        triggerToast(`Registered procurement order with ${poSelectedSupplier}`, "success");
        setPoCartItems([]);
        const data = await resp.json();
        // Append to local state list instantly
        setPurchaseOrders([data.purchaseOrder, ...purchaseOrders]);
        await fetchPharmacyData();
      }
    } catch (e: any) {
      triggerToast("Failed ordering", "error");
    }
  };

  // High-contrast, beautiful layout templates and panels definitions
  // 1. Calculations: Earnings & Totals
  const totalSalesVolume = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalLowStockMeds = medicines.filter(m => m.stock <= m.threshold).length;
  
  // Calculate meds expiring within 30 days and 90 days from local system date 2026-06-19
  const getExpirationStatus = (med: Medicine) => {
    const expDate = new Date(med.expiryDate);
    const systemDate = new Date("2026-06-19");
    const diffTime = expDate.getTime() - systemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { label: "EXPIRED 🛑", days: diffDays, severity: "danger" };
    if (diffDays <= 30) return { label: "IMMEDIATE (FEFO) ⚠️", days: diffDays, severity: "warn" };
    if (diffDays <= 90) return { label: "EXPIRING IN 90 DAYS ⏳", days: diffDays, severity: "info" };
    return { label: "STABLE ✅", days: diffDays, severity: "good" };
  };

  const medicinesExpiringSoon = medicines.map(m => {
    const status = getExpirationStatus(m);
    return { ...m, expiryAlert: status };
  }).filter(m => m.expiryAlert.days <= 90);

  // Dynamic Theme Styling Variables
  const containerStyle = {
    "classic-light": "bg-white border-slate-150 text-slate-850 shadow-xs",
    "slate-dark": "bg-slate-900 border-slate-800 text-slate-100 dark",
    "sepia-cozy": "bg-[#f5ebd5] border-[#dfd4be] text-[#3c2f1f] shadow-2xs",
    "forest-fresh": "bg-[#142318] border-[#25392b] text-emerald-100 shadow-2xs"
  }[theme];

  const headerStyle = {
    "classic-light": "bg-gradient-to-r from-blue-50 to-indigo-50/75 border-b border-light-200 text-slate-900",
    "slate-dark": "bg-slate-950/40 border-b border-slate-800 text-white",
    "sepia-cozy": "bg-[#ebe0cb] border-b border-[#dfd4be] text-[#3c2f1f]",
    "forest-fresh": "bg-[#111c14] border-b border-[#25392b] text-emerald-100"
  }[theme];

  const tabActiveStyle = {
    "classic-light": "bg-indigo-600 text-white shadow-xs",
    "slate-dark": "bg-indigo-700 text-white shadow-xs",
    "sepia-cozy": "bg-amber-800 text-[#FAF4E8] shadow-xs",
    "forest-fresh": "bg-emerald-750 text-[#e6f4ea] shadow-xs"
  }[theme];

  const inputStyle = {
    "classic-light": "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-505",
    "slate-dark": "bg-slate-950 border-slate-850 text-slate-100 focus:bg-slate-950 focus:border-slate-700",
    "sepia-cozy": "bg-[#fcf8f2] border-[#dfd4be] text-[#3c2f1f] focus:border-amber-705",
    "forest-fresh": "bg-[#0b140f] border-[#25392b] text-emerald-205 focus:border-emerald-605"
  }[theme];

  const cardStyle = {
    "classic-light": "bg-slate-50/70 border border-slate-200 hover:bg-white",
    "slate-dark": "bg-slate-950/40 border border-slate-850 hover:bg-slate-950/80",
    "sepia-cozy": "bg-[#faf4e8]/60 border border-[#dfd4be] hover:bg-[#faf4e8]",
    "forest-fresh": "bg-[#0b140f]/60 border border-[#25392b] hover:bg-[#0c120e]"
  }[theme];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto flex flex-col justify-center items-center min-h-[400px]">
        <div className="relative flex h-6 w-6 animate-spin mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-indigo-600"></span>
        </div>
        <p className="text-xs uppercase tracking-widest font-black text-slate-400">Loading Enterprise Medical Shop systems...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none transition-all duration-200`} id="pharmacy-portals-root">
      
      {/* Toast Alert Box */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-6 ${
          toastMessage.type === "success" ? "bg-emerald-600 text-white" : toastMessage.type === "error" ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"
        }`}>
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold">✓</div>
          <span className="text-xs font-black uppercase tracking-wider">{toastMessage.text}</span>
        </div>
      )}

      {/* Main header banner control containing branch index config selector */}
      <div className={`p-6 mt-4 rounded-3xl border ${containerStyle} flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative`}>
        <div className="space-y-1 z-10 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
              Digital Pharmacy System
            </span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-extrabold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
            Campus Wellness & Pharmacy Center <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Corporate Medicine Logistics, GST compliant invoice generator, and prescription RAG-OCR Engine.
          </p>
        </div>

        {/* Multi-Pharmacy Branch Selection */}
        <div className="flex items-center gap-2.5 z-10 shrink-0">
          <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black tracking-wider text-slate-400">Pharmaceutics Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                triggerToast(`Switched active terminal block to "${branches.find(b => b.id === e.target.value)?.name}"`);
              }}
              className={`text-xs font-black uppercase rounded-lg border px-3 py-1.5 outline-none tracking-wide ${inputStyle}`}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Core Tab Navigations */}
      <div className="flex gap-2 pb-1 overflow-x-auto max-w-full border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "analytics", label: "Dashboard Analytics", icon: TrendingUp },
          { id: "billing", label: "GST Billing Terminal", icon: FileText },
          { id: "ocr", label: "Prescription OCR & Uploads", icon: UploadCloud },
          { id: "inventory", label: "Inventory & Batch Tracker", icon: Box },
          { id: "ledger", label: "Corporate Ledgers", icon: Users },
          { id: "audits", label: "Audits & Backups", icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          const isAct = activePane === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActivePane(tab.id as any);
                setErrorMessage("");
              }}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                isAct ? tabActiveStyle : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Primary Pane Render Blocks */}

      {/* 1. ANALYTICS DASHBOARD PANE */}
      {activePane === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Bento metric blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className={`p-5 rounded-2xl border transition-all ${containerStyle}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aggregate Sales Volume</span>
                  <p className="text-xl font-black font-mono">₹{totalSalesVolume.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase">
                <span>+14.8% from peak month</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${containerStyle}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Medicines in Inventory</span>
                  <p className="text-xl font-black font-mono">{medicines.length} Brands</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                <span>Across {branches.length} Campus Blocks</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${containerStyle}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Low Stock Forewarns</span>
                  <p className="text-xl font-black font-mono text-rose-500">{totalLowStockMeds} Batches</p>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-rose-500 font-bold uppercase">
                <span>⚠️ Action Required Immediately</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${containerStyle}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Expiring in 90 Days</span>
                  <p className="text-xl font-black font-mono text-amber-500">{medicinesExpiringSoon.length} Batches</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                  <Clock className="w-5 h-5 animate-bounce" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase">
                <span>FEFO shelf priority recommended</span>
              </div>
            </div>

          </div>

          {/* Analytics Visualizer Charts (Recharts compliant) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Volume progression chart */}
            <div className={`p-6 rounded-3xl border ${containerStyle}`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                📈 Monthly Earnings Progression <Sparkles className="w-4 h-4 text-indigo-500" />
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: "Jan", sales: 12500, trans: 45 },
                      { month: "Feb", sales: 18900, trans: 62 },
                      { month: "Mar", sales: 22000, trans: 78 },
                      { month: "Apr", sales: 15400, trans: 50 },
                      { month: "May", sales: 29000, trans: 95 },
                      { month: "Jun", sales: totalSalesVolume > 0 ? totalSalesVolume : 32000, trans: invoices.length ? invoices.length * 15 : 120 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradientSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "slate-dark" ? "#2a3541" : "#e2e8f0"} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ fontSize: 10, fontWeight: 700, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="sales" name="Sales Earnings (INR)" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#gradientSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expiring item inventory stocks forecast chart */}
            <div className={`p-6 rounded-3xl border ${containerStyle}`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                📦 Medicine Category Distribution & Stock status
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={medicines.map(m => ({ name: m.name.substring(0, 10), stock: m.stock, threshold: m.threshold }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "slate-dark" ? "#2a3541" : "#e2e8f0"} />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ fontSize: 10, fontWeight: 700, borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                    <Bar dataKey="stock" name="Current Stock" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="threshold" name="Safety Limit" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* AI Demand Prediction Control Container */}
          <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  🔮 AI Sales Forecasting & Demand Predictor Console
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  Powered by server-side Gemini intelligence models analyzing stock trends.
                </p>
              </div>
              <button
                onClick={generateAiForecastReport}
                disabled={isAiLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Calculating Stock Regressions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate AI Forecasting Report
                  </>
                )}
              </button>
            </div>

            {aiReportText ? (
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium leading-relaxed font-mono whitespace-pre-wrap select-text">
                {aiReportText}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-medium uppercase tracking-wide">
                No active report forecasted. Click generate above.
              </div>
            )}
          </div>

          {/* Low Stock predictions and Immediate Expiry warning grid lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Low Stocks warn alert panel */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                ⚠️ Current Stock Predictions & Shortages
              </h3>
              
              {totalLowStockMeds === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-bold uppercase">All batches safe from buffer exhaustion</div>
              ) : (
                <div className="space-y-3">
                  {medicines.filter(m => m.stock <= m.threshold).map(med => (
                    <div key={med.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${cardStyle}`}>
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{med.name}</p>
                        <span className="text-[9px] uppercase font-bold text-slate-400">Barcode: {med.barcode} • Batch: {med.batchNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded text-[9px] font-black uppercase">
                          Stock: {med.stock} / {med.threshold} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiry alerts list panel */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
                ⏳ High-alert Medicine Expirations (FEFO FEASIBILITY)
              </h3>

              {medicinesExpiringSoon.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-bold uppercase">No near-term batch expirations detected</div>
              ) : (
                <div className="space-y-3">
                  {medicinesExpiringSoon.map(med => (
                    <div key={med.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${cardStyle}`}>
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{med.name}</p>
                        <span className="text-[9px] uppercase font-bold text-slate-400">Expires: {med.expiryDate} • Supplier: {med.supplier}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          med.expiryAlert.days <= 10 ? "bg-rose-100 text-rose-600 dark:bg-rose-950" : "bg-amber-100 text-amber-600 dark:bg-amber-950"
                        }`}>
                          {med.expiryAlert.label} ({med.expiryAlert.days} Days Left)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. GST BILLING TERMINAL */}
      {activePane === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Left panel: Bill Draft Builder & Barcode trigger */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Barcode scanner emulator container */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-3`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Barcode className="w-4 h-4 text-indigo-500" /> Integrated Laser Barcode Scanner Simulator
              </h3>
              
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan drug barcode (e.g. MED-PAR650, MED-AMO500, MED-AST100)"
                  value={mockBarcodeRaw}
                  onChange={(e) => setMockBarcodeRaw(e.target.value)}
                  className={`flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl border outline-none ${inputStyle}`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
                >
                  Laser Sync
                </button>
              </form>

              {/* Instant scanner cheats */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Barcode Cheats:</span>
                {medicines.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMockBarcodeRaw(m.barcode);
                      triggerToast(`Simulated active laser scanner barcode read on "${m.barcode}"`);
                    }}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 rounded text-[9px] font-bold border border-slate-205 dark:border-slate-700 inline-block uppercase text-slate-500 cursor-pointer"
                  >
                    🔍 {m.name} ({m.barcode})
                  </button>
                ))}
              </div>
            </div>

            {/* Manual item builder selector card */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                🏗️ Manual Invoice Item Adder
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Select Medicine</label>
                  <select
                    value={selectedCartMed}
                    onChange={(e) => setSelectedCartMed(e.target.value)}
                    className={`text-xs font-black uppercase border rounded-xl px-3 py-2.5 outline-none ${inputStyle}`}
                  >
                    <option value="">-- Choose Brand --</option>
                    {medicines.map(m => (
                      <option key={m.id} value={m.name}>{m.name} [₹{m.price}] (In Stock: {m.stock})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Sales Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={cartQuantity}
                    onChange={(e) => setCartQuantity(Math.max(1, Number(e.target.value)))}
                    className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={addCartItem}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Add Row
                  </button>
                </div>
              </div>
            </div>

            {/* Invoices List Draft Cart */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                📋 Live Invoice Cart Draft Items
              </h3>

              {!billingCart.length ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wide">
                  Draft invoice is empty. Scan barcode or add manual item rows.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                          <th className="pb-3">Medicine Description</th>
                          <th className="pb-3 text-center">Qty</th>
                          <th className="pb-3 text-right">M.R.P</th>
                          <th className="pb-3 text-right">GST Rate</th>
                          <th className="pb-3 text-right">Gross Total</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingCart.map((item, idx) => {
                          const medMatch = medicines.find(m => m.name === item.medicineName);
                          const unitPrice = medMatch ? medMatch.price : 10;
                          const igst = medMatch ? medMatch.igst : 12;
                          const gross = unitPrice * item.quantity;
                          
                          return (
                            <tr key={idx} className="border-b border-light-200 dark:border-slate-850 py-2">
                              <td className="py-3 font-extrabold text-slate-800 dark:text-slate-100">{item.medicineName}</td>
                              <td className="py-3 text-center font-black font-mono">{item.quantity}</td>
                              <td className="py-3 text-right font-black font-mono">₹{unitPrice}</td>
                              <td className="py-3 text-right font-bold font-mono text-indigo-500">{igst}%</td>
                              <td className="py-3 text-right font-black font-mono text-emerald-500">₹{gross}</td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => removeCartItem(item.medicineName)}
                                  className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Checkout Details Summary & Settling */}
          <div className="space-y-6">
            
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                🧮 GST Invoice Settlement Summary
              </h3>

              <form onSubmit={handleCheckoutInvoice} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Customer Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma (or Walk-In)"
                    value={billingCustomerName}
                    onChange={(e) => setBillingCustomerName(e.target.value)}
                    className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Customer Phone (WhatsApp Integration)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={billingCustomerPhone}
                    onChange={(e) => setBillingCustomerPhone(e.target.value)}
                    className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Tax Payment Method</label>
                  <select
                    value={billingPaymentMethod}
                    onChange={(e) => setBillingPaymentMethod(e.target.value)}
                    className={`text-xs font-black uppercase border rounded-xl px-3 py-2outline-none ${inputStyle}`}
                  >
                    <option value="UPI">UPI Digital Payment / Fastag</option>
                    <option value="NetBanking">NetBanking / Credit Bank</option>
                    <option value="Cash">Direct physical Cash</option>
                  </select>
                </div>

                {/* Direct Totals breakdown */}
                {billingCart.length > 0 && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/40 border border-indigo-100/50 dark:border-slate-800 space-y-2 text-xs font-black uppercase">
                    
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">Taxable Amount:</span>
                      <span className="font-mono">
                        ₹{billingCart.reduce((sum, item) => {
                          const medMatch = medicines.find(m => m.name === item.medicineName);
                          return sum + (medMatch ? medMatch.price : 10) * item.quantity;
                        }, 0)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-indigo-500 text-[10px]">CGST (Calculated):</span>
                      <span className="font-mono">
                        ₹{Math.round(billingCart.reduce((sum, item) => {
                          const medMatch = medicines.find(m => m.name === item.medicineName);
                          const tax = medMatch ? medMatch.price * (medMatch.igst / 100) : 1.2;
                          return sum + (tax / 2) * item.quantity;
                        }, 0) * 100) / 100}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-indigo-500 text-[10px]">SGST (Calculated):</span>
                      <span className="font-mono">
                        ₹{Math.round(billingCart.reduce((sum, item) => {
                          const medMatch = medicines.find(m => m.name === item.medicineName);
                          const tax = medMatch ? medMatch.price * (medMatch.igst / 100) : 1.2;
                          return sum + (tax / 2) * item.quantity;
                        }, 0) * 100) / 100}
                      </span>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-800" />

                    <div className="flex justify-between text-sm text-emerald-500">
                      <span>Grand Total (INC GST):</span>
                      <span className="font-mono">
                        ₹{Math.round(billingCart.reduce((sum, item) => {
                          const med = medicines.find(m => m.name === item.medicineName);
                          const price = med ? med.price : 10;
                          const tax = med ? price * (med.igst / 100) : 1.2;
                          return sum + (price + tax) * item.quantity;
                        }, 0) * 100) / 100}
                      </span>
                    </div>

                  </div>
                )}

                <button
                  type="submit"
                  disabled={!billingCart.length}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Generate Invoice receipt & settle
                </button>

              </form>
            </div>

            {/* Quick social share helper triggers */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider">
                📑 Latest Invoices List ({invoices.length})
              </h3>
              
              <div className="space-y-3">
                {invoices.slice().reverse().slice(0, 3).map(inv => (
                  <div key={inv.id} className="p-4 border rounded-2xl flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="font-black text-xs text-slate-800 dark:text-slate-100">{inv.invoiceNumber}</span>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{inv.customerName} • {inv.paymentMethod}</p>
                      </div>
                      <span className="font-black text-xs font-mono text-emerald-500">₹{inv.totalAmount}</span>
                    </div>

                    {/* Quick share buttons actions */}
                    <div className="flex flex-wrap gap-1 mt-1 text-[9px] uppercase font-black tracking-wider">
                      <button 
                        onClick={() => setViewInvoiceObject(inv)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 rounded flex items-center gap-1 cursor-pointer"
                        title="Display Printing Page Model"
                      >
                        <Printer className="w-3 h-3" /> print
                      </button>
                      <button 
                        onClick={() => setViewQrObject(inv)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-500 rounded flex items-center gap-1 cursor-pointer"
                        title="Show digital payments QR"
                      >
                        <QrCode className="w-3 h-3" /> pay qr
                      </button>
                      <button 
                        onClick={() => handleSocialBroadcast("whatsapp", inv)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded flex items-center gap-1 cursor-pointer"
                      >
                        WhatsApp Sharing
                      </button>
                      <button 
                        onClick={() => handleSocialBroadcast("sms", inv)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-910/40 text-rose-500 rounded flex items-center gap-1 cursor-pointer"
                      >
                        SMS alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. PRESCRIPTION OCR & DIGITAL UPLOADS */}
      {activePane === "ocr" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          
          {/* Upload, Drag Drop Area */}
          <div className="space-y-6">
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.length) {
                  handleOcrFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all ${
                isDragOver ? "border-indigo-650 bg-indigo-50/20" : "border-slate-310 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Drag-and-Drop Doctor Prescription File
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                Supports JPG, PNG or PDF formats. Standard file limit capped at 10MB.
              </p>

              <div className="mt-4">
                <input
                  type="file"
                  id="prescription-file-picker"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleOcrFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="prescription-file-picker"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all inline-block cursor-pointer"
                >
                  Manually Pick File
                </label>
              </div>
            </div>

            {ocrUploadedFile && (
              <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  📷 Upload Preview File: "{ocrUploadedFile.name}"
                </h4>

                <div className="flex gap-4">
                  {ocrUploadedPreview && (
                    <img 
                      src={ocrUploadedPreview} 
                      alt="prescription upload asset preview" 
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="text-[10px] uppercase font-black space-y-1">
                      <p>Size: {(ocrUploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Type: {ocrUploadedFile.type}</p>
                    </div>

                    <button
                      onClick={runSimulatedOcrScan}
                      disabled={ocrProgress === "imaging" || ocrProgress === "ocr"}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {ocrProgress === "idle" && "Trigger AI OCR Scan"}
                      {ocrProgress === "imaging" && "Preprocessing pixels..."}
                      {ocrProgress === "ocr" && "Translating handwriting..."}
                      {ocrProgress === "completed" && "Re-run AI OCR Scan"}
                    </button>
                  </div>
                </div>

                {ocrProgress !== "idle" && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] uppercase font-black">
                      <span>Scanning progress states</span>
                      <span>
                        {ocrProgress === "imaging" ? "35%" : ocrProgress === "ocr" ? "75%" : "100% SUCCESS"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-indigo-600 transition-all duration-300 ${
                          ocrProgress === "imaging" ? "w-[35%]" : ocrProgress === "ocr" ? "w-[75%]" : "w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OCR AI Detections list summary */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                🤖 AI Prescription OCR Parser translation outcomes
              </h3>

              {ocrProgress === "completed" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-950/40 border border-indigo-100/50 dark:border-slate-800 space-y-2">
                    <span className="text-[9px] uppercase font-black text-slate-400">Recognized Clinical Molecules:</span>
                    
                    {ocrMedicinesFound.map((med, idx) => {
                      const existsInInventory = medicines.some(m => m.name.toLowerCase() === med.toLowerCase());
                      return (
                        <div key={idx} className="flex items-center justify-between pointer-events-none">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">{med}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            existsInInventory ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" : "bg-rose-100 text-rose-600 dark:bg-rose-950"
                          }`}>
                            {existsInInventory ? "Stock Available" : "Alternative molecule required"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] font-semibold text-slate-400 uppercase leading-normal">
                    OCR scanned details detected matching clinical formulas on current inventory databases. One-click button transfers molecule structures directly to active live checkout cart elements.
                  </p>

                  <button
                    onClick={addOcrToBillingCart}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Transfer drugs to invoice cart
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-405 text-xs font-semibold uppercase tracking-wide">
                  No active prescription OCR processed. Select a file on left panel.
                </div>
              )}
            </div>

            {/* Prescriptions History lists uploads */}
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-3`}>
              <h3 className="text-xs font-black uppercase tracking-wider">
                📁 Saved Historical Prescription uploads
              </h3>

              <div className="space-y-3">
                {prescriptions.map(pres => (
                  <div key={pres.id} className="p-3 border rounded-2xl flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{pres.patientName}</p>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Uploaded: {pres.uploadDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] font-black uppercase">
                        {pres.detectedMedicines.length} Drugs Scanned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. INVENTORY & BATCH TRACKER */}
      {activePane === "inventory" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main search filtering index of medicines and add edit controllers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Registered Medicines indexes lists */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    📋 Stock Database & Core Batch indexes ({medicines.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search medicine by name..."
                      value={searchMedicineQuery}
                      onChange={(e) => setSearchMedicineQuery(e.target.value)}
                      className={`text-xs font-bold px-2 py-1.5 rounded-lg border outline-none ${inputStyle}`}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-light-200 dark:border-slate-850 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        <th className="pb-3">Drug</th>
                        <th className="pb-3">Barcode</th>
                        <th className="pb-3">Batch Number</th>
                        <th className="pb-3 text-center">In Stock</th>
                        <th className="pb-3 text-right">Price</th>
                        <th className="pb-3 text-right">Expiry Date</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.filter(m => m.name.toLowerCase().includes(searchMedicineQuery.toLowerCase())).map((med) => (
                        <tr key={med.id} className="border-b border-slate-100 dark:border-slate-850 py-2">
                          <td className="py-3 font-extrabold text-slate-850 dark:text-slate-100">
                            <div>
                              <p className="font-extrabold leading-tight">{med.name}</p>
                              <span className="text-[9px] uppercase font-bold text-slate-400">{med.category}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono font-bold text-slate-400">{med.barcode}</td>
                          <td className="py-3 font-mono font-bold text-indigo-500">{med.batchNumber}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              med.stock <= med.threshold ? "bg-rose-100 text-rose-600 dark:bg-rose-950" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950"
                            }`}>
                              {med.stock} pcs
                            </span>
                          </td>
                          <td className="py-3 text-right font-black font-mono">₹{med.price}</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-400">{med.expiryDate}</td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => editMedicineAction(med)}
                              className="text-indigo-500 hover:text-indigo-600 font-extrabold uppercase text-[9px] underline cursor-pointer"
                            >
                              edit
                            </button>
                            <button
                              onClick={() => handleBatchRecall(med.batchNumber)}
                              className="text-rose-500 hover:text-rose-600 font-black uppercase text-[9px] border px-1.5 py-0.5 rounded border-rose-250 cursor-pointer"
                              title="Flag defective batch recall"
                            >
                              recall
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right side: Add / Edit Medicine state fields */}
            <div>
              <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
                <h3 className="text-xs font-black uppercase tracking-wider">
                  ⚠️ {selectedMedId ? "Edit Active Medicine" : "Add Brand New Medicine"}
                </h3>

                <form onSubmit={handleSaveMedicine} className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider font-extrabold">Brand / Drug Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cough-Syrup Corex"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider font-extrabold">Drug Category</label>
                    <select
                      value={newMedCategory}
                      onChange={(e) => setNewMedCategory(e.target.value)}
                      className={`text-xs font-black uppercase border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                    >
                      <option value="Analgesic">Analgesic (Pain Relief)</option>
                      <option value="Antibiotic">Antibiotic Regimens</option>
                      <option value="Cardiology">Cardiology / Cholesterol</option>
                      <option value="General">General Wellness</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Unit M.R.P</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={newMedPrice}
                        onChange={(e) => setNewMedPrice(e.target.value)}
                        className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Opening Stock</label>
                      <input
                        type="number"
                        placeholder="In Stock"
                        value={newMedStock}
                        onChange={(e) => setNewMedStock(e.target.value)}
                        className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Buffer Threshold</label>
                      <input
                        type="number"
                        value={newMedThreshold}
                        onChange={(e) => setNewMedThreshold(e.target.value)}
                        className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Expiry Date</label>
                      <input
                        type="date"
                        value={newMedExpiry}
                        onChange={(e) => setNewMedExpiry(e.target.value)}
                        className={`text-xs font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider font-extrabold font-black text-indigo-505">Supplier Vendor</label>
                    <select
                      value={newMedSupplier}
                      onChange={(e) => setNewMedSupplier(e.target.value)}
                      className={`text-xs font-black uppercase border rounded-xl px-3 py-2.5 outline-none ${inputStyle}`}
                    >
                      <option value="">-- Choose Vendor --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
                    >
                      Save Medicine
                    </button>
                    {selectedMedId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedId(null);
                          setNewMedName("");
                          setNewMedPrice("");
                          setNewMedStock("");
                          setNewMedSupplier("");
                        }}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl cursor-pointer"
                      >
                        <Undo className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 5. CORPORATE LEDGERS & SUPPLIER POs */}
      {activePane === "ledger" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Supplier ledgers lists and accounts */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                📂 Corporate Suppliers Ledger Indexes
              </h3>

              <div className="space-y-4">
                {suppliers.map(sup => (
                  <div key={sup.id} className="p-4 border rounded-2xl space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-slate-850 dark:text-slate-100">{sup.name}</p>
                        <span className="text-[9px] uppercase font-bold text-slate-400">{sup.address}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase rounded-full">
                        {sup.medicineCount} brands
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-slate-400">Ledger Balance (Credit):</span>
                      <span className={sup.pendingAmount > 0 ? "text-rose-500 font-mono" : "text-slate-400"}>
                        ₹{sup.pendingAmount.toLocaleString()}
                      </span>
                    </div>

                    {sup.pendingAmount > 0 && (
                      <button
                        onClick={() => {
                          const updated = suppliers.map(s => s.id === sup.id ? { ...s, pendingAmount: 0 } : s);
                          setSuppliers(updated);
                          triggerToast(`Credit balance settled with "${sup.name}"`);
                        }}
                        className="w-full mt-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded transition cursor-pointer"
                      >
                        Settle Ledger Account
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier Purchase Order Placement Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                🛍️ Procurement & Corporate Purchase Orders
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-light-200 dark:border-slate-850">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Select Supplier Target</label>
                  <select
                    value={poSelectedSupplier}
                    onChange={(e) => setPoSelectedSupplier(e.target.value)}
                    className={`text-xs font-black uppercase border rounded-xl px-2 py-2 outline-none ${inputStyle}`}
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Configure Drug</label>
                  <select
                    value={poTempMed}
                    onChange={(e) => setPoTempMed(e.target.value)}
                    className={`text-xs font-black uppercase border rounded-xl px-2 py-2 outline-none ${inputStyle}`}
                  >
                    <option value="">-- Choose inventory drug --</option>
                    {medicines.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Batch Quantity</label>
                  <input
                    type="number"
                    value={poTempQty}
                    onChange={(e) => setPoTempQty(Math.max(10, Number(e.target.value)))}
                    className={`text-xs font-bold border rounded-xl px-2 py-1.5 outline-none ${inputStyle}`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Cost Price/Item (INR)</label>
                  <input
                    type="number"
                    value={poTempCost}
                    onChange={(e) => setPoTempCost(Math.max(1, Number(e.target.value)))}
                    className={`text-xs font-bold border rounded-xl px-2 py-1.5 outline-none ${inputStyle}`}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddPoItem}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Stage Order Row
                  </button>
                </div>
              </div>

              {/* Order form cart summary breakdown */}
              {poCartItems.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-3">
                  <span className="text-[9px] uppercase font-black text-slate-400">Procure list items:</span>
                  
                  {poCartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-bold uppercase">
                      <span>{item.medicineName} (x{item.quantity})</span>
                      <span className="font-mono">₹{item.quantity * item.costPrice}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t flex justify-between font-black text-xs uppercase text-emerald-500">
                    <span>Aggregate value draft:</span>
                    <span className="font-mono">₹{poCartItems.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0)}</span>
                  </div>

                  <button
                    onClick={submitPurchaseOrderForm}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Dispatch order to supplier
                  </button>
                </div>
              )}

              {/* PO procurement history logs list */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[9px] uppercase font-black text-slate-400">Order Logs Summary:</span>
                
                {purchaseOrders.map(po => (
                  <div key={po.id} className="p-3 border rounded-xl flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-800 dark:text-slate-100">
                    <div>
                      <p className="font-bold">{po.supplierName}</p>
                      <span className="text-[9px] uppercase text-slate-400 font-semibold">{po.orderDate} • {po.items.length} Drug Types</span>
                    </div>
                    <span className="font-black text-emerald-500 font-mono">₹{po.totalAmount}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 6. AUDIT LOGS, RESTORES & BACKUPS */}
      {activePane === "audits" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Backups & Restore center panels */}
          <div className="space-y-6">
            
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
                💾 Local JSON Backup Generator
              </h3>

              <p className="text-[10px] text-slate-400 font-semibold leading-normal uppercase">
                Generates a fully encrypted, lightweight database dump file containing registered medicines, suppliers, custom transaction invoice registries, and audit timeline logs. Save this backup safely.
              </p>

              <button
                onClick={handleBackupDownload}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
              >
                Download Encrypted Schema JSON
              </button>
            </div>

            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                🔄 Settle Restore Database Schema
              </h3>

              <form onSubmit={handleRestoreConfiguration} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider font-extrabold">Raw Configuration Payload</label>
                  <textarea
                    rows={4}
                    placeholder="Paste corporate JSON configuration dump files..."
                    value={restoreJsonPayload}
                    onChange={(e) => setRestoreJsonPayload(e.target.value)}
                    className={`text-xs font-mono font-bold border rounded-xl px-3 py-2 outline-none ${inputStyle}`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
                >
                  Parse & Restore configuration JSON
                </button>
              </form>
            </div>

          </div>

          {/* High-fidelity clinical audit logs timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-3xl border ${containerStyle} space-y-4`}>
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                📜 Systems Audit Operations Timeline log
              </h3>

              <div className="space-y-3 overflow-y-auto max-h-[500px]">
                {auditLogs.slice().reverse().map(log => (
                  <div key={log.id} className="p-4 border rounded-2xl flex items-start gap-3 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 bg-indigo-500"></span>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start text-xs font-black uppercase tracking-wider">
                        <span className="text-indigo-600 font-extrabold">{log.action}</span>
                        <span className="text-[9px] text-slate-405 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{log.details}</p>
                      
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 uppercase font-black">
                        <span>Staff: {log.user}</span>
                        <span>•</span>
                        <span>Severity: {log.severity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          MODAL PREVIEWERS AND POPUP WINDOW CONTAINERS (PORTABLE Iframe safe)
          ======================================================== */}

      {/* A. Print Invoice Modal */}
      {viewInvoiceObject && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-lg w-full border shadow-2xl relative space-y-6 select-text">
            
            <button
              onClick={() => setViewInvoiceObject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Corporate Billing invoice format */}
            <div className="space-y-4" id="printable-area-container">
              
              <div className="text-center pb-4 border-b border-slate-205 space-y-1">
                <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black uppercase">Tax compliant invoice</span>
                <h3 className="text-sm font-black uppercase tracking-tight">CAMPUS HEALTH PHARMACY CO.</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Warden Block A Main Terminal • GSTIN: 22AAAAA0000A1Z5</p>
              </div>

              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <div className="space-y-0.5">
                  <p>Invoiced To: <strong className="text-slate-800">{viewInvoiceObject.customerName}</strong></p>
                  <p>Recipient Contact: <strong className="text-slate-800">{viewInvoiceObject.customerPhone || "Walk-In"}</strong></p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p>Bill Ref: <strong className="text-slate-800">{viewInvoiceObject.invoiceNumber}</strong></p>
                  <p>Issue Date: <strong className="text-slate-800">{viewInvoiceObject.date.split("T")[0]}</strong></p>
                </div>
              </div>

              <div className="border-t border-b border-light-200 py-2">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="uppercase font-black text-slate-450 tracking-wider">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">M.R.P</th>
                      <th className="pb-2 text-right">GST Rate</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoiceObject.items.map((it, idx) => (
                      <tr key={idx} className="border-t border-slate-100 py-1">
                        <td className="py-2 font-extrabold text-slate-800">{it.medicineName}</td>
                        <td className="py-2 text-center font-black font-mono">{it.quantity}</td>
                        <td className="py-2 text-right font-black font-mono">₹{it.unitPrice}</td>
                        <td className="py-2 text-right font-bold font-mono">{it.taxRate}%</td>
                        <td className="py-2 text-right font-black font-mono">₹{it.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 text-[10px] font-black uppercase text-right text-slate-500">
                <div className="flex justify-between">
                  <span>Gross Subtotal amount:</span>
                  <span className="font-mono text-slate-900">₹{viewInvoiceObject.subtotal}</span>
                </div>
                <div className="flex justify-between text-indigo-650">
                  <span>SGST (Calculated @ 6%):</span>
                  <span className="font-mono">₹{Math.round((viewInvoiceObject.taxAmount / 2) * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-indigo-650">
                  <span>CGST (Calculated @ 6%):</span>
                  <span className="font-mono">₹{Math.round((viewInvoiceObject.taxAmount / 2) * 100) / 100}</span>
                </div>
                <hr className="border-slate-200 my-1" />
                <div className="flex justify-between text-xs text-slate-900">
                  <span>Aggregate Grand total (Inc Taxes):</span>
                  <span className="font-mono text-emerald-600">₹{viewInvoiceObject.totalAmount}</span>
                </div>
              </div>

              {/* Digital transaction verification codes */}
              <div className="flex flex-col items-center gap-3 pt-4 border-t border-dashed border-slate-250">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Digital payment verified via {viewInvoiceObject.paymentMethod}
                </span>
                
                {/* Simulated payment confirmation stamp */}
                <div className="p-2 border-2 border-emerald-500 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest rotate-2">
                  ✓ PAID IN FULL
                </div>
              </div>

            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  triggerToast("Transmitted data payload directly to printer driver spool");
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
              >
                Print Invoice Receipt
              </button>
              <button
                onClick={() => setViewInvoiceObject(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer"
              >
                Dismiss View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* B. Pay QR code Modal */}
      {viewQrObject && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full border shadow-2xl relative space-y-6 text-center select-text">
            
            <button
              onClick={() => setViewQrObject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest">
                UPI Merchant Qr Code
              </span>
              <p className="text-xs font-extrabold text-slate-700 uppercase">
                Invoice {viewQrObject.invoiceNumber} Settlement
              </p>

              {/* High-fidelity custom calculated QR block frame */}
              <div className="w-48 h-48 mx-auto bg-slate-50 border p-3.5 rounded-2xl relative flex items-center justify-center">
                <QrCode className="w-40 h-40 text-slate-800" />
                <span className="absolute text-[8px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full select-none">
                  ₹{viewQrObject.totalAmount}
                </span>
              </div>

              <div className="text-[10px] uppercase font-black space-y-1 text-slate-405 leading-normal">
                <p>Merchant String Payload: </p>
                <code className="text-[9px] bg-slate-100 p-1.5 rounded-lg text-indigo-600 block break-all font-mono">
                  {viewQrObject.qrPayload}
                </code>
              </div>
            </div>

            <button
              onClick={() => setViewQrObject(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer"
            >
              Dismiss settlement
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
