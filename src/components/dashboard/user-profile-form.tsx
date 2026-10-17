"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function UserProfileForm({
  user,
}: {
  user: {
    id: string;
    email: string;
    name: string | null;
    memberSince: string;
    tenantId: string;
    tenantName: string;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name: name.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la mise à jour");
      toast({ title: "Profil mis à jour ✓", description: "Vos informations sont enregistrées." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled className="bg-muted/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Organisation (tenant)</Label>
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground font-medium">
          {user.tenantName} <span className="text-xs text-muted-foreground/70">({user.tenantId.slice(0, 8)}…)</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>Enregistrer</Button>
        <span className="text-xs text-muted-foreground">Membre depuis {new Date(user.memberSince).toLocaleDateString("fr-FR")}</span>
      </div>
    </form>
  );
}
