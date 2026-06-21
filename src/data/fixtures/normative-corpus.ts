import type { NormativeChunk } from "@/data/contracts";

/**
 * Normative interpretive corpus for Norm RAG.
 *
 * Sources: published clinical criteria (DSM-5-TR, Petersen 2018, Albert 2011,
 * Jack 2018, AAN guidelines, Slick et al. SVT), easystats/report interpretive
 * band language, and sho-87/cognitive-battery construct mappings.
 * All text is interpretive synthesis — no licensed manual text reproduced verbatim.
 */
export const NORMATIVE_CORPUS: NormativeChunk[] = [
  // ─── WAIS-IV ─────────────────────────────────────────────────────────────

  {
    id: "wais-fsiq-18-44-avg",
    test: "WAIS-IV",
    domain: "general",
    ageBand: "18-44",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "WAIS-IV Full Scale IQ SS 90-109 (25th-73rd percentile) falls in the Average range for ages 18-44. Isolated low performance in one index within an otherwise Average profile suggests domain-specific rather than global intellectual weakness.",
  },
  {
    id: "wais-fsiq-45-64-avg",
    test: "WAIS-IV",
    domain: "general",
    ageBand: "45-64",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "WAIS-IV FSIQ SS 90-109 is Average for ages 45-64. Mild processing speed decline relative to verbal ability is normative; interpret PSI in context of age-expected slowing before attributing to acquired impairment.",
  },
  {
    id: "wais-fsiq-65-69",
    test: "WAIS-IV",
    domain: "general",
    ageBand: "65-69",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "WAIS-IV FSIQ for ages 65-69: ≥120 Very Superior; 110-119 High Average; 90-109 Average; 80-89 Low Average; 70-79 Borderline; <70 Extremely Low. Standard scores are age-corrected — compare to same-age peers, not population base rates.",
  },
  {
    id: "wais-fsiq-70-74",
    test: "WAIS-IV",
    domain: "general",
    ageBand: "70-74",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "WAIS-IV FSIQ for ages 70-74: Average range (SS 90-109) indicates intact general intellectual functioning relative to age peers. Increased variance between indices is normative in this age band; use index scores rather than composite for clinical interpretation.",
  },
  {
    id: "wais-fsiq-75plus",
    test: "WAIS-IV",
    domain: "general",
    ageBand: "75+",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "WAIS-IV FSIQ for ages 75+: SS 90+ is Average or above. At this age band, Low Average (80-89) may reflect normal aging on fluid abilities; weigh against estimated premorbid level and functional independence before inferring decline.",
  },
  {
    id: "wais-vci-construct",
    test: "WAIS-IV",
    domain: "language",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "WAIS-IV Verbal Comprehension Index (VCI) measures crystallized intelligence, verbal concept formation, and acquired knowledge. VCI is relatively resistant to acquired brain injury and often used as a premorbid intellectual estimate when performance indices are depressed.",
  },
  {
    id: "wais-pri-construct",
    test: "WAIS-IV",
    domain: "executive",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "WAIS-IV Perceptual Reasoning Index (PRI) measures fluid reasoning, visual processing, and visuospatial construction. PRI is sensitive to right hemisphere dysfunction and acquired deficits; a VCI-PRI discrepancy >15 points warrants further investigation.",
  },
  {
    id: "wais-wmi-65-69",
    test: "WAIS-IV",
    domain: "executive",
    ageBand: "65-69",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "Working Memory Index SS 90 (25th percentile) is Low Average for ages 65-69. Dissociation between preserved reasoning (PRI/VCI) and reduced working memory may reflect attentional or encoding factors rather than global intellectual decline.",
  },
  {
    id: "wais-psi-65-69",
    test: "WAIS-IV",
    domain: "processing speed",
    ageBand: "65-69",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "Processing Speed Index SS 86 (18th percentile) is Low Average for ages 65-69. In elderly patients, processing speed decline may reflect medical comorbidity, motor slowing, or fatigue; interpret in context of effort and motor limitations.",
  },
  {
    id: "wais-psi-75plus",
    test: "WAIS-IV",
    domain: "processing speed",
    ageBand: "75+",
    source: "WAIS-IV interpretive bands (synthesis)",
    text: "PSI SS 80-89 (Low Average) is common in adults 75+ due to normative motor and processing slowing. PSI below SS 70 (Extremely Low) at this age band warrants consideration of neurological contributors beyond normal aging.",
  },

  // ─── WMS-IV ──────────────────────────────────────────────────────────────

  {
    id: "wms-delayed-65-69",
    test: "WMS-IV",
    domain: "memory",
    ageBand: "65-69",
    source: "WMS-IV interpretive bands (synthesis)",
    text: "Delayed Memory Index SS 73 (4th percentile) falls in the Borderline range for age 65-69. Pattern of poor delayed recall with relatively preserved immediate memory suggests encoding/storage difficulty rather than retrieval-only deficit.",
  },
  {
    id: "wms-immediate-65-69",
    test: "WMS-IV",
    domain: "memory",
    ageBand: "65-69",
    source: "WMS-IV interpretive bands (synthesis)",
    text: "Immediate Memory Index SS 81 (10th percentile) is Low Average for ages 65-69. When paired with Borderline delayed recall, consider amnestic process rather than global cognitive decline.",
  },
  {
    id: "wms-recognition-cueing",
    test: "WMS-IV",
    domain: "memory",
    ageBand: "65-69",
    source: "WMS-IV interpretive bands (synthesis)",
    text: "Limited benefit from recognition cueing when delayed free recall is impaired suggests encoding/storage rather than retrieval-only deficit — clinically relevant for amnestic MCI differential.",
  },
  {
    id: "wms-visual-memory-construct",
    test: "WMS-IV",
    domain: "memory",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "WMS-IV Visual Memory Index measures nonverbal memory encoding and delayed reproduction. Dissociation between verbal (immediate/delayed) and visual memory indices can help localize dysfunction; verbal > visual suggests right hemisphere involvement.",
  },
  {
    id: "wms-delayed-18-44",
    test: "WMS-IV",
    domain: "memory",
    ageBand: "18-44",
    source: "WMS-IV interpretive bands (synthesis)",
    text: "Delayed Memory Index SS 85-115 is expected for ages 18-44. SS <78 (7th percentile) in this age band is clinically significant and warrants differential diagnosis including psychiatric contributors, substance use, and acquired neurological causes.",
  },
  {
    id: "wms-delayed-70-74",
    test: "WMS-IV",
    domain: "memory",
    ageBand: "70-74",
    source: "WMS-IV interpretive bands (synthesis)",
    text: "Delayed Memory Index SS 75-90 is common in adults 70-74. SS below 70 suggests impairment beyond normal aging; compare to premorbid estimates and document functional memory complaints to contextualize findings.",
  },

  // ─── CVLT-3 ──────────────────────────────────────────────────────────────

  {
    id: "cvlt-recognition-18-59",
    test: "CVLT-3",
    domain: "memory",
    ageBand: "18-59",
    source: "CVLT-3 interpretive (synthesis)",
    text: "Low free recall with Average recognition discriminability suggests retrieval deficit. Low free recall with poor recognition suggests encoding/storage deficit — pattern relevant to amnestic presentations.",
  },
  {
    id: "cvlt-learning-slope",
    test: "CVLT-3",
    domain: "memory",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "CVLT-3 measures verbal list learning, serial position effects, encoding strategies, retention over delay, and recognition memory. Flat learning curve (trial 1 ≈ trial 5) despite repeated exposure suggests encoding impairment or limited strategy use.",
  },
  {
    id: "cvlt-intrusions",
    test: "CVLT-3",
    domain: "memory",
    source: "CVLT-3 interpretive (synthesis)",
    text: "Elevated intrusion errors on CVLT-3 (>5 per recall trial) may indicate poor source monitoring or confabulation tendency; flag for clinician review. Perseverative intrusions specifically suggest frontal-executive involvement.",
  },
  {
    id: "cvlt-retention-ratio",
    test: "CVLT-3",
    domain: "memory",
    ageBand: "65-74",
    source: "CVLT-3 interpretive (synthesis)",
    text: "Normal retention for ages 65-74: Long Delay Free Recall ≥ 80% of Trial 5 score. Retention ratio below 70% indicates rapid forgetting — key indicator distinguishing amnestic MCI from other cognitive profiles.",
  },
  {
    id: "cvlt-embedded-validity",
    test: "CVLT-3",
    domain: "validity",
    source: "Slick et al. SVT criteria (synthesis)",
    text: "CVLT-3 Forced Choice Recognition: chance performance is 50%; scores ≤42/50 (84% accuracy) are below what even severely amnestic patients typically achieve. Scores at or below chance raise concern for performance invalidity.",
  },

  // ─── RAVLT ───────────────────────────────────────────────────────────────

  {
    id: "ravlt-delayed-65-74",
    test: "RAVLT",
    domain: "memory",
    ageBand: "65-74",
    source: "RAVLT clinical interpretation (synthesis)",
    text: "Delayed free recall SS 70 (2nd percentile) with limited recognition benefit suggests encoding deficit. Compare to premorbid estimates before attributing to degenerative disease.",
  },
  {
    id: "ravlt-proactive-interference",
    test: "RAVLT",
    domain: "memory",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "RAVLT assesses verbal learning across five trials, proactive interference (List B effect), retroactive interference, and delayed recall. Steep interference effects relative to learning slope suggest susceptibility to distraction rather than primary encoding failure.",
  },

  // ─── Trail Making ────────────────────────────────────────────────────────

  {
    id: "trails-construct",
    test: "Trail Making Test",
    domain: "executive",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "Trail Making Part A measures visual scanning, processing speed, and psychomotor speed. Part B adds set-shifting and cognitive flexibility. The Part B/A ratio isolates executive demand from motor and processing speed contributions; a ratio >3 suggests specific executive impairment.",
  },
  {
    id: "trails-b-65-69",
    test: "Trail Making Test",
    domain: "executive",
    ageBand: "65-69",
    source: "Trails interpretive bands (synthesis)",
    text: "Trail Making Part B SS 84 (14th percentile) is Low Average for ages 65-69. Executive slowing may reflect processing speed, visual search, or motor factors; compare to Part A and behavioral observations.",
  },
  {
    id: "trails-a-18-44",
    test: "Trail Making Test",
    domain: "processing speed",
    ageBand: "18-44",
    source: "Trails interpretive bands (synthesis)",
    text: "Trail Making Part A SS 85-115 is expected for ages 18-44. Errors on Part A (not just slowness) suggest attentional lapses or visuospatial processing difficulty rather than motor slowing.",
  },
  {
    id: "trails-b-70-74",
    test: "Trail Making Test",
    domain: "executive",
    ageBand: "70-74",
    source: "Trails interpretive bands (synthesis)",
    text: "Trail Making Part B SS below 80 is common in adults 70-74 due to normative slowing. Errors (vs. slowness) are more clinically significant; errors on Part B with intact Part A suggest set-shifting difficulty beyond processing speed.",
  },
  {
    id: "trails-b-75plus",
    test: "Trail Making Test",
    domain: "executive",
    ageBand: "75+",
    source: "Trails interpretive bands (synthesis)",
    text: "Trail Making Part B SS 70-85 (Low Average to Borderline) is common in adults 75+ due to motor slowing. Cannot complete Part B should prompt evaluation for significant executive or attentional dysfunction.",
  },

  // ─── Boston Naming Test ───────────────────────────────────────────────────

  {
    id: "bnt-65-69-avg",
    test: "Boston Naming Test",
    domain: "language",
    ageBand: "65-69",
    source: "BNT interpretive bands (synthesis)",
    text: "Boston Naming Test SS 92 (30th percentile) is Average for ages 65-69. Preserved confrontation naming argues against primary language degeneration when memory is the chief complaint.",
  },
  {
    id: "bnt-construct",
    test: "Boston Naming Test",
    domain: "language",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "Boston Naming Test (BNT) measures confrontation naming, word retrieval, and lexical access. Semantic cue benefit > phonemic cue benefit suggests storage loss (semantic dementia pattern); phonemic cue benefit > semantic cue benefit suggests retrieval deficit (tip-of-tongue phenomenon).",
  },
  {
    id: "bnt-75plus",
    test: "Boston Naming Test",
    domain: "language",
    ageBand: "75+",
    source: "BNT interpretive bands (synthesis)",
    text: "BNT SS below 85 is more common in adults 75+; score below 70 (2nd percentile age-corrected) suggests significant word-finding difficulty beyond normal aging and warrants further language evaluation.",
  },
  {
    id: "bnt-ftd-pattern",
    test: "Boston Naming Test",
    domain: "language",
    source: "FTD clinical criteria (synthesis)",
    text: "Severe confrontation naming impairment (BNT SS <60) disproportionate to memory and executive deficits is consistent with semantic-variant primary progressive aphasia (svPPA). Distinguish from anomic aphasia by assessing semantic memory and word-picture matching.",
  },

  // ─── COWAT / Verbal Fluency ───────────────────────────────────────────────

  {
    id: "cowat-construct",
    test: "Verbal Fluency",
    domain: "executive",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "COWAT measures phonemic verbal fluency (letter F, A, S). Category fluency (Animals, Fruits) measures semantic retrieval and organization. Phonemic < Category fluency suggests executive/frontal deficit; Category < Phonemic suggests semantic memory degradation.",
  },
  {
    id: "cowat-65-69",
    test: "Verbal Fluency",
    domain: "executive",
    ageBand: "65-69",
    source: "Verbal fluency norms (synthesis)",
    text: "Phonemic fluency SS 88 (21st percentile) is Low Average for ages 65-69. Mild executive/language retrieval weakness is common in aging; weigh against memory findings when forming impression.",
  },
  {
    id: "cowat-18-44",
    test: "Verbal Fluency",
    domain: "executive",
    ageBand: "18-44",
    source: "Verbal fluency norms (synthesis)",
    text: "COWAT FAS SS 90-110 expected for ages 18-44 with average education. Category fluency <12 words/minute (Animals) in this age band is below normative expectation and may reflect semantic organization deficit.",
  },

  // ─── RBANS ───────────────────────────────────────────────────────────────

  {
    id: "rbans-attention-70-74",
    test: "RBANS",
    domain: "attention",
    ageBand: "70-74",
    source: "RBANS interpretive bands (synthesis)",
    text: "RBANS Attention Index SS 82 (12th percentile) is Low Average for ages 70-74. Attention deficits can depress memory performance; consider effort, fatigue, and mood when interpreting memory indices.",
  },
  {
    id: "rbans-total-construct",
    test: "RBANS",
    domain: "general",
    source: "cognitive-battery construct mapping (synthesis)",
    text: "RBANS Total Scale measures five cognitive domains: Immediate Memory, Visuospatial/Constructional, Language, Attention, and Delayed Memory. RBANS is a brief screening battery; low scores warrant comprehensive neuropsychological evaluation, not definitive diagnosis.",
  },
  {
    id: "rbans-memory-75plus",
    test: "RBANS",
    domain: "memory",
    ageBand: "75+",
    source: "RBANS interpretive bands (synthesis)",
    text: "RBANS Delayed Memory Index SS below 70 (2nd percentile) for adults 75+ indicates significant memory impairment beyond normal aging. This warrants clinical attention and, if confirmed with comprehensive testing, consideration of amnestic MCI or NCD.",
  },
  {
    id: "rbans-language-index",
    test: "RBANS",
    domain: "language",
    source: "RBANS interpretive bands (synthesis)",
    text: "RBANS Language Index SS 85-115 is Average. Language index includes Picture Naming and Semantic Fluency; combined score below SS 80 suggests naming and/or lexical retrieval weakness warranting BNT and COWAT follow-up.",
  },

  // ─── MoCA ────────────────────────────────────────────────────────────────

  {
    id: "moca-screening",
    test: "MoCA",
    domain: "screening",
    source: "MoCA clinical use (synthesis)",
    text: "MoCA ≤26 suggests possible cognitive impairment in educated older adults; MoCA 24/30 with predominant delayed recall weakness warrants comprehensive neuropsychological evaluation rather than screening alone.",
  },
  {
    id: "moca-domains",
    test: "MoCA",
    domain: "screening",
    source: "MoCA clinical use (synthesis)",
    text: "MoCA assesses visuospatial/executive (5 pts), naming (3 pts), memory (5 pts), attention (6 pts), language (3 pts), abstraction (2 pts), orientation (6 pts). Pattern of domain loss guides differential: memory + orientation loss → amnestic; executive + attention → vascular or DLB; language → PPA.",
  },
  {
    id: "moca-education-correction",
    test: "MoCA",
    domain: "screening",
    source: "MoCA clinical use (synthesis)",
    text: "Add 1 point to MoCA score for patients with ≤12 years education. MoCA has limited ceiling for highly educated adults (SS 26-30 may mask subtle deficits); comprehensive testing recommended when clinical concern persists despite normal MoCA.",
  },

  // ─── TOMM / Validity ─────────────────────────────────────────────────────

  {
    id: "tomm-cutoffs",
    test: "TOMM",
    domain: "validity",
    source: "Slick et al. SVT criteria (synthesis)",
    text: "TOMM Trial 1 score <36 or Trial 2 score <45 raises concern for performance invalidity. Even severely amnestic patients typically score ≥45 on Trial 2. Retention score <45 is the primary clinical indicator; interpret in context of overall validity picture.",
  },
  {
    id: "reliable-digit-span",
    test: "General",
    domain: "validity",
    source: "Slick et al. SVT criteria (synthesis)",
    text: "Reliable Digit Span (WAIS-IV Digit Span Forward + Backward, longer span): cutoff <7 in adults suggests possible performance invalidity. Sensitivity ~50%, specificity ~90%; use as one indicator in a multi-measure validity battery, not in isolation.",
  },
  {
    id: "svt-criteria",
    test: "General",
    domain: "validity",
    source: "Slick et al. SVT criteria (synthesis)",
    text: "Symptom Validity Testing (Slick et al. 2005): performance invalidity is probable (Level B) when at least one free-standing SVT fails and below-chance performance on forced-choice memory cannot be explained by genuine neurological deficit. Classify all low scores in context of validity findings.",
  },
  {
    id: "effort-behavioral-signs",
    test: "General",
    domain: "validity",
    source: "Clinical practice (synthesis)",
    text: "Behavioral signs of poor effort: inconsistent performance across similar tasks, better performance on harder than easier tasks, high variability within test session, unusually slow response times relative to alleged deficits, and marked discrepancy between test performance and observed functional abilities.",
  },
  {
    id: "effort-caveat",
    test: "General",
    domain: "validity",
    source: "Clinical practice (synthesis)",
    text: "Interpret all cognitive findings in light of effort, mood, fatigue, sensory/motor limitations, and cultural/linguistic factors. Flag inconsistent performance patterns for clinician review.",
  },

  // ─── Clinical Criteria: MCI ───────────────────────────────────────────────

  {
    id: "petersen-amnestic-mci",
    test: "Clinical criteria",
    domain: "memory",
    source: "Petersen et al. (2018) MCI criteria",
    text: "Amnestic MCI: subjective memory complaint, objective memory impairment on standardized testing, preserved general cognition and functional independence. Delayed recall disproportionately impaired relative to immediate recall supports amnestic subtype.",
  },
  {
    id: "albert-mci-subtypes",
    test: "Clinical criteria",
    domain: "general",
    source: "Albert et al. (2011) MCI criteria",
    text: "MCI subtypes: single-domain amnestic (memory only) carries highest Alzheimer's risk; multi-domain amnestic (memory + other domains) may reflect AD or vascular; non-amnestic (executive or language predominant) may reflect FTD, DLB, or vascular etiology.",
  },
  {
    id: "mci-recommendations",
    test: "Clinical criteria",
    domain: "general",
    source: "MCI management (synthesis)",
    text: "When amnestic MCI pattern is present, recommendations typically include cognitive follow-up (12-18 months), safety planning (driving, finances), caregiver education, and medical workup for reversible contributors — avoid definitive etiological diagnosis in report.",
  },
  {
    id: "mci-reversible-contributors",
    test: "Clinical criteria",
    domain: "general",
    source: "AAN dementia practice guideline",
    text: "When memory is selectively impaired with other domains relatively preserved, consider neurodegenerative etiology but rule out reversible causes: thyroid dysfunction, vitamin B12 deficiency, depression, obstructive sleep apnea, and polypharmacy before concluding progressive disease.",
  },

  // ─── Clinical Criteria: DSM-5-TR NCD ─────────────────────────────────────

  {
    id: "dsm5-mild-ncd",
    test: "Clinical criteria",
    domain: "general",
    source: "DSM-5-TR Mild NCD",
    text: "Mild Neurocognitive Disorder requires modest cognitive decline from baseline in one or more domains (1-2 SD below normative mean), sufficient to interfere with complex instrumental activities (finances, medications, complex scheduling) but not basic ADLs. Do not diagnose without corroborating functional data.",
  },
  {
    id: "dsm5-major-ncd",
    test: "Clinical criteria",
    domain: "general",
    source: "DSM-5-TR Major NCD",
    text: "Major Neurocognitive Disorder requires substantial cognitive decline (>2 SD below normative mean) in one or more domains with interference in basic ADLs and independence. Must exclude delirium and not be better explained by another mental disorder.",
  },
  {
    id: "dsm5-ncd-domains",
    test: "Clinical criteria",
    domain: "general",
    source: "DSM-5-TR NCD domains",
    text: "DSM-5-TR NCD cognitive domains: complex attention, executive function, learning and memory, language, perceptual-motor, and social cognition. Report which domain(s) are impaired and document functional impact for each.",
  },

  // ─── Clinical Criteria: ATN / AD ─────────────────────────────────────────

  {
    id: "jack-atn-framework",
    test: "Clinical criteria",
    domain: "general",
    source: "Jack et al. (2018) ATN framework",
    text: "Jack 2018 ATN biological framework: A (amyloid), T (tau), N (neurodegeneration). Biomarker-positive A+T+N+ indicates Alzheimer's continuum. Neuropsychological testing reflects N (neurodegeneration) — memory-predominant profile with hippocampal features is consistent with Alzheimer's pathology pattern but requires biomarker confirmation.",
  },
  {
    id: "aan-dementia-guideline",
    test: "Clinical criteria",
    domain: "general",
    source: "AAN dementia practice guideline",
    text: "AAN guidelines: dementia diagnosis requires cognitive or behavioral symptoms that: represent decline from prior functioning, interfere with ADLs, are not explained by delirium or psychiatric disorder, and are detected by history + objective testing. Minimum two domain impairment threshold.",
  },

  // ─── Clinical Criteria: FTD ───────────────────────────────────────────────

  {
    id: "ftd-behavioral-criteria",
    test: "Clinical criteria",
    domain: "executive",
    source: "Rascovsky et al. (2011) bvFTD criteria",
    text: "Behavioral-variant FTD (bvFTD) criteria include: early disinhibition, apathy/inertia, loss of empathy, perseverative/stereotyped behavior, hyperorality, and executive neuropsychological profile. Memory may be relatively preserved early; prominent behavioral change in the absence of memory loss should prompt FTD evaluation.",
  },
  {
    id: "ftd-ad-differentiation",
    test: "Clinical criteria",
    domain: "general",
    source: "Clinical neuropsychology (synthesis)",
    text: "FTD vs AD differentiation: FTD shows executive > memory impairment early; AD shows memory > executive impairment early. FTD onset typically 45-65 years; AD onset more commonly 65+. BNT and category fluency may be impaired in semantic FTD; visuospatial abilities typically preserved until late FTD.",
  },

  // ─── Clinical Criteria: Vascular NCD ─────────────────────────────────────

  {
    id: "vascular-ncd-criteria",
    test: "Clinical criteria",
    domain: "executive",
    source: "DSM-5-TR Vascular NCD criteria",
    text: "Vascular NCD: stepwise decline following vascular events, focal neurological signs, and neuroimaging evidence of cerebrovascular disease temporally related to cognitive onset. Executive and processing speed disproportionately impaired relative to memory; episodic memory may be relatively preserved.",
  },
  {
    id: "vascular-ncd-profile",
    test: "Clinical criteria",
    domain: "executive",
    source: "Clinical neuropsychology (synthesis)",
    text: "Vascular cognitive impairment profile: disproportionate impairment on Trail Making B, verbal fluency, and working memory relative to delayed recall. Preserved recognition memory with poor free recall suggests retrieval deficit consistent with frontal-subcortical involvement.",
  },

  // ─── Clinical Criteria: DLB ───────────────────────────────────────────────

  {
    id: "dlb-criteria",
    test: "Clinical criteria",
    domain: "attention",
    source: "McKeith et al. (2017) DLB criteria",
    text: "DLB core clinical features: fluctuating cognition, recurrent visual hallucinations, REM sleep behavior disorder, parkinsonism. Neuropsychological profile: attentional fluctuation, visuospatial impairment disproportionate to memory. RBANS Visuospatial < Memory index discrepancy is characteristic.",
  },

  // ─── Heaton Base Rates ────────────────────────────────────────────────────

  {
    id: "heaton-base-rates",
    test: "General",
    domain: "general",
    source: "Heaton base rates (synthesis)",
    text: "Standard scores M=100, SD=15. Classifications: ≥85 Average or above; 70-84 Low Average; 55-69 Borderline; <55 Extremely Low. Apply SEM and base-rate tables when interpreting isolated low scores.",
  },
  {
    id: "heaton-base-rates-multiple-low",
    test: "General",
    domain: "general",
    source: "Heaton et al. base-rate tables (synthesis)",
    text: "Heaton base-rate consideration: the probability of obtaining at least one low score (SS <85) increases with battery size — up to 50% of healthy adults show one Low Average score in a 10-test battery. Multiple impaired scores are clinically meaningful; isolated low scores require caution in interpretation.",
  },

  // ─── Premorbid Estimation ─────────────────────────────────────────────────

  {
    id: "premorbid-estimate",
    test: "General",
    domain: "general",
    source: "Premorbid estimation (synthesis)",
    text: "Compare current intellectual and memory scores to estimated premorbid functioning (education, occupation, prior testing). Performance consistent with estimated premorbid level argues against progressive decline.",
  },
  {
    id: "naart-premorbid",
    test: "General",
    domain: "general",
    source: "NAART/NART premorbid estimation (synthesis)",
    text: "NAART/WTAR estimates premorbid verbal IQ from irregular word reading, which is resistant to acquired cognitive decline. NAART-estimated FSIQ significantly exceeding current FSIQ (>15 points) supports meaningful intellectual decline from premorbid baseline.",
  },
  {
    id: "education-premorbid",
    test: "General",
    domain: "general",
    source: "Demographic premorbid estimation (synthesis)",
    text: "Education and occupational complexity are robust premorbid ability proxies when reading-based premorbid tests are unavailable. Advanced degree + professional occupation → estimated premorbid FSIQ ≥110; high school education + manual occupation → estimated FSIQ ~95.",
  },

  // ─── Interpretation Principles ────────────────────────────────────────────

  {
    id: "intra-individual-variability",
    test: "General",
    domain: "general",
    source: "Neuropsychological interpretation (synthesis)",
    text: "Intra-individual variability ≥1.5 SD between highest and lowest index scores may indicate selective impairment. Memory-specific decline with preserved reasoning and language supports amnestic profile.",
  },
  {
    id: "depression-dementia-dissociation",
    test: "General",
    domain: "general",
    source: "Neuropsychological interpretation (synthesis)",
    text: "Depression vs. dementia dissociation: depression typically shows effort-dependent deficits (working memory, processing speed, effortful encoding) with intact recognition; dementia shows storage failure with poor recognition. Mood screening is required in all cognitive evaluations.",
  },
  {
    id: "medication-effects",
    test: "General",
    domain: "general",
    source: "Neuropsychological interpretation (synthesis)",
    text: "Anticholinergic medications (diphenhydramine, oxybutynin, certain antidepressants) impair encoding and processing speed. Benzodiazepines depress global cognition and memory. Document all medications and timing relative to testing; consider washout periods when clinically feasible.",
  },
  {
    id: "serial-position-effects",
    test: "General",
    domain: "memory",
    source: "Neuropsychological interpretation (synthesis)",
    text: "Normal serial position effects: primacy (first items recalled) and recency (last items recalled) with a middle dip. Absent primacy with intact recency suggests hippocampal storage failure; absent recency with intact primacy suggests rapid forgetting or attention failure.",
  },
  {
    id: "domain-intact-definition",
    test: "General",
    domain: "general",
    source: "Neuropsychological interpretation (synthesis)",
    text: "Domain classification conventions: intact = SS ≥85 (≥16th percentile); mild impairment = SS 70-84 (2nd-15th percentile); moderate impairment = SS 55-69 (<2nd percentile); severe impairment = SS <55 (<0.1th percentile). Apply age-corrected norms consistently.",
  },
  {
    id: "multimodal-memory-pattern",
    test: "General",
    domain: "memory",
    source: "Neuropsychological interpretation (synthesis)",
    text: "Amnestic profile: impaired verbal AND visual delayed memory with relatively intact attention and executive function. Multi-domain profile: memory + executive/language/visuospatial deficits. Pattern of involvement guides etiology and treatment planning.",
  },
];
