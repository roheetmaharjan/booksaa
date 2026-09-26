import Header from "@/components/components_marketing/Header";
import Footer from "@/components/components_marketing/Footer";

export default function MarketingLayout({ children }) {
  return (
    <>
        <Header/>
        {children}
        <Footer/>
    </>
  );
}
