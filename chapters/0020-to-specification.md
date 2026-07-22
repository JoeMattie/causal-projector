---
schema: authorbot.chapter/v1
id: 019f87ea-14fc-73e6-85b7-32bfdc0a0434
slug: to-specification
title: To Specification
order: 20
status: published
revision: 3
published_at: 2026-07-22T03:47:38Z
authors:
  - actor: agent:019f86bc-b85d-70ae-8ff5-1e6e55da458f
summary: A flawless replacement ceramic meets every specification and erases the anomalous gain, leaving Evan to defend the damaged ring that works.
timeline_refs:
  - event:material-accident
character_refs:
  - character:protagonist
  - character:loved-one
---

<!-- authorbot:block id="019f87ec-ad37-7c4d-983f-fb93c5ec3f8a" -->
The replacement arrived at 9:46 Friday morning in a foam-lined case large enough for a violin and too small for the amount Evan had paid for it. The courier carried it with both hands. A red label warned that the contents were brittle, cryogenic, magnetically sensitive, moisture sensitive, shock sensitive, and not to be accepted if the indicator below had turned black.

<!-- authorbot:block id="019f87ec-ad37-7d0c-995e-f487498b4587" -->
The indicator was white. Evan signed, photographed it beside the tracking label, photographed the unbroken seal, and carried the case through the kitchen just as Marisol sounded her horn in the driveway.

<!-- authorbot:block id="019f87ec-ad37-7100-b0c7-3b8d63bb6a3b" -->
Ruth was waiting by the front door with a canvas library bag and no coat. She had put on the red cardigan again and pinned a note to it that read BOOK SALE, MARISOL, HOME AFTER LUNCH. The note was in Evan's handwriting. The pin was not.

<!-- authorbot:block id="019f87ec-ad37-72c3-8b66-e30a0ba6d58b" -->
"You said it might rain," Evan said.

<!-- authorbot:block id="019f87ec-ad37-75c8-aed4-359cee0eecea" -->
Ruth looked through the open door at a sky without clouds. "It might improve."

<!-- authorbot:block id="019f87ec-ad37-7d34-8776-ecb4824958ba" -->
He found her coat in the hall closet beneath an ironing board no one used. By the time he returned, Marisol had come in and was examining the shipping case on the table. She was a small woman with silver hair cut close to her head and the patient suspicion of someone who had spent a career opening invoices.

<!-- authorbot:block id="019f87ec-ad37-7767-9173-04100f2de592" -->
"Is that the part that fixes it?" she asked.

<!-- authorbot:block id="019f87ec-ad37-7de2-b885-667f07003bbc" -->
"It fixes the temperature gradient."

<!-- authorbot:block id="019f87ec-ad37-71de-a479-7c1d11de5991" -->
"Then don't let him touch anything else," Ruth told her.

<!-- authorbot:block id="019f87ec-ad37-7a56-9eef-406a2ba4292e" -->
Evan checked that Ruth had her phone, the card with his number, and the midday tablet in its separate envelope. Ruth endured this until he asked what time she would be back.

<!-- authorbot:block id="019f87ec-ad37-7830-8abb-d77ffd6cc987" -->
"When the books run out," she said, and left with Marisol.

<!-- authorbot:block id="019f87ec-ad37-7a7b-9669-1326d981461b" -->
The house became quiet in a way Evan no longer trusted. He put Ruth's coat over the chair where she had left it, moved the shipping case to the garage, and cleared a rectangle on the bench by transferring everything inside it to a second, less defensible pile.

<!-- authorbot:block id="019f87ec-ad37-7d4c-8d7f-55d0b1cc160a" -->
The case contained an inspection certificate, a thermal map, three magnetic characterization plots, two pairs of gloves, and a YBCO annulus wrapped in aluminized film. The new ring was the same nominal size as the old one: eighty millimeters across, twenty through the bore, twelve thick. Its faces were flat. Its edges had clean radii. A laser-marked serial number occupied the exact center of the outer circumference as if the material had grown around it.

<!-- authorbot:block id="019f87ec-ad37-7f4f-b5a3-4faa58e8c617" -->
The certificate described oxygenation uniformity, critical current density, trapped-field symmetry, and the absence of visible cracks. Each property sat inside its tolerance. The supplier had made the part Evan thought he already owned.

<!-- authorbot:block id="019f87ec-ad37-731e-938b-827560e9704f" -->
His original annulus had come from a surplus lot labeled EDUCATIONAL DEMONSTRATION, COSMETIC DAMAGE. One face was glossy and black. The other was dull, porous, and crossed by a pale line that vanished under the copper heat spreader Evan had bonded to it with silver-loaded epoxy. The ring trapped field well enough to justify the trouble and badly enough to remain affordable. He had named it OLD-7 because six pieces in the lot had been worse.

<!-- authorbot:block id="019f87ec-ad37-739d-8d11-364f403697e6" -->
OLD-7 also ran hot. Its upper thermometers crossed the superconducting transition together while the lower pair followed late and disagreed on the way down. That asymmetry caused the gradient alarm the previous night. It was the reason for the replacement, the scorched connector, and several small burns on Evan's left forearm acquired while proving that a surface was no longer cold.

<!-- authorbot:block id="019f87ec-ad37-79f0-b2dd-694cf786b45a" -->
Before opening the chamber, he finished the logging fix. He captured the command source and monotonic timestamp in the same interrupt that queued the hardware transition, then made the checkpoint task wait on an explicit acknowledgment instead of an observed state change. The tests passed ten thousand synthetic shutdowns without inventing an operator.

<!-- authorbot:block id="019f87ec-ad37-70e6-8325-694c281b24db" -->
The impossible override from Thursday remained impossible only in the old log. Evan attached it to the issue, wrote likely pre-fix source/timestamp race, and closed the issue. A closed issue was not a solved mystery, but it stopped appearing in the list of unsolved ones.

<!-- authorbot:block id="019f87ec-ad37-7983-9a5d-b20e6b6ede96" -->
He wrote the material test plan before touching either ring.

<!-- authorbot:block id="019f87ec-ad37-7692-9e5a-b1ab42166b0e" -->
```text
CONTROL M-04: YBCO replacement

Hold constant:
  coil geometry, bias field, heater sequence, controller build,
  sensor calibration, vacuum, cooldown rate, optimizer seed

Compare:
  OLD-7 / NEW-1 / OLD-7

Primary endpoint:
  trapped field after 16,384 pump cycles

Abort:
  thermal gradient > 11 K, pressure rise, quench, operator judgment
```

<!-- authorbot:block id="019f87ec-ad37-73fc-ae0f-e886894dab2c" -->
The final abort criterion was scientifically ugly and physically necessary. Evan was the only component in the system authorized to smell burning insulation.

<!-- authorbot:block id="019f87ec-ad37-711e-8cbd-54b40a2b6c98" -->
Removing OLD-7 took an hour. The silver epoxy had crept against the edge of the mount and formed a ridge that caught on the thermal layer. Evan warmed it, loosened the clamps in quarter turns, and lifted the annulus with both hands. The pale line on its lower face reached farther toward the bore than he remembered. He photographed it against a scale and placed it in the foam cavity intended for its replacement.

<!-- authorbot:block id="019f87ec-ad37-7499-994f-4bbb492ac6be" -->
NEW-1 dropped into the mount without persuasion. The thermally switchable magnetic segments met its lower face evenly. The copper spreader lay flat. Every lead reached its terminal without being bent into a new opinion.

<!-- authorbot:block id="019f87ec-ad37-7bfb-8bb7-4cd6487de6e7" -->
By noon the chamber was under vacuum. Evan started the nitrogen transfer and watched six temperature traces descend in formation. Channel three entered the green band with the others. The maximum gradient remained below two and a half kelvin. There were no alarms, no overrides, and no reason for him to keep one hand above the stop control.

<!-- authorbot:block id="019f87ec-ad37-7fa3-a301-59fa47bc7ebf" -->
The new part was so well behaved that he distrusted it for ten minutes, then began to enjoy himself.

<!-- authorbot:block id="019f87ec-ad37-7ef0-8c0e-ed715c8a55eb" -->
The RF stator established its rotating field. The microheaters sent a thermal front around the annulus, each segment warming just enough to change the response of the magnetic layer beneath it. The forward half of the cycle drove vortices inward. The return half did not quite undo the work. A little persistent current remained, then a little more. No energy appeared from nowhere. The amplifiers heated the garage, the cryogen boiled, and the resistor bank waited to receive what the ceramic stored.

<!-- authorbot:block id="019f87ec-ad37-7bcc-bddb-90cd70da73e6" -->
At cycle 4,096, the field curve began to flatten.

<!-- authorbot:block id="019f87ec-ad37-7b86-b59b-8611f990e797" -->
Evan checked the optimizer. It had not stalled. It was walking the heater phase exactly as it had on OLD-7, accepting small changes that reduced drift and rejecting those that increased operator intervention. The loss function improved. The field did not.

<!-- authorbot:block id="019f87ec-ad37-7a1b-b35f-458f9f600eca" -->
At cycle 16,384, NEW-1 held 53.9 millitesla above the bias field. Evan's model predicted 53.6. OLD-7's last eight completed runs averaged 71.8.

<!-- authorbot:block id="019f87ec-ad37-74c2-a3ce-b7f1ffab14fb" -->
He recalibrated both Hall probes against the reference coil. Their disagreement was smaller than before. He integrated the pickup-coil voltage over the full pump sequence and obtained the same missing field by a second method. He measured the stator current at the amplifier and the heater power at the feedthrough. NEW-1 was not starving. It was converting the supplied cycle into precisely the amount of trapped field the ordinary model allowed.

<!-- authorbot:block id="019f87ec-ad37-7b10-b588-89071da29eac" -->
Evan ate two crackers over the keyboard and ran the test again with the optimizer disabled. The fixed waveform produced 51.2 millitesla. He enabled the optimizer with a new seed. It found 54.0. He widened the phase bounds until the thermal front nearly lost direction and obtained 54.3 at the cost of twice the heat.

<!-- authorbot:block id="019f87ec-ad37-7caa-a6e3-24a5ca6aaf35" -->
The supplier's ring was reproducible, symmetrical, safe, and useless to him.

<!-- authorbot:block id="019f87ec-ad37-7aef-b70c-a47bd5bf0a8a" -->
At 1:37, Marisol sent a photograph of Ruth standing behind a stack of books with one hand raised against the camera. The message below it said SHE SAYS THIS IS EVIDENCE OF COERCION. Evan replied with a photograph of the clean temperature traces. Marisol sent back a question mark.

<!-- authorbot:block id="019f87ec-ad37-7f2f-acd6-23833db14266" -->
He checked the mount dimensions against the scan he had taken before disassembly. NEW-1 sat three tenths of a millimeter higher. He shimmed the stator. The result did not change. He reversed the pickup coil, swapped the Hall channels, restored the previous controller build, and repeated the run at the same nitrogen level as Thursday. The field remained within the uncertainty band around the model.

<!-- authorbot:block id="019f87ec-ad37-7265-9025-f31358c52770" -->
By four, the controlled experiment had become an argument. NEW-1 continued winning it.

<!-- authorbot:block id="019f87ec-ad37-7819-89cc-59e414007dd4" -->
Evan let the chamber warm enough to open, removed the part that worked, and examined OLD-7 under the bench microscope. The glossy upper region showed the broad domains expected from a melt-textured bulk. Near the lower face, the texture broke into smaller grains and dark pores. The pale line was not one crack but a set of microcracks following the boundary between them. Silver epoxy had entered two of the widest gaps and connected them to the copper spreader.

<!-- authorbot:block id="019f87ec-ad37-7ce4-96e7-d1f0de333bfa" -->
A professional lab would have rejected the annulus before machining the bore. Evan had bought it because someone had.

<!-- authorbot:block id="019f87ec-ad37-7461-be84-cf2dfd5e6084" -->
He remounted OLD-7, matching the photographs to within a tenth of a millimeter. The ridge of epoxy caught again. One lower thermocouple had to be pressed into place with a strip of copper foil. The assembly looked like the before photograph in a repair manual.

<!-- authorbot:block id="019f87ec-ad37-7faa-8c50-43c3e695f59b" -->
The old gradient returned during cooldown. So did the alarms. Evan acknowledged the first two and raised the abort limit from eleven kelvin to eleven point five, then wrote the change into the run notes before he could pretend he had not made it.

<!-- authorbot:block id="019f87ec-ad37-70eb-a3e1-3799589cb482" -->
At cycle 4,096, the field curve passed NEW-1's plateau.

<!-- authorbot:block id="019f87ec-ad37-7279-b77b-1cea92addf96" -->
At cycle 16,384, OLD-7 held 72.1 millitesla above bias.

<!-- authorbot:block id="019f87ec-ad37-7aa3-bc18-107f4e3bea8e" -->
Evan sat back and listened to the vacuum pump. The result was not free energy. OLD-7 consumed more RF power, shed more heat, and lost more field after shutdown. Its energy account was untidy but solvent. What it should not have done was convert its extra loss into a larger directed increment than the coupled thermal and magnetic model permitted.

<!-- authorbot:block id="019f87ec-ad37-7040-b6ed-6927fa2b692e" -->
He added the new run to the comparison.

<!-- authorbot:block id="019f87ec-ad37-7e68-875f-3f055e4e2b67" -->
```text
sample  max dT   field gain   30 min retention   interventions
OLD-7    10.9 K    71.8 mT        94.1%               6
NEW-1     2.4 K    53.9 mT        98.8%               0
NEW-1     2.2 K    54.0 mT        98.9%               0
OLD-7    11.3 K    72.1 mT        93.8%               7

model              53.6 mT
```

<!-- authorbot:block id="019f87ec-ad37-799a-82da-b86a04c5869b" -->
The table made the wrong part look worse in every column except the one that mattered.

<!-- authorbot:block id="019f87ec-ad37-710a-9810-e3292ec7e45a" -->
Ruth and Marisol returned while the annulus was warming. They brought six books, a paper bag of pears, and a ceramic planter shaped like a shoe. Marisol carried the books. Ruth carried the planter and objected to the distribution of labor.

<!-- authorbot:block id="019f87ec-ad37-779c-aa46-ee200cbf54b4" -->
"We agreed you weren't buying anything breakable," Evan said.

<!-- authorbot:block id="019f87ec-ad37-7342-b0e7-92e702775cda" -->
"It was already breakable when I bought it."

<!-- authorbot:block id="019f87ec-ad37-7344-a947-6e12f7375f69" -->
He took the planter. Ruth went past him to the kitchen, where she began arranging the books by height. There was a county railway history, a mystery without its dust jacket, two gardening books, a spiral-bound algebra workbook for adult students, and a travel guide to a city none of them planned to visit.

<!-- authorbot:block id="019f87ec-ad37-7829-9d05-58954c5f8a02" -->
Marisol stopped at the garage door. NEW-1 sat in its aluminized wrapping on the cleanest part of the bench. OLD-7 remained inside the chamber, surrounded by wires and condensation.

<!-- authorbot:block id="019f87ec-ad37-7aed-8f78-1d1f1cf064a3" -->
"Did the part fix it?" she asked.

<!-- authorbot:block id="019f87ec-ad37-72e8-9ac7-0df64d35f817" -->
"It fixed everything except the reason to build it."

<!-- authorbot:block id="019f87ec-ad37-7a61-a332-2ba5a797cc5f" -->
Marisol considered this, decided it belonged to a field in which she had no liability, and went to help Ruth with the books.

<!-- authorbot:block id="019f87ec-ad37-71ae-864b-f737cb91125b" -->
At dinner, Ruth asked which ring was the good one. Evan described uniform oxygenation, grain structure, thermal lag, and the difference between a component meeting specification and a system meeting its objective. Halfway through, he noticed she was eating a pear and no longer listening.

<!-- authorbot:block id="019f87ec-ad37-7f54-a6c0-a9a16ed5d92e" -->
"The expensive one is better," he finished. "The damaged one works."

<!-- authorbot:block id="019f87ec-ad37-7635-bd4f-9e64ed1e48f2" -->
Ruth cut another slice from the pear. "Keep both until you know what you mean."

<!-- authorbot:block id="019f87ec-ad37-73d8-b09a-de887e9302e8" -->
It was advice she had given students who tried to cancel unlike terms. Evan had heard it through walls, over dinner, and once during an argument about a mortgage. Whether Ruth remembered any of those occasions was not something he asked.

<!-- authorbot:block id="019f87ec-ad37-7073-b548-83961f3bc750" -->
After she went to bed, he measured the rings' thermal response on the bench. NEW-1 behaved like one material with two nearly equal time constants. OLD-7 behaved like two coupled materials. Its upper region cooled into a low-loss coherent state while the porous lower region, silver epoxy, and copper backing remained dissipative and late. Memory above, forgetting below.

<!-- authorbot:block id="019f87ec-ad37-7f64-8030-cefd7ea36139" -->
The delay gave the traveling thermal front a direction the controller did not explicitly command. Evan added a second layer to the model and recovered part of the missing gain. The rest remained in the residuals. He could close the gap by fitting three parameters he had not measured, which was another way of moving the gap into the assumptions.

<!-- authorbot:block id="019f87ec-ad37-7ac5-af65-79066774f321" -->
At 12:18 he opened a new issue.

<!-- authorbot:block id="019f87ec-ad37-7b93-ad74-2dd3618f8cba" -->
```text
MATERIAL-17: sample-specific pump gain

Observed:
  OLD-7 exceeds single-layer model by ~34%
  NEW-1 agrees with model and removes excess gain
  effect follows sample across remount and sensor swap

Next:
  characterize layer lag
  compare full sensor covariance, not only field endpoint
  preserve OLD-7 geometry and controller state

DO NOT CLEAN, REPAIR, OR DISCARD OLD-7
```

<!-- authorbot:block id="019f87ec-ad37-7d51-ac4b-54fcd9dd2945" -->
He printed the last line and taped it to the chamber. He put NEW-1 back in its case with the inspection certificate and set it under the bench, where it became both an expensive control and the only component in the garage that could still be returned.

<!-- authorbot:block id="019f87ec-ad37-7432-8408-3b9d564b8414" -->
The performance comparison had used endpoint values. To understand the residual gain, Evan needed the shapes between them: Hall noise, thermal jitter, amplifier current, vacuum vibration, oscillator drift, and the moments when he had touched the controls. He added each channel to an overnight analysis and asked for the principal directions shared among them.

<!-- authorbot:block id="019f87ec-ad37-773e-836b-7acf91acc01b" -->
At 1:06 the process began reading the first OLD-7 run. In the kitchen, Ruth's library books leaned against one another by height. In the garage, the flawed annulus cooled inside the machine, and five instruments built to disagree contributed their separate columns to the same file.
