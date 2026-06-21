"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { Label } from "@/client/components/ui/label";

export default function PatientIntakePage() {
  const params = useParams();
  const encounterId = params.encounterId as string;
  const router = useRouter();

  const [concerns, setConcerns] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medications, setMedications] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch(`/api/encounters/${encounterId}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concerns,
          symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
          currentMedications: medications.split(",").map((m) => m.trim()).filter(Boolean),
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cortex-bg">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-cortex-ink-1 mb-4">Intake Submitted</h1>
          <p className="text-cortex-ink-2 mb-8">Thank you. Your information has been securely saved for your upcoming appointment.</p>
          <Button variant="cortex-primary" onClick={() => router.push("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cortex-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl bg-cortex-surface shadow-[var(--shadow-2)] rounded-cortex-lg p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cortex-ink-1">Pre-Appointment Intake</h1>
          <p className="text-cortex-ink-2 mt-2">Please provide some details before your appointment to help us better understand your needs.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="concerns">Primary Concerns <span className="text-destructive">*</span></Label>
            <Textarea
              id="concerns"
              required
              rows={4}
              placeholder="What are your main concerns for this visit?"
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Current Symptoms (comma separated)</Label>
            <Input
              id="symptoms"
              placeholder="e.g. memory loss, confusion, headaches"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications (comma separated)</Label>
            <Input
              id="medications"
              placeholder="e.g. donepezil 5mg, aspirin 81mg"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Any other information you'd like to share?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>

          {status === "error" && (
            <div className="text-sm text-destructive">There was an error saving your intake. Please try again.</div>
          )}

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              variant="cortex-primary" 
              disabled={status === "submitting"}
              className="w-full sm:w-auto"
            >
              {status === "submitting" ? "Submitting..." : "Submit Secure Intake"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
