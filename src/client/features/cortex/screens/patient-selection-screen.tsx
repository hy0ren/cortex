"use client";

import { useEffect, useState } from "react";
import type { PatientRecord } from "@/data/contracts";
import { Button } from "@/client/components/ui/button";
import { apiRequest } from "@/client/lib/api-client";

export function PatientSelectionScreen() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ patients: PatientRecord[] }>("/api/patients")
      .then((data) => {
        setPatients(data.patients || []);
      })
      .catch((err) => {
        console.error("Failed to fetch patients:", err);
        setError(err instanceof Error ? err.message : "Failed to load patients");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectPatient = async (patientId: string) => {
    try {
      const data = await apiRequest<{ encounter: { id: string } }>("/api/encounters", {
        method: "POST",
        body: JSON.stringify({ patientId }),
      });
      window.location.href = `/?encounterId=${data.encounter.id}`;
    } catch (err) {
      console.error("Failed to create encounter:", err);
      alert(err instanceof Error ? err.message : "Failed to create encounter");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-cortex-bg">
      <div className="w-full max-w-2xl bg-cortex-surface rounded-cortex-lg shadow-[var(--shadow-2)] p-8">
        <h1 className="text-2xl font-bold text-cortex-ink-1 mb-6">Select a Patient</h1>
        <div className="space-y-4">
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-cortex-md text-sm">
              Failed to load patients: {error}
            </div>
          )}

          {!loading && !error && patients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 border border-cortex-border rounded-cortex-md hover:border-cortex-teal transition-colors">
              <div>
                <div className="font-semibold text-cortex-ink-1">{patient.demographics.name}</div>
                <div className="text-sm text-cortex-fg-subtle">
                  {patient.demographics.sex} · MRN {patient.mrn} · DOB: {patient.demographics.dateOfBirth}
                </div>
              </div>
              <Button onClick={() => handleSelectPatient(patient.id)} variant="cortex-primary">
                New Encounter
              </Button>
            </div>
          ))}

          {loading && (
            <div className="text-center text-cortex-fg-muted py-8">Loading patients...</div>
          )}

          {!loading && !error && patients.length === 0 && (
            <div className="text-center text-cortex-fg-muted py-8">No patients found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

