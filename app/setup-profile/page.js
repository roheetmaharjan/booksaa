"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SetupProfilePage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [form, setForm] = useState({ password: "", phone: "", bio: "", location: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/setup-profile", {
      method: "POST",
      body: JSON.stringify({ ...form, token }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) router.push("/login");
    else alert(data.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="password" type="password" placeholder="Set Password" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <textarea name="bio" placeholder="Bio" onChange={handleChange}></textarea>
      <input name="location" placeholder="Location" onChange={handleChange} />
      <button type="submit">Complete Setup</button>
    </form>
  );
}
