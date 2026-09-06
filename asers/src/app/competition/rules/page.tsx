import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rules & Eligibility",
  description: "ASERS competition eligibility, research safety, presentation, integrity, and AI-use guidance.",
  alternates: { canonical: "/competition/rules" },
};

const requirements = [
  ["Grades", "9–12 through a participating ASERS chapter."],
  ["Projects", "Individual or team projects meeting the local chapter's eligibility requirements."],
  ["Research", "Original experimental, computational, engineering, or theoretical work."],
  ["Required materials", "Research paper, oral presentation, and scientific poster."],
  ["Registration", "Through the student's local ASERS chapter."],
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Competition</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Rules &amp; Eligibility</h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">These are the national rules for ASERS symposia. Local chapters may add policies within the limits described below.</p>

      <div className="mt-8 grid gap-3 border-2 border-brand-pale bg-strip p-6 sm:grid-cols-2">
        {requirements.map(([label, value]) => <p key={label} className="text-sm font-light leading-[1.6]"><strong className="font-medium">{label}:</strong> {value}</p>)}
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Eligible research</h2>
      <p className="mt-3 font-light leading-[1.7]">Students may enter original experimental, computational, engineering, or theoretical research. Demonstrations, literature reviews, informational projects, and projects that only reproduce existing work are not eligible as research entries.</p>

      <h2 id="research-approval" className="mt-12 scroll-mt-8 text-2xl font-bold tracking-[-0.015em]">Research approval and responsibility</h2>
      <p className="mt-3 font-light leading-[1.7]">Projects involving human participants, vertebrate animals, biological materials, hazardous chemicals, or other regulated research may require approval before experimentation begins.</p>
      <p className="mt-3 font-light leading-[1.7]">ASERS is a conference-style presentation and evaluation venue. We do not design, fund, supervise, or approve student research, and we do not replace the school, mentor, university, IRB, SRC, IACUC, or other responsible review body.</p>
      <p className="mt-3 font-light leading-[1.7]">Students may enter a project before all approval documents are collected. Required approvals must be obtained before the research begins, where applicable. A project cannot be accepted for the symposium until the required documentation has been submitted and verified.</p>
      <p className="mt-3 font-light leading-[1.7]">Students, parents or guardians, advisors, schools, and research institutions remain responsible for planning, supervising, and approving the research. For university-based human-subjects research, students must provide the university&apos;s official IRB approval or exemption documentation. Student-created summaries or informal mentor letters do not replace official institutional records.</p>
      <p className="mt-3 font-light leading-[1.7]">Chapters may conduct an eligibility or safety review and may set additional requirements. Students should contact their chapter before beginning regulated work.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Participation responsibilities</h2>
      <p className="mt-3 font-light leading-[1.7]">Before a project is accepted, ASERS may require separate acknowledgments from the student, a parent or legal guardian, and the teacher or research mentor. These acknowledgments may address supervision, research approvals, venue rules, emergency procedures, and the student&apos;s responsibilities during the symposium.</p>
      <p className="mt-3 font-light leading-[1.7]">The registration portal and required forms are being prepared. Until they are available, chapter-specific instructions control the documents students must provide.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Student contribution</h2>
      <p className="mt-3 font-light leading-[1.7]">Students may conduct research with mentors, universities, companies, or research laboratories. The work submitted to ASERS must clearly represent the student&apos;s own contribution.</p>
      <p className="mt-3 font-light leading-[1.7]">Students should be prepared to explain what they personally designed, performed, analyzed, and wrote, along with what was provided or completed by mentors or collaborators.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Continuing projects</h2>
      <p className="mt-3 font-light leading-[1.7]">Students may continue research from a previous year if the new work represents a meaningful extension of the earlier project. Previous work should be identified clearly so judges can distinguish research completed during the current competition cycle.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Research paper</h2>
      <p className="mt-3 font-light leading-[1.7]">Students submit a research paper before the symposium. Papers support pre-event review and help judges understand and verify the work. Students should cite outside sources clearly and identify assistance from mentors or collaborators.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Oral presentation</h2>
      <p className="mt-3 font-light leading-[1.7]">Students present their research in a timed category session followed by judge questions. Presentations should focus on the student&apos;s own research, including the question, methods, results, interpretation, limitations, and next steps.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Poster and display safety</h2>
      <p className="mt-3 font-light leading-[1.7]">Students prepare a scientific poster for the poster session. Posters should distinguish student-generated work from material obtained elsewhere and properly credit figures, images, data, and outside sources.</p>
      <p className="mt-3 font-light leading-[1.7]">Physical prototypes, robotics, engineering builds, and interactive computer demonstrations may be displayed when they can be operated safely. At check-in, event volunteers may conduct a brief visual safety check of table setups, including shielding for moving parts and safe electrical connections.</p>
      <p className="mt-3 font-light leading-[1.7]">Live biological cultures, unsealed chemicals, open flames, and unshielded high-voltage equipment may not be brought into the venue. Projects involving these hazards must use photos, charts, video, or other approved records instead. Chapters may publish additional Display &amp; Safety Rules covering poster dimensions, equipment, biological materials, and other on-site requirements.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Research integrity</h2>
      <p className="mt-3 font-light leading-[1.7]">Students are expected to present their research honestly and accurately. Fabrication, falsification, plagiarism, misrepresentation of student contribution, undisclosed conflicts, or intentionally misleading presentation of results may result in disqualification or removal from award consideration.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">AI use</h2>
      <p className="mt-3 font-light leading-[1.7]">AI tools may be used as research tools where appropriate, but students remain responsible for the accuracy, originality, and understanding of everything they submit or present. Any substantial use of AI in the research process should be disclosed where relevant.</p>

      <div className="mt-14 border-l-4 border-brand bg-brand-pale/40 p-5 font-light leading-[1.7]">
        <strong className="font-medium">Local Chapter Policies:</strong> ASERS chapters must follow all national competition, judging, eligibility, and safety standards. Chapters may establish local deadlines, administrative forms, schedules, venue requirements, and reasonable display restrictions. Chapters may impose additional safety requirements when required by their venue, institution, or applicable law, but may not waive national standards or introduce rules that materially affect competitive fairness without approval from ASERS National.
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/competition" className="bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark">Back to competition</Link>
        <Link href="/chapters" className="border-2 border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand hover:text-white">Find your chapter</Link>
      </div>
    </div>
  );
}
