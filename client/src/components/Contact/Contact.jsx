import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Contact.css";

const defaultSettings = {
  academyName: "Rajratna Martial Arts & Fitness Academy",
  contactHeading: "Start Your Martial Arts Journey Today",
  contactDescription: "Join Rajratna Martial Arts & Fitness Academy.",
  phone: "",
  email: "",
  address: "",
  whatsapp: "",
};

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [settings, setSettings] = useState(defaultSettings);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    api.get("/site-settings")
      .then(({ data }) => setSettings({ ...defaultSettings, ...data.settings }))
      .catch(() => {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    try {
      const { data } = await api.post("/contact", formData);
      setFeedback(data.message || "Your message has been sent.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappNumber = (settings.whatsapp || settings.phone).replace(/\D/g, "");
  const mapUrl = settings.mapEmbedUrl?.trim();

  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        <div className="contact-info">
          <p className="section-tag">Contact Us</p>
          <h2>{settings.contactHeading}</h2>
          <p>{settings.contactDescription}</p>
          <div className="contact-details">
            {settings.phone && <a href={`tel:${settings.phone}`}>Phone: {settings.phone}</a>}
            {settings.email && <a href={`mailto:${settings.email}`}>Email: {settings.email}</a>}
            {settings.address && mapUrl ? (
              <a href={mapUrl} target="_blank" rel="noreferrer">Address: {settings.address}</a>
            ) : (
              settings.address && <p>Address: {settings.address}</p>
            )}
            {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>}
          </div>
          {mapUrl && (
            <div className="contact-map">
              <iframe
                src={mapUrl}
                title="Location map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        <div className="contact-form">
          <h3>Send us a message</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            <textarea name="message" placeholder="Your Message" rows="5" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
            <button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send Message"}</button>
            {feedback && <p className="contact-feedback">{feedback}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
