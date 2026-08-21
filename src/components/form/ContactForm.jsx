import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import FormField, { fieldInputClass } from "./FormField";
import { isValidEmail } from "../../lib/validate";
import { parseJsonSafe } from "../../lib/api";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const validate = () => {
    const nextErrors = /** @type {Record<string, string>} */ ({});
    if (!form.name.trim()) nextErrors.name = "Nama wajib diisi.";
    if (!isValidEmail(form.email)) nextErrors.email = "Masukkan alamat email yang valid.";
    if (!form.message.trim()) nextErrors.message = "Pesan wajib diisi.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.name,
          contact: form.email,
          message: `${form.message}${form.phone.trim() ? `\n\nTelepon: ${form.phone.trim()}` : ""}`,
          company,
        }),
      });
      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data.error || "Gagal mengirim pesan.");

      setStatus("success");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setServerError(error.message || "Gagal mengirim pesan. Silakan coba lagi.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[1.5rem] border border-clay/30 bg-linen p-8 text-center">
        <CheckCircle2 className="mx-auto text-clay" size={40} />
        <h3 className="mt-4 font-display text-2xl text-cocoa">Pesan Terkirim</h3>
        <p className="mt-2 text-cocoa/[0.68]">Terima kasih sudah menghubungi kami. Tim Luvin Home akan membalas secepatnya.</p>
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
        value={company}
        onChange={(event) => setCompany(event.target.value)}
      />

      <FormField label="Nama" htmlFor="contact-name" error={errors.name}>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={updateField("name")}
          className={fieldInputClass}
          placeholder="Nama lengkap"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Email" htmlFor="contact-email" error={errors.email}>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={updateField("email")}
            className={fieldInputClass}
            placeholder="nama@email.com"
          />
        </FormField>
        <FormField label="No. Telepon (Opsional)" htmlFor="contact-phone">
          <input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={updateField("phone")}
            className={fieldInputClass}
            placeholder="08xxxxxxxxxx"
          />
        </FormField>
      </div>

      <FormField label="Pesan" htmlFor="contact-message" error={errors.message}>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={updateField("message")}
          className={fieldInputClass}
          placeholder="Tulis pesan Anda..."
        />
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
        {status === "submitting" ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  );
}
