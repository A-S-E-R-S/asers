import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChapterNav from "@/components/ChapterNav";
import { getChapter } from "@/lib/chapters";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  return chapter?.published ? { title: `${chapter.shortName} Photos` } : {};
}

export default async function ChapterPhotosPage({ params }: Props) {
  const chapter = await getChapter((await params).slug);
  if (!chapter?.published) notFound();
  return (
    <>
      <ChapterNav chapter={chapter} />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">{chapter.shortName}</p>
        <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Past event photos</h1>
        {chapter.photos.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {chapter.photos.map((photo) => (
              <figure key={`${photo.src}-${photo.caption}`} className="overflow-hidden border-2 border-brand-pale bg-strip">
                {/* Admin-managed URLs may be local paths or external image hosts. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.caption || `${chapter.shortName} event photo`} className="aspect-[4/3] w-full object-cover" />
                {photo.caption && <figcaption className="p-4 text-sm font-light leading-[1.6]">{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        ) : <p className="mt-8 font-light">Photos from past events will be added here.</p>}
      </main>
    </>
  );
}
