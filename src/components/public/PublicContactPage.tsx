import { useState } from "react";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

export default function PublicContactPage() {
  const school = dataService.getSchoolInfo();
  const [sent, setSent] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      alert("Please fill in your name, phone number, and message.");
      return;
    }
    setIsSubmitting(true);
    const newInquiry = dataService.addInquiry({
      name: form.name,
      email: form.email || "Not provided",
      phone: form.phone,
      message: form.message,
    });

    setInquiryId(newInquiry.id);
    setIsSubmitting(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Contact & Location Details
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            Get in touch with our admissions counsellors and administrative office.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8">
        {/* Contact Details Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>
              Reach Us Directly
            </h2>
            <p className="text-xs text-slate-500 mt-1">Our front desk operates Monday to Saturday from 8:00 AM to 4:00 PM.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100/50 p-1.5 flex items-center justify-center flex-shrink-0">
                <img src={LOGOS.location} alt="Location" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Campus Address</div>
                <div className="text-slate-600 mt-0.5 leading-relaxed">{school.address}</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100/50 p-1.5 flex items-center justify-center flex-shrink-0">
                <img src={LOGOS.contacts} alt="Phone" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Admissions Helpline</div>
                <div className="text-slate-600 font-mono mt-0.5">{school.phone}</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100/50 p-1.5 flex items-center justify-center flex-shrink-0 text-sm">
                ✉️
              </div>
              <div>
                <div className="font-bold text-slate-900">Email Inquiry</div>
                <div className="text-slate-600 mt-0.5">{school.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Send Inquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "DM Serif Display, serif" }}>
            Send an Online Inquiry
          </h2>
          <p className="text-xs text-slate-500 mb-6">Our admission team will revert within 24 business hours.</p>

          {sent ? (
            <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center text-green-900 space-y-3">
              <div className="text-3xl">🎉</div>
              <div className="font-bold text-base">Inquiry Message Received!</div>
              <p className="text-xs text-green-700 max-w-md mx-auto">
                Thank you for reaching out to Nalanda International School. Your inquiry has been dispatched to our admissions team.
              </p>
              {inquiryId && (
                <div className="bg-white/80 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-green-800 inline-block">
                  Reference ID: {inquiryId}
                </div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", phone: "", message: "" });
                  }}
                  className="px-4 py-2 bg-green-700 text-white rounded-xl text-xs font-semibold hover:bg-green-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="e.g. Vikram Verma"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                  placeholder="parent@example.com"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Your Question / Inquiry *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none resize-none leading-relaxed"
                  placeholder="Ask about class vacancies, curriculum, transportation..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-sm"
                style={{ background: "var(--primary)" }}
              >
                Submit Inquiry →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
