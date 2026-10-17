import { requireChapterAdmin } from "@/lib/admin";
import { updateChapterCategoriesAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, Textarea } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

export default async function ChapterCategoriesPage({ params }: Props) {
  const { chapter: slug } = await params;
  const { chapter } = await requireChapterAdmin(slug);
  return (
    <Card title="Project categories">
      <p className="text-sm font-light leading-relaxed">
        Define the categories students can choose for this chapter. Put one category per line. Leave the field empty to use the national defaults.
      </p>
      <ActionForm action={updateChapterCategoriesAction} className="mt-5 space-y-4">
        <input type="hidden" name="chapter" value={slug} />
        <Textarea name="categories" rows={12} maxLength={5000} defaultValue={chapter.categories.join("\n")} />
        <p className="text-xs font-light text-ink-soft">Students and judges will see these categories in registration, project editing, and judging assignments.</p>
        <SubmitButton>Save categories</SubmitButton>
      </ActionForm>
    </Card>
  );
}
