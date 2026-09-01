"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { chapters } from "@/data/chapters";

export default function SponsorInquiryForm() {
  const searchParams = useSearchParams();
  const requestedChapter = searchParams.get("chapter") ?? "";
  const chapter = useMemo(
    () => chapters.find((item) => item.slug === requestedChapter),
    [requestedChapter]
  );
  return (
    <form onSubmit={(event) => event.preventDefault()} className="mt-6 space-y-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      <input type="hidden" name="chapter" value={chapter?.slug ?? ""} />
      {chapter && (
        <div className="border-2 border-brand-pale bg-white px-4 py-3">
          <p className="text-sm font-light text-ink-soft">Supporting chapter</p>
          <p className="font-medium">{chapter.name} ({chapter.shortName})</p>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name
          <input required name="name" maxLength={100} className="mt-2 block w-full border-2 border-brand-pale px-3 py-2 font-normal" />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input required type="email" name="email" maxLength={254} className="mt-2 block w-full border-2 border-brand-pale px-3 py-2 font-normal" />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Organization <span className="font-normal text-ink-soft">(optional)</span>
        <input name="organization" maxLength={150} className="mt-2 block w-full border-2 border-brand-pale px-3 py-2 font-normal" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Estimated gift or sponsorship level
          <input name="amount" maxLength={80} placeholder="For example, $500 or Silver sponsor" className="mt-2 block w-full border-2 border-brand-pale px-3 py-2 font-normal" />
        </label>
        <label className="block text-sm font-medium">
          Area of support
          <select name="support" className="mt-2 block w-full border-2 border-brand-pale bg-white px-3 py-2 font-normal">
            <option>General support</option>
            <option>Student access</option>
            <option>Travel support</option>
            <option>Awards</option>
            <option>Event or chapter support</option>
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Message
        <textarea required name="message" maxLength={3000} rows={5} className="mt-2 block w-full resize-y border-2 border-brand-pale px-3 py-2 font-normal" />
      </label>
      <p className="text-sm font-light leading-[1.6] text-ink-soft">Donations are made directly to and legally benefit ASERS. A chapter-specific link simply helps ASERS track which chapter referred the donor. It does not create a separate chapter fund, earmark the donation for that chapter, or direct funds to a local chapter account.</p>
      <button type="button" disabled className="bg-brand px-6 py-3 font-medium text-white opacity-60">
        Inquiry form coming soon
      </button>
      <p className="text-sm font-light text-ink-soft">This form is not accepting submissions yet.</p>
    </form>
  );
}
