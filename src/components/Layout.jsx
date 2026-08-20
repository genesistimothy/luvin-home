import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import { createWhatsAppLink } from "../config/contact";
import { useCmsContent, useHomepageSeo } from "../hooks/useCmsContent";
import { SavedProductsProvider } from "../context/SavedProductsContext";

export default function Layout() {
  const content = useCmsContent();
  const { siteSettings, collections } = content;
  const whatsAppLink = createWhatsAppLink(siteSettings.defaultWhatsAppMessage, siteSettings.whatsAppNumber);

  useHomepageSeo(siteSettings);

  return (
    <SavedProductsProvider>
      <Navbar siteSettings={siteSettings} collections={collections} whatsAppLink={whatsAppLink} />
      <main>
        <Outlet context={content} />
      </main>
      <Footer siteSettings={siteSettings} whatsAppLink={whatsAppLink} />
      <FloatingWhatsApp whatsAppLink={whatsAppLink} />
    </SavedProductsProvider>
  );
}
