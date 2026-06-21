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
    visitTranscript: `Clinician: Good morning Alex, how have you been since our last contact?
Patient: Better than right after the accident, but I still lose words in meetings. I'll know what I want to say and it just vanishes.
Clinician: Can you give me an example?
Patient: Yesterday I couldn't remember the word "spreadsheet" — I said "the numbers table thing." My wife finishes my sentences now, which is embarrassing.
Clinician: Any headaches, dizziness, or sleep changes?
Patient: Headaches maybe twice a week, mild. Sleep is okay with the sertraline. No dizziness.
Clinician: How is driving?
Patient: I drive locally but avoid highways. Reaction time feels slower.
Clinician: Let's review today's testing. On the interview you reported increased irritability and reduced confidence at work as a project manager.`,
    testBattery: [
      { test: "WASI-II", subtest: "Vocabulary", standardScore: 11, percentile: 63, classification: "Average" },
      { test: "WASI-II", subtest: "Matrix Reasoning", standardScore: 12, percentile: 75, classification: "High Average" },
      { test: "CVLT-3", subtest: "Total Recall Trials 1-5", standardScore: 7, percentile: 16, classification: "Low Average" },
      { test: "CVLT-3", subtest: "Long Delay Free Recall", standardScore: 6, percentile: 9, classification: "Low Average" },
      { test: "CVLT-3", subtest: "Recognition Discriminability", standardScore: 10, percentile: 50, classification: "Average" },
      { test: "Trail Making Test", subtest: "Part A", standardScore: 9, percentile: 37, classification: "Average" },
      { test: "Trail Making Test", subtest: "Part B", standardScore: 7, percentile: 16, classification: "Low Average" },
      { test: "Boston Naming Test", subtest: "Total Correct", standardScore: 8, percentile: 25, classification: "Low Average" },
      { test: "Digit Span", subtest: "Forward", standardScore: 10, percentile: 50, classification: "Average" },
      { test: "Digit Span", subtest: "Backward", standardScore: 8, percentile: 25, classification: "Low Average" },
      { test: "PHQ-9", subtest: "Total", standardScore: 12, percentile: 0, classification: "Moderate depressive symptoms" },
      { test: "GAD-7", subtest: "Total", standardScore: 8, percentile: 0, classification: "Mild anxiety symptoms" },
    ],
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
    visitTranscript: `Clinician: Jordan, what brings you in today?
Patient: My daughter says I'm repeating myself. I forget appointments even with reminders on the fridge.
Clinician: When did you first notice this?
Patient: Maybe two years ago, worse in the last six months. Since my husband passed I thought it was grief, but it's not getting better.
Clinician: Do you get lost in familiar places?
Patient: Once in my own neighborhood last month. That scared me.
Clinician: Any visual hallucinations, tremor, or gait changes?
Patient: No hallucinations. I walk slower but I blame my knees.
Clinician: You started donepezil recently — any side effects?
Patient: Some vivid dreams, otherwise fine.
Clinician: Today we'll look at memory, language, executive functions, and mood to help clarify what's going on.`,
    testBattery: [
      { test: "RBANS", subtest: "Immediate Memory Index", standardScore: 65, percentile: 1, classification: "Impaired" },
      { test: "RBANS", subtest: "Delayed Memory Index", standardScore: 60, percentile: 0.4, classification: "Impaired" },
      { test: "RBANS", subtest: "Visuospatial/Constructional Index", standardScore: 85, percentile: 16, classification: "Low Average" },
      { test: "RBANS", subtest: "Language Index", standardScore: 90, percentile: 25, classification: "Low Average" },
      { test: "RBANS", subtest: "Attention Index", standardScore: 82, percentile: 12, classification: "Low Average" },
      { test: "Clock Drawing", subtest: "Total", standardScore: 5, percentile: 5, classification: "Impaired" },
      { test: "Animal Fluency", subtest: "Total Correct", standardScore: 7, percentile: 16, classification: "Low Average" },
      { test: "Trail Making Test", subtest: "Part B", standardScore: 5, percentile: 5, classification: "Impaired" },
      { test: "Geriatric Depression Scale", subtest: "Total", standardScore: 8, percentile: 0, classification: "Mild depressive symptoms" },
      { test: "Logical Memory II", subtest: "Delayed Recall", standardScore: 4, percentile: 2, classification: "Impaired" },
    ],
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
    visitTranscript: `Clinician: Sam, tell me about what's been hardest day to day.
Patient: I can't finish anything. I'll start five tasks and my brain jumps. Deadlines at work are a disaster — I'm a graphic designer and I miss client emails constantly.
Clinician: Any hyperactivity or mostly inattention?
Patient: Both. I fidget, I interrupt people, and I hyperfocus on art for hours then forget to eat.
Clinician: Sleep?
Patient: Terrible schedule. I stay up until 3am and then crash.
Clinician: Substance use?
Patient: Cannabis occasionally, no alcohol issues.
Clinician: We'll assess attention, processing speed, executive function, and mood/anxiety today.`,
    testBattery: [
      { test: "WISC-V", subtest: "Verbal Comprehension Index", standardScore: 110, percentile: 75, classification: "High Average" },
      { test: "WISC-V", subtest: "Visual Spatial Index", standardScore: 105, percentile: 63, classification: "Average" },
      { test: "WISC-V", subtest: "Working Memory Index", standardScore: 88, percentile: 21, classification: "Low Average" },
      { test: "WISC-V", subtest: "Processing Speed Index", standardScore: 82, percentile: 12, classification: "Low Average" },
      { test: "Conners CPT-3", subtest: "Detectability d'", standardScore: 78, percentile: 7, classification: "Impaired" },
      { test: "Conners CPT-3", subtest: "Commissions", standardScore: 72, percentile: 3, classification: "Impaired" },
      { test: "Trail Making Test", subtest: "Part B", standardScore: 85, percentile: 16, classification: "Low Average" },
      { test: "Stroop", subtest: "Color-Word Interference", standardScore: 90, percentile: 25, classification: "Low Average" },
      { test: "GAD-7", subtest: "Total", standardScore: 11, percentile: 0, classification: "Moderate anxiety symptoms" },
      { test: "ASRS", subtest: "Part A", standardScore: 6, percentile: 0, classification: "Positive ADHD screen" },
    ],
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
    visitTranscript: `Clinician: Morgan, how has cognition been since finishing chemotherapy?
Patient: I feel foggy. Reading research papers takes twice as long. I used to hold complex formulas in my head — now I need notes for everything.
Clinician: When did you notice the change?
Patient: During the last two cycles of chemo, and it hasn't fully cleared six months out.
Clinician: Fatigue levels?
Patient: Moderate fatigue by afternoon. Mornings are best.
Clinician: Mood?
Patient: Anxious about returning to the lab but motivated. No depression like during treatment.
Clinician: We'll compare today's results to your pre-treatment baseline to quantify change.`,
    testBattery: [
      { test: "WASI-II", subtest: "Full Scale IQ-2 Estimate", standardScore: 108, percentile: 70, classification: "High Average" },
      { test: "CVLT-3", subtest: "Total Recall Trials 1-5", standardScore: 9, percentile: 37, classification: "Average" },
      { test: "CVLT-3", subtest: "Long Delay Free Recall", standardScore: 8, percentile: 25, classification: "Low Average" },
      { test: "Digit Symbol Coding", subtest: "Scaled Score", standardScore: 7, percentile: 16, classification: "Low Average" },
      { test: "Trail Making Test", subtest: "Part B", standardScore: 9, percentile: 37, classification: "Average" },
      { test: "Verbal Fluency", subtest: "Phonemic (FAS)", standardScore: 10, percentile: 50, classification: "Average" },
      { test: "Paced Auditory Serial Addition", subtest: "Total Correct", standardScore: 8, percentile: 25, classification: "Low Average" },
      { test: "Beck Depression Inventory-II", subtest: "Total", standardScore: 9, percentile: 0, classification: "Minimal depressive symptoms" },
      { test: "Fatigue Severity Scale", subtest: "Total", standardScore: 4.2, percentile: 0, classification: "Clinically significant fatigue" },
    ],
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
