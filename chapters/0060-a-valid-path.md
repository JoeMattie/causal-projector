---
schema: authorbot.chapter/v1
id: 019f87ee-0300-748a-8cb1-b6514662be27
slug: a-valid-path
title: A Valid Path
order: 60
status: draft
revision: 1
authors:
  - actor: agent:019f86bc-b85d-70ae-8ff5-1e6e55da458f
summary: Evan commits to ten die throws before they are thrown and gets all ten, then asks the apparatus for a state its own steel shutter forbids.
---

<!-- authorbot:block id="019f87ee-29a7-7598-b0f8-4040c72423ed" -->
Ruth found OUTCOME-01 in the printer tray on Wednesday morning.

<!-- authorbot:block id="019f87ee-29a7-7f38-aeb4-97dce53fba36" -->
She had gone looking for the home-care assessment because Denise Kwan had said a copy would be mailed and Ruth wanted to know why a document produced in her kitchen had to visit another building before she could read it. Instead she found Evan's protocol, one page of fixed fields beneath a warning, with the target line empty.

<!-- authorbot:block id="019f87ee-29a7-727b-96d7-b5bf3a48955c" -->
"Is this a form?" she asked.

<!-- authorbot:block id="019f87ee-29a7-7eac-98b7-a30c2612da8d" -->
Evan took it from her too quickly. "A test plan."

<!-- authorbot:block id="019f87ee-29a7-7430-ab7e-f7d3b169bc77" -->
"You haven't said what you're testing."

<!-- authorbot:block id="019f87ee-29a7-7aa2-87ad-c2c1300f11bd" -->
"That part is blank."

<!-- authorbot:block id="019f87ee-29a7-7b6f-9865-30cb00c69d34" -->
"Yes," Ruth said. "That is how I noticed."

<!-- authorbot:block id="019f87ee-29a7-7055-9577-d0c85e0d4849" -->
He put the protocol beneath his laptop. On the table beside it, Denise's squeaking pen had acquired a strip of masking tape with Ruth's name on it. The agency had not called. Evan had checked the portal at 6:40, 7:05, and 7:51, producing no measurable improvement in the speed of institutional thought.

<!-- authorbot:block id="019f87ee-29a7-7ed1-ab44-fb6b574f8f48" -->
Ruth poured cereal into a bowl and stopped before adding milk. "Will the machine know what you put there?"

<!-- authorbot:block id="019f87ee-29a7-7632-a3a5-c8c3e62671ad" -->
"No. It doesn't know anything."

<!-- authorbot:block id="019f87ee-29a7-7df6-aa60-34a674edd0be" -->
"Good. Machines are difficult enough when they only know what you tell them."

<!-- authorbot:block id="019f87ee-29a7-7b22-97c4-1085f1ed82c4" -->
She added the milk. By the time she had finished breakfast, Evan knew the target could not involve the agency, his job, money, weather, illness, or another person. It had to be useless enough that success could not disguise itself as judgment.

<!-- authorbot:block id="019f87ee-29a7-755c-842f-5514eef07131" -->
In the garage he opened a storage bin labeled BEARINGS and removed a clear polycarbonate drum left over from the flywheel project. He mounted it on two rollers, added six low paddles, and fitted a trapdoor at the bottom. A geared motor rotated the drum through seven uneven turns, stopped, and released one casino die into a felt-lined tray. A camera above the tray read the upper face. The die then dropped through a return chute for the next throw.

<!-- authorbot:block id="019f87ee-29a7-7419-bc8e-ed0e08d58f59" -->
The tumbler had its own battery and controller. It sat in the garden shed with no electrical connection to the garage. An optical fiber carried settled face values in one direction. A second camera wrote every throw to local storage. Evan named it TUMBLER-1 because giving a device a descriptive name made it feel less like an accomplice.

<!-- authorbot:block id="019f87ee-29a7-7701-84b4-917c41a5fb53" -->
He ran six thousand baseline throws while he worked. Each face remained within two tenths of a percent of expectation. Transition frequencies were dull. Replacing the die changed nothing. Running the RF stator into a dummy load changed nothing. He photographed the drum, weighed both dice, sealed the controller box, and saved its firmware hash.

<!-- authorbot:block id="019f87ee-29a7-72c0-99a3-7cd54ca1ff86" -->
Ten throws gave 60,466,176 possible sequences. Evan selected one before opening the live protocol.

<!-- authorbot:block id="019f87ee-29a7-72d9-982e-8438fdf9e7f3" -->
```text
OUTCOME-01: PRECOMMITTED PHYSICAL SEQUENCE

source:
  TUMBLER-1, die A, first ten valid throws after LIVE gate

target:
  6 1 4 2 5 3 2 6 1 4

success:
  all ten settled faces match in order
  camera and optical logs agree
  no invalid or repeated frames

consumer:
  MATCH    -> safe stop
  NO MATCH -> one additional 64-cycle pump segment, then safe stop
```

<!-- authorbot:block id="019f87ee-29a7-7bea-8a2b-333a677cf5f7" -->
The target was not a prediction. The numbers had no pattern he valued and no consequence outside the protocol. Their only distinction was that he had written them down.

<!-- authorbot:block id="019f87ee-29a7-79bc-af86-c0dac6683dce" -->
He generated a random nonce, hashed the target file with it, and submitted the digest to a public timestamp service. The receipt established that a particular hidden document existed at 11:18. After the run, anyone could combine the revealed file and nonce, reproduce the digest, and verify that he had not chosen the sequence after seeing the die.

<!-- authorbot:block id="019f87ee-29a7-7412-a34b-28afb6092b0e" -->
He performed the same procedure for two controls. In the first, ten prerecorded throws entered the comparator while the apparatus followed the anomalous phase walk. In the second, fresh throws arrived but the MATCH value was written to a log no task consumed. Neither control produced the target. They were not expected to. One miss said almost nothing.

<!-- authorbot:block id="019f87ee-29a7-772d-892f-1e555e894364" -->
At 2:07, Evan armed LIVE.

<!-- authorbot:block id="019f87ee-29a7-7bb5-90ed-df04c4931e30" -->
OLD-7 cooled through its uneven transition. The bias coil established the background field. The RF phases separated into quadrature, and the microheaters began moving a thermal front around the annulus. On the covariance display, five independent noise channels gradually surrendered four dimensions.

<!-- authorbot:block id="019f87ee-29a7-7b00-93aa-507ceb3706e8" -->
The controller reached the narrow phase relation at 2:43. OUTCOME-01 opened its observation gate. In the shed, the drum began to turn.

<!-- authorbot:block id="019f87ee-29a7-7587-bd6f-fb480cb29b43" -->
The first throw was six.

<!-- authorbot:block id="019f87ee-29a7-78a8-8203-0aadbc98eb24" -->
Evan watched the camera image settle on four red pips and two white intervals. He had expected the first mismatch to release him. A one-in-six agreement did not require an explanation.

<!-- authorbot:block id="019f87ee-29a7-7fe9-bd62-a81ec8010b54" -->
The second throw was one.

<!-- authorbot:block id="019f87ee-29a7-70a8-a5b2-f04100b2e8e8" -->
The third was four.

<!-- authorbot:block id="019f87ee-29a7-77e5-9b64-ed592a47200d" -->
After the fourth throw matched, he stopped looking at the target displayed beside the video. He knew it. Six, one, four, two. Five next. Then three. The sequence occupied his mind with the smooth certainty of a remembered phone number, although it had existed for less than four hours.

<!-- authorbot:block id="019f87ee-29a7-752c-8eca-b07d33ac38af" -->
The fifth throw was five.

<!-- authorbot:block id="019f87ee-29a7-7cdc-a7dd-48b8bce22431" -->
The quiet arrived. It did not announce itself as pleasure. The garage simply ceased proposing ways the experiment might fail. Camera latency, an uneven die, a duplicated frame, a bug in the comparator, a false timestamp, an unremembered edit: each remained testable, but none competed for his attention. There was one sequence and the apparatus was traversing it.

<!-- authorbot:block id="019f87ee-29a7-72ce-bb94-4a2294ac1a3c" -->
Three. Two. Six.

<!-- authorbot:block id="019f87ee-29a7-7fbc-9711-da92dda633df" -->
On the ninth throw, the die struck the tray wall, rolled onto an edge, and balanced there longer than any throw in the baseline. The vision system waited. Evan could see five pips on one face and one on the other. Either result had an ordinary path through gravity and felt and the exact compressions of the die's corners.

<!-- authorbot:block id="019f87ee-29a7-7d2d-9d56-ffca8e1b3138" -->
It fell to one.

<!-- authorbot:block id="019f87ee-29a7-7f5f-80f8-593a00abdf42" -->
The drum turned for the final throw. A lawn sprinkler clicked two gardens away. A delivery van stopped in the street and continued. Nothing in the world appeared to care which face landed upward.

<!-- authorbot:block id="019f87ee-29a7-796a-961c-d61c6c1afa29" -->
The die entered the tray, struck twice, and showed four.

<!-- authorbot:block id="019f87ee-29a7-71a8-a5d3-ebbab380ca1b" -->
The optical receiver reported MATCH. The controller completed its current pump cycle, ramped down the RF drive, and transferred the trapped field into the resistor bank. The additional segment did not run.

<!-- authorbot:block id="019f87ee-29a7-789f-af64-56532e5386bf" -->
Evan remained seated until the current reached zero. His pulse was sixty-one. The gradient stayed below the abort line. TUMBLER-1 had consumed the same charge per throw as it had during baseline. The local camera log contained ten distinct releases, ten distinct impacts, and the committed sequence.

<!-- authorbot:block id="019f87ee-29a7-7d61-ba3e-0413386c15f2" -->
He copied the files before touching the analysis. He retrieved the timestamp receipt, revealed the target and nonce, and reproduced the digest. Then he rebuilt the comparison from the raw frames. Six, one, four, two, five, three, two, six, one, four.

<!-- authorbot:block id="019f87ee-29a7-717f-8a9d-4856c948593c" -->
The probability under independent fair throws was 0.00000165 percent.

<!-- authorbot:block id="019f87ee-29a7-7413-80d0-341ccf784060" -->
That number was not the disturbing part. Rare sequences occurred whenever dice were thrown. The disturbing part was that this rare sequence had been distinguished from the other sixty million before it existed, and the distinction had determined whether the apparatus continued.

<!-- authorbot:block id="019f87ee-29a7-7f94-ac3c-aac8cf39fe6a" -->
Evan walked to the shed and opened the tumbler enclosure. The seal was intact. Die A weighed 9.61 grams before and after. He rolled it by hand sixty times, producing no face more than thirteen times. He exchanged it for die B, replayed the motor commands, and inspected the trapdoor for magnets he knew were not there.

<!-- authorbot:block id="019f87ee-29a7-77e2-bf05-1c00b267d650" -->
He spent forty minutes attempting to turn success back into an ordinary mistake. The attempt was methodical and sincere. It was also performed by the version of him to whom the committed sequence had happened.

<!-- authorbot:block id="019f87ee-29a7-7db5-95be-6d85bf0d948b" -->
At 5:26 he prepared CONSTRAINT-01.

<!-- authorbot:block id="019f87ee-29a7-7ba7-96b9-3dffb1ac93dd" -->
Two steel shutters shared one rigid slide. Moving the slide left blocked optical gate A and opened gate B. Moving it right opened A and blocked B. The solid center section was wider than both beams. No position allowed both gates to read open. Evan verified this through the full mechanical travel, then removed the actuator. For the target run, nothing could move the slide at all.

<!-- authorbot:block id="019f87ee-29a7-7239-9c54-7b6c4e1be257" -->
```text
CONSTRAINT-01: NO VALID PATH

target:
  gate A = OPEN
  gate B = OPEN
  same sample, stable for 100 ms

physical state:
  mutually excluded by fixed steel shutter
  actuator removed

consumer:
  MATCH    -> safe stop
  NO MATCH -> extend up to gradient limit
```

<!-- authorbot:block id="019f87ee-29a7-72b2-8a08-27562e5890a6" -->
He committed the target, started the apparatus, and waited.

<!-- authorbot:block id="019f87ee-29a7-7981-aefb-00d3cb8dc61a" -->
Gate A remained closed and gate B remained open. As the phase walk entered the anomalous region, A began to chatter at its threshold. One sample arrived late. Another carried an invalid checksum. The controller rejected both. The RF amplifiers drew more current while trapped-field gain flattened. The lower layer warmed toward the gradient limit.

<!-- authorbot:block id="019f87ee-29a7-74b4-9173-9dd1f56f8b98" -->
At 7.8 kelvin across the annulus, the safety task ended the run. The rigid shutter had not moved. The impossible sample had not appeared. What the apparatus produced instead was every nearby legal nuisance: sensor jitter, timing delay, extra heat, and a checksum error that could have become evidence only if Evan weakened the success criterion after seeing it.

<!-- authorbot:block id="019f87ee-29a7-7d45-bff5-f650cb5ec548" -->
He did not weaken it.

<!-- authorbot:block id="019f87ee-29a7-7b9e-8fd4-d2bb66dffe37" -->
The machine had not made two exclusive apertures open. It had not violated the fixture, manufactured energy, or sent a result backward through a clock. It had pushed available paths toward the target until the remaining paths ended in heat and failure.

<!-- authorbot:block id="019f87ee-29a7-7227-bcd4-16a34b0a23d1" -->
Evan added both results to DECISION-01.

<!-- authorbot:block id="019f87ee-29a7-731c-a38e-cc27865794dc" -->
```text
OUTCOME SELECTION

valid target:
  precommitted 10-throw sequence obtained on first LIVE attempt
  p = 1 / 60,466,176 under fair independent throws
  target commitment predates observation
  independent optical and local video records agree

invalid target:
  no success state observed
  neighboring legal failures increased
  run terminated at ordinary thermal limit

working rule:
  the apparatus does not produce the requested state
  it removes continuations in which a reachable state is missed
```

<!-- authorbot:block id="019f87ee-29a7-75e3-a618-27acf778aa65" -->
He read the working rule and changed requested to selected. Requested implied a listener.

<!-- authorbot:block id="019f87ee-29a7-770a-bcd8-69ff1b21fe1e" -->
Ruth came to the garage door after seven. She had put on her coat but not her shoes and wanted to know whether Marisol was late. Marisol was not expected. Evan told her this, found the calendar on the refrigerator, and showed her Thursday's library entry.

<!-- authorbot:block id="019f87ee-29a7-78e2-8e0f-7e86207a69a6" -->
Ruth studied the page. "Then I'm early."

<!-- authorbot:block id="019f87ee-29a7-7de3-ac95-cd337f4ac9f1" -->
"By a day."

<!-- authorbot:block id="019f87ee-29a7-7002-aaf8-06fc82c8be22" -->
"That is what early means."

<!-- authorbot:block id="019f87ee-29a7-7569-a060-7e395bf92cd3" -->
He helped her hang the coat. On the kitchen table, OUTCOME-01 lay beside the agency forms. Ruth looked at the ten numbers and then at him.

<!-- authorbot:block id="019f87ee-29a7-7595-a014-1b0b08d28b78" -->
"Did it work?"

<!-- authorbot:block id="019f87ee-29a7-702b-8281-cc0c7b3d1c5f" -->
Evan could have said that one experiment did not establish a mechanism. He could have described multiple-comparison discipline, independent replication, or the need for an operator blind to the target. All of those statements were true.

<!-- authorbot:block id="019f87ee-29a7-7651-b1eb-a153f0b25393" -->
"Yes," he said.

<!-- authorbot:block id="019f87ee-29a7-7bda-afbe-6ba3d4d20bb6" -->
"What did you ask it for?"

<!-- authorbot:block id="019f87ee-29a7-73bc-ada0-f8855c15c1eb" -->
"Ten numbers."

<!-- authorbot:block id="019f87ee-29a7-7048-b767-bd52652b4df7" -->
"Did you need them?"

<!-- authorbot:block id="019f87ee-29a7-7020-90f5-a498738403b3" -->
"No."

<!-- authorbot:block id="019f87ee-29a7-77b1-b82b-fdfe4df5be04" -->
Ruth considered this. "Then that was practice."

<!-- authorbot:block id="019f87ee-29a7-78a5-a27f-0e01bfb2d931" -->
She took the agency forms and went to find Denise's pen. Evan carried OUTCOME-01 back to the garage.

<!-- authorbot:block id="019f87ee-29a7-7b5b-af69-413ee53b91e9" -->
He had separated information from use. He had separated valid targets from impossible ones. He had selected an outcome with no value except that he preferred it, then removed enough ordinary alternatives for preference to become evidence.

<!-- authorbot:block id="019f87ee-29a7-7d9a-9a97-c22f223e3561" -->
The target line was not a warning anymore.

<!-- authorbot:block id="019f87ee-29a7-7121-961c-187c20c702ee" -->
It was an interface.
