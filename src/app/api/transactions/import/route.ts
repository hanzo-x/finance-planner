import { CSV_MAX_BYTES, parseTransactionsCsv } from "@/lib/csv";
import { getCurrentUser } from "@/lib/dal";
import { checkMilestones } from "@/lib/milestone-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Nguồn gốc request không hợp lệ" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Request không đúng định dạng" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ error: "Chưa chọn file" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return Response.json({ error: "Chỉ nhận file .csv" }, { status: 400 });
  }
  if (file.size > CSV_MAX_BYTES) {
    return Response.json({ error: "File quá lớn (tối đa 1 MB)" }, { status: 413 });
  }

  const { rows, errors } = parseTransactionsCsv(await file.text());
  if (errors.length > 0) {
    return Response.json(
      { error: "File CSV có lỗi", errors: errors.slice(0, 10), totalErrors: errors.length },
      { status: 400 },
    );
  }

  await prisma.transaction.createMany({
    data: rows.map((row) => ({ ...row, userId: user.id })),
  });
  revalidatePath("/", "layout");
  const { messages, celebrate } = await checkMilestones(user.id);
  return Response.json({ imported: rows.length, milestones: messages, celebrate });
}
