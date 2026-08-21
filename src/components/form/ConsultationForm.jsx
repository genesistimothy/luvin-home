import { useState } from "react";
import { CheckCircle2, MessageCircle, Paperclip, XCircle } from "lucide-react";
import FormField, { fieldInputClass } from "./FormField";
import { isValidContact } from "../../lib/validate";
import { parseJsonSafe } from "../../lib/api";
import { createWhatsAppLink } from "../../config/contact";

const ROOM_TYPES = ["Ruang Tamu", "Ruang Makan", "Kamar Tidur", "Dapur", "Ruang Kerja", "Lainnya"];
const BUDGET_RANGES = ["< Rp 10 juta", "Rp 10–30 juta", "Rp 30–75 juta", "> Rp 75 juta", "Belum yakin"];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialForm = { name: "", contact: "", roomType: ROOM_TYPES[0], budgetRange: BUDGET_RANGES[0], message: "" };

export default function ConsultationForm({ serviceName, serviceSlug, whatsAppNumber }) {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      setFileError("");
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      setFile(null);
      setFileError("Gunakan gambar JPG, PNG, atau WebP.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setFile(null);
      setFileError("Ukuran gambar maksimal 4 MB.");
      return;
    }
    setFile(selected);
    setFileError("");
  };

  const validate = () => {
    const nextErrors = /** @type {Record<string, string>} */ ({});
    if (!form.name.trim()) nextErrors.name = "Nama wajib diisi.";
    if (!isValidContact(form.contact)) nextErrors.contact = "Masukkan email atau nomor WhatsApp yang valid.";
    if (!form.message.trim()) nextErrors.message = "Ceritakan kebutuhan Anda secara singkat.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("submitting");
    try {
      let referenceImageAssetId = "";
      if (file) {
        const uploadResponse = await fetch("/api/inquiry-upload", {
          method: "POST",
          headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
          body: file,
        });
        const uploadData = await parseJsonSafe(uploadResponse);
        if (!uploadResponse.ok) throw new Error(uploadData.error || "Unggah gambar gagal.");
        referenceImageAssetId = uploadData.assetId;
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service",
          serviceName,
          serviceSlug,
          referenceImageAssetId,
          company: "",
          ...form,
        }),
      });
      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data.error || "Gagal mengirim permintaan.");

      setStatus("success");
      setForm(initialForm);
      setFile(null);
    } catch (error) {
      setStatus("error");
      setServerError(error.message || "Gagal mengirim permintaan. Silakan coba lagi.");
    }
  };

  if (status === "success") {
    const followUpMessage = `Halo Luvin Home, saya baru saja mengirimkan permintaan konsultasi untuk layanan ${serviceName}. Nama saya ${form.name || ""}.`;
    return (
      <div className="rounded-[1.5rem] border border-clay/30 bg-linen p-8 text-center">
        <CheckCircle2 className="mx-auto text-clay" size={40} />
        <h3 className="mt-4 font-display text-2xl text-cocoa">Permintaan Terkirim</h3>
        <p className="mt-2 text-cocoa/[0.68]">Tim kami akan menghubungi Anda segera. Anda juga bisa langsung chat via WhatsApp.</p>
        <a
          href={createWhatsAppLink(followUpMessage, whatsAppNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="premium-button mt-6 inline-flex items-center gap-2 bg-cocoa px-6 py-3.5 text-sm font-bold text-cream hover:bg-umber"
        >
          <MessageCircle size={18} /> Lanjutkan via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.5rem] border border-oat/[0.55] bg-cream p-6 sm:p-8" noValidate>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
        onChange={updateField("company")}
      />

      <FormField label="Nama" htmlFor="consult-name" error={errors.name}>
        <input
          id="consult-name"
          type="text"
          value={form.name}
          onChange={updateField("name")}
          className={fieldInputClass}
          placeholder="Nama lengkap"
        />
      </FormField>

      <FormField label="Kontak (Email / No. WhatsApp)" htmlFor="consult-contact" error={errors.contact}>
        <input
          id="consult-contact"
          type="text"
          value={form.contact}
          onChange={updateField("contact")}
          className={fieldInputClass}
          placeholder="nama@email.com atau 08xxxxxxxxxx"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Jenis Ruangan" htmlFor="consult-room">
          <select id="consult-room" value={form.roomType} onChange={updateField("roomType")} className={fieldInputClass}>
            {ROOM_TYPES.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Perkiraan Anggaran" htmlFor="consult-budget">
          <select id="consult-budget" value={form.budgetRange} onChange={updateField("budgetRange")} className={fieldInputClass}>
            {BUDGET_RANGES.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Ceritakan Kebutuhan Anda" htmlFor="consult-message" error={errors.message}>
        <textarea
          id="consult-message"
          rows={4}
          value={form.message}
          onChange={updateField("message")}
          className={fieldInputClass}
          placeholder={`Saya tertarik dengan layanan ${serviceName}...`}
        />
      </FormField>

      <FormField label="Foto Referensi (Opsional)" htmlFor="consult-file" error={fileError} hint="JPG, PNG, atau WebP. Maksimal 4 MB.">
        <label
          htmlFor="consult-file"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-oat/70 bg-white/50 px-4 py-3 text-sm text-cocoa/[0.65] hover:border-clay/40"
        >
          <Paperclip size={16} />
          {file ? file.name : "Pilih gambar referensi"}
        </label>
        <input id="consult-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      </FormField>

      {status === "error" && (
        <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
          <XCircle size={16} /> {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="premium-button inline-flex w-full items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Mengirim..." : "Kirim Permintaan Konsultasi"}
      </button>
    </form>
  );
}
