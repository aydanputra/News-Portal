"use client";

import { useRouter } from "next/navigation";
import PageForm from "../components/PageForm";

export default function CreatePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/pages");
      router.refresh();
    } else {
      const error = await res.json();
      alert(error.error || "Gagal membuat halaman");
    }
  };

  return <PageForm onSubmit={handleSubmit} />;
}
