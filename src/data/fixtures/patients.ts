import type { PatientRecord } from "@/data/contracts";

/**
 * Synthetic patient fixtures — NO real PHI.
 * Shape is consumable directly by Wernicke (transcript + history) and Norm (test battery).
 */
export const PATIENT_FIXTURES: PatientRecord[] = [
  {
    id: "pat-001",
    mrn: "SYN-2024-001",
    demographics: {
      name: "Alex Rivera",
      dateOfBirth: "1978-03-14",
      sex: "M",
      education: "16 years (BA Psychology)",
      handedness: "Right",
      referralReason:
        "Cognitive changes following mild TBI (MVA 8 months ago); concerns about memory and word-finding",
    },
    history: {
      medical: [
        "Mild TBI secondary to motor vehicle accident (Aug 2024)",
        "Hypertension, controlled",
        "No history of seizures",
      ],
      psychiatric: [
        "Adjustment disorder with anxious mood post-MVA",
        "No prior psychiatric hospitalizations",
      ],
      medications: ["Lisinopril 10mg daily", "Sertraline 50mg daily"],
      priorEvaluations: [
        {
          date: "2019-06-12",
          setting: "Outpatient neuropsychology",
          summary:
            "Baseline evaluation for ADHD assessment; overall cognition WNL with mild attention variability.",
        },
      ],
    },


    priorReports: [
      {
        date: "2019-06-15",
        type: "Neuropsychological Evaluation",
        summary:
          "Overall cognitive profile within expected range; mild executive/attention weaknesses consistent with ADHD presentation.",
      },
    ],
  },
  {
    id: "pat-002",
    mrn: "SYN-2024-002",
    demographics: {
      name: "Jordan Chen",
      dateOfBirth: "1962-11-02",
      sex: "F",
      education: "18 years (MA Education)",
      handedness: "Right",
      referralReason:
        "Progressive memory decline; rule out neurodegenerative process vs. mood-related cognitive impairment",
    },
    history: {
      medical: [
        "Type 2 diabetes mellitus (diagnosed 2015)",
        "Hyperlipidemia",
        "Family history: mother with Alzheimer's disease (onset ~72)",
      ],
      psychiatric: [
        "Major depressive disorder, recurrent, in partial remission",
        "History of grief-related depression (2021, spouse death)",
      ],
      medications: [
        "Metformin 1000mg BID",
        "Atorvastatin 20mg daily",
        "Escitalopram 15mg daily",
        "Donepezil 5mg daily (started 3 months ago by neurologist)",
      ],
      priorEvaluations: [
        {
          date: "2022-03-08",
          setting: "Neurology clinic screening",
          summary: "MoCA 24/30; referred for comprehensive neuropsychological evaluation.",
        },
      ],
    },


    priorReports: [
      {
        date: "2022-03-08",
        type: "MoCA Screening",
        summary: "MoCA 24/30 with deficits in delayed recall and orientation; insufficient for formal diagnosis.",
      },
    ],
  },
  {
    id: "pat-003",
    mrn: "SYN-2024-003",
    demographics: {
      name: "Sam Okonkwo",
      dateOfBirth: "1995-07-22",
      sex: "X",
      education: "14 years (some college)",
      handedness: "Ambidextrous",
      referralReason:
        "ADHD diagnostic clarification; academic and occupational functional impairment",
    },
    history: {
      medical: [
        "Childhood asthma, resolved",
        "No head injury history",
        "No sleep apnea (ruled out 2024)",
      ],
      psychiatric: [
        "ADHD combined presentation (childhood diagnosis, never medicated consistently)",
        "Generalized anxiety disorder",
      ],
      medications: ["None currently"],
      priorEvaluations: [],
    },


    priorReports: [],
  },
  {
    id: "pat-004",
    mrn: "SYN-2024-004",
    demographics: {
      name: "Morgan Walsh",
      dateOfBirth: "1988-01-30",
      sex: "F",
      education: "20 years (PhD Chemistry)",
      handedness: "Right",
      referralReason:
        "Post-chemotherapy cognitive impairment ('chemo brain'); return-to-work planning",
    },
    history: {
      medical: [
        "Stage IIA breast cancer, treated 2023 (AC-T chemotherapy, completed)",
        "Currently in remission",
        "Thyroid function WNL post-treatment",
      ],
      psychiatric: [
        "Cancer-related distress, improving",
        "No prior psychiatric history",
      ],
      medications: ["Tamoxifen 20mg daily", "Vitamin D 2000 IU daily"],
      priorEvaluations: [
        {
          date: "2022-01-10",
          setting: "Pre-treatment baseline (oncology referral)",
          summary:
            "Pre-chemotherapy baseline: all domains average to high average; FSIQ estimate 118.",
        },
      ],
    },


    priorReports: [
      {
        date: "2022-01-15",
        type: "Pre-treatment Neuropsychological Baseline",
        summary:
          "FSIQ 118; verbal memory and processing speed high average; no baseline deficits.",
        sections: {
          summary:
            "High-functioning premorbid estimate; strong verbal and visuospatial skills.",
        },
      },
    ],
  },
];

export function getFixtureById(id: string): PatientRecord | undefined {
  return PATIENT_FIXTURES.find((p) => p.id === id);
}

export function getFixtureByMrn(mrn: string): PatientRecord | undefined {
  return PATIENT_FIXTURES.find((p) => p.mrn === mrn);
}
