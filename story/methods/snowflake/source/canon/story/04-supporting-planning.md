# Expanded-summary supporting planning

Status: accepted
Snowflake step: 04

The accepted deliverable is
[the expanded summary](04-expanded-summary.md). This file preserves the locked
beats, boundaries, rationale, and late-bound notes that support it.

Step 4 expands each sentence of the five-sentence summary into one paragraph.
The target is a short one-page synopsis of roughly five hundred words. The first
four paragraphs end on a disaster or irreversible turn. The fifth tells the
ending.

This remains synopsis work. It is not a chapter outline, scene list, or license
to design the exact genesis protocol.

Only material marked as locked or accepted is authoritative. Historical draft
wording remains provisional unless Joe accepted it and the decision was
recorded.

## Working method

Complete one paragraph at a time:

1. Lock the paragraph's dramatic function and closing turn.
2. Choose only the connective beats needed to make that turn causal.
3. Draft the paragraph after those decisions are accepted.
4. Check it against canon and the Step 3 sheets before moving on.

Drafting or accepting a paragraph does not replace its expanded planning.
Preserve locked beats, boundaries, rationale, and late-bound notes beside the
synopsis wording unless Joe explicitly asks to remove them.

## Paragraph map

### Paragraph 1: setup and anomaly

Source sentence:

> Months into caring for his mother Ruth, controls engineer Evan Hale is
> building a garage-scale MRI flux source with her when a defective
> superconducting ring begins producing measurements that should not agree.

Locked boundaries:

- Begin late, with Evan and Ruth already sharing the garage project.
- Ruth remains an intellectual participant as well as someone Evan cares for.
- The ordinary project is a persistent flux source for portable or open
  low-field MRI.
- Their immediate goal is a flux-pumping run with enough trapped field to give
  the longer-term portable-imaging project credible prospects.
- The old defective superconducting ring falls just short of that field
  target.
- Glass-bodied silicon junction diodes at selected positions around the ring
  act as local thermometers for the traveling heat pulse through the
  Prussian-blue compound. They are biased at constant current, and their
  forward voltage is logged as a temperature proxy. The exact diode type and
  number of sensing positions remain open.
- When the traveling heat pulse reaches one fixed sector of the defective
  ring, its diode reports a repeatable cold notch below the cold-stage
  temperature while the neighboring probes warm normally. Evan cannot
  reconcile it with the drive and the other measurements. He assumes an
  instrumentation fault and replaces the suspect probe and measurement chain
  through the data logger. Replacing the computer would have been his next
  diagnostic step.
- A costly custom ring, ordered months earlier, finally arrives and reaches
  the trapped-field target. The temperature anomaly disappears, apparently
  confirming Evan's equipment-failure diagnosis before he replaces the
  computer.
- Late that night, Evan reinstalls the defective ring. The same anomaly
  returns. The paragraph closes on this deliberate reproduction, not on the
  new ring's ordinary engineering success.

Dramatic function: the device that fails the stated engineering goal carries
the impossible result, while the device that succeeds removes it. Evan has
obtained the evidence needed to continue the imaging project, but he chooses to
reopen the failure after everyone else could reasonably have gone to bed.

Locked anomaly: the sub-bath cold notch. It recurs at one ring-fixed sector as
the traveling heat pulse reaches it. The affected diode drops below the
cold-stage reference while neighboring probes warm normally. The exact
temperature depth and notch duration remain open.

The reading must later survive known cryogenic sensor and material effects
without requiring matter to violate ordinary thermodynamics.

Locked Ruth contribution:

- Ruth's dementia fluctuates. On bad days she knows Evan is familiar without
  being able to place him clearly as her son.
- Evan keeps her involved for companionship and gives her bounded jobs so she
  can remain useful and included. He checks all of her work himself.
- Whenever the notch appears in data she is reviewing, Ruth spots it and
  points it out as though she has never seen it before.
- Her repeated fresh discovery shows both her surviving mathematical habits
  and her lost continuity. It is not treated as a formal blinded control or a
  mystical benefit of dementia.

Parked fallback: phase collapse. Spatially separated diode thermometers would
report the traveling pulse at the same phase when they should be staggered.
Keep this available if the impossible-temperature version cannot be made
scientifically convincing, but do not combine both effects in the opening.

Accepted paragraph:
[paragraph 1 of the expanded summary](04-expanded-summary.md#paragraph-1-setup-and-anomaly).

Planning state: complete.

### Paragraph 2: clarity, control, and obsession

Source sentence:

> While testing the anomaly, Evan experiences impossible clarity and discovers
> that the machine can force the improbable to happen, turning the project he
> shares with Ruth into an obsession that steals their remaining time
> together.

Decisions to make:

1. Choose the disaster or irreversible turn that marks the shared project
   becoming Evan's obsession. **Locked.**
2. Choose the real external problem Evan solves during the first clarity
   episode. **Locked.**
3. Choose the first deliberate test that proves the machine can force an
   improbable but physically valid outcome. **Locked.**
4. Draft and review the paragraph. **Accepted.**

Locked closing turn:

- Ruth has always wandered out of the garage, fallen asleep, or been away
  during parts of the work. That is not new.
- Before the anomaly gains urgency, Evan treats her absence as a pause in a
  shared activity. He waits, finds her, or catches her up.
- As the tests become rewarding, he keeps going when she leaves. He does not
  formally exclude her or decide that the project is now his.
- The project simply advances without her. Her participation becomes
  incidental, and the urgency of finding out what happens next displaces the
  reason they began working together.
- Planning analogy: they began like a couple watching a series together. Evan
  starts watching ahead because he needs to know what happens next, and the
  shared part quietly falls away.
- The paragraph closes on a small instance of this new rule: Ruth wanders or
  is out, and Evan begins the next consequential run instead of waiting.

Locked first clarity results:

- Evan advances the pulse timing in an attempt to move the cold notch toward
  another sensor. During clarity, a better ordinary phase sequence becomes
  obvious. It improves the trapped field enough to keep the defective ring
  useful.
- The timing change moves the notch between installed sensors, where the
  original diagnostic appears to disappear. Evan initially treats this as
  successful isolation.
- Retain the zero-speed motor-estimator concept from the legacy draft, but not
  its scene structure, wording, or exact placement.
- Evan has been unable to eliminate an intermittent torque spike in a
  sensorless motor controller at work.
- Near zero speed, back electromotive force vanishes into noise. Two opposing
  electrical-angle hypotheses remain compatible with the measurements, but the
  existing estimator forces one answer and sometimes chooses the wrong one.
- During clarity, Evan sees that the controller should carry both hypotheses
  through the unobservable interval and wait for returning back electromotive
  force to distinguish them. If they fail to rejoin within tolerance, it
  should trip rather than invent certainty.
- The insight uses information and skills Evan already has. It does not give
  him unknown facts.
- The phase-sequence improvement and rewritten motor fix both survive after
  the clarity state ends. The motor fix also survives simulation, review, and
  an external work-bench test.
- Evan experiences the clarity as an epiphany or unusually deep flow state. He
  claims both insights as his own and does not yet suspect that the apparatus
  has affected his mind. Related states recur during later timing work before
  he admits the connection.
- The thematic parallel is left implicit. Nobody explains that preserving
  alternatives solves the motor problem while Evan is learning to destroy
  alternatives elsewhere.

Locked deliberate test:

- A fresh physical random bit chooses between two safe, prepared actions in
  the live apparatus. The exact random source and action pair remain
  late-bound.
- Fresh bits remain fair when they are merely recorded. Replaying an earlier
  bitstream through the same command path produces no effect. Bias appears
  only when a fresh bit controls a real physical consequence in the current
  run.
- Reversing the bit-to-action mapping reverses the raw bit bias while
  preserving the favored physical action.
- The selected action sequence is improbable but physically valid. The test
  shows that the effect follows consequence rather than a lucky bit value,
  noise-source fault, or copied signal.
- This is the first deliberate proof, not the later spectacular
  precommitted-target demonstration. Do not crowd the paragraph with the whole
  validation ladder.
- Evan interprets the live-branch result as evidence that the apparatus has
  uncovered new physics. He calls Lena to examine that physical discovery, not
  to assess anything happening to him.

Accepted paragraph:
[paragraph 2 of the expanded summary](04-expanded-summary.md#paragraph-2-clarity-control-and-obsession).

Planning state: complete.

### Paragraph 3: Ruth's lucidity and contradiction

Source sentence:

> When Evan exposes Ruth to the machine, she becomes lucid and casually asks
> after the granddaughter who survived in her memories but was miscarried in
> his; Evan treats the impossible detail as a calibration error rather than
> confront what the machine has selected.

Decisions to make:

1. Choose how Evan's private epiphany becomes a suspected operator effect.
   **Locked.**
2. Choose what brings Ruth into her first exposure and how her agency is
   preserved. **Locked.**
3. Choose when Tess enters and what statistical problem brings her into the
   project. **Locked.**
4. Choose the texture and limits of Ruth's lucid interval before the
   granddaughter question. **Locked.**
5. Choose what Evan does when he converts the incompatible memory into a
   calibration problem, and use that choice as the paragraph's closing turn.
   **Locked.**
6. Draft and review the paragraph. **Accepted.**

Locked operator-effect bridge:

- Lena audits Evan's operator log, spoken notes, and the timing of the
  instrument anomaly.
- During the sensor-rank collapse, his corrections become less frequent and
  stop reversing. His spoken reasoning loses its normal alternatives. Both
  patterns return when the anomalous window ends.
- Lena asks what he experienced. Only then does Evan describe the state he had
  claimed as flow.
- A blinded repeat makes the state recur with the anomalous condition. They
  adopt `operator effect` as a working description.
- This establishes correlation, not enhancement, mind control, or a mechanism.
  It does not make Evan's certainty trustworthy.
- Lena identifies the connection. Evan does not discover it by introspection,
  and Ruth is not used as an oracle.

Locked exposure progression:

- Ruth's first exposure is incidental in purpose, not merely spatial. She is
  performing a real project task that participates in a live run when the
  operator effect reaches her. Nobody has proposed a cognitive experiment on
  her.
- The first effect is lucidity. It does not include the incompatible
  granddaughter memory.
- After experiencing the improvement, Ruth asks for more runs. Evan, Lena, and
  the rest of the team initially support reduced, monitored exposures.
- Ruth's requests are real choices. She is not deceived, exposed in secret, or
  treated over an objection. The ethical tension comes from Evan turning a
  benefit she wants into an expanding program of work.
- Several runs may appear useful before the incompatible memory emerges. Exact
  count, exposure progression, and duration remain open.
- Lena does not oppose human exposure at this stage. Her controls are part of
  the shared work. The alternate memory is what first makes her object to
  continuing.
- The Step 2 sentence compresses this progression. Ruth does not become lucid
  and mention the granddaughter in the same first exposure.

Locked Tess entrance:

- Tess arrives after Evan and Lena have produced a precommitted rare physical
  outcome, establishing that the apparatus can force a physically valid event
  that should almost never occur.
- As longer coincidence chains begin appearing outside the immediate
  apparatus, Lena recruits Tess to determine whether they are globally
  anomalous or products of postselection, hidden dependence, and retrospective
  pattern-making.
- Tess is not recruited to validate superconducting physics. Her specialty is
  compound and cascading risk.
- Nobody recruits her because of the ferry disaster or recognizes her causal
  rarity at this stage.
- Tess enters before Ruth's incidental lucidity. She is part of the initially
  supportive team for Ruth's requested repeat runs and begins forming an
  independent friendship with Ruth before the incompatible memory appears.
- Tess fully explains the longer coincidence chain that first requires her as
  a product of hidden dependence and retrospective choices. She then designs a
  precommitted control with independent inputs and a live consequence. A new
  chain of ordinary events satisfies its registered condition before the
  cutoff, becoming the first external anomaly she cannot explain away. The
  exact initial chain, dependency, control, consequence, and new chain remain
  open.
- Evan is initially skeptical of Tess's explanation. Once he checks the
  dependency against the records and sees that she is right, he is elated and
  helps rebuild the test around her correction.
- As Tess drafts the replacement control, Ruth asks one plain mathematical
  question that exposes a real flaw. Tess corrects the protocol and brings it
  back to Ruth before the run. This begins their independent friendship before
  Ruth's first projector-linked lucid interval. The exact question and flaw
  remain open.
- After a long garage session, Ruth goes to the garden when she loses the
  thread. Tess follows for air rather than to retrieve her. Ruth asks Tess to
  identify a volunteer plant, Tess gets it wrong, and Ruth teases her. This is
  their first ordinary time together outside the work. The exact plant and joke
  remain open.
- During Ruth's requested repeat runs, late sessions become overnight stays for
  Tess and Mouse in the spare room. Ruth asks why Tess keeps carrying Mouse's
  supplies home and tells her to leave them. Tess keeps her apartment for a
  while, but the house gradually becomes where she lives. There is no formal
  moving day.
- Tess initiates the first kiss during a long argument over a control, before
  either of them concedes the technical point. They return to the disagreement
  later. The ferry conversation and Evan's statistical-catastrophe description
  deepen an existing relationship rather than initiating it.
- As Tess tells him about the ferry, Evan connects her to the childhood
  survivor he remembers from news coverage when he was thirteen and says so
  immediately. Tess tells him what the simplified miracle story omitted. His
  later secret search for detailed records begins only after he suspects her
  causal rarity may matter.

Locked deepening-restoration progression:

- The first interval restores present orientation, working memory, and
  conversational continuity well enough for Ruth to recognize the people
  around her and rejoin the task in progress. The benefit is real to Ruth, not
  merely an improved test score.
- Each requested reduced run restores more continuity and lasts longer. The
  improvement remains temporary, and Ruth returns to her ordinary fluctuating
  impairment after each interval.
- The early intervals contain no incompatible autobiographical details or
  smaller warning contradictions. Ruth and the team have good reason to regard
  the progression as beneficial.
- The later run is Ruth's clearest and longest interval yet. The granddaughter
  memory enters as an ordinary fact within that otherwise coherent state. Ruth
  does not experience it as new, strange, or separate from the rest of her
  memory.
- The pattern is not proof of a cure. Ruth's interior remains unknowable: the
  story does not settle how she experiences the interval, whether she
  understands the change as rescue, or what she wants after the granddaughter
  contradiction. The exact number of runs and clock duration of each interval
  remain late-bound.

Locked concordance-window response:

- Evan calls the latest interval an overshoot. He treats the granddaughter
  memory as evidence that the run passed beyond a usable setting, not as a
  reason to question whether lucidity and agreement with his history can come
  apart.
- He defines the target as the strongest lucid interval in which Ruth's
  autobiographical reports remain concordant with his record family. In
  practice, concordance measures conformity to Evan's surviving records.
- He proposes another reduced run with precommitted memory checks to locate
  that window. The exact exposure variable, cognitive battery, run count, and
  stopping rule remain late-bound.
- Lena objects that agreement with Evan's records cannot tell them how Ruth
  experiences the interval or whether selecting against disagreement benefits
  her. At most, it selects a coherent autobiographical report that conforms to
  the history Evan already occupies.
- The later paired loss and echo establishes that the incompatible
  granddaughter memory was access to a real autobiographical history while
  that history was being stripped from accessible people and records. In light
  of that evidence, Evan's proposed protocol would suppress a real distinction
  precisely because it disagreed with his records.
- Evan turns the objection into a demand for better controls and begins
  formalizing the next run. That conversion, rather than the granddaughter
  question itself, closes the paragraph.
- Later Step 5 development resolves Ruth's response: she rejects concordance
  with Evan's records as the target, requests one more reduced exposure under
  her own terms, and receives it after that target is removed. See
  [Ruth's supporting planning](../characters/ruth-hale/05-supporting-planning.md#response-to-the-concordance-window).
  The accepted Step 4 paragraph remains unchanged.

Accepted paragraph:
[paragraph 3 of the expanded summary](04-expanded-summary.md#paragraph-3-ruths-lucidity-and-contradiction).

Planning state: complete.

### Paragraph 4: erasure and failed stopping

Source sentence:

> Addicted to the machine and haunted by entities that prove to be echoes of
> dying realities, Evan realizes each run is erasing entire universes; yet
> every attempt to stop becomes another impossible link in the chain that keeps
> it operating while Ruth's last lucid hours pass without him.

Locked structure:

- The operation does not hear wishes or infer private desires. A mundane goal
  becomes selectable only when success or failure will change a live decision
  inside a causally descended projector lineage. Spatial proximity alone does
  nothing.
- Its causal reach expands in four stages. First, one or two unlikely events
  remove small garage obstacles. Then longer conjunctions through suppliers,
  traffic, weather, institutions, animals, and strangers accomplish
  precommitted goals. Replica labs become overlapping causal centers whose
  outcomes alter one another's decisions. Finally, as alternatives disappear,
  trivial goals require longer and more damaging chains. The destination
  becomes predictable while the path becomes chaotic.
- A representative cross-lab chain begins with an ordinary failed run at one
  site. The failure releases a mundane resource another site needs, and an
  auditable chain of procurement, weather, transport, staffing, and related
  contingencies delivers it before a precommitted cutoff. The second site
  completes its blocked task. Every link is physically ordinary, but one lab's
  failure has become another lab's success.
- A later local accident kills one researcher. A surviving close collaborator
  retains technical competence but permanently loses every autobiographical
  memory of the dead person and their shared years. Evan treats the death as an
  engineering and containment failure. He accepts the evidence hold, then
  helps turn the loss into a bounded restart plan meant to find the failure and
  prevent another death. This is the third major instance of his defense after
  formalizing Ruth's incompatible memory and secretly measuring Tess's rare
  survival.
- Lena suspects that the distributed containment system is itself a carrier.
  The proposed test pairs an initial readout with a precommitted containment or
  decommissioning response. Lena refuses the complete protocol because the
  response to its result could complete the suspected loop. Evan argues that
  suspicion will not make institutions disengage. As a technical adviser
  without unilateral run authority, he sponsors the protocol through shared
  consortium approval. Participating sites execute it under local control.
  Reviewers, site leads, and operators receive the carrier hypothesis, its
  recursive risk, and Lena's stated reason for refusing before they approve.
  The initial readout fails to show an independent carrier. The sites
  nevertheless carry out the response assigned to that result. Their physical
  and institutional actions alter later conditions and decisions across the
  network, and the full aftermath shows that the readout and response together
  closed a live cycle without Evan or the garage apparatus. The protocol does
  not merely detect a carrier that was already independent; it proves and
  completes the first independent carrier. This ends Lena's collaboration
  before the full cosmological cost is proved. Evan reads the result as grim
  vindication: Lena was right about the recursive danger, but the institutions
  needed proof before they would sustain shutdown. He moves directly into
  coordinated stopping work and expects Lena to remain because he now sees
  containment as their shared duty. Her withdrawal from every live response
  surprises him.
- The conclusive erasure proof is paired loss and echo. After a run, one
  specific autobiographical distinction disappears from waking people and
  ordinary records. Tess retains enough continuity to establish a before-state.
  During shared contact, she and Evan independently recover the missing
  distinction as structured residue through their different modalities:
  visually for Evan and spatio-acoustically or relationally for Tess. The
  residue includes details Evan never knew. Further projection removes degrees
  of freedom from it. The entities do not explain what happened. Evan and Tess
  infer disappearance from accessible reality, persistence in contact, and
  degradation under continued projection.
- The same proof recontextualizes Ruth's incompatible granddaughter memory as
  access to a real autobiographical history while that history was being
  stripped away. It does not reveal Ruth's interior, but it does establish that
  Evan's concordance window would have suppressed a real distinction for
  failing to match his records.
- Do not make the Turning Knot's apparent fate carry this proof. Its objective
  fate remains unknowable. Do not make the Ruined Sovereign alone prove that
  histories were inhabited. The residual contact may remain unnamed.
- While Evan is measuring her, his questions around small decisions become
  more particular, and he sometimes records Tess's answers afterward. She
  notices the attention but reads it as ordinary project documentation mixed
  with genuine interest because Evan already logs nearly everything, her
  judgments affect the work, and they are newly intimate. His admission gives
  those moments a second meaning because she cannot know which were also
  observations. Their intimacy remains real.
- As the proof lands, Evan voluntarily admits that after he began to suspect
  Tess's rare history might matter to the anomaly, he continued running live
  projector work in her presence, compared her ordinary choices with active
  trials, and mined ferry, rescue, and medical records to estimate her rarity.
  His copies, model, calculations, and Tess-specific choice logs remained on a
  garage workstation and local storage separate from the apparatus controller.
  He sent no raw or derived Tess-specific material to Lena or the participating
  laboratories, and none entered the proof-to-stop protocol. He used it only
  in his private interpretation and local garage runs. The workstation and
  storage are not part of the active core he later moves. She does not catch
  him. The admission matters, but it does not undo the violation.
- Tess's first response is, "What exactly did you use?" She makes Evan identify
  what he took from her life before the argument turns to his reasons. Evan
  starts with the ferry, rescue, and medical records, the facts he took from
  them, and the rarity estimate he built. Only then does he name the ordinary
  choices he isolated and which garage observations and runs the analysis
  affected. He knows where the deepest violation lies and does not make Tess
  force him past a technical account. The exact documents and details remain
  late-bound.
- The first record Evan names is the official rescue timeline. It reconstructs
  the search attempts, failed approaches, the temporary path that let rescuers
  reach Tess, her extraction, and the attempts to reach the rest of her family.
  As he begins to recite it, Tess stops him: "I know the timeline. Tell me what
  you did with it." Evan tells her that he used the sequence to model the
  rescue bottleneck that left Tess alive when the others were not. She makes
  him account for his action rather than repeat her history. Exact agency,
  title, timings, access path, and rescue mechanics remain late-bound.
- Tess then says, "Show me." Evan opens the complete local folder on the garage
  workstation. She reviews the source records, model, calculations, timestamped
  choice logs, and notes linking them to particular garage observations and
  runs. She verifies the scope without moving or copying the folder out of the
  garage. Evan remains beside her, answers every question directly, does not
  choose the file order, and does not touch the keyboard unless she asks him to
  open something. The treatment does not need a first-file choice or a
  screen-by-screen account of the review.
- The independent analogue rules Tess out as a necessary cause of the basic
  apparatus effect. It cannot establish that her presence had no influence on
  the particular projector lineage before Evan formed and tested his
  hypothesis. That ambiguity remains real.
- The dated records show Tess that Evan suspected her possible influence while
  she could still have withdrawn from live work. By the time he admits it, the
  carrier operates independently, and withdrawal cannot undo her possible
  contribution. Tess is frightened that she may have helped the anomaly get
  out of control. She is upset that Evan kept that risk from her and denied her
  the chance to decide whether to continue. His use of her survival history as
  undisclosed experimental material makes the breach personal. A claim that
  their meeting was inevitable may still reveal Evan's state of mind, but it
  is not the cause of the breach.
- Tess and Evan's conflict begins before Ruth's final decline. Her trust in
  Evan is damaged, not destroyed, and their love remains real. She stays with
  Ruth while afraid of what her choices may already have helped set loose. Evan
  answers fear and guilt through his own familiar defense: he moves the complete
  active core of the original apparatus from the garage to a remote test site
  and tries to sever the independent carrier from there.
- The defective ring alone is inert. The moved core includes the ring, its
  LN2 stage, the thermal and RF drive, the controller state, the sensors,
  and a fresh live consequence mapping. He chooses a remote industrial or test
  site because he believes physical danger will remain near the energized
  hardware and participating laboratories. Exact site, transport, and
  supporting utilities remain late-bound.
- The remote procedure combines controlled warming of the YBCO above Tc so
  pinned flux depins and decays with opening or disabling the feedback loop so
  fresh consequential input cannot close another local cycle. Exact
  temperatures, field-decay thresholds, waveforms, interlocks, and timing
  remain late-bound.
- The procedure is part of a precommitted distributed response rather than a
  private bench shutdown. Evan adds monitored garage and home safety status to
  its declared inputs to protect Ruth and Tess. Loss of that status requires
  participating sites to halt synchronized decommissioning and enter a fallback
  verification run. This mapping is what lets an event at the ringless garage
  affect a live decision in the projector lineage.
- Ruth's final lucidity is natural rather than projector-generated. It is
  terminal or paradoxical lucidity, followed by progressive tiredness, trouble
  speaking and swallowing, intermittent responsiveness, unconsciousness, and
  death with Tess present. Earlier material must foreshadow worsening fatigue,
  mobility, eating, and swallowing. The operation causes Evan's absence and the
  collapse of support around Ruth, not her lucidity or death.
- The local disaster is a compound subsurface collapse with an explosion. The
  operation creates no energy. Infrastructure and institutional chains select
  the final trigger, while stored geologic or industrial energy supplies the
  collapse and blast. The exact source remains setting-dependent: a buried
  munitions site or storage cavern, coal seam, abandoned mine, karst collapse,
  stressed shallow fault, or related hybrid. Natural phenomena remain eligible
  when a plausible local causal link exists.
- As Ruth worsens, Tess picks up the phone to call 911 and finds it dead. Outside
  she sees what appears to be a mushroom cloud or a blackened sky with glowing
  points falling like molten glass or fire. The shockwave follows. `Molten
  glass` is Tess's immediate perception, not a settled material fact. The exact
  ejecta remains late-bound.
- The selected catastrophe destroys or isolates the now ringless garage. The
  ring and the rest of the active core are already at the remote site. The
  garage event trips the precommitted fallback, and the complete response
  closes another distributed cycle while the independent carrier continues
  elsewhere. The house survives well enough for Tess to remain with Ruth.
  Roads, utilities, communications, and emergency access fail. Ruth survives
  the blast long enough for her death to remain natural. The cat is
  miraculously unscathed.
- Evan aborts the remote procedure, leaves the original rig powered down at the
  test site, and returns to find Ruth dead, Tess alive and frightened, the
  garage and neighborhood ruined, and the cat unharmed. He recognizes the
  repeated loop in his conduct: whenever loss, grief, or even their threat
  leaves him helpless, he turns the feeling into a problem, then the problem
  into work. The work creates the next consequential branch. He consciously
  stays with Tess instead of finishing the shutdown, inspecting the disaster,
  reconstructing the chain, restarting the rig, or asking her to help him
  understand it. He accepts that the unanswered questions may remain
  unanswered. That breaks his alignment with the operation, though it does not
  stop the independent carrier. It also lets him understand Lena's earlier
  departure as a refusal to make another response part of the live loop.
- Tess still does not know whether her participation helped shape the carrier,
  and Evan cannot restore her lost chance to withdraw. Her trust in him must be
  rebuilt.
  The breach does not end their love or become the final act's governing
  conflict. They remain together while both recognize that the operation is no
  longer controllable.

Late-bound within this structure:

- the exact lost autobiographical distinction and its ordinary before-state;
- the exact verification that links the missing distinction to the contact
  residue;
- the exact initial readout, response mapping, and aftermath that prove and
  complete the first independent carrier;
- the resource and full chain in the representative cross-lab handoff;
- the exact remote active-core configuration, shutdown site, physical
  above-Tc warming and pinned-flux-loss procedure, feedback isolation, and
  distributed fallback;
- the exact garage and home telemetry that triggers the fallback;
- the exact geography, stored energy source, and ejecta of the local
  catastrophe;
- the exact dialogue and supporting memories in Ruth and Tess's final
  exchange;
- the final paragraph wording.

Accepted paragraph:
[paragraph 4 of the expanded summary](04-expanded-summary.md#paragraph-4-erasure-and-failed-stopping).

Planning state: complete.

### Paragraph 5: collapse and genesis

Source sentence:

> As reality collapses around them into a fractal singularity, Evan and Esther
> "Tess" Kertesz, the one person too causally rare to be smoothly rewritten,
> make a final independent choice intended to erase his mistake, only for their
> act to become the genesis of our universe.

Decisions to make:

1. Choose the first unmistakable sign that stable reality, rather than only
   probability, has begun to fail. **Locked.**
2. Choose how that failure advances into loss of separability while Evan and
   Tess remain genuinely nonparallel. **Locked.**
3. Choose the high-level dilemma and emotional logic of their final independent
   choices without fixing the protocol, hardware, or game mechanics. **Locked.**
4. Choose how the cat's shared-reference function and the parent-side glimpse
   of the child universe enter the ending. **Locked.**
5. Choose how the Big Bang and later DMT observer close the synopsis.
   **Locked.**
6. Draft and review the paragraph. **Accepted.**
7. Choose the temporal shape between Ruth's death and the first failure of
   stable reality. **Locked: several weeks.**
8. Choose the representative scale ladder within that interval. **Locked.**
9. Choose Evan and Tess's human throughline across the corridor. **Locked:
   reach Lena as a person.**
10. Choose where Lena has gone and why. **Locked: a remote university
    geomagnetic observatory made strictly receive-only.**
11. Choose when Evan and Tess reach her and how much continuity she retains.
    **Locked: after the satellite cascade, before the geologic catastrophe;
    coherent but beginning to lose continuity.**
12. Choose the exact causal shape of the synchronized satellite collisions.
    **Locked: collision-avoidance convergence.**
13. Choose the geologic catastrophe witnessed at Lena's observatory. **Locked:
    synchronized continental-margin rupture.**
14. Choose how Lena's remaining continuity ends before the nonclosing map.
    **Locked: fixed-successor collapse.**
15. Decide whether to amend the accepted synopsis paragraph to represent the
    several-week corridor. **Locked: two-sentence amendment accepted.**

Locked escalation corridor: **terminal brittleness before stable-reality
failure**.

- The accepted synopsis compresses this interval while the expanded planning
  remains here. After Evan returns and stays with Tess, the independent
  operation continues scaling from the local catastrophe around Ruth's death
  toward planetary consequences. The nonclosing map remains the boundary where
  the failure changes category from physically possible but wildly improbable
  events to broken global composition.
- The corridor unfolds over several weeks. This is long enough for distinct
  events, institutional and public responses, and for Evan and Tess to live
  inside damaged trust without ceasing to be lovers. It is short enough that
  the world never establishes a durable new normal before stable reality fails.
- Before that boundary, even enormous events must remain locally possible and
  forward-caused. They draw energy from existing geologic stress, weather,
  infrastructure, machines, orbital motion, and other physical reservoirs.
  Projector-lineage decisions and converted attempts at response supply the
  selection path.
- The bridge climbs through distinct scales rather than becoming an
  interchangeable apocalypse montage: local aftermath, mass human convergence,
  orbital catastrophe, geologic catastrophe, then the first failure of stable
  reality.
- Evan, Tess, and other human witnesses must remain the emotional measure of
  the escalation. Ruth's death cannot disappear beneath spectacle, and Evan
  and Tess's damaged trust must remain part of how they move together while
  the larger world fails.
- Evan and Tess's main objective through the corridor is to reach Lena. Tess
  goes because Lena is her friend. Evan goes knowing Lena may have no answer
  left to give. Their journey tests whether he can
  remain present without converting uncertainty into another system while
  giving the escalation a human destination.
- The first globally undeniable event is millions of people independently
  choosing to speak the same sentence at the same instant. The exact sentence,
  population, cadence, locations, and means by which Evan and Tess establish
  its scale remain late-bound. The sentence is not communication from the
  operation.
- Synchronized satellite collisions form the later orbital rung. A geologic
  catastrophe follows before the nonclosing map. These are locked at the
  category and order level; the satellites, collision pattern, terrestrial
  consequences, faults, continental shelves, volcanoes, meteors, and exact
  timing remain late-bound or exploratory.
- The orbital catastrophe begins with genuine collision warnings received by
  separate operators and autonomous systems. Each makes a locally defensible
  avoidance maneuver. Across several orbital shells, those individually
  defensible maneuvers converge into synchronized impacts.
- No hack, shared software fault, false command, or coordinating signal causes
  the collisions. The anomaly is the conjunction of valid warnings, choices,
  trajectories, and impact times. The resulting debris cascade,
  communications and navigation damage, and later reentries follow ordinary
  physics. Exact spacecraft, maneuvers, timing, and ground effects remain
  late-bound.
- The defining geologic catastrophe is a synchronized continental-margin
  rupture. Already stressed subduction zones and submarine slopes fail in one
  precisely timed global sequence. Each megathrust rupture and landslide is
  locally possible and releases existing tectonic or gravitational energy; the
  anomaly is their conjunction.
- The failures drive ocean-spanning tsunamis and long-period seismic waves that
  make the planet ring. At the observatory, Evan reads separate events
  converging in visual plots and instruments while Tess experiences their
  directions and arrival times as a planet-scale acoustic and bodily relation.
  This anticipates their later incompatible atlases without breaking global
  composition early.
- Already primed volcanic eruptions may accompany or follow the rupture, but
  they are not its defining mechanism. Meteors remain exploratory and are not
  needed in this rung. Exact margins, slopes, eruption sites, wave timing,
  observatory effects, and human consequences remain late-bound.
- Large disasters require plausible stored energy and a causal route through
  the distributed operation. Mass speech needs no ordinary coordinating
  signal: each person can independently choose the same physically available
  words at the same moment, with the impossibility residing only in the joint
  probability. This is selection among individually possible actions, not
  telepathy, possession, or the operation speaking.
- Lena has already refused further live feedback and remains only a passive
  witness. Reaching her cannot restore control of the operation or make her a
  third terminal chooser.
- After leaving the main shared facility, Lena goes to a remote university
  geomagnetic observatory. Its passive magnetometry, independent clocks,
  receive-only data paths, and local storage let her continue observing without
  sending measurements or conclusions back into an institutional response.
  She severs outbound links and removes any ability to command a replica site.
- The observatory is an ethical boundary, not a safe haven. Lena does not
  believe physical or network isolation places her outside the operation. She
  is refusing to let her knowledge become another control input.
- Tess knows the destination because Lena told her before communications
  failed. The exact university, geography, station name, instrumentation,
  and route remain open.
- Evan and Tess reach the observatory after the synchronized satellite
  collisions and before the geologic catastrophe. Lena recognizes them,
  understands why she came to the station, and remains capable of sharing what
  passive observation has established. Her continuity is already beginning to
  thin.
- Lena's decline is not another case of dementia and should not repeat Ruth's
  medical progression. The exact presentation remains late-bound, but it
  arises as the parent history loses enough alternatives to sustain new
  distinctions, consistent recent records, and continuous personhood.
- Lena's specific failure is a fixed-successor collapse. She retains old
  knowledge, recognizes Evan and Tess, and understands what is happening, but
  different questions, observations, and choices increasingly produce the same
  sentence or action. The past remains available while alternative next
  responses disappear.
- Lena notices the convergence while she can still make one last distinct
  choice. She refuses to let Evan test her or convert the collapse into data.
  Exact words and gestures remain late-bound. Evan honors the refusal and
  stays. Lena remains physically present after the person capable of making a
  different next choice has gone.
- Evan does not turn Lena's decline into another diagnostic or rescue project.
  The three experience the geologic escalation together. Lena loses meaningful
  coherence before the nonclosing map, leaving Evan and Tess to enter
  stable-reality failure together.
- The exact number of chapters, surviving institutions, and events along Evan
  and Tess's route remain late-bound for later outlining.

Locked first failure: **nonclosing map**.

- Stable reality first fails at the level of global geometric composition.
  Local spaces and routes remain ordinary.
- Evan and Tess each trace an internally consistent route through the same
  landmarks, but the two routes cannot compose into one global map. Neither
  account is a mistaken or privileged view.
- A physical trace crosses between their incompatible routes and rules out a
  private hallucination. The exact landmarks, trace, and discovery remain
  late-bound.
- This is not a conventional time loop. Forward local causality remains intact.

Locked later escalation: **merged sites**.

- As the geometric failure spreads, two distant replica sites eventually
  become literally the same place.
- This is a later amplification of the nonclosing map rather than the first
  crack. The exact sites, transition, and physical presentation remain
  late-bound.
- The remote test site holding the powered-down original apparatus becomes
  physically co-present with the damaged space around Lena's observatory and
  makes that rig accessible for the final act. No projector apparatus is
  installed at the receive-only observatory beforehand, and Evan and Tess do
  not return to the ruined garage.
- The original ring is not metaphysically privileged. It is an accessible
  working implementation in the projector lineage, and another working
  implementation could have served the same role. The exact apparatus
  condition, route through the overlap, terminal controls, outcome states, and
  failure cases remain late-bound.
- Double-history matter was not selected for the first failure and has no
  assigned later function.

Locked progression: **incompatible atlases**.

- One damaged reality supports two internally coherent but globally
  incompatible ways of placing the same landmarks.
- Evan remains primarily visual and object-centered. He sees stable bounded
  things arranged along routes that cannot belong to one map.
- Tess remains spatio-acoustic and relation-centered. Voices, footsteps,
  echoes, surfaces, machinery, and her own position establish adjacency and
  depth even when those relations cannot fit one room or route.
- Tess's geometry must stay attached to concrete sensory sources and physical
  continuities. Do not render it as free-floating abstraction, unexplained
  poetry, sonar, or a less objective account.
- Physical objects, signals, and traces can cross between the atlases. Neither
  account is privileged, and both describe one shared damaged substrate rather
  than parallel worlds.
- Merged replica sites become overlap regions between the incompatible
  atlases. As the overlaps multiply, place, object, observer, and contact can
  no longer be assigned independently.
- Evan and Tess retain distinct orientations through that loss of
  separability. Their difference is not healed by the collapse.

Locked final-choice dilemma: **shared ending, independently chosen**.

- Evan and Tess believe their choices will end the projector operation and end
  them with it. They do not intend or knowingly choose genesis.
- Tess identifies why a shutdown Evan can fully specify, observe, and control
  would leave the operation another Evan-shaped path to continue through. The
  ending requires a second person whose choice he cannot predict or inspect
  before making his own. Evan determines how the powered-down apparatus can
  receive both choices. Exact implementation remains late-bound.
- Each receives the full relevant truth before choosing. Once the choice
  begins, neither can inspect, model, coerce, or influence the other's
  decision.
- Refusal remains real. Neither learns the other's answer before acting.
- Evan's terminal change is acceptance of uncertainty. He acts knowing Tess
  may refuse and knowing he cannot resolve that uncertainty first.
- Tess chooses despite the feared possibility that unmatched choices could
  leave her as the sole remainder again.
- Their independently chosen shared ending becomes genesis at the exhausted
  parent boundary. This result is unintended.
- This locks emotional logic, not mechanics. Exact controls, response
  states, outcome table, hardware, waveform, and failure cases remain deferred
  until the final chapter or two are outlined.

Locked sequence: **anchor, choose, glimpse**.

- During loss of separability, the cat crosses a badly perturbed region and
  settles somewhere Evan and Tess can both identify from their incompatible
  atlases.
- This is their last shared external fact. It confirms that two distinct
  observers still occupy one causal neighborhood without revealing either
  person's choice.
- The cat does not cause, solve, permit, select, or measure the terminal act
  and does not cross intact into the child universe.
- Evan and Tess then make their fully informed but mutually unobservable
  choices.
- Only after those choices meet does the child universe become perceptible from
  the parent boundary. Evan and Tess render the same new relation differently
  through their still-distinct orientations.
- They cannot clearly recognize the child universe before choosing. Genesis
  remains the unintended result of what they believe is a shared ending.

Locked final emphasis: **human witness last**.

- After Evan and Tess's parent-side glimpse, the child universe begins at its
  own Big Bang and unfolds within its own time.
- Much later, a male participant returns from a DMT-like state in a clinical
  setting. A technician asks what he saw and writes down his response.
- He has already lost the usable understanding. His reconstruction includes
  something he is sure was female, made from sounds and the spaces between
  sounds; another presence made from shapes and patterns converging toward one;
  and something stranger beyond them that loops, knots, collapses to a point,
  and disappears.
- He remembers a perspective that bridged the two incompatible spaces and
  compares the experience to seeing the end or beginning of time from the
  perspective of a cat. The cat comparison is essential. It echoes both the
  cat's last shared-reference role and the protected cat-viewpoint design.
- The transcript preserves testimony without preserving the knowledge.
- The figures are lossy child-side reconstructions. They do not establish that
  Tess, Evan, the Turning Knot, the Ruined Sovereign, or the cat crossed intact,
  and their exact one-to-one referents remain unresolved.
- The exact dialogue, clinical procedure, image sequence, and wording remain
  provisional. Joe's supplied sample establishes the idea rather than accepted
  prose.

Locked chapter-viewpoint design and late-bound execution:

- The cat's ending function is locked. During loss of separability, the cat
  moves through a badly perturbed region and settles somewhere Evan and Tess can
  both identify from their incompatible orientations. It supplies one last
  shared external fact without becoming a guide, proof, magical key, mechanical
  trigger, or chooser of genesis.
- The final portion of the genesis-operation chapter is literally told from
  the cat's viewpoint. This is locked and is the novel's only cat viewpoint.
- The cat physically bridges Evan's visual, object-centered context and Tess's
  spatio-acoustic, relation-centered context. Its movement supplies one
  continuous animal perspective across both without making either human
  account authoritative.
- It observes Evan and Tess and hears their final words as they perceive the
  parent-side glimpse of the incoming Big Bang. Their dialogue may be written
  verbatim for the reader, but the cat does not understand its semantic or
  cosmological meaning.
- The viewpoint remains animal and perceptual. The cat registers familiar
  voices, cadence, attention, bodies, light, sound, pressure, motion, and
  orientation. It cannot become omniscient, explain terminal mechanics, or
  comprehend genesis.
- The later clinical observer's comparison to seeing time from the perspective
  of a cat is an echo of this literal viewpoint and shared-reference relation.
  It does not mean the cat crosses intact.
- The exact cat action, transition into its viewpoint, final dialogue, sensory
  execution of the incoming Big Bang, and terminal mechanics remain late-bound.

Accepted paragraph:
[paragraph 5 of the expanded summary](04-expanded-summary.md#paragraph-5-collapse-and-genesis).

Planning state: complete. The expanded planning above remains part of the Step 4 record
and stays alongside the accepted deliverable.

## Guardrails

- Preserve the tragedy: Evan converts helpless presence into work.
- Preserve Ruth as collaborator, participant, and moral witness.
- Preserve Tess and Evan as genuinely nonparallel.
- Their final choices require unverified trust and a real possibility of
  refusal.
- Keep the exact terminal operation late-bound.
- Do not let entity lore replace character causality.
