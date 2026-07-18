import {
  ArrowRight,
  Send,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function BooksaaFooter() {
  return (
    <footer className="relative bg-[#6E8DA9] overflow-hidden rounded-t-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-20 w-80 h-80 border-[60px] border-white rounded-full" />
        <div className="absolute top-24 right-32 w-52 h-52 bg-white" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] border-[60px] border-white rounded-full" />
      </div>

      {/* CTA */}
      <section className="relative z-10 pt-24 pb-48">
        <div className="max-w-4xl mx-auto text-center px-6">
          <span className="inline-flex px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm">
            Built for Service Businesses
          </span>

          <h2 className="mt-6 text-5xl md:text-6xl font-bold text-white leading-tight">
            Manage bookings.
            <br />
            Grow your business.
          </h2>

          <p className="mt-6 text-white text-lg max-w-2xl mx-auto">
            Booksaa helps service businesses manage bookings, staff,
            customers, schedules, and locations from one platform.
          </p>

          <button className="mt-8 bg-primary text-white px-8 py-4 rounded-xl flex items-center gap-2 mx-auto hover:opacity-90">
            Start Free Trial
            <ArrowRight size={18} />
          </button>

          <div className="mt-6 flex justify-center gap-8 text-white">
            <span>✓ No Credit Card Required</span>
            <span>✓ 15-Day Free Trial</span>
          </div>
        </div>
      </section>

      {/* Footer Card */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="-mt-32 bg-white rounded-3xl shadow-2xl">
          <div className="p-10 md:p-16">
            {/* Top */}
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand */}
              <div>
                <h3 className="text-3xl font-bold">
                  <span className="text-primary">Booksaa</span>
                </h3>

                <p className="mt-4 text-slate-700">
                  Modern booking and business management software for service
                  companies.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-4">Product</h4>

                <ul className="space-y-3 text-gray-600">
                  <li>Online Booking</li>
                  <li>Scheduling</li>
                  <li>Staff Management</li>
                  <li>Locations</li>
                  <li>Reports</li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold mb-4">Company</h4>

                <ul className="space-y-3 text-gray-600">
                  <li>Pricing</li>
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Blog</li>
                  <li>Support</li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="font-semibold mb-4">
                  Get product updates
                </h4>

                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 border rounded-l-xl px-4 py-3 outline-none"
                  />

                  <button className="bg-primary text-white px-4 rounded-r-xl">
                    <Send size={18} />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Tips, updates, and new feature announcements.
                </p>
              </div>
            </div>

            <div className="border-t my-10" />

            {/* Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-500 text-sm">
                © 2026 Booksaa. All rights reserved.
              </p>

              <div className="flex gap-5 text-slate-700">
                <Facebook size={18} />
                <Instagram size={18} />
                <Linkedin size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </footer>
  );
}