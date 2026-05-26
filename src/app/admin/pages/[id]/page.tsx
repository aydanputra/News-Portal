"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageForm from "../components/PageForm";

export default function EditPage(props: { params: Promise<{ id: string }> }) {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPage = useCallback(async () => {
    const params = await props.params;
    try {
      const res = await fetch(`/api/pages/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setInitialData(data);
      } else {
        alert("Halaman tidak ditemukan");
        router.push("/admin/pages");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [props.params, router]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSubmit = async (data: any) => {
    const params = await props.params;
    const res = await fetch(`/api/pages/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin/pages");
      router.refresh();
    } else {
      const error = await res.json();
      alert(error.error || "Gagal mengupdate halaman");
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;
  if (!initialData) return null;

  return <PageForm initialData={initialData} onSubmit={handleSubmit} isEditing />;
}
