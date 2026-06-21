"use client";

import { useEffect, useState } from "react";
import type { PatientRecord } from "@/data/contracts";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { apiRequest } from "@/client/lib/api-client";

export function PatientSelectionScreen() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSex, setNewSex] = useState("Female");
  const [newDob, setNewDob] = useState("");
  const [creatingPatient, setCreatingPatient] = useState(false);

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

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDob) return;
    setCreatingPatient(true);
    try {
      const res = await apiRequest<{ patient: PatientRecord }>("/api/patients", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          sex: newSex,
          dateOfBirth: newDob,
        }),
      });
      await handleSelectPatient(res.patient.id);
    } catch (err) {
      console.error("Failed to create patient:", err);
      alert(err instanceof Error ? err.message : "Failed to create patient");
      setCreatingPatient(false);
    }
  };

  if (isCreating) {
    return (
      <div className="flex h-screen items-center justify-center bg-cortex-bg">
        <div className="w-full max-w-2xl bg-cortex-surface rounded-cortex-lg shadow-[var(--shadow-2)] p-8">
          <h1 className="text-2xl font-bold text-cortex-ink-1 mb-6">Create New Patient</h1>
          <form onSubmit={handleCreatePatient} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <select 
                id="sex" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newSex} 
                onChange={(e) => setNewSex(e.target.value)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" required value={newDob} onChange={(e) => setNewDob(e.target.value)} />
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-cortex-border">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)} disabled={creatingPatient}>
                Cancel
              </Button>
              <Button type="submit" variant="cortex-primary" disabled={creatingPatient}>
                {creatingPatient ? "Starting..." : "Create & Start Encounter"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-cortex-bg">
      <div className="w-full max-w-2xl bg-cortex-surface rounded-cortex-lg shadow-[var(--shadow-2)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-cortex-ink-1">Select a Patient</h1>
          <Button onClick={() => setIsCreating(true)} variant="outline">
            + New Patient
          </Button>
        </div>
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

