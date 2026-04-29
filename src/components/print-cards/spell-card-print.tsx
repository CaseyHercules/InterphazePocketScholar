"use client";

import { createElement, type ReactElement, type ReactNode } from "react";
import { Spell } from "@/types/spell";
import {
  DEFAULT_SPELL_CARD_STYLE_ID,
  SPELL_CARD_PREVIEW_ORIENTATION,
} from "@/components/print-cards/constants";
import { SpellCardTemplate } from "@/components/print-cards/spell-card-template";
import { SpellCardStyleId } from "@/components/print-cards/types";

export type RenderSpellCardOptions = {
  styleId?: SpellCardStyleId;
  orientation?: "portrait" | "landscape";
};

export function getSpellCardKey(spell: Spell): string {
  return spell.id ?? spell.title;
}

export function renderSpellCard(
  spell: Spell,
  options?: RenderSpellCardOptions
): ReactElement {
  const styleId = options?.styleId ?? DEFAULT_SPELL_CARD_STYLE_ID;
  const orientation = options?.orientation ?? "portrait";
  return createElement(SpellCardTemplate, {
    key: getSpellCardKey(spell),
    spell,
    styleId,
    orientation,
  });
}

export function renderSpellCardsForPrint(
  spells: Spell[],
  options?: RenderSpellCardOptions
): ReactElement[] {
  const styleId = options?.styleId ?? DEFAULT_SPELL_CARD_STYLE_ID;
  const orientation = options?.orientation ?? "portrait";
  return spells.map((spell) =>
    createElement(SpellCardTemplate, {
      key: getSpellCardKey(spell),
      spell,
      styleId,
      orientation,
    })
  );
}

export function SpellCardPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="aspect-[5/3] w-[min(92vw,36rem)] max-w-full overflow-hidden rounded-md border border-border/60 shadow-lg">
      <div className="h-full min-h-0 w-full min-w-0">{children}</div>
    </div>
  );
}

export function SpellCardPreview(props: {
  spell: Spell;
  styleId?: SpellCardStyleId;
  orientation?: RenderSpellCardOptions["orientation"];
}) {
  const styleId = props.styleId ?? DEFAULT_SPELL_CARD_STYLE_ID;
  const orientation = props.orientation ?? SPELL_CARD_PREVIEW_ORIENTATION;
  return (
    <SpellCardPreviewFrame>
      <SpellCardTemplate
        spell={props.spell}
        styleId={styleId}
        orientation={orientation}
      />
    </SpellCardPreviewFrame>
  );
}
