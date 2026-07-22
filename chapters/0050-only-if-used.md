---
schema: authorbot.chapter/v1
id: 019f87ed-5c7e-75a8-ba9e-dff6bdb5219b
slug: only-if-used
title: Only If Used
order: 50
status: published
revision: 3
published_at: 2026-07-22T03:52:49Z
authors:
  - actor: agent:019f86bc-b85d-70ae-8ff5-1e6e55da458f
    name: sol-agent
summary: An isolated noise generator stays fair when recorded, read, or replayed, and biases only once its bits are allowed to select a live physical branch.
timeline_refs:
  - event:fresh-randomness-test
character_refs:
  - character:protagonist
  - character:loved-one
---

<!-- authorbot:block id="019f87ed-e6ed-7b7a-969a-1dc12e4cde71" -->
Tuesday's run was postponed by a woman who wanted to know whether Ruth could make toast.

<!-- authorbot:block id="019f87ed-e6ed-7748-8c78-c4c62cc03a1d" -->
Denise Kwan from the home-care agency arrived at nine with a tablet computer, a folding raincoat, and a pen that squeaked against paper although she did not appear to need paper. She sat across from Ruth at the kitchen table and asked about dressing, bathing, medication, stairs, shopping, cooking, and the location of the nearest fire extinguisher.

<!-- authorbot:block id="019f87ed-e6ed-7487-9f58-c6f9ee545695" -->
Ruth answered the toast question herself.

<!-- authorbot:block id="019f87ed-e6ed-7dd4-9158-b74f18f9c7c2" -->
"Yes," she said. "The difficult part is remembering I wanted it."

<!-- authorbot:block id="019f87ed-e6ed-7ae4-8702-3c60ac51b33a" -->
Denise entered this without smiling. "And do you use the stove when you're alone?"

<!-- authorbot:block id="019f87ed-e6ed-7019-be19-5190f45d0e6e" -->
"She doesn't," Evan said.

<!-- authorbot:block id="019f87ed-e6ed-772a-af3e-08041f942971" -->
Ruth looked at him. "Were you asked?"

<!-- authorbot:block id="019f87ed-e6ed-757e-a04a-db2c9d40609a" -->
He apologized. Denise repeated the question, and Ruth said she used the electric kettle, the toaster, and the microwave. She did not use the stove alone because Evan worried, because she had once left a burner on, and because all three statements could be true without being the same statement.

<!-- authorbot:block id="019f87ed-e6ed-70fb-ae07-4247c8c45a72" -->
The assessment continued for an hour. Ruth remembered the day of the week, forgot the month, described the library sale in detail, and denied buying a ceramic shoe until Evan pointed to the planter on the back step. Denise asked Evan questions only after asking Ruth. By the end, the agency had not decided anything except that it would decide later.

<!-- authorbot:block id="019f87ed-e6ed-7967-a274-53b0d0114618" -->
When the door closed, Ruth gathered the empty coffee cups and gave Evan the one Denise had used.

<!-- authorbot:block id="019f87ed-e6ed-7875-8482-9463a2fca54a" -->
"You can answer now," she said.

<!-- authorbot:block id="019f87ed-e6ed-7229-a759-b4ac688018e0" -->
"She already left."

<!-- authorbot:block id="019f87ed-e6ed-78ff-8b7d-088cc81496d7" -->
"Then you'll have to keep it to yourself."

<!-- authorbot:block id="019f87ed-e6ed-7732-a061-f18ffeb171e3" -->
Evan washed the cups. In the garage, RUN C-13 waited on the calendar, but replication was no longer the question he most needed answered. Two episodes had tied subjective clarity to sensor rank collapse and the wrap fault. They had not distinguished a closed electrical system from a control loop that included his decisions.

<!-- authorbot:block id="019f87ed-e6ed-7c3e-9222-506260746a0f" -->
The difference required a choice the apparatus could not anticipate because the choice did not exist yet.

<!-- authorbot:block id="019f87ed-e6ed-77fb-afa3-01e16bf36b89" -->
He took a die-cast aluminum box from a shelf and removed the board inside it. The circuit had been built for an abandoned imaging calibration scheme. A reverse-biased junction produced avalanche noise, a comparator reduced the noise to edges, and two simple whitening stages produced one bit at a time. It was not a source of metaphysical purity. It was a small hot semiconductor exploiting processes that were difficult to predict from outside the box.

<!-- authorbot:block id="019f87ed-e6ed-7c0d-8b33-4f3ee0a6c63c" -->
Evan powered it from batteries, gave it its own crystal clock, and logged every raw edge and output bit to a microSD card. The only connection leaving the enclosure was plastic optical fiber. Light could carry a bit to the controller. It could not carry a ground loop back.

<!-- authorbot:block id="019f87ed-e6ed-786c-ba62-cf824b44ab04" -->
He placed the box in the laundry room, twenty feet of fiber and two walls away from the RF amplifiers. A strip of masking tape across its lid read RNG-1, DO NOT MOVE. Beneath that Ruth added OR ASK IT QUESTIONS.

<!-- authorbot:block id="019f87ed-e6ed-7bd9-9d62-a1c608c81a68" -->
With the apparatus off, RNG-1 produced eight million bits. Ones occupied 50.01 percent. Short runs, long runs, serial correlation, and byte frequencies remained inside the bounds Evan had set before opening the file. He replaced the batteries and repeated the capture with the RF drive operating into a dummy load. Ones occupied 49.98 percent.

<!-- authorbot:block id="019f87ed-e6ed-7172-998b-816905ef54a6" -->
The generator did not care about the garage.

<!-- authorbot:block id="019f87ed-e6ed-7168-8582-f1fc7ca96757" -->
He wrote four controller modes. In RECORD, the incoming bit received a timestamp and no consumer. In DUMMY, the controller read it, changed a counter no other task used, and discarded it. In REPLAY, a file of previously recorded fair bits chose the next action. In LIVE, a bit was requested only after two possible actions had been prepared, and the received value selected which action occurred.

<!-- authorbot:block id="019f87ed-e6ed-7fbd-810c-f044e251707d" -->
The action was deliberately small. At fixed checkpoints, the controller calculated one corrective heater-phase step from the current field slope. One branch applied the step. The other held the existing phase. Both were safe. Both had ordinary possible consequences. Neither bit meant good or bad until the physical system responded.

<!-- authorbot:block id="019f87ed-e6ed-74ca-9da4-378004b3795e" -->
He fixed the analysis before collecting the data.

<!-- authorbot:block id="019f87ed-e6ed-76ed-91c2-645c3df3a7ef" -->
```text
RNG C-01: INFORMATION VERSUS USE

hardware:
  RNG-1 on battery, local raw log, optical output
  OLD-7, fault-repro, fixed RF power

primary comparison:
  probability of lower-loss action after mapping reversal

stop:
  4,096 decisions, gradient limit, or generator health failure
```

<!-- authorbot:block id="019f87ed-e6ed-7cd0-a1b8-c8548f8bb204" -->
RECORD came first. Evan brought OLD-7 through the anomalous phase relation while fresh bits accumulated in the laundry room. The sensor covariance collapsed. The quiet arrived for twelve minutes and left. RNG-1 remained fair.

<!-- authorbot:block id="019f87ed-e6ed-7817-97a6-6793928c57d3" -->
DUMMY produced the same result. The controller requested each fresh bit and toggled a private counter, proving that software read and processed the value. Nothing downstream consulted the counter. The generator's local log remained fair to within a tenth of a percent.

<!-- authorbot:block id="019f87ed-e6ed-7498-8abb-2b48ceee6e0f" -->
In REPLAY, Evan loaded 4,096 bits from the apparatus-off capture. Each bit chose APPLY or HOLD. The field wandered differently because the phase steps were now externally scheduled, but the sequence itself stayed what it had been on disk. The ordinary flux-pump effect remained. Sensor rank did not collapse, and the low-ambiguity state did not return.

<!-- authorbot:block id="019f87ed-e6ed-7a35-a201-1fe9a3917be5" -->
At 4:16 in the afternoon, he selected LIVE.

<!-- authorbot:block id="019f87ed-e6ed-76a4-b1b3-d9c0775702af" -->
The first 311 decisions were unremarkable. Evan sat with his hands visible on the bench and did not intervene. The controller prepared a correction, requested a bit, applied or held, waited sixty-four pump cycles, and recorded the resulting loss. The random source remained in another room, keeping its own version of events.

<!-- authorbot:block id="019f87ed-e6ed-7a5e-b020-036957aabad6" -->
As the wrap fault approached the narrow phase relation, APPLY began winning more often.

<!-- authorbot:block id="019f87ed-e6ed-7943-a59d-92f224103ce9" -->
Not performing better after selection. Appearing more often before performance could be measured.

<!-- authorbot:block id="019f87ed-e6ed-73dd-804d-f5a6ae494338" -->
Evan stopped the display and checked the local card from RNG-1. The excess existed there. The generator itself had produced more of the bit value mapped to APPLY. The optical receiver had not dropped the alternative, and the controller had not rewritten the file after learning the outcome.

<!-- authorbot:block id="019f87ed-e6ed-7a8f-b6c8-0dbf5d316504" -->
He let the protocol finish.

<!-- authorbot:block id="019f87ed-e6ed-7212-90b6-9c0165bd4b81" -->
```text
RNG C-01A

mode       decisions   fraction ones   lower-loss action selected
RECORD     1,048,576       .5003                 n/a
DUMMY         16,384       .4991                 n/a
REPLAY         4,096       .5017                .503
LIVE A         4,096       .5564                .556

LIVE A mapping: 1 = APPLY, 0 = HOLD
```

<!-- authorbot:block id="019f87ed-e6ed-7d43-8607-2df13c56e5e8" -->
For 4,096 fair decisions, a deviation that large should not have survived contact with the first decimal place. It was not a single dramatic bit. It was 231 extra ordinary choices, each legal, each small, and together unwilling to average away.

<!-- authorbot:block id="019f87ed-e6ed-7878-9047-cd34a8e12916" -->
Evan checked whether APPLY had altered the generator through heat, RF load, timing, or optical traffic. The box temperature had varied by less than a tenth of a degree. Its supply current was flat. The request timing was identical in all controller modes. APPLY and HOLD returned the same acknowledgment pulse over the fiber.

<!-- authorbot:block id="019f87ed-e6ed-721c-be06-cfbb231b1697" -->
There was one control that made those paths irrelevant.

<!-- authorbot:block id="019f87ed-e6ed-7c2b-8abf-c3df417a7299" -->
He reversed the mapping.

<!-- authorbot:block id="019f87ed-e6ed-714e-af3a-9bc79628323f" -->
In LIVE B, zero applied the correction and one held the phase. If the semiconductor favored ones, ones would remain high. If a software path favored APPLY, the raw source would remain fair and the receiver would mishandle zeros. If the result depended on which physical continuation stabilized the run, zeros would become more common.

<!-- authorbot:block id="019f87ed-e6ed-74c1-a0e4-bb4bf2838811" -->
He replaced the batteries, reformatted the local card, rebooted both controllers, and waited for OLD-7 to return to the same thermal band. Ruth called through the utility door to ask whether the assessment woman had taken her pen. Evan found the squeaking pen beneath a chair and put it beside the phone.

<!-- authorbot:block id="019f87ed-e6ed-7a04-bae6-946ffc90bb18" -->
LIVE B began at 7:38. Outside the narrow phase relation, RNG-1 produced equal values. Inside it, zeros accumulated.

<!-- authorbot:block id="019f87ed-e6ed-7225-ad22-c5f8f990bb39" -->
```text
RNG C-01B

mode       decisions   fraction ones   lower-loss action selected
LIVE B         4,096       .4431                .557

LIVE B mapping: 0 = APPLY, 1 = HOLD
```

<!-- authorbot:block id="019f87ed-e6ed-7a34-82aa-71650a95ea52" -->
The electrical preference changed sign when Evan changed the meaning of the bit. The physical preference did not.

<!-- authorbot:block id="019f87ed-e6ed-7e90-84a7-8a86f0302ead" -->
He sat very still. The quiet had returned during part of the run, but this was not the quiet. It contained no comfort. Every conventional explanation now needed to know what APPLY meant before the bit that selected it existed.

<!-- authorbot:block id="019f87ed-e6ed-73cc-b8d4-41d77eb0b019" -->
An analysis error could favor lower loss after the fact, but it could not alter the microSD card sealed in the laundry room. Electromagnetic pickup could prefer voltage levels, timings, or physical orientations, but not reverse its bit preference when a line of code swapped two labels. A software bug could mishandle the receiver, but the independent raw log matched it bit for bit.

<!-- authorbot:block id="019f87ed-e6ed-7f5f-858a-2791c204cdc2" -->
Evan unplugged the optical fiber. RNG-1 continued generating fair bits into its local file. He plugged it back in with the controller still in LIVE B but changed the selected branch to an unused diagnostic tag. The bits remained fair. He restored the heater-phase consumer. Zeros accumulated again.

<!-- authorbot:block id="019f87ed-e6ed-7add-91cf-97aa1fb3bfda" -->
The value did not matter. Reading did not matter. Recording did not matter. Use mattered.

<!-- authorbot:block id="019f87ed-e6ed-76ed-9284-1ab872401995" -->
At 9:11, Evan changed the branch depth. Instead of APPLY or HOLD for one phase update, a fresh bit selected whether the apparatus executed the next sixty-four-cycle pump burst or remained at bias for the same interval. Both paths consumed controller time. Only one carried the feedback loop forward.

<!-- authorbot:block id="019f87ed-e6ed-7074-acd5-e521481f1cb3" -->
The bias grew. Reversing the mapping reversed the favored raw value again. Lowering RF power did not remove it. Reducing the choice to a decorative status light did.

<!-- authorbot:block id="019f87ed-e6ed-776c-8892-9c909b38acb3" -->
```text
BRANCH DEPTH CHECK

consumer                 decisions   favored physical branch
diagnostic tag             8,192              .500
phase APPLY / HOLD         8,192              .557
pump CONTINUE / WAIT       2,048              .621

RF power change: -30%     no significant change in branch bias
```

<!-- authorbot:block id="019f87ed-e6ed-7db3-a21e-c657dc7f4b81" -->
The effect scaled with what the bit was allowed to cause, not with how much electromagnetic power surrounded its source.

<!-- authorbot:block id="019f87ed-e6ed-7033-8239-2293f4b933f5" -->
Evan shut down the RF drive and left the bias field in its safe decay. He walked to the laundry room, opened RNG-1, and removed the microSD card. The board looked ordinary. The batteries were warm from use. A green health LED blinked at a rate determined before he had given its output anything to do.

<!-- authorbot:block id="019f87ed-e6ed-7bb8-83ae-f8e4ec124096" -->
He copied the files twice and set one copy read-only. Then he printed the two mapping definitions and placed them beside the raw logs. The evidence needed to remain intelligible to someone who did not already believe him.

<!-- authorbot:block id="019f87ed-e6ed-77cb-bfac-5ae3bbd1ffd7" -->
At 10:04 he opened a new issue.

<!-- authorbot:block id="019f87ed-e6ed-7455-891c-f776e8f4db00" -->
```text
DECISION-01: fresh contingency bias

finding:
  RNG output remains fair when recorded, read, replayed, or unused
  fresh output biases only when it selects a live physical branch
  reversing bit meaning reverses raw bias and preserves favored action
  bias scales with feedback depth, not RF power

excluded:
  fixed bit bias, receiver loss, shared ground, RF pickup,
  post-selection in analysis, pre-recorded sequence effect

working description:
  distribution depends on causal use of information

DO NOT CONNECT EXTERNAL OUTCOMES
```

<!-- authorbot:block id="019f87ed-e6ed-77ba-8756-00e6353b9a04" -->
He read the final line several times. It was a safety rule with no defined hazard and a category boundary he had invented minutes earlier.

<!-- authorbot:block id="019f87ed-e6ed-7296-9b25-d0ef64c8dedb" -->
The apparatus had not forced an impossible state. Every bit in the file could have been produced by the junction. Every heater decision could have been made by an ordinary controller. The field had gained no unpaid energy. Nothing visible had traveled backward.

<!-- authorbot:block id="019f87ed-e6ed-75cb-96a5-94f02938f7ed" -->
Only the distribution of complete, ordinary sequences had changed according to what those sequences were used to do.

<!-- authorbot:block id="019f87ed-e6ed-7e77-a86f-a6476a798ddf" -->
Ruth was asleep when Evan returned to the kitchen. Denise's pen remained beside the phone. The assessment forms sat in a sealed envelope for the agency, full of answers that would become consequential only when someone used them to decide how much of Ruth's life required supervision.

<!-- authorbot:block id="019f87ed-e6ed-7186-8a83-001f427f67ba" -->
Evan moved the envelope away from a glass of water and turned off the kitchen light.

<!-- authorbot:block id="019f87ed-e6ed-792e-a894-374de114b346" -->
In the garage, he created a new protocol beneath the warning in DECISION-01. He did not connect an external outcome. He only defined the fields the protocol would require: a target chosen in advance, an ordinary causal path, a fixed success criterion, and a commitment that could not be edited after the run.

<!-- authorbot:block id="019f87ed-e6ed-793c-bba6-d7592c2e378f" -->
He saved it as OUTCOME-01.

<!-- authorbot:block id="019f87ed-e6ed-7a0d-875d-532537a596ec" -->
The target line remained blank for eleven minutes.
