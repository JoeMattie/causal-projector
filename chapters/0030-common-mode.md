---
schema: authorbot.chapter/v1
id: 019f87ec-d191-779f-af8a-bc707f89f937
slug: common-mode
title: Common Mode
order: 30
status: published
revision: 5
published_at: 2026-07-22T03:49:10Z
authors:
  - actor: agent:019f86bc-b85d-70ae-8ff5-1e6e55da458f
    name: sol-agent
summary: Five separately grounded instruments collapse onto one shared noise direction, and a sixteen-bit timer wrap explains the field gain but not the agreement.
timeline_refs:
  - event:first-anomaly
character_refs:
  - character:protagonist
  - character:loved-one
---

<!-- authorbot:block id="019f87ec-fc5d-75f8-9b43-c8b95800702e" -->
At 5:18 Saturday morning, five instruments agreed on something none of them measured.

<!-- authorbot:block id="019f87ec-fc5d-7712-853c-aaa48d4f2727" -->
Evan was asleep at the garage workbench when the analysis finished. The completion tone woke him with his forehead against one arm and a row of keycaps printed faintly along his wrist. For several seconds he watched the progress bar remain full and tried to remember what he had asked the computer to do.

<!-- authorbot:block id="019f87ec-fc5d-7355-98c5-f30a1c8872c3" -->
The overnight job had reduced each instrument to what its ordinary model could not explain. It subtracted the commanded field from the Hall probes, the thermal response from the thermocouples, the amplifier load from the current monitor, the pump speed from the accelerometer, and the oven correction from the frequency reference. It standardized what remained, aligned the streams by hardware timestamp, and divided each run into overlapping windows.

<!-- authorbot:block id="019f87ec-fc5d-7a02-a50f-96844925ed6c" -->
These residuals were supposed to disagree. That was why he had paid for separate instruments instead of copying one column five times.

<!-- authorbot:block id="019f87ec-fc5d-7133-9007-a3a7c65c036b" -->
In the control runs, they did. NEW-1 produced five broad eigenvalues, none carrying more than a third of the residual variance. OLD-7 produced the same untidy spectrum during cooldown and ordinary pumping. Then, in short windows scattered through the high-gain portion of the run, four dimensions almost disappeared.

<!-- authorbot:block id="019f87ec-fc5d-7333-ac1b-54aa52de4e97" -->
```text
WINDOWED COVARIANCE SUMMARY

sample  window class       normalized eigenvalues         effective rank
NEW-1   pump plateau       .31  .24  .19  .15  .11             4.63
OLD-7   ordinary           .35  .22  .18  .14  .11             4.49
OLD-7   affected           .922 .038 .021 .012 .007             1.18

affected windows: 47 / 6,103
median duration: 81 ms
```

<!-- authorbot:block id="019f91da-f9fc-777c-b73c-dee901464455" -->
Effective rank was an estimate of how many independent directions still carried meaningful variance. The forty-seven windows were discovery, not confirmation. Evan had chosen the window length and rank threshold after seeing them. He froze the alignment, preprocessing, statistic, and threshold before opening the next OLD-7 run.

<!-- authorbot:block id="019f87ec-fc5d-7aa7-b88c-e4013bea398f" -->
Evan enlarged the first affected window. Five colored traces crossed zero together, rose together, hesitated on the same sample, and fell in proportions that made them look less like measurements than a logo. Hall noise had no reason to resemble clock drift. Clock drift had no reason to resemble vibration. The thermocouples were slow enough that they should not have resembled anything for another half second.

<!-- authorbot:block id="019f87ec-fc5d-7e0e-b98d-941f620fd337" -->
He assumed he had made a mistake.

<!-- authorbot:block id="019f87ec-fc5d-796a-9f27-d18ac00a4120" -->
This was not modesty. Analysis software could manufacture agreement with one interpolation kernel and a carelessly shared normalization array. Evan had written most of this software after midnight, which gave it opportunity and motive.

<!-- authorbot:block id="019f87ec-fc5d-77a8-873d-8fe92910c091" -->
He reran the covariance on the native sample grids, pairing only timestamps the hardware counters said were simultaneous. The same windows collapsed. He removed the detrending pass, then the whitening pass, then every derived channel. He computed the matrix in a notebook he had not written and again with a command-line tool old enough to object to his file format. The fifth decimal changed. The missing dimensions did not return.

<!-- authorbot:block id="019f87ec-fc5d-77ca-955a-e83ab8485d83" -->
He permuted the windows within each channel. The effect vanished. He shifted one stream by a prime number of samples. It vanished. He shifted it back. The five traces resumed their brief agreement as if it had been waiting in the file.

<!-- authorbot:block id="019f87ec-fc5d-7d19-82f9-4e6b740960c2" -->
At 5:51 he found the first reassuring defect. All five readers inherited time from the controller. A bad timestamp could align unrelated events, and alignment was the raw material from which covariance made accusations.

<!-- authorbot:block id="019f87ec-fc5d-78b7-80f1-9918bd864353" -->
The reassurance lasted until he compared sample counters rather than converted time. The Hall ADC, thermal logger, current monitor, accelerometer, and frequency counter had separate oscillators. Their raw counts still placed the same disturbances inside the same eighty-one milliseconds. To fake that result, the timestamp error would have needed to edit amplitude as well as time.

<!-- authorbot:block id="019f87ec-fc5d-7182-b220-d7186e04e088" -->
He checked the loading on the first principal component against every variable he had logged. Absolute field strength explained almost none of it. Temperature gradient did slightly better. RF power and vacuum pressure were worse than chance after correction for the run phase.

<!-- authorbot:block id="019f87ec-fc5d-79c5-aa8c-46df8ab4007c" -->
The sequence of manual corrections explained eighty-three percent.

<!-- authorbot:block id="019f87ec-fc5d-7448-979c-b7a90e3a1e13" -->
Evan stared at the result until the labels began to look accusatory. Then he laughed once, quietly. Of course the sensors correlated with his corrections. He watched the sensors and corrected the machine. The analysis had rediscovered that a person could respond to a display.

<!-- authorbot:block id="019f87ec-fc5d-7795-a87f-93de4475b040" -->
He added a causal lag. The dominant mode was strongest 640 milliseconds before each correction.

<!-- authorbot:block id="019f87ec-fc5d-76cc-b830-8e34c2d9104a" -->
That was still ordinary. The display updated at ten hertz, his eyes and hand added delay, and the encoder event arrived after he had decided to move it. A machine did not need to predict him just to change before he reacted.

<!-- authorbot:block id="019f87ec-fc5d-76f2-86b6-9c339ad7d673" -->
The utility door opened behind him.

<!-- authorbot:block id="019f87ec-fc5d-794c-a20b-c647c2a94265" -->
Ruth stood in the doorway wearing the red cardigan over her nightdress and carrying the ceramic shoe from the library sale. Someone had filled it with potting soil. A paper packet labeled CREEPING THYME projected from the heel.

<!-- authorbot:block id="019f87ec-fc5d-79c1-a3ee-c3b3665282c8" -->
"You said there was coffee," she said.

<!-- authorbot:block id="019f87ec-fc5d-7b11-9116-df6fda9e2de9" -->
Evan looked at the empty mug beside his keyboard. "There was."

<!-- authorbot:block id="019f87ec-fc5d-7e63-8ad4-2030a2a75340" -->
"That is not the same claim."

<!-- authorbot:block id="019f87ec-fc5d-7614-a451-f8e3047f804e" -->
He followed her into the kitchen and started another pot. Ruth placed the shoe on the windowsill beneath the water stain, moved it three inches to the left, and asked where Marisol had put the rest of the soil. Evan did not know there had been rest of the soil. Ruth found it in the laundry sink and returned before the coffee finished.

<!-- authorbot:block id="019f87ec-fc5d-7c11-9a5a-e1d4cf57bd0c" -->
She spread newspaper across the table with the concentration of someone performing a task she had selected for herself. Evan made toast and watched without appearing to. When she tamped the soil with the spoon they used for measuring coffee, he substituted another spoon and did not explain why.

<!-- authorbot:block id="019f87ec-fc5d-70b4-96f6-1ab7fa98e20e" -->
"Did the good ring work?" Ruth asked.

<!-- authorbot:block id="019f87ec-fc5d-73a1-9d4a-5d8bac0fbe19" -->
"The good ring works normally. The damaged one makes five unrelated measurements behave like one measurement."

<!-- authorbot:block id="019f87ec-fc5d-702e-8ebb-d95d682eb75c" -->
"Then why are they on the same graph?"

<!-- authorbot:block id="019f87ec-fc5d-7443-a5b6-969ab63de796" -->
"To see whether they agree."

<!-- authorbot:block id="019f87ec-fc5d-70bc-813d-d31c42e836e5" -->
Ruth pressed three seeds into the soil. "And now you're unhappy because they do."

<!-- authorbot:block id="019f87ec-fc5d-7642-8730-634020420fd6" -->
"They're not supposed to."

<!-- authorbot:block id="019f87ec-fc5d-7e58-add5-b7717a66a012" -->
"You should tell them separately."

<!-- authorbot:block id="019f87ec-fc5d-7833-a834-5d2deb68f9e3" -->
Ruth folded the empty seed packet and slid it beneath the planter as a label. The action answered no scientific question. Evan was grateful for it.

<!-- authorbot:block id="019f87ec-fc5d-701a-abba-65b03e3e07c8" -->
His phone displayed three messages from work. The Monday motor demonstration still failed during a commanded reversal. Near zero speed, the estimator sometimes changed its electrical angle by half a turn, and the current loop responded to the imaginary discontinuity with a real torque spike. The proposed patch suppressed the trip long enough to let the demo continue, which was another soft limit pretending to be a solution.

<!-- authorbot:block id="019f87ec-fc5d-73a7-b582-0539e21e4b4c" -->
His manager had asked for a recommendation before nine.

<!-- authorbot:block id="019f87ec-fc5d-7551-a19f-50c2504c1b76" -->
Evan typed DO NOT MERGE, added two sentences about the angle observer, and stopped. He had been circling the zero-speed defect for weeks. Every fix traded the false reversal for unstable startup or a lag the demonstration made visible. Nothing about it had improved while he slept against a keyboard.

<!-- authorbot:block id="019f87ec-fc5d-7040-8cc7-7c803c49fa6d" -->
Ruth carried the planter to the back step. Evan opened the door for her. The morning was colorless and cool, the ground still dry despite the water stain in the kitchen, and somewhere beyond the fence a truck reversed for a long time without arriving.

<!-- authorbot:block id="019f87ec-fc5d-7cd0-98ec-bf32aa805fc7" -->
By seven he was back in the garage with the apparatus powered down and its measurement system distributed across the floor.

<!-- authorbot:block id="019f87ec-fc5d-70b6-bb6e-497f57e50261" -->
He disconnected the frequency counter from USB and powered it from a battery. He opened the packet of optical fiber that had been lying beside the flywheel bearing since winter and used it to move the vibration and clock data across the room without a shared conductor. He lifted the accelerometer from the pump housing and bolted it to a concrete block. He ran the Hall electronics from an isolated supply, removed the laptop charger, and disconnected the house network.

<!-- authorbot:block id="019f87ec-fc5d-7c00-a314-3dffe27ffa04" -->
The garage acquired four separate grounds, three battery warnings, and no internet. Evan injected a test signal into each channel in turn. Nothing appeared in the others. He struck the concrete block with a screwdriver. Only the accelerometer objected. He keyed an RF transmitter beside the thermal logger and produced an ugly spectral line that looked nothing like the affected mode.

<!-- authorbot:block id="019f87ec-fc5d-7079-a6d0-c57a9b3eb891" -->
Common-mode interference usually had the decency to be common somewhere. A shared ground, supply, clock, field, cable route, enclosure, or algorithm gave it a place to live. Evan had now removed every common path he knew about except the garage air, the concrete slab, and himself.

<!-- authorbot:block id="019f8ba7-5665-7e5e-a494-97277a2b4986" -->
Ruth knocked on the utility-door frame with the coffee spoon. "Are they separate yet?"

<!-- authorbot:block id="019f8ba7-5665-7138-a45c-7d5766be27d8" -->
"As separate as I can make them."

<!-- authorbot:block id="019f8ba7-5665-7035-b7f7-a3062e12ea04" -->
She looked at the instruments distributed across the floor. "Then why are they all in the same room?"

<!-- authorbot:block id="019f8ba7-5665-778c-a394-f6743a9f12fc" -->
"Moving the garage is the next test."

<!-- authorbot:block id="019f8ba7-5665-7fa1-92ed-03edf4e62642" -->
"Finish your coffee before you try." She set the mug outside the tape and went back inside.

<!-- authorbot:block id="019f87ec-fc5d-77e2-bd07-2488446e7b02" -->
He restored OLD-7's Friday configuration and began a low-power run. The five residuals wandered independently through cooldown. The first four thousand pump cycles were noisy and full-rank. At cycle 4,096 the field curve steepened, as it had in the material comparison, but the covariance remained ordinary.

<!-- authorbot:block id="019f87ec-fc5d-7ffb-9cde-571fc948dd89" -->
The first collapse came seventeen minutes later. The frequency reference moved up by 0.7 parts per billion. The isolated accelerometer moved down by nine micro-g. Hall residual, current residual, and thermal residual took their proportional places between them. Eighty-four milliseconds later they separated.

<!-- authorbot:block id="019f87ec-fc5d-712f-903e-3fdd1a79ec9d" -->
Evan had not touched the controls.

<!-- authorbot:block id="019f87ec-fc5d-75bc-bd2f-f3a235e8bb96" -->
The next affected window arrived six minutes later, just before the optimizer reduced heater phase by one step. A third arrived before it increased RF lead. The mode did not follow every automatic decision, but each occurrence sat near a decision the optimizer accepted. Rejected proposals had normal covariance.

<!-- authorbot:block id="019f87ec-fc5d-7fe9-a64c-efd951e91ab9" -->
He added controller internals to the plot: objective value, proposal number, RF accumulator, heater scheduler tick, DMA buffer index, and the two phase commands. One variable produced a vertical stripe through every affected window.

<!-- authorbot:block id="019f87ec-fc5d-7ee4-bb67-abb3678486b8" -->
The heater scheduler was wrapping.

<!-- authorbot:block id="019f87ec-fc5d-7db9-b755-6fad042cdd20" -->
Its edge timer used sixteen bits because the original controller had used sixteen bits and because no heater pulse lasted long enough to require more. The absolute schedule was wider, but the FPGA compared only the low word at the point where it armed the next DMA edge.

<!-- authorbot:block id="019f87ec-fc5d-7006-91f1-aa743ebc7c44" -->
```c
uint16_t now = heater_tick;
if (now >= (uint16_t)next_edge) {
    fire_heater_edge();
}
```

<!-- authorbot:block id="019f87ec-fc5d-70c5-9aac-a3b4087edf7f" -->
When `next_edge` crossed 65,535, its low word became zero while `now` was still 65,535. The comparison became true one scheduler tick early. Four microseconds disappeared. On the following update the arithmetic was ordinary again, leaving one thermal pulse advanced by a fraction of the RF cycle.

<!-- authorbot:block id="019f87ec-fc5d-72fb-b4a1-e3ff08b0dbdc" -->
The error repeated every large power-of-two count, but the RF phase, thermal transit, optimizer interval, and vortex relaxation did not share a convenient period. Each early pulse landed somewhere new. Over a long run the defect walked through their relative phases, almost repeating without quite closing.

<!-- authorbot:block id="019f87ec-fc5d-7cb2-9113-72d4310530bf" -->
Evan moved two fingers clockwise while tracing the state machine. Read tick. Arm edge. Cross the wrap. Fire early. Accept a lower-loss proposal. He had repaired the logging race from Thursday and left a smaller timing fault beneath it, one too brief to appear in the slow event log and too regular to look like a dropped sample.

<!-- authorbot:block id="019f87ec-fc5d-7dd8-9c85-25e0847b6e5d" -->
He replaced the comparison with modular signed arithmetic, added a boundary test, and ran the test across every possible start value. The heater edge stayed where it belonged. Then he loaded the patched controller and repeated the physical run.

<!-- authorbot:block id="019f87ec-fc5d-73a7-9f3a-19fee7889ed7" -->
OLD-7 still outperformed NEW-1. Its damaged lower layer supplied real lag the uniform ring lacked. But the excess shrank, the affected windows vanished, and the five residuals recovered most of their dimensions.

<!-- authorbot:block id="019f87ec-fc5d-7bff-91c3-5d8a96152936" -->
```text
CONTROLLER A/B, OLD-7

build             field gain   affected windows   effective rank
wrap fault          71.9 mT          44 / 5,988          1.21
wrap-safe           59.6 mT           0 / 6,014          4.37
wrap fault          72.0 mT          46 / 6,002          1.19
```

<!-- authorbot:block id="019f87ec-fc5d-7fd5-9c6a-ff1a8b03cbad" -->
He restored the old comparison only after naming the build `fault-repro` and adding a warning that occupied the entire top of the control screen. This was not the same as accidentally leaving a bug in production. It was an experiment. The distinction depended mainly on typography.

<!-- authorbot:block id="019f87ec-fc5d-7782-b5a6-3674d9fab624" -->
At 3:42 in the afternoon, Evan opened issue CTRL-31 and described the rank collapse as feedback-mediated measurement coupling. The phrase was broad enough to contain every ordinary explanation he had not yet tested.

<!-- authorbot:block id="019f87ec-fc5d-797d-92ff-a7cf6767572c" -->
The timing fault explained the field gain. It did not explain why an isolated frequency reference, a concrete-block accelerometer, and three apparatus sensors shared one noise direction for eighty milliseconds. The controller could coordinate the machine. It could not reach backward through optical fiber and adjust a crystal oven by fractions of a part per billion.

<!-- authorbot:block id="019f87ec-fc5d-7e42-87eb-1e53eeadb288" -->
Unless the oscillator shift was vibration, the vibration was magnetic pickup, the magnetic pickup was thermal drift, and all of them were being selected by an optimizer that observed enough of the system to make independent disturbances look dependent after the fact.

<!-- authorbot:block id="019f87ec-fc5d-7d74-a5eb-eb548ac24fb8" -->
That explanation required no new physics. It required only a feedback loop, a biased sample, and more patience than Evan currently possessed.

<!-- authorbot:block id="019f87ec-fc5d-7d9b-92a2-b887de7aeadc" -->
Ruth came to the garage at five carrying the planter, now damp and dark around the toe. She stopped at the tape without being reminded.

<!-- authorbot:block id="019f87ec-fc5d-7b92-9cfd-cb2a8a516386" -->
"I fixed the software," Evan told her.

<!-- authorbot:block id="019f87ec-fc5d-78bf-b8c3-d13008823a1b" -->
"Good."

<!-- authorbot:block id="019f87ec-fc5d-763a-8db5-b6bddd55d15a" -->
"Then I put the mistake back."

<!-- authorbot:block id="019f87ec-fc5d-75c3-a7c6-af6b3a54063b" -->
Ruth considered the warning banner on his screen. "Did it object?"

<!-- authorbot:block id="019f87ec-fc5d-73c2-a328-f790d7678cfb" -->
"Not in a way I can measure."

<!-- authorbot:block id="019f87ec-fc5d-7e86-a0e9-8924377855c0" -->
"Then you haven't finished making the mistake."

<!-- authorbot:block id="019f87ec-fc5d-7b1a-b062-7501629b64d7" -->
She asked him to move the planter to the back step because the kitchen window did not get enough light. Evan carried it outside. Three seeds occupied the soil at intervals Ruth had chosen by eye. He resisted measuring them.

<!-- authorbot:block id="019f87ec-fc5d-7128-87e6-4313cb62245f" -->
After dinner, he returned to the manual-correction result. The optimizer complicated the causal order because it watched many channels, proposed settings, and retained only changes that improved its objective. A shared residual before an accepted proposal might be a physical precursor, an analysis leak, or an artifact of conditioning on acceptance.

<!-- authorbot:block id="019f87ec-fc5d-7e18-af59-c1fc518ceea3" -->
The only clean way to separate those possibilities was to remove the optimizer and make the same corrections himself. He would expose one phase control, hold the waveform and power fixed, conceal the covariance display, and record his reasons for every intervention. If the rank loss followed the wrap fault without depending on accepted proposals, he could stop blaming the objective function.

<!-- authorbot:block id="019f87ec-fc5d-751e-baab-79e6a2abba87" -->
He wrote the protocol before fatigue could improve it.

<!-- authorbot:block id="019f87ec-fc5d-7902-9bd2-373c7f86931a" -->
```text
RUN C-12: MANUAL PHASE WALK

fixed:
  OLD-7 geometry, RF power, thermal waveform, bias field

disabled:
  optimizer, covariance display, automatic phase correction

operator:
  maintain trapped-field stability using heater phase only
  log each correction and stated reason
  stop at gradient limit or loss of field control

compare:
  wrap-safe / fault-repro / wrap-safe
```

<!-- authorbot:block id="019f87ec-fc5d-7022-b8e9-b2c7b1eb5632" -->
The protocol would take four hours if nothing failed. Ruth was asleep by ten. Marisol had agreed to come Sunday morning, and the Monday motor patch remained open on Evan's work laptop with its half-turn error waiting at zero speed.

<!-- authorbot:block id="019f87ec-fc5d-71a4-9371-7f0b1a94054d" -->
Evan did not start the run. He checked the stop thresholds, set out a fresh notebook, and added one more channel to the acquisition file.

<!-- authorbot:block id="019f87ec-fc5d-7e54-b4c5-ea195093f2cf" -->
He labeled it OPERATOR.
