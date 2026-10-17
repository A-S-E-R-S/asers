import "server-only";
import { all, first, parseJSON } from "@/lib/db";

export const JUDGING_CRITERIA = [
  ["question", "Research question and significance"],
  ["methods", "Methods and rigor"],
  ["evidence", "Evidence and results"],
  ["analysis", "Analysis and conclusions"],
  ["communication", "Student understanding and communication"],
] as const;

export type JudgingRound = {
  id: string;
  chapter_slug: string;
  name: string;
  format: "oral" | "poster" | "final";
  active: number;
};

export type JudgeOption = { id: string; name: string; institution: string; status: string };
export type ProjectOption = { id: string; title: string; code: string | null; category: string; description: string };

export type JudgeAssignment = {
  id: string;
  round_id: string;
  round_name: string;
  format: string;
  room: string;
  session_label: string;
  order_index: number;
  project_id: string;
  judge_name: string;
  project_title: string;
  project_code: string | null;
  project_category: string;
  project_description: string;
  score_json: string | null;
  comments: string | null;
  submitted_at: number | null;
};

export async function listJudgingRounds(slug: string): Promise<JudgingRound[]> {
  return all<JudgingRound>("SELECT * FROM judging_rounds WHERE chapter_slug = ? ORDER BY created_at DESC", slug);
}

export async function listApprovedJudges(slug: string): Promise<JudgeOption[]> {
  return all<JudgeOption>(
    `SELECT r.id, u.first_name || ' ' || u.last_name AS name,
            json_extract(r.data, '$.institution') AS institution, r.status
     FROM registrations r JOIN users u ON u.id = r.user_id
     WHERE r.chapter_slug = ? AND r.role = 'judge' AND r.status = 'approved'
     ORDER BY u.last_name, u.first_name`,
    slug
  );
}

export async function listApprovedProjects(slug: string): Promise<ProjectOption[]> {
  return all<ProjectOption>(
    `SELECT p.id, p.title, p.project_code AS code, COALESCE(p.focus_other, p.focus, '') AS category,
            p.description
     FROM projects p
     WHERE p.chapter_slug = ? AND EXISTS (
       SELECT 1 FROM registrations r WHERE r.project_id = p.id AND r.role = 'student' AND r.status = 'approved'
     )
     ORDER BY category, p.project_code, p.title`,
    slug
  );
}

export async function listJudgeAssignments(userId: string, slug: string): Promise<JudgeAssignment[]> {
  return all<JudgeAssignment>(
    `SELECT a.id, a.round_id, j.name AS round_name, j.format, a.room, a.session_label, a.order_index,
            u.first_name || ' ' || u.last_name AS judge_name,
            p.id AS project_id, p.title AS project_title, p.project_code, COALESCE(p.focus_other, p.focus, '') AS project_category,
            p.description AS project_description, s.scores AS score_json, s.comments, s.submitted_at
     FROM judge_assignments a
     JOIN judging_rounds j ON j.id = a.round_id
     JOIN registrations jr ON jr.id = a.judge_registration_id
     JOIN users u ON u.id = jr.user_id
     JOIN projects p ON p.id = a.project_id
     LEFT JOIN judge_scores s ON s.assignment_id = a.id
     WHERE j.chapter_slug = ? AND jr.user_id = ? AND j.active = 1
     ORDER BY j.created_at DESC, a.order_index, p.project_code, p.title`,
    slug,
    userId
  );
}

export async function listRoundAssignments(slug: string, roundId: string): Promise<JudgeAssignment[]> {
  return all<JudgeAssignment>(
    `SELECT a.id, a.round_id, j.name AS round_name, j.format, a.room, a.session_label, a.order_index,
            u.first_name || ' ' || u.last_name AS judge_name,
            p.id AS project_id, p.title AS project_title, p.project_code, COALESCE(p.focus_other, p.focus, '') AS project_category,
            p.description AS project_description, s.scores AS score_json, s.comments, s.submitted_at
     FROM judge_assignments a
     JOIN judging_rounds j ON j.id = a.round_id
     JOIN registrations jr ON jr.id = a.judge_registration_id
     JOIN users u ON u.id = jr.user_id
     JOIN projects p ON p.id = a.project_id
     LEFT JOIN judge_scores s ON s.assignment_id = a.id
     WHERE j.chapter_slug = ? AND j.id = ?
     ORDER BY a.order_index, p.project_code, u.last_name, u.first_name`,
    slug,
    roundId
  );
}

export function scoreMap(value: string | null): Record<string, number> {
  return parseJSON<Record<string, number>>(value, {});
}
