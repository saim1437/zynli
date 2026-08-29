import Logo from "@/components/Logo";
import UploadDropzone from "@/components/UploadDropzone";
import RecentDocs from "@/components/RecentDocs";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-8">
        <div className="fade-up">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">
            Turn any PDF into notes worth studying from
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Zynli reads your PDF, keeps the parts that matter, and answers
            your questions with the page they came from.
          </p>
        </div>

        <div className="mt-8 fade-up" style={{ animationDelay: "80ms" }}>
          <UploadDropzone />
        </div>

        <RecentDocs />
      </main>
    </div>
  );
}
