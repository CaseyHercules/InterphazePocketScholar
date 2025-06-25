import Link from "next/link";
import { PenSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BackstoryRenderer } from "@/components/BackstoryRenderer";

interface CharacterBackstoryCardProps {
  character: any;
}

export function CharacterBackstoryCard({
  character,
}: CharacterBackstoryCardProps) {
  const hasBackstory =
    character.notes && (character.notes as Record<string, any>).backstory;

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">Backstory</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Write some fun stories about your character
          </CardDescription>
        </div>

        <Button variant="outline" size="sm" className="mt-2 sm:mt-0" asChild>
          <Link href={`/characters/${character.id}/backstory`}>
            <PenSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Edit Backstory
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {hasBackstory ? (
          <div className="border rounded-lg p-3">
            <ScrollArea className="h-[250px] sm:h-[300px]">
              <BackstoryRenderer
                content={(character.notes as Record<string, any>).backstory}
              />
            </ScrollArea>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No backstory has been added for this character.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
