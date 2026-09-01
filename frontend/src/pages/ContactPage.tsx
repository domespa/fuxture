import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Validazione form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Il nome è obbligatorio";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Il nome deve contenere almeno 2 caratteri";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Inserisci un'email valida";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "L'oggetto è obbligatorio";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "L'oggetto deve contenere almeno 5 caratteri";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Il messaggio è obbligatorio";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Il messaggio deve contenere almeno 20 caratteri";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Rimuovi errore del campo quando l'utente inizia a digitare
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Errore nell'invio del messaggio");
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset success message dopo 5 secondi
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Errore invio form contatto:", error);
      setSubmitStatus("error");

      // Reset error message dopo 5 secondi
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contattaci</h1>
          <p className="text-gray-600 text-lg">
            Hai domande, suggerimenti o vuoi collaborare con noi?
          </p>
          <p className="text-gray-600">
            Compila il form qui sotto e ti risponderemo al più presto!
          </p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === "success" && (
          <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8 rounded-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">
                  Messaggio inviato con successo!
                </h3>
                <p className="text-green-800 text-sm">
                  Grazie per averci contattato. Ti risponderemo entro 24-48 ore
                  all'indirizzo email che hai fornito.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  Errore nell'invio
                </h3>
                <p className="text-red-800 text-sm">
                  Si è verificato un errore durante l'invio del messaggio.
                  Riprova più tardi o contattaci direttamente via email.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Invia un Messaggio
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Il tuo nome"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="tuaemail@esempio.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Oggetto */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Oggetto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.subject
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Di cosa vuoi parlare?"
                  />
                  {errors.subject && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Messaggio */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Messaggio *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                      errors.message
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Scrivi qui il tuo messaggio... (minimo 10 caratteri)"
                  />
                  {errors.message && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.message.length} / 1000
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Invia Messaggio
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  * Campi obbligatori
                </p>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Email Diretta */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <Mail className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Email Diretta</h3>
              <a
                href="mailto:info@fuxture.net"
                className="text-blue-600 hover:underline font-medium"
              >
                info@fuxture.net
              </a>
              <p className="text-sm text-gray-600 mt-2">
                Puoi anche inviarci un'email direttamente a questo indirizzo.
              </p>
            </div>

            {/* Località */}
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-600">
              <MapPin className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Dove Siamo</h3>
              <p className="text-gray-700">
                <strong>Domenico Spampinato</strong>
                <br />
                Carlentini, Italia
                <br />
                P.IVA: IT01937400891
              </p>
            </div>

            {/* Tempo di Risposta */}
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
              <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">
                Tempo di Risposta
              </h3>
              <p className="text-gray-700 text-sm">
                Ci impegniamo a rispondere a tutte le richieste entro{" "}
                <strong>24-48 ore</strong> durante i giorni lavorativi.
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-100 p-5 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Informativa Privacy:</strong> I tuoi dati saranno
                utilizzati esclusivamente per rispondere alla tua richiesta.
                Consulta la nostra{" "}
                <Link to="/privacy-policy" className="text-blue-600 underline">
                  Privacy Policy
                </Link>{" "}
                per maggiori dettagli.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              ← Torna alla Homepage
            </Link>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                to="/privacy-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/cookie-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Cookie Policy
              </Link>
              <Link
                to="/terms"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
