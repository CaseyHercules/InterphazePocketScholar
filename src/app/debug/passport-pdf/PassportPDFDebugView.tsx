"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { RotateCw } from "lucide-react";
import { getCharacterForPassport } from "@/lib/actions/passport";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { PassportExportScope } from "@/components/passport/pdf/PassportPDFDocument";

const PassportPDFViewer = dynamic(
  () => import("./PassportPDFViewer").then((m) => m.PassportPDFViewer),
  { ssr: false }
);

function getMockCharacter(): any {
  return {
    id: "mock",
    name: "Very Long Character Name For Testing Layout Overflow",
    primaryClass: { Title: "Scholar", id: "1", EP: 105 },
    primaryClassLvl: 20,
    secondaryClass: { Title: "Rogue", id: "2", EP: 38 },
    secondaryClassLvl: 7,
    primarySkills: [
      { id: "1", title: "Spells I", tier: 1, descriptionShort: "Cast/Learn spells", epCost: "Level" },
      { id: "2", title: "Knowledge II", tier: 2, descriptionShort: "Ritual, ask 1 open-ended question", epCost: 7 },
    ],
    secondarySkills: [
      { id: "3", title: "Sneak I", tier: 1, descriptionShort: "Hide in shadows" },
    ],
    inventory: [
      { id: "1", title: "Magic Staff", type: "Weapon", quantity: 1, description: "A staff imbued with arcane power" },
    ],
    spells: [
      { id: "1", title: "Fireball", level: 3, description: "Hurl a ball of fire", type: "Attack" },
    ],
    adjustments: [],
    user: { name: "Test Player", UnallocatedLevels: 0 },
    notes: { title: "Lord of Longing, King of Spring" },
    inlineEffectsJson: {
      effects: [
        { type: "special_ability", title: "Blackmail: Expert", note: "Deals in information. Gain a Blackmail card and ask open-ended questions." },
        { type: "dingus", title: "Guild Membership", note: "Member of the Mage Guild" },
      ],
    },
    alignmentJson: [2, 1, 0],
    Attributes: {},
  };
}

type Character = { id: string; name: string };

type PassportPDFDebugViewProps = {
  characters: Character[];
};

async function generateQrDataUrl(url: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(url, { width: 128, margin: 1 });
}

export function PassportPDFDebugView({
  characters,
}: PassportPDFDebugViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    characters[0]?.id ?? null
  );
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scope, setScope] = useState<PassportExportScope>({
    main: true,
    spells: false,
    items: false,
  });
  const [useMock, setUseMock] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (useMock) {
      setLoading(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      generateQrDataUrl(`${origin}/passport/mock`).then((qr) => {
        setCharacter(getMockCharacter());
        setQrDataUrl(qr);
        setLoading(false);
      });
      return;
    }
    if (!selectedId) {
      setCharacter(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    Promise.all([
      getCharacterForPassport(selectedId),
      generateQrDataUrl(`${origin}/passport/${selectedId}`),
    ]).then(([char, qr]) => {
      if (!cancelled) {
        setCharacter(char);
        setQrDataUrl(qr);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId, useMock]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6 p-4 bg-white dark:bg-stone-800 rounded-lg border">
        <div>
          <Label className="text-sm font-medium">Character</Label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value || null)}
            disabled={useMock}
            className="ml-2 mt-1 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            <option value="">— Select —</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={useMock}
            onCheckedChange={(v) => setUseMock(!!v)}
          />
          <span className="text-sm">Mock data</span>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          <RotateCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Scope</Label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={scope.main}
              onCheckedChange={(v) =>
                setScope((s) => ({ ...s, main: !!v }))
              }
            />
            <span className="text-sm">Main</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={scope.spells}
              onCheckedChange={(v) =>
                setScope((s) => ({ ...s, spells: !!v }))
              }
            />
            <span className="text-sm">Spells</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={scope.items}
              onCheckedChange={(v) =>
                setScope((s) => ({ ...s, items: !!v }))
              }
            />
            <span className="text-sm">Items</span>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 rounded-lg border overflow-hidden">
        {loading ? (
          <div className="h-[800px] flex items-center justify-center text-muted-foreground">
            Loading character…
          </div>
        ) : character && PassportPDFViewer ? (
          <PassportPDFViewer
            character={character}
            scope={scope}
            qrDataUrl={qrDataUrl}
            refreshKey={refreshKey}
          />
        ) : characters.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No characters. Create one first.
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Select a character
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Edit the PDF components and save to see changes via hot reload.
      </p>
    </div>
  );
}
