import { Skill, Class } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getSkillEffects,
  getSkillNotes,
  isStatBonusEffect,
  isSkillModifierEffect,
  isGrantSkillEffect,
  isPickSkillByTierEffect,
  type SkillEffect,
} from "@/types/skill-effects";

interface SkillViewerProps {
  skill: (Skill & { class?: Class | null }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillViewer({ skill, isOpen, onClose }: SkillViewerProps) {
  if (!skill) return null;

  // Convert prerequisiteSkills to string array if it's not already
  const prerequisiteSkills = Array.isArray(skill.prerequisiteSkills)
    ? skill.prerequisiteSkills
    : typeof skill.prerequisiteSkills === "string"
    ? [skill.prerequisiteSkills]
    : [];

  // Extract notes and effects from additionalInfo (handles legacy string format)
  const notes = getSkillNotes(skill.additionalInfo);
  const effects = getSkillEffects(skill.additionalInfo);
  
  // Format effect for display
  const formatEffect = (effect: SkillEffect): string => {
    if (isStatBonusEffect(effect)) {
      const sign = effect.value >= 0 ? "+" : "";
      const condition = effect.condition ? ` (${effect.condition})` : "";
      return `${sign}${effect.value} ${effect.stat}${condition}`;
    }
    if (isSkillModifierEffect(effect)) {
      const sign = typeof effect.modifier === "number" && effect.modifier >= 0 ? "+" : "";
      return `Modifies ${effect.targetField}: ${sign}${effect.modifier}`;
    }
    if (isGrantSkillEffect(effect)) {
      const hasSpecific =
        effect.skillId || (effect.skillIds && effect.skillIds.length > 0);
      if (hasSpecific) {
        return "Grants access to specific skill(s)";
      }
      if (effect.classId && effect.maxTier) {
        return `Grants access to skills up to Tier ${effect.maxTier} from another class`;
      }
      return "Grants access to skill(s)";
    }
    if (isPickSkillByTierEffect(effect)) {
      return `Pick any skill up to Tier ${effect.maxTier} from your class(es)`;
    }
    if ("note" in effect && effect.note) {
      return effect.note;
    }
    return "Unknown effect";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-4 gap-1">
        <DialogHeader className="space-y-1 pb-0 mb-0">
          <DialogTitle className="text-2xl font-bold">
            {skill.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {skill.descriptionShort}
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            <p className="whitespace-pre-wrap text-sm">{skill.description}</p>

            <Separator className="my-2" />

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Tier: </span>
                {skill.tier}
              </div>
              <div>
                <span className="text-muted-foreground">EP Cost: </span>
                {skill.epCost && skill.epCost.trim() !== ""
                  ? skill.epCost
                  : "—"}
              </div>
              <div>
                <span className="text-muted-foreground">EP Reduction: </span>
                {skill.permenentEpReduction}
              </div>
              <div>
                <span className="text-muted-foreground">Class: </span>
                {skill.class?.Title || "None"}
              </div>
              <div>
                <span className="text-muted-foreground">Activation: </span>
                {skill.activation}
              </div>
              <div>
                <span className="text-muted-foreground">Duration: </span>
                {skill.duration}
              </div>
              <div>
                <span className="text-muted-foreground">Ability Check: </span>
                {skill.abilityCheck || "None"}
              </div>
            </div>

            {effects.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground font-medium">Meta-Effects:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {effects.map((effect, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {formatEffect(effect)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {notes && (
              <div className="text-sm">
                <span className="text-muted-foreground">Additional Info: </span>
                <p className="whitespace-pre-wrap mt-1">{notes}</p>
              </div>
            )}

            {prerequisiteSkills.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Prerequisites: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prerequisiteSkills.map((prereq, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {String(prereq)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {skill.canBeTakenMultiple && (
                <Badge variant="outline" className="text-xs">
                  Can be taken multiple times
                </Badge>
              )}
              {!skill.playerVisable && (
                <Badge variant="outline" className="text-xs">
                  Hidden from players
                </Badge>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
