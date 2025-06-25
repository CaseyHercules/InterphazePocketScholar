"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

interface CSVRow {
  Class: string;
  Tier: string;
  "Title of Skill": string;
  "Desc P1": string;
  "Desc P2": string;
  "Desc Short": string;
  Cost: string;
  Activation: string;
  Duration: string;
  Save: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function BulkSkillImport() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // If not in development mode, don't render the component
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateRow = (row: CSVRow, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!row["Title of Skill"]?.trim()) {
      errors.push({
        row: rowIndex,
        field: "Title of Skill",
        message: "Title is required",
      });
    }

    // Validate Tier
    const tierValue = row.Tier?.trim();
    if (!tierValue) {
      errors.push({
        row: rowIndex,
        field: "Tier",
        message: "Tier is required",
      });
    } else {
      // Parse the tier value as a number
      const tier = parseInt(tierValue);
      if (isNaN(tier)) {
        errors.push({
          row: rowIndex,
          field: "Tier",
          message: `Invalid tier value: "${tierValue}". Must be a number between 1 and 4.`,
        });
      } else if (tier < 1 || tier > 4) {
        errors.push({
          row: rowIndex,
          field: "Tier",
          message: `Tier value ${tier} is out of range. Must be between 1 and 4.`,
        });
      }
    }

    // Validate Description
    if (!row["Desc P1"]?.trim()) {
      errors.push({
        row: rowIndex,
        field: "Desc P1",
        message: "Description is required",
      });
    }

    return errors;
  };

  const processCSV = async (csvContent: string) => {
    const rows = csvContent.split("\n");
    if (rows.length < 2) {
      throw new Error("File is empty or has no data rows");
    }

    // Clean and normalize headers
    const headers = rows[0].split("\t").map((header) => header.trim());

    const data: CSVRow[] = [];
    const errors: ValidationError[] = [];

    // Create a mapping of normalized headers to actual headers
    const headerMapping: { [key: string]: string } = {
      class: "Class",
      tier: "Tier",
      "title of skill": "Title of Skill",
      "desc p1": "Desc P1",
      "desc p2": "Desc P2",
      "desc short": "Desc Short",
      cost: "Cost",
      activation: "Activation",
      duration: "Duration",
      save: "Save",
    };

    // Find matching headers (case-insensitive and ignoring extra spaces)
    const foundHeaders = new Map<string, string>();
    headers.forEach((header) => {
      const normalizedHeader = header.toLowerCase().trim();
      Object.entries(headerMapping).forEach(([key, value]) => {
        if (normalizedHeader.includes(key)) {
          foundHeaders.set(value, header);
        }
      });
    });

    // Check for required headers
    const requiredHeaders = ["Tier", "Title of Skill", "Desc P1"];
    const missingHeaders = requiredHeaders.filter(
      (header) => !foundHeaders.has(header)
    );

    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required columns: ${missingHeaders.join(", ")}\n\n` +
          `Found columns: ${headers.join(", ")}\n\n` +
          `Please ensure your CSV file has these columns in the header row:\n` +
          `- Tier\n` +
          `- Title of Skill\n` +
          `- Desc P1`
      );
    }

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;

      const values = rows[i].split("\t");
      const row: any = {};

      // Map values using found headers
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        Object.entries(headerMapping).forEach(([key, value]) => {
          if (normalizedHeader.includes(key)) {
            // Special handling for Tier to ensure it's a clean number
            if (value === "Tier") {
              const tierValue = values[index]?.trim();
              // Parse the tier value as a number
              const tier = parseInt(tierValue);
              row[value] = !isNaN(tier) ? tier.toString() : "";
            } else {
              row[value] = values[index]?.trim() || "";
            }
          }
        });
      });

      // Validate row data
      const rowErrors = validateRow(row as CSVRow, i + 1);
      if (rowErrors.length > 0) {
        // Add the entire row data to each error
        rowErrors.forEach((error) => {
          error.message = `${error.message}\nRow data: ${JSON.stringify(
            row,
            null,
            2
          )}`;
        });
        errors.push(...rowErrors);
      } else {
        data.push(row as CSVRow);
      }
    }

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => `Row ${error.row}: ${error.field} - ${error.message}`)
        .join("\n");

      throw new Error(`Validation errors found:\n${errorMessages}`);
    }

    return data;
  };

  const importSkills = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    try {
      const text = await file.text();
      const skills = await processCSV(text);

      const totalSkills = skills.length;
      let processedSkills = 0;
      let failedSkills = 0;
      const failedSkillDetails: string[] = [];

      for (const skill of skills) {
        try {
          // Parse permanent EP reduction from Cost field
          let epCost = skill.Cost || null;
          let permanentEpReduction = 0;

          // Look for variations of permanent EP reduction text
          const permanentPattern =
            /(permanent|perm)[.\s]*(ep|energy)[.\s]*(reduction|red)/i;
          if (epCost && permanentPattern.test(epCost)) {
            const match = epCost.match(/\d+/);
            if (match) {
              permanentEpReduction = parseInt(match[0]);
              epCost = null;
            }
          }

          // Ensure description fields are properly handled
          const descP1 = skill["Desc P1"] || "";
          const descP2 = skill["Desc P2"] || "";
          const description =
            descP1 + (descP2 && descP2 !== "undefined" ? "\n" + descP2 : "");
          const descriptionShort = skill["Desc Short"] || "";

          const skillData = {
            title: skill["Title of Skill"],
            description: description,
            descriptionShort: descriptionShort,
            tier: parseInt(skill.Tier),
            epCost: epCost === null ? "" : epCost,
            activation: skill.Activation || "None",
            duration: skill.Duration || "None",
            abilityCheck: skill.Save || "None",
            skillGroupId: "",
            classId: skill.Class || "", // Use class ID from TSV
            permenentEpReduction: permanentEpReduction,
            canBeTakenMultiple: false,
            playerVisable: true,
            prerequisiteSkills: [],
            additionalInfo: [],
          };

          const response = await axios.post("/api/admin/skill", skillData);

          processedSkills++;
          setProgress((processedSkills / totalSkills) * 100);
        } catch (error: any) {
          console.error(`Error importing skill ${skill["Title of Skill"]}:`, {
            error: error,
            response: error.response?.data,
            status: error.response?.status,
            skillData: {
              title: skill["Title of Skill"],
              tier: skill.Tier,
            },
          });
          failedSkills++;
          failedSkillDetails.push(
            `${skill["Title of Skill"]}: ${
              error.response?.data?.error || error.message
            }`
          );
        }
      }

      if (failedSkills > 0) {
        toast({
          title: "Import Partially Complete",
          description: `Successfully imported ${processedSkills} out of ${totalSkills} skills.\nFailed to import ${failedSkills} skills:\n${failedSkillDetails.join(
            "\n"
          )}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${processedSkills} skills.`,
        });
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk Import Skills</CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple skills at once. The file should
          be tab-separated with the following columns: Class, Tier, Title of
          Skill, Desc P1, Desc P2, Cost, Activation, Duration, Save
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".tsv"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          <Button onClick={importSkills} disabled={!file || isImporting}>
            {isImporting ? "Importing..." : "Import Skills"}
          </Button>
        </div>
        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              Importing skills... {Math.round(progress)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
