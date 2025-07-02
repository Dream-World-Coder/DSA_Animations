import { ShadCNHeader as Header } from "../components/Header/ShadCNNav";
import SEOData from "../components/SEO";
import AppLogo from "../components/Logo";

export default function NotFoundPage() {
  const seoData = {
    title: "Page not found",
  };
  return (
    <>
      <SEOData data={seoData} />

      <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-start gap-20 py-32 px-0 bg-neutral-900">
        <Header />

        <div className="flex justify-center items-center p-8">
          <AppLogo width={200} height={240} />
          <div className="text-amber-50 text-2xl">
            Page Not found{" "}
            <div className="text-green-500">
              <b>404</b>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
