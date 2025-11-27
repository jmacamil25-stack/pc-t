
import React, { useState } from 'react';
import Button from '../ui/Button';
import { Phone, Mail, Clock, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const ContactPage: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    try {
      await api.submitContactForm(formData);
      setFormStatus('success');
    } catch (error) {
      console.error("Failed to send message", error);
      setFormStatus('idle'); // Ideally show an error state here
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#002B60]">Get in Touch</h1>
        <p className="mt-2 text-lg text-gray-600">We'd love to hear from you. Reach out with any questions or to schedule a test drive.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold text-[#002B60] mb-6">Send Us a Message</h2>
          {formStatus === 'success' ? (
            <div className="text-center py-10 bg-green-50 text-green-800 rounded-lg border border-green-100 animate-fade-in">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold">Message Sent!</h3>
              <p className="mt-2">Thank you for contacting us. A member of our team will get back to you shortly.</p>
              <button onClick={() => setFormStatus('idle')} className="mt-6 text-[#1E63FF] font-medium hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  disabled={formStatus === 'submitting'}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  disabled={formStatus === 'submitting'}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={formStatus === 'submitting'}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  value={formData.message}
                  onChange={handleInputChange}
                  required 
                  disabled={formStatus === 'submitting'}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
                ></textarea>
              </div>
              <Button type="submit" className="w-full flex justify-center items-center" disabled={formStatus === 'submitting'}>
                {formStatus === 'submitting' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
                  </>
                ) : 'Submit'}
              </Button>
            </form>
          )}
        </div>
        
        {/* Dealership Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#002B60] mb-4">Contact Information</h2>
            <div className="space-y-3 text-lg text-gray-700">
              <p className="flex items-center"><MapPin className="w-6 h-6 mr-3 text-[#1E63FF]" />456 Highway 99 N, Eugene, OR 97402</p>
              <p className="flex items-center"><Phone className="w-6 h-6 mr-3 text-[#1E63FF]" />(541) 555-0199</p>
              <p className="flex items-center"><Mail className="w-6 h-6 mr-3 text-[#1E63FF]" />sales@pacificcarsandtrucks.com</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#002B60] mb-4">Business Hours</h2>
            <div className="space-y-2 text-lg text-gray-700">
                <p className="flex items-center"><Clock className="w-6 h-6 mr-3 text-[#1E63FF]" />Monday - Friday: 9:00 AM - 7:00 PM</p>
                <p className="flex items-center"><Clock className="w-6 h-6 mr-3 text-[#1E63FF]" />Saturday: 9:00 AM - 5:00 PM</p>
                <p className="flex items-center"><Clock className="w-6 h-6 mr-3 text-[#1E63FF]" />Sunday: Closed</p>
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl overflow-hidden shadow-md">
             <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2870.738318816727!2d-123.1199396844917!3d44.0903339791096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54c11eb5a6f0803f%3A0x8ff6635c5c8466b7!2s456%20Hwy%2099%20N%2C%20Eugene%2C%20OR%2097402!5e0!3m2!1sen!2sus!4v1684351333795!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              title="Dealership Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
