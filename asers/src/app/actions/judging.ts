"use server";

import { revalidatePath } from "next/cache";
import { audit, first, newId, run } from "@/lib/db";
import { adminForChapter } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { JUDGING_CRITERIA } from "@/lib/judging";
import { type ActionState, str, text } from "@/lib/form";

export async function createJudgingRoundAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapter = str(fd, "chapter");
  const ctx = await adminForChapter(chapter);
  if (!ctx) return { error: "You don't have permission to manage this chapter." };
  const name = str(fd, "name", 120);
  const format = str(fd, "format");
  if (!name) return { error: "Enter a round name." };
  if (!["oral", "poster", "final"].includes(format)) return { error: "Choose a valid judging format." };
  try {
    await run("INSERT INTO judging_rounds (id, chapter_slug, name, format) VALUES (?, ?, ?, ?)", newId(), chapter, name, format);
  } catch {
    return { error: "That round name already exists for this chapter." };
  }
  await audit(ctx.user.id, chapter, "judging.round.create", null, `${name} (${format})`);
  revalidatePath(`/admin/${chapter}/judging`);
  return { message: "Judging round created.", ok: Date.now() };
}

export async function createJudgeAssignmentAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapter = str(fd, "chapter");
  const ctx = await adminForChapter(chapter);
  if (!ctx) return { error: "You don't have permission to manage this chapter." };
  const roundId = str(fd, "roundId");
  const judgeId = str(fd, "judgeId");
  const projectId = str(fd, "projectId");
  const round = await first<{ id: string }>("SELECT id FROM judging_rounds WHERE id = ? AND chapter_slug = ?", roundId, chapter);
  const judge = await first<{ id: string }>("SELECT id FROM registrations WHERE id = ? AND chapter_slug = ? AND role = 'judge' AND status = 'approved'", judgeId, chapter);
  const project = await first<{ id: string }>("SELECT id FROM projects WHERE id = ? AND chapter_slug = ?", projectId, chapter);
  if (!round || !judge || !project) return { error: "Choose a valid round, approved judge, and project." };
  try {
    await run(
      `INSERT INTO judge_assignments (id, round_id, judge_registration_id, project_id, room, session_label, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      newId(), roundId, judgeId, projectId, str(fd, "room", 100), str(fd, "session", 100), Number(str(fd, "order")) || 0
    );
  } catch {
    return { error: "That judge is already assigned to this project in this round." };
  }
  await audit(ctx.user.id, chapter, "judging.assignment.create", projectId, `judge ${judgeId}`);
  revalidatePath(`/admin/${chapter}/judging`);
  return { message: "Assignment created.", ok: Date.now() };
}

export async function submitJudgeScoreAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user?.emailVerified) return { error: "Please log in and verify your email first." };
  const assignmentId = str(fd, "assignmentId");
  const assignment = await first<{ id: string; chapter_slug: string }>(
    `SELECT a.id, j.chapter_slug FROM judge_assignments a JOIN judging_rounds j ON j.id = a.round_id
     JOIN registrations r ON r.id = a.judge_registration_id WHERE a.id = ? AND r.user_id = ? AND r.status = 'approved'`,
    assignmentId, user.id
  );
  if (!assignment) return { error: "That judging assignment is not available." };
  const scores: Record<string, number> = {};
  for (const [key] of JUDGING_CRITERIA) {
    const score = Number(str(fd, `score_${key}`));
    if (!Number.isInteger(score) || score < 1 || score > 5) return { error: "Give every rubric category a score from 1 to 5." };
    scores[key] = score;
  }
  await run(
    `INSERT INTO judge_scores (id, assignment_id, scores, comments) VALUES (?, ?, ?, ?)
     ON CONFLICT(assignment_id) DO UPDATE SET scores = excluded.scores, comments = excluded.comments, updated_at = unixepoch(), submitted_at = unixepoch()`,
    newId(), assignmentId, JSON.stringify(scores), text(fd, "comments", 5000)
  );
  await audit(user.id, assignment.chapter_slug, "judging.score.submit", assignmentId);
  revalidatePath(`/dashboard/${assignment.chapter_slug}`);
  return { message: "Evaluation saved.", ok: Date.now() };
}
