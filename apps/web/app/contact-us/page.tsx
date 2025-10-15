"use client";
import Footer from "@/components/footer";
import { motion } from "motion/react";
import { useState } from "react";
import logo from "@/public/dark-logo.png"
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if(loading) return
    e.preventDefault();
    try {
      console.log(formData)
    } catch (error) {
      console.error(error, "error")
    }finally{
      setLoading(false)
    }
    // TODO: integrate with backend or Supabase
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-indigo-50 to-white text-center overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold mb-4"
          >
            Contact <span className="text-indigo-600">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Got questions, feedback, or ideas? We’d love to hear from you!  
            Our team is always ready to collaborate and support your AI-powered creative journey.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div  className="w-full rounded-2xl flex justify-center object-cover"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}>
            <Image src={logo} alt="Logo" width={100} height={100} />
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-semibold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Message</label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={5}
                  placeholder="Write your message here..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors duration-200 w-full"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Contact Info / Community Links */}
      {/* <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold mb-8"
          >
            Other Ways to Reach Us
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💬",
                title: "Join Our Discord",
                text: "Collaborate and chat with the TryScript.ai community.",
                link: "https://discord.gg/k9sZcq2gNG",
              },
              {
                icon: "📧",
                title: "Email Support",
                text: "Reach out to us anytime at support@tryscript.ai.",
                link: "mailto:support@tryscript.ai",
              },
              {
                icon: "🌐",
                title: "GitHub",
                text: "Contribute to our open-source codebase and explore our projects.",
                link: "https://github.com/scriptaiapp/scriptai",
              },
            ].map((item, idx) => (
              <motion.a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className="block bg-white rounded-2xl shadow p-6 border hover:shadow-md transition-all duration-200"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-indigo-600">{item.title}</h3>
                <p className="text-gray-700">{item.text}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section> */}
      <Footer />
    </div>
  );
}
