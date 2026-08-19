import PlaceholderPage from "../components/PlaceholderPage";

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="Tentang Kami"
      description="Cerita brand Luvin Home dan filosofi desain akan dipindahkan ke halaman ini pada tahap berikutnya."
      breadcrumbItems={[{ label: "Home", to: "/" }, { label: "Tentang Kami" }]}
    />
  );
}
