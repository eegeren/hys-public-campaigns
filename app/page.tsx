import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { BUCKET, r2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  path?: string;
}>;

function encodeR2Path(path: string) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function getPublicUrl(key: string) {
  const base = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${encodeR2Path(key)}`;
}

function getParentPath(currentPath: string) {
  const parts = currentPath.split("/").filter(Boolean);
  parts.pop();

  return parts.length > 0 ? `${parts.join("/")}/` : "";
}

function getName(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) || "Kampanyalar";
}

function isImage(name: string) {
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name);
}

function isVideo(name: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(name);
}

function isPdf(name: string) {
  return /\.pdf$/i.test(name);
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const prefix =
    typeof params.path === "string"
      ? decodeURIComponent(params.path)
      : "";

  const result = await r2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      Delimiter: "/",
    })
  );

  const folders =
    result.CommonPrefixes?.map((item) => item.Prefix).filter(
      (item): item is string => Boolean(item)
    ) ?? [];

  const files =
    result.Contents?.filter(
      (item) => item.Key && item.Key !== prefix
    ) ?? [];

  const currentTitle = prefix
    ? getName(prefix)
    : "Kampanyalar";

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ef] text-[#171717]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">

            {/* LOGOLAR */}
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <img
                src="/logos/hys-logo.webp"
                alt="HYS"
                className="h-10 w-auto max-w-[90px] object-contain sm:h-14 sm:max-w-[130px]"
              />

              <div className="h-8 w-px bg-black/10 sm:h-10" />

              <img
                src="/logos/koroglu-logo.webp"
                alt="Köroğlu"
                className="h-10 w-auto max-w-[90px] object-contain sm:h-14 sm:max-w-[130px]"
              />
            </div>

            {/* MASAÜSTÜ BAŞLIK */}
            <div className="hidden border-l border-black/10 pl-5 md:block">
              <h1 className="text-xl font-black">
                Kampanyalar
              </h1>

              <p className="mt-0.5 text-sm text-black/45">
                Güncel kampanya ve fırsatlar
              </p>
            </div>

          </div>
        </div>

        {/* MOBİL BAŞLIK */}
        <div className="border-t border-black/5 px-4 py-3 md:hidden">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-lg font-black">
              Kampanyalar
            </h1>

            <p className="mt-0.5 text-xs text-black/45">
              Güncel kampanya ve fırsatlar
            </p>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-5 sm:py-10">

        {/* GERİ */}
        {prefix && (
          <a
            href={
              getParentPath(prefix)
                ? `/?path=${encodeURIComponent(
                    getParentPath(prefix)
                  )}`
                : "/"
            }
            className="mb-7 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span>←</span>
            <span>Geri</span>
          </a>
        )}

        {/* SAYFA BAŞLIĞI */}
        <div className="mb-8 sm:mb-10">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-black/35">
            {prefix ? "Seçiminiz" : "Müşteriye özel"}
          </div>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {currentTitle}
          </h2>

          {!prefix && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-black/45 sm:text-base">
              Size özel güncel kampanyaları görüntüleyin.
            </p>
          )}
        </div>

        {/* KLASÖRLER */}
        {folders.length > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
            {folders.map((folder) => {
              const folderName = getName(folder);

              return (
                <a
                  key={folder}
                  href={`/?path=${encodeURIComponent(folder)}`}
                  className="group relative overflow-hidden rounded-3xl border border-black/[0.07] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-6"
                >
                  <div className="flex items-center gap-5">

                    {/* KLASÖR İKONU */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50 sm:h-20 sm:w-20">
                      <div className="relative h-8 w-10 sm:h-9 sm:w-11">
                        <div className="absolute left-0 top-0 h-3 w-5 rounded-t-md bg-orange-400" />

                        <div className="absolute bottom-0 left-0 h-7 w-full rounded-md bg-orange-400 shadow-sm" />

                        <div className="absolute bottom-0 left-0 h-6 w-full rounded-md bg-gradient-to-br from-orange-400 to-orange-500" />
                      </div>
                    </div>

                    {/* KLASÖR BİLGİSİ */}
                    <div className="min-w-0 flex-1">
                      <div className="break-words text-xl font-black tracking-tight sm:text-2xl">
                        {folderName}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-orange-600">
                        <span>Devam et</span>

                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>

                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* DOSYALAR */}
        {files.length > 0 && (
          <>
            <div className="mb-5 flex items-center gap-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-black/35">
                Kampanya İçerikleri
              </div>

              <div className="h-px flex-1 bg-black/[0.07]" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => {
                const key = file.Key!;
                const name = key.slice(prefix.length);
                const url = getPublicUrl(key);

                {/* GÖRSEL */}
                if (isImage(name)) {
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-[#eceae5]">
                        <img
                          src={url}
                          alt={name}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.015]"
                        />
                      </div>

                      <div className="p-5">
                        <div className="break-words font-bold">
                          {name}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm font-bold text-orange-600">
                          <span>Görseli aç</span>
                          <span>→</span>
                        </div>
                      </div>
                    </a>
                  );
                }

                {/* VİDEO */}
                if (isVideo(name)) {
                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                    >
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        className="aspect-video w-full bg-black"
                      >
                        <source src={url} />
                      </video>

                      <div className="p-5">
                        <div className="break-words font-bold">
                          {name}
                        </div>
                      </div>
                    </div>
                  );
                }

                {/* PDF */}
                if (isPdf(name)) {
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-3xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                        📄
                      </div>

                      <div className="mt-5 break-words font-black">
                        {name}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm font-bold text-orange-600">
                        <span>PDF&apos;i aç</span>
                        <span>→</span>
                      </div>
                    </a>
                  );
                }

                {/* DİĞER DOSYA */}
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-3xl border border-black/[0.07] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04] text-2xl">
                      📎
                    </div>

                    <div className="mt-5 break-words font-black">
                      {name}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm font-bold text-orange-600">
                      <span>Dosyayı aç</span>
                      <span>→</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}

        {/* BOŞ KLASÖR */}
        {folders.length === 0 && files.length === 0 && (
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
              <div className="relative h-8 w-10">
                <div className="absolute left-0 top-0 h-3 w-5 rounded-t-md bg-orange-300" />

                <div className="absolute bottom-0 left-0 h-7 w-full rounded-md bg-orange-400" />
              </div>
            </div>

            <div className="mt-5 font-black">
              Henüz içerik bulunmuyor
            </div>

            <div className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
              Bu alana kampanya eklendiğinde içerikler otomatik olarak burada
              görüntülenecek.
            </div>
          </div>
        )}

        {/* MOBİL KULLANIM BİLGİSİ */}
        {!prefix && (
          <div className="mt-8 md:hidden">
            <div className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                  ?
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-black">
                    Kampanyalara nasıl ulaşırım?
                  </div>

                  <p className="mt-1 text-xs leading-5 text-black/50">
                    Mağazanızı seçin; ardından tarih, saat ve ürün kategorisi
                    adımlarını takip edin.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] font-bold text-orange-600">
                    <span>Mağaza</span>
                    <span className="text-black/20">→</span>
                    <span>Tarih</span>
                    <span className="text-black/20">→</span>
                    <span>Saat</span>
                    <span className="text-black/20">→</span>
                    <span>Kategori</span>
                    <span className="text-black/20">→</span>
                    <span>Kampanya</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </section>

      {/* MASAÜSTÜ SAĞ ALT KULLANIM BİLGİSİ */}
      {!prefix && (
        <aside className="fixed bottom-6 right-6 z-30 hidden w-[340px] md:block">
          <div className="rounded-3xl border border-black/[0.08] bg-white/95 p-5 shadow-[0_15px_50px_rgba(0,0,0,0.13)] backdrop-blur-xl">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                ?
              </div>

              <div className="min-w-0">
                <div className="text-sm font-black">
                  Kampanyalara nasıl ulaşırım?
                </div>

                <p className="mt-1.5 text-xs leading-5 text-black/50">
                  Mağazanızı seçin ve ilgili adımları takip ederek kampanya
                  görsellerine ulaşın.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-bold text-orange-600">
                  <span>Mağaza</span>
                  <span className="text-black/20">→</span>

                  <span>Tarih</span>
                  <span className="text-black/20">→</span>

                  <span>Saat</span>
                  <span className="text-black/20">→</span>

                  <span>Kategori</span>
                  <span className="text-black/20">→</span>

                  <span>Kampanya</span>
                </div>
              </div>

            </div>
          </div>
        </aside>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-black/[0.07] bg-white/40">
        <div className="mx-auto max-w-7xl px-5 py-6 text-center text-xs font-medium text-black/35">
          HYS
          <span className="mx-2">•</span>
          Köroğlu
          <span className="mx-2">•</span>
          Güncel Kampanyalar
        </div>
      </footer>

    </main>
  );
}