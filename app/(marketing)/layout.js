import Footer from "@/components/components_marketing/Footer";
import Header from "@/components/components_marketing/Header";

export default function MarketingLayout({ children }) {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  );
}
