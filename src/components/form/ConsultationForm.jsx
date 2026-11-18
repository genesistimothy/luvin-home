import { useState } from "react";
import { CheckCircle2, LoaderCircle, MessageCircle, Paperclip, XCircle } from "lucide-react";
import FormField, { fieldInputClass } from "./FormField";
import TurnstileWidget from "./TurnstileWidget";
import { isValidContact } from "../../lib/validate";
import { parseJsonSafe } from "../../lib/api";
import { createWhatsAppLink } from "../../config/contact";

const ROOM_TYPES = ["Living Room", "Dining Room", "Bedroom", "Kitchen", "Workspace", "Other"];
const BUDGET_RANGES = ["< Rp 10 million", "Rp 10–30 million", "Rp 30–75 million", "> Rp 75 million", "Not sure yet"];
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
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

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
      setFileError("Please use a JPG, PNG, or WebP image.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setFile(null);
      setFileError("Image size must be 4 MB or less.");
      return;
    }
    setFile(selected);
    setFileError("");
  };

  const validate = () => {
    const nextErrors = /** @type {Record<string, string>} */ ({});
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!isValidContact(form.contact)) nextErrors.contact = "Enter a valid email or WhatsApp number.";
    if (!form.message.trim()) nextErrors.message = "Tell us briefly about what you need.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setStatus("submitting");
    try {
      let referenceImagePath = "";
      if (file) {
        const uploadResponse = await fetch("/api/inquiry-upload", {
          method: "POST",
          headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
          body: file,
        });
        const uploadData = await parseJsonSafe(uploadResponse);
        if (!uploadResponse.ok) throw new Error(uploadData.error || "Image upload failed.");
        referenceImagePath = uploadData.path;
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service",
          serviceName,
          serviceSlug,
          referenceImagePath,
          company: "",
          turnstileToken,
          ...form,
        }),
      });
      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data.error || "Failed to send your request.");

      setStatus("success");
      setForm(initialForm);
      setFile(null);
      setTurnstileToken("");
      setTurnstileKey((key) => key + 1);
    } catch (error) {
      setStatus("error");
      setTurnstileToken("");
      setTurnstileKey((key) => key + 1);
      setServerError(error.message || "Failed to send your request. Please try again.");
    }
  };

  if (status === "success") {
    const followUpMessage = `Hello Luvin Home, I just submitted a consultation request for the ${serviceName} service. My name is ${form.name || ""}.`;
    return (
      <div className="rounded-[1.5rem] border border-clay/30 bg-linen p-8 text-center">
        <CheckCircle2 className="mx-auto text-clay-strong" size={40} />
        <h3 className="mt-4 font-display text-2xl text-cocoa">Request Sent</h3>
        <p className="mt-2 text-cocoa/[0.68]">Our team will reach out to you shortly. You can also chat with us directly on WhatsApp.</p>
        <a
          href={createWhatsAppLink(followUpMessage, whatsAppNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="premium-button mt-6 inline-flex items-center gap-2 bg-cocoa px-6 py-3.5 text-sm font-bold text-cream hover:bg-umber"
        >
          <MessageCircle size={18} /> Continue on WhatsApp
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

      <FormField label="Name" htmlFor="consult-name" error={errors.name}>
        <input
          id="consult-name"
          type="text"
          value={form.name}
          onChange={updateField("name")}
          className={fieldInputClass}
          placeholder="Full name"
        />
      </FormField>

      <FormField label="Contact (Email / WhatsApp Number)" htmlFor="consult-contact" error={errors.contact}>
        <input
          id="consult-contact"
          type="text"
          value={form.contact}
          onChange={updateField("contact")}
          className={fieldInputClass}
          placeholder="name@email.com or 08xxxxxxxxxx"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Room Type" htmlFor="consult-room">
          <select id="consult-room" value={form.roomType} onChange={updateField("roomType")} className={fieldInputClass}>
            {ROOM_TYPES.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Estimated Budget" htmlFor="consult-budget">
          <select id="consult-budget" value={form.budgetRange} onChange={updateField("budgetRange")} className={fieldInputClass}>
            {BUDGET_RANGES.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Tell Us What You Need" htmlFor="consult-message" error={errors.message}>
        <textarea
          id="consult-message"
          rows={4}
          value={form.message}
          onChange={updateField("message")}
          className={fieldInputClass}
          placeholder={`I'm interested in the ${serviceName} service...`}
        />
      </FormField>

      <FormField label="Reference Photo (Optional)" htmlFor="consult-file" error={fileError} hint="JPG, PNG, or WebP. Max 4 MB.">
        <label
          htmlFor="consult-file"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-oat/70 bg-white/50 px-4 py-3 text-sm text-cocoa/70 hover:border-clay/40"
        >
          <Paperclip size={16} />
          {file ? file.name : "Choose a reference image"}
        </label>
        <input id="consult-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      </FormField>

      {status === "error" && (
        <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
          <XCircle size={16} /> {serverError}
        </p>
      )}

      <TurnstileWidget key={turnstileKey} onToken={setTurnstileToken} />

      <button
        type="submit"
        disabled={status === "submitting"}
        aria-busy={status === "submitting"}
        className="premium-button inline-flex w-full items-center justify-center gap-2 bg-cocoa px-7 py-4 text-sm font-bold text-cream hover:bg-clay disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <LoaderCircle className="motion-safe:animate-spin" size={16} aria-hidden="true" /> Sending...
          </>
        ) : (
          "Send Consultation Request"
        )}
      </button>
    </form>
  );
}
