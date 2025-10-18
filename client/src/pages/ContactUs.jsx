import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const ContactUs = () => {
  const { axios } = useAppContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const { data } = await axios.post("/api/contact", formData);
      if (data.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (err) {
      toast.error("Something went wrong. Try again later.");
      console.log(err);
    }
  };

  return (
    <div className="mt-20 px-3 sm:px-6 md:px-16">
      {/* Heading */}
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold uppercase tracking-wide text-center">
            Contact Us
        </h1>
        <div className="w-20 h-1 bg-primary rounded-full mt-2"></div>
        <p className="text-gray-500 mt-2 text-center">
            Have questions, suggestions, or feedback? We’d love to hear from you.
        </p>
    </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-6 mt-10 rounded shadow-md max-w-2xl mx-auto"
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name *"
          value={formData.name}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email *"
          value={formData.email}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          name="message"
          placeholder="Message *"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <button
          type="submit"
          className="bg-primary text-white py-3 rounded hover:bg-dull-primary transition"
        >
          Send Message
        </button>
      </form>
      <div className="mt-16 max-w-2xl mx-auto text-center text-gray-600">
        <p>Email: support@example.com</p>
        <p>Phone: +91 1234567890</p>
        <p>Address: 123, Main Street, Your City</p>
      </div>
    </div>
  );
};

export default ContactUs;
