export default function Solution() {
  return (
    <section className="py-[50px] md:py-[80px] lg:py-[100px] bg-background-2">
      <div className="container">
        <div className="space-y-[35px] md:space-y-[70px]">
          <div className="space-y-3 text-center">
            <h2 id="wealth-management-heading" className="section-heading">All-in-one wealth management</h2>
            <p>Manage your money with guidance that evolves with your goals.</p>
          </div>

          <div className="space-y-14">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-3 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="portfolio-management-heading" className="text-2xl">
                    Portfolio management
                  </h3>
                  <p className="text-base">
                    Custom, diversified portfolios that adapt to market changes.
                  </p>
                </div>

                <div>
                  <a
                    href=""
                    rel="noopener noreferrer"
                    className="btn btn-white hover:btn-primary btn-md dark:btn-transparent"
                    aria-label="Learn more about portfolio management"
                  >
                    <span>View more</span>
                  </a>
                </div>
              </div>

              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-35 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="financial-planning-heading" className="text-2xl">
                    Financial planning
                  </h3>
                  <p className="text-base">
                    Get a plan that grows with you—automated and
                    advisor-reviewed.
                  </p>
                </div>

                <div>
                  <a
                    href="./our-services-details-page.html"
                    rel="noopener noreferrer"
                    className="btn btn-white hover:btn-primary btn-md dark:btn-transparent"
                    aria-label="Learn more about financial planning"
                  >
                    <span>View more</span>
                  </a>
                </div>
              </div>

              <div className="max-w-[405px] w-full p-8 bg-white rounded-[20px] space-y-6">
                <span className="ns-shape-1 text-[52px] text-secondary dark:text-accent inline-block"></span>

                <div className="space-y-2">
                  <h3 id="growth-assist-heading" className="text-2xl">
                    Growth assist
                  </h3>
                  <p className="text-base">
                    Smart tools that help optimize savings, interest, and tax
                    efficiency.
                  </p>
                </div>

                <div>
                  <a
                    href="./our-services-details-page.html"
                    rel="noopener noreferrer"
                    className="btn btn-white hover:btn-primary btn-md dark:btn-transparent"
                    aria-label="Learn more about growth assist"
                  >
                    <span>View more</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center w-full">
              <a
                href="./our-services-page-01.html"
                className="btn btn-primary btn-md w-[85%] md:w-auto hover:btn-secondary dark:hover:btn-accent"
                aria-label="View all wealth management solutions"
              >
                <span>View all solutions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
