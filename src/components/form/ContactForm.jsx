import { useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import FormField, { fieldInputClass } from "./FormField";
import TurnstileWidget from "./TurnstileWidget";
import { isValidEmail, isValidPhone } from "../../lib/validate";
import { parseJsonSafe } from "../../lib/api";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const validate = () => {
    const nextErrors = /** @type {Record<string, string>} */ ({});
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!isValidEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (form.phone.trim() && !isValidPhone(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
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
          message: `${form.message}${form.phone.trim() ? `\n\nPhone: ${form.phone.trim()}` : ""}`,
          company,
          turnstileToken,
        }),
      });
      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(data.error || "Failed to send your message.");

      setStatus("success");
      setForm(initialForm);
      setTurnstileToken("");
      setTurnstileKey((key) => key + 1);
    } catch (error) {
      setStatus("error");
      setTurnstileToken("");
      setTurnstileKey((key) => key + 1);
      setServerError(error.message || "Failed to send your message. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[1.5rem] border border-clay/30 bg-linen p-8 text-center">
        <CheckCircle2 className="mx-auto text-clay-strong" size={40} />
        <h3 className="mt-4 font-display text-2xl text-cocoa">Message Sent</h3>
        <p className="mt-2 text-cocoa/[0.68]">Thank you for reaching out. The Luvin Home team will get back to you soon.</p>
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

      <FormField label="Name" htmlFor="contact-name" error={errors.name}>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={updateField("name")}
          className={fieldInputClass}
          placeholder="Full name"
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
            placeholder="name@email.com"
          />
        </FormField>
        <FormField label="Phone Number (Optional)" htmlFor="contact-phone" error={errors.phone}>
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

      <FormField label="Message" htmlFor="contact-message" error={errors.message}>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={updateField("message")}
          className={fieldInputClass}
          placeholder="Write your message..."
        />
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
          "Send Message"
        )}
      </button>
    </form>
  );
}
