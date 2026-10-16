import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChapterNav from "@/components/ChapterNav";
import { getChapter, paragraphs } from "@/lib/chapters";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  return chapter?.published ? { title: `${chapter.shortName} Rules` } : {};
}

export default async function ChapterRulesPage({ params }: Props) {
  const chapter = await getChapter((await params).slug);
  if (!chapter?.published) notFound();
  const rules = paragraphs(chapter.localRules);
  return (
    <>
      <ChapterNav chapter={chapter} />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">{chapter.shortName}</p>
        <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Local rules</h1>
        {rules.length ? <div className="mt-8 space-y-4 text-[17px] font-light leading-[1.7]">{rules.map((rule, i) => <p key={i} className="whitespace-pre-line">{rule}</p>)}</div> : <p className="mt-8 font-light">Local rules have not been published yet. See the national <Link href="/competition/rules" className="font-medium text-brand underline">competition rules</Link> in the meantime.</p>}
        <p className="mt-10 border-l-4 border-brand bg-strip px-5 py-4 font-light leading-[1.7]">These local rules supplement the national ASERS rules. If there is a conflict, national standards apply.</p>
      </main>
    </>
  );
}
