import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QUIZ_PACKS, getPack } from "@/lib/quiz/packs";
import PackPlayClient from "@/components/quiz/pack-play";

export function generateStaticParams() {
  return QUIZ_PACKS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pack = getPack(id);
  if (!pack) return { title: "Pack Not Found" };
  return {
    title: `${pack.title} — Play a Quiz Pack`,
    description: `Answer the ${pack.title.toLowerCase()} about yourself and get a code to challenge your friends.`,
  };
}

export default async function PackPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = getPack(id);
  if (!pack) notFound();
  return <PackPlayClient pack={pack} />;
}