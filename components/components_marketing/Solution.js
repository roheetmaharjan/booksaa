export default function Solution() {
  return (
    <section className="py-[50px] md:py-[80px] lg:py-[100px] bg-slate-100">
      <div className="container">
        <div className="space-y-[35px] md:space-y-[70px]">
          <div className="space-y-3 max-w-3xl mx-auto text-center">
            <p className="text-center uppercase text-primary font-semibold mb-3">Solutions</p>
            <h2 className="section-heading">
              Replace <span className="text-primary">Multiple Tools</span> with One Powerful Platform
            </h2>
            <p>Booksaa helps businesses streamline operations, automate scheduling, improve customer experiences, and gain visibility into performance—all from a single platform.</p>
          </div>

          <div className="space-y-14">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-3 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="portfolio-management-heading" className="text-2xl">
                    Online Booking
                  </h3>
                  <p className="text-base">Let customers book appointments anytime, anywhere through your website, booking page, or mobile device.</p>
                </div>

                <div>
                  <a href="" rel="noopener noreferrer" className="btn btn-white hover:btn-primary btn-md dark:btn-transparent" aria-label="Learn more about portfolio management">
                    <span>View more</span>
                  </a>
                </div>
              </div>

              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-35 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="financial-planning-heading" className="text-2xl">
                    Customer Management
                  </h3>
                  <p className="text-base">Store customer information, booking history, notes, and preferences in one centralized place.</p>
                </div>

                <div>
                  <a href="./our-services-details-page.html" rel="noopener noreferrer" className="btn btn-white hover:btn-primary btn-md dark:btn-transparent" aria-label="Learn more about financial planning">
                    <span>View more</span>
                  </a>
                </div>
              </div>

              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-1 text-[52px] text-secondary dark:text-accent inline-block"></span>
                <div className="space-y-2">
                  <h3 id="growth-assist-heading" className="text-2xl">
                    Smart Scheduling
                  </h3>
                  <p className="text-base">Manage appointments, staff availability, resources, and calendars without conflicts or double bookings.</p>
                </div>
              </div>
              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-1 text-[52px] text-secondary dark:text-accent inline-block"></span>
                <div className="space-y-2">
                  <h3 id="growth-assist-heading" className="text-2xl">
                    Team Management
                  </h3>
                  <p className="text-base">Assign staff, track performance, manage schedules, and keep your team organized.</p>
                </div>
              </div>
              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-1 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="growth-assist-heading" className="text-2xl">
                    Multi-Location Support
                  </h3>
                  <p className="text-base">Manage multiple branches, teams, and services from a single dashboard.</p>
                </div>
              </div>
              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-1 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="growth-assist-heading" className="text-2xl">
                    Reports & Insights
                  </h3>
                  <p className="text-base">Track bookings, revenue, staff performance, and business growth with real-time reporting</p>
                </div>
              </div>
            </div>

            <div className="text-center w-full">
              <a href="#" className="btn-primary">
                <span>View all solutions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
