import { Outlet, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import { createWhatsAppLink } from "../config/contact";
import { useCmsContent, useHomepageSeo } from "../hooks/useCmsContent";
import { SavedProductsProvider } from "../context/SavedProductsContext";
import { getScenarioContent } from "../data/devWorstCase";
import DevDataToggle from "../dev/DevDataToggle";

export default function Layout() {
  const content = useCmsContent();
  const [params] = useSearchParams();

  // Dev-only data switch: ?data=worst|empty|one|many. Swaps the data at the
  // same boundary the CMS uses, so what breaks is the component, not an edit.
  const scenario = import.meta.env.DEV ? getScenarioContent(params.get("data")) : null;
  const data = scenario ? { ...content, ...scenario } : content;

  const { siteSettings, collections } = data;
  const whatsAppLink = createWhatsAppLink(siteSettings.defaultWhatsAppMessage, siteSettings.whatsAppNumber);

  useHomepageSeo(siteSettings);

  return (
    <SavedProductsProvider>
      <Navbar siteSettings={siteSettings} collections={collections} whatsAppLink={whatsAppLink} />
      <main>
        <Outlet context={data} />
      </main>
      <Footer siteSettings={siteSettings} whatsAppLink={whatsAppLink} />
      <FloatingWhatsApp whatsAppLink={whatsAppLink} />
      {import.meta.env.DEV && <DevDataToggle />}
    </SavedProductsProvider>
  );
}
