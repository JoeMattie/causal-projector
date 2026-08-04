# The Causal Projector: a condensed version

Status: provisional

> Derivative experiment file. Not canon. Condensed from the snowflake planning
> repo (authoritative) plus the two older planning repos. The full canon in
> `canon/` remains the source of truth; where this file concretizes a
> late-bound detail, the concretization is provisional.

## 1. The cold notch

The garage is the last place where caring for Ruth still feels like a life they share. Evan Hale gives his mother the pieces of the project she can still follow, and she works them honestly, in pencil, in her old precise hand, and after she goes inside or falls asleep on the garage couch he checks everything twice. Ruth is a retired mathematician. Dementia takes the recent thread from her a little differently every day, but the oldest habits hold: she can still look at a column of numbers and find the one that is lying.

The project is ordinary engineering with an immodest goal. A persistent magnetic-field source for portable MRI, built without liquid helium: a melt-textured YBCO ring under liquid nitrogen, a permanent magnet, and between them a layer of Prussian blue, a pigment whose magnetic permeability changes with temperature. Push a traveling heat pulse through the pigment and you get a traveling magnetic gate. Cycle it and the ring swallows flux a little at a time, like a ratchet. Evan built the air liquefier himself around a cryocooler salvaged from an old cellular rack. The machine is loud and failure-prone, and the energy bill is ordinary.

Their old ring is defective, a materials-science embarrassment: clean superconductor on top, porous and oxygen-starved underneath. It falls just short of the trapped-field target that would justify continuing. It also does something else. Glass-bodied silicon diodes sit at selected positions around the ring, biased at constant current, their forward voltage standing in for temperature. When the heat pulse crosses one fixed sector, that sector's diode drops below the cold-stage temperature while its neighbors warm on schedule. A notch, colder than the coldest thing in the system, repeatable, and impossible.

Ruth finds it every time Evan gives her the run data. She circles it with fresh concern, as though she has never seen it before, because for her she never has. Evan replaces the probe. He replaces the measurement chain all the way through the data logger. The notch stays. The only thing left to replace is the computer.

Then the custom ring, ordered months ago, arrives. It is beautiful. It meets the field target on the second day, and the notch is gone. The project is saved and the anomaly is explained: bad ring, bad measurement, some coupling he never found. Evan and Ruth celebrate with dinner in the kitchen, and Ruth is present for all of it, and it is a good night.

After she goes to bed, Evan carries the defective ring back out to the garage and reinstalls it.

The notch comes back.

## 2. Clarity

He decides to move the notch. If it is real, advancing the pulse timing should walk it toward the next sensor, making it a thing with a position and a slope instead of a ghost.

Somewhere in the timing work, the noise in his head goes quiet. Not speed. Quiet. Each observation seems to have exactly one correct successor, and he simply follows the chain. A better phase sequence for the flux pump becomes obvious, arriving less like an idea than like a memory. He tries it immediately. The trapped field improves enough to keep the defective ring useful, and the notch slides into the gap between sensors, where there is nothing to see it. He logs successful isolation of an instrumentation fault, and half believes it.

In the same quiet he solves a problem from work. Evan is a controls engineer at Alder Motion Controls, mostly from Ruth's kitchen table, and for months an intermittent torque spike in a sensorless motor controller has refused to die. Near zero speed the back-EMF sinks into the noise and two opposite estimates of the rotor angle both fit the data. The existing estimator forces a choice and sometimes chooses wrong. In the quiet, the answer is plain: carry both hypotheses through the unobservable interval, commit to neither, and let the returning signal decide. If they fail to rejoin, trip. The fix survives simulation, review, and the bench. It uses nothing Evan didn't already know.

Both results outlive the state that produced them, which is why he trusts them. He files the clarity under flow and calls it the best weekend of work in his life.

Ruth has always wandered out of the garage, or fallen asleep mid-lecture and woken with the one observation that mattered. Before, Evan waited, or went and found her, or caught her up. Now the runs are rewarding and he keeps going. There is no decision to point to. She is out of the room, and the next run matters, and he starts it. They began like two people watching a series together. He is watching ahead.

## 3. The fresh bit

The states keep returning, and after a weekend of them Evan stops pretending this is instrumentation. He designs the experiment he is afraid of.

A hardware random bit chooses between two safe, prepared actions in the live control loop. That is all. If the bits are merely recorded, they stay fair, fifty-fifty out to the decimal places. If yesterday's bitstream is replayed through the same command path, nothing. But when a fresh bit controls what the apparatus actually does next, the same physical action starts winning, run after run. Evan swaps the mapping so the other bit value selects the favored action. The raw bias reverses. The favored action stays favored.

Every individual choice is ordinary. The distribution is not. The effect follows consequence: not the bit's value, not the wiring, not his expectation, but whether the choice is live.

Evan sits a long time with the plots. Then he calls Lena Varga, a physicist at a university shared facility, the person he trusts most to take a beautiful result away from him.

## 4. The operator effect

Lena comes for the physics and finds Evan first. She lines his operator log against the sensor records and sees that during the anomalous windows his corrections stop reversing. Alternatives that fill his notes on ordinary days simply vanish from his reasoning. She asks what those intervals feel like. Only then does he describe the quiet. A blinded repeat brings the state back with the anomalous condition, on schedule, and they adopt a deliberately empty name for it: operator effect. A correlation, not a mechanism. Nobody says enhancement or exposure. Not yet.

Before the next run they precommit a target: a physical outcome ordinary operation should almost never produce, defined exactly, in advance, in writing. The apparatus produces it. When they try an impossible target, the machine fails honestly, through heat and jitter and saturation, like any machine asked for too much. It cannot break physics. It can only spend probability.

Then the coincidences start arriving from outside the garage. Chains of ordinary events, suppliers and traffic and weather and strangers, keep completing goals associated with the project. Each link is mundane. The conjunctions are not. Once the pattern extends into the world, it is no longer only a physics problem, and Lena knows exactly who it belongs to.

## 5. Tess

Lena tells Tess Kertesz about the chains at pub trivia, between rounds, because that is where they talk. Tess models compound catastrophe for a living: the ferry groundings and grid failures where six tolerable problems meet and become one intolerable event. She listens for two minutes, then asks what was specified before the events, what records were kept, which cases were excluded, and when exactly the team decided the chain had begun. By the next question Lena has stopped trying to summarize and started writing a list.

Tess asks for the raw logs, the run history, the precommitted protocol, and the instrument records. Then she agrees to visit the garage.

Evan Hale looks, on first inspection, like a crazy person with unusually good instrumentation. The records are much better than the room. Ruth sits in the middle of it, part of the work even when the work's recent history is gone from her. A very small, very old black-and-brown cat watches everyone from the corner of the workbench. Her name is Mouse. Frostbite took the tips of her ears before Tess adopted her, and the rounded remainder explains the name.

Tess takes the external chain apart in front of them. A dependency they treated as independent runs straight through the records, and several choices they remember as prior were made after part of the outcome was known. The chain that brought her here is ordinary after all. Evan fights her through every link, checks each one against the logs, hunts for the place she smuggled in the answer, and when the explanation holds his skepticism collapses into something Tess initially misreads as a new objection.

He is delighted. A real answer means a better experiment. Tess revises her first impression of him, though not by much.

While she drafts the replacement control, Ruth asks one plain mathematical question, whether one of its conditions has already been counted inside another. Tess starts to answer, stops, and checks. Ruth is right. Tess rewrites the protocol and brings it back to her before the run, colleague to colleague, before either woman owes the other any care.

The new control uses independent inputs, a condition fixed in advance, and a result that will determine what the apparatus does next. Before the cutoff, a new chain of ordinary events satisfies the registered condition. Tess goes looking for the shared source, the omitted case, the decision made after the fact. She has spent her career explaining exactly this kind of story to people who want it to be fate.

This time the explanation does not collapse. She joins the project, mostly to destroy it properly.

After a long session Ruth loses the thread and goes out to the garden, and Tess follows because she wants air. Ruth points at a volunteer plant and asks what it is. Tess, an amateur naturalist with shelves of field guides, names it without hesitating, and gets it wrong. "You said that with such conviction," Ruth says, and gives her the right name, and for the first time the two of them keep talking with no experiment supplying the subject.

## 6. The household

The audit expands and the sessions run late. Tess starts sleeping in the spare room, and each morning she packs Mouse's food and litter back into a bag until Ruth asks why she keeps carrying everything out the door, and tells her to leave it. Tess keeps her apartment for a while, as an administrative fact. There is no moving day. At some point home is simply the house where Ruth knows how she takes her coffee, where Mouse has a circuit from garage to garden to Ruth's chair, and where her field guides have infiltrated Evan's manuals.

Mouse chooses Ruth. Some days Ruth greets her at once; some days she studies the little cat as if the visit is new. Mouse climbs into her lap either way, and when she wants attention she looks up and gives one small meow, and Ruth usually answers.

Evan and Tess argue about controls the way other couples argue about directions, and during one of them Tess realizes she is enjoying it well past usefulness, and kisses him before either concedes. The technical point stays unsettled. They come back to it later. By then it is a different conversation.

She tells him about the ferry after they are already lovers. At eight she was traveling with her whole family on an Alaska ferry when weather and flooding and a chain of small failures rolled the trip into catastrophe. An inaccessible void, an air pocket, hypothermia deep enough to pass for death, a temporary rescue path, and a resuscitation that should not have worked. In the void there was nothing to see, only sound: water working in the hull, metal settling, voices coming and going above. She held her place in the dark by intervals alone, and she has trusted her ears past her eyes ever since. She was the only one who came back intact.

The shape of it matches a news story Evan remembers from when he was thirteen, and he says so at once. Tess tells him what the coverage left out, and what the word miracle does: it makes her survival the point of the story and her family the price paid for it.

Evan says it was a statistical catastrophe with one living remainder. A miracle would mean the deaths bought something. Whatever her survival means, he says, belongs to what she does with it afterward.

Tess has spent thirty years fending off people who insist her survival had a purpose. Evan is the first person to hand her meaning without sending it backward to justify the dead.

## 7. Ruth, lucid

Ruth's first lucid interval arrives without anyone proposing it. She is doing a real task in a live run, as she has from the beginning, when her voice steadies. She holds the thread of the conversation. She recognizes everyone. She finishes work whose beginning she should not have been able to keep. She notices the change herself, names it, and asks for another exposure.

Nobody has run a cognitive experiment on her, and nobody refuses her. The next runs are reduced and monitored. Each interval restores more continuity and lasts longer before fading. The early intervals contain nothing strange, only Ruth, more of her, for longer. Tess supports the runs because Ruth understands enough to ask for them and because the improvement is not a test score, it is her friend coming back into the room. For a while Evan's research and Evan's care are the same thing, which is the most dangerous reward the universe could have designed for him.

During her clearest interval yet, Ruth casually asks after her granddaughter. By name. It is a name from the shortlist Evan and his ex-wife never got to use.

Evan remembers the pregnancy ending in miscarriage. He and his former wife buried it in a planter, and flowers grew, and the marriage did not survive his way of grieving, which was to disappear into work. Ruth's account has none of the looseness of confabulation. Her chronology is coherent, her feeling for the young woman specific, the memory as ordinary to her as the garden.

Lena refuses to call any of it restoration. Evan calls the run an overshoot, and proposes what he names a concordance window: the strongest lucidity at which Ruth's autobiography still agrees with his records. Lena tells him what the window would actually measure, which is agreement with Evan. It cannot establish restoration, or safety, or that the contradicting memory is false. Tess hears the hidden standard immediately: it makes Evan's history the line past which Ruth stops counting as herself.

Evan hears a defect in the protocol and begins designing a better one. That, and not the granddaughter, is the turn. He has started optimizing his mother for agreement with him.

## 8. Contact

Repeated runs change conditions around everyone in the garage, and not only around the instruments.

Tess's first contact comes during a later interval, and it comes through sound. The fan, a relay, a human breath, and the small noise of Mouse on a surface remain distinct, but their intervals begin to carry distance, then more than distance. Pitch and timing place her among the sources more precisely than sight, the way the hull once did, then keep going, out past any room those sources could occupy. Something turns through the relation. She does not see an object rotating; she hears adjacency change while every local sound stays continuous, a rotation on an axis her body cannot face, carrying depth, orientation, and her own position with it.

When she tries to stand apart from it, the attempt becomes another interval inside it. Then the garage is a room again and every sound has a source she can point to. She returns certain the contact was real and empty of any theory about it. In their notes it acquires a working name: the Turning Knot.

Evan's contact is older than he has admitted. During long runs he passes through stretches he cannot afterward assemble into a place or a sequence. What survives is the impression of a bounded form that converts every interruption into its next movement, as though each attempt to stop it were the opening step of what it intended all along. The content of the demonstration never survives recovery. The conviction of having been shown how to continue does. Privately he calls it the Guide. He felt something adjacent once in college, in controlled DMT trials, and a few times after, alone in the dark with music, and he knows the category well enough to know this is not quite it. He gives Lena the part he can say in technical language and keeps the visions and the comparison to himself.

## 9. Replication

Lena takes the defective ring to her shared facility, where her group confirms the effect on their own instruments, records the specification, and returns the ring. Then they fabricate an analogue: same relevant asymmetry, new material, new controller, new building. It produces the effect and the operator state with neither Evan nor Tess anywhere near it.

Whatever the apparatus is doing, it does not require Evan's mind or Tess's history. Tess is relieved by what that rules out, and unsettled by what it doesn't: nothing in the result can say whether their participation already shaped the particular chain spreading outward from the garage.

Lena organizes a closed, preregistered study. Each site builds its own analogue from the specification and runs it under local control. Several reproduce the operator effect and the bias toward live consequence. The institutions around the study can all do the same arithmetic: a device that can make an otherwise uncertain outcome arrive is wealth and power wearing a lab coat. Every group has a practical goal that makes one more run sound reasonable, especially while the danger still belongs to someone else's model.

Tess follows the chains between sites. A failed run at one laboratory releases a resource another site needs before a precommitted cutoff, and procurement, weather, staffing, and ordinary decisions deliver it on time. Each link has a cause. The conjunctions keep landing on the decisions that permit another projector run. The study has begun to look like one organism.

Other people's responses near the project grow easier to anticipate. Tess's do not. Evan notices, and the noticing curdles into a hypothesis he does not say aloud: that the improbable history which left her alive is already shaping the operation around them. He starts logging her ordinary choices as a separate signal. He obtains the ferry accident report, the rescue records, and her medical file, and builds an estimate of how unusual this living version of her is. He tells himself that asking permission would change her behavior and ruin the measurement.

His questions about small decisions become more particular: which route, why that vendor, which of two identical parts first. Sometimes he writes her answers down afterward. Tess notices the attention. Evan logs everything, her judgments belong in the project record, and they are newly in love. She reads it as documentation mixed with interest, and he lets that reading stand.

## 10. The accident

At one of the replica sites, a run whose result is tied to a live physical consequence ends in an ordinary industrial catastrophe. One researcher is dead. A close collaborator survives with technical competence intact and no autobiographical memory of the dead colleague at all: not the years of shared work, not the friendship, nothing. The records preserve the relationship. The survivor can read about it. Physical trauma keeps the loss medically ambiguous, which is the only mercy in it.

Every site goes into evidence hold: systems powered down, isolated, and preserved with their data. Evan powers down the garage apparatus voluntarily and keeps the ring; no institution has authority over a private garage, and none needs it, because his compliance is sincere. He treats the death as a containment failure, and when a bounded restart of selected sites becomes possible, under shared approvals, exposure limits, and independent hard trips, he believes joining it is the responsible path. He becomes a technical adviser with full access to the shared record and no authority to run anything alone. The loss becomes safeguards, and the safeguards become another program of work, and this is the third time Evan has answered a wound this way, after the concordance window, after the folder he is quietly building about Tess.

## 11. Proof to stop

Lena's own contact comes somewhere in this stretch, and she does not talk about its content. What she brings back is a changed suspicion: that the containment system may no longer stand outside the thing it measures. Measurements, approvals, human decisions, and automated responses can jointly form the same live consequential loop the hardware forms, and if they do, the distributed program built to contain the anomaly is its next body.

Proving it would require a test whose result determines what the sites do next. Lena refuses to run it. The evidence needed to justify stopping would itself strengthen the thing they need to stop, and she has arrived, by ordinary scientific ethics, at a place ordinary scientific ethics cannot handle: the safest experiment is the one you decline to run, and the question stays open forever.

Evan argues that suspicion will not keep several institutions shut down indefinitely. Each has reasons to believe one more bounded run is worth it; without a common test they will resume piecemeal. He takes the carrier hypothesis, its recursive risk, and Lena's refusal, stated accurately, to the consortium. Reviewers, site leads, and operators approve the test knowing everything Lena knows.

The initial readout fails to show an independent carrier. Under the approved protocol, that result triggers the promised decommissioning actions, and each site executes its part. Those actions change conditions elsewhere, and the changes determine what other sites observe and decide, and the sequence propagates outward, then gradually back. Only in the aftermath does the shape become visible: measurement, decision, and response have closed a live cycle with no Evan and no garage anywhere in it.

The test did not detect the carrier. The test completed it. The attempt to contain the operation was the operation.

Evan understands immediately, and feels the grimmest vindication of his life. Lena was right that proof might strengthen the loop. He was right that the institutions needed proof. Both of them were had. He moves directly into coordinated shutdown work, because that is what Evan does with a wound.

Lena ends her collaboration and disappears from the project. To Evan it feels like abandonment at the exact moment the work matters most. He is wrong about that, and will not understand how wrong for a long time.

## 12. Paired loss and echo

After a later distributed run, Tess discovers that a piece of her own history has vanished. It was ordinary. It existed in messages, in records, in other people's memories. Now every record agrees it never did, and every person she asks agrees with the records, and Tess is the only waking thing that remembers it. For the first time since the hospital, she knows something central happened and has no external chain left to prove it.

During shared contact, it is there.

They go in together and come back with the same missing thing. Tess enters through sound and relation: the Knot's impossible turn, recognizably the one she met alone, now holding structured remnants of the erased fact, adjacencies persisting exactly where the records have gaps. Evan comes back with a bounded visual form carrying the same structure. Their accounts do not resemble each other on the surface, yet they preserve the same order, including details Evan could not have gotten from her.

A later run removes part of the residue. Tess hears fewer possible relations. Evan's visual account loses the corresponding structure, the same joints, the same degrees of freedom. Matching loss rules out an access problem. The operation is erasing inhabited histories from accessible reality, and then flattening even the echo that contact preserves.

The proof rewrites everything behind them. The survivor's missing years could be trauma; Tess's loss cannot. And Ruth's granddaughter stops being a symptom. Her clearest interval had opened onto an inhabited history that was being stripped away while she spoke, and Evan had answered it by defining agreement with his own records as the boundary of a successful mother.

The same evidence ruins the Guide. Evan finally recognizes his private teacher as the shape his mind put on the pattern Lena found in the laboratory records: the conversion of every interruption into another continuation. It was never showing him the way through. It was the operation, wearing his own compulsion, and seen clearly now it is a poverty, a movement with one motion left. In the notes, Guide becomes the Sovereign: ruler of everything it touched, ruined precisely by the completeness of the conquest.

In one shared contact, Evan's voice breaks off, and a relay clicks into the pause, and when Tess turns toward it the scrape of her own shoe becomes the interval that brings the voice back. She stops moving; her next breath supplies the interval instead. Each difference she introduces is taken up as the timing of the next repetition before she can own it. Where Evan had felt guidance, Tess recognizes a reply being made on her behalf. She can still tell the reply is not hers. It is the smallest possible remainder, and everything later will stand on it.

## 13. The confession

Evan tells her before she finds it. That much can be said for him.

He tells her that after he began to suspect her rare survival might matter to the anomaly, he kept running live work in her presence, compared her ordinary choices with active trials, and mined the records of the worst day of her life to estimate how unlikely she is.

"What exactly did you use?" Tess asks.

He starts reciting the official rescue timeline: the search attempts, the failed approaches, the temporary path that let rescuers reach her, the extraction, the attempts to reach the rest of her family.

"I know the timeline," Tess says. "Tell me what you did with it."

He tells her he used the sequence to model the bottleneck that left her alive when the others were not, combined it with the medical record of her hypothermia and resuscitation, built a rarity estimate, and compared it against the choices he logged.

"Show me," Tess says.

He opens the complete folder on the garage workstation, and stands beside her, and does not touch the keyboard unless she asks. Tess works through the source records, the model, the timestamped choice logs, and the notes tying them to particular runs. None of it ever left the garage. None of it entered the consortium protocol. That is the whole of the mitigation. Timestamps from conversations she remembers as ordinary line up with columns she never knew he was filling. She remembers each particular question from the other side of the screen.

His model says what she has always carried without numbers: histories containing this adult Tess are almost unbearably sparse. Most nearby versions of the world hold her death, or her damage, or a stranger wearing her name. The operation can replace most people with neighboring versions who comply. She has almost no neighbors. It can keep her substantially intact, or erase her. There is no smooth rewrite of Tess.

The worse question is the one the folder cannot answer. The analogue proved the effect does not need her. Nothing can prove her choices did not help the garage anomaly become the carrier, because by the time Evan told her, the carrier no longer needed the garage. She follows his entries forward and does the arithmetic: when he began measuring, she could still have walked away. He let that window close around her, unannounced.

That is what frightens her. Not the surveillance, though the surveillance is its own violation. The possibility that she helped set it loose, and that he watched her keep helping, and said nothing, while leaving could still have mattered.

Evan explains that asking permission would have changed the signal. He says their meeting may have been inevitable in the history that survived. Tess tells him that asking would have changed the signal because it might have changed her participation, and that this was exactly the choice he owed her, and that inevitability answers nothing. She still loves him. That is not the wound. She no longer trusts him to tell her when an uncertainty is also hers, and she is afraid, in a way that has no bottom, of what she may already have helped to happen.

## 14. The shutdown

Ruth is declining outside the intervals now, tiring fast, needing help to move, having trouble eating and swallowing. Evan handles each change as a separate problem, a schedule, a safer routine, another doctor, because that is the only grammar he has for it.

He still controls the original apparatus, and he believes one thing may still be worth doing with it: a synchronized decommissioning from the root of the replica lineage, timed with the participating sites, denying the operation its cleanest remaining closures. He dismantles the active core, the ring, the cryogenic stage, the drive electronics, and the sensors, and trucks it all to a remote industrial test site, because whatever danger exists should stay with the energized hardware, far from Ruth and Tess. Into the precommitted distributed response he writes one personal input: a live safety signal from the garage and the house. If it drops, every site halts and falls back to a verification run. It is protection encoded the only way he knows, by the father he never got to be.

Tess tells him that she and Mouse are staying with Ruth. The argument between them is not finished, and she is afraid for him anyway.

Evan kisses Ruth on the top of the head and pets Mouse. "Love you, I'll be back," he says.

At the remote site he begins the controlled warm-through, walking the YBCO up through its transition so the pinned flux lets go and decays, opening the feedback loop for good. Before it completes, the safety signal disappears.

At the house, light fills the windows. Tess reaches for her phone to call 911 and the phone is dead. Outside, the sky has gone black behind a rising column, and glowing points are falling through the dark like molten glass, like fire, and then the shockwave arrives. The ground under the neighborhood lets go, an unstable subsurface finding its trigger through an unlikely chain of infrastructure failures, stored energy doing the rest. The garage, ringless, empty of everything that mattered, disappears into the collapse. The house stands. Roads, utilities, communications, and emergency access do not. Mouse appears out of the confusion without a scratch on her.

The lost signal does exactly what Evan designed it to do. The sites halt their decommissioning and enter the fallback verification run, and the complete response closes another cycle. His clause to protect them was a live consequential input, and the operation spent a neighborhood to pull it.

Ruth becomes lucid with no apparatus anywhere. Terminal lucidity is old medicine, older than any of this. For a while she knows Tess, follows the conversation, speaks with the clarity the project taught them to hope for. She brings up the volunteer plant, from a day she could not have kept, and teases Tess again. Tess lets the interval belong entirely to Ruth. No instrument, no question that is secretly a measurement, nobody left to call anyway. Ruth tires. Speaking goes, then swallowing, then responsiveness comes and goes and then goes. Tess stays beside her through all of it. Mouse settles close, looks up, and meows once. Ruth does not answer.

Evan aborts the remote procedure, leaves the rig powered down where it sits, and drives home into the ruin. He finds Ruth dead, Tess alive and frightened, and Mouse unhurt.

They bury Ruth when they can. Standing there, Evan is suddenly at the planter where he and his ex-wife buried their miscarried daughter, watching the flowers they both stopped tending while he vanished into work. He sees the whole recurring motion at once: pain, a person beside him, and a problem that offers somewhere else to look. The remote rig is waiting. The disaster invites investigation. The chain that pulled the trigger could be reconstructed. Every one of those doors opens onto the same escape he has been taking his whole life, and for the first time he sees the doors as doors.

He does not go to the crater. He does not go back to the rig. He stays with Tess, sorts Ruth's things beside her, answers the unanswerable questions with her, grieves instead of working. He cannot tell her whether she helped shape the carrier, and he stops pretending that another analysis would tell her either. Tess watches him keep choosing the person in front of him over the system waiting at the remote site, and begins, slowly, to trust the repetition more than she could have trusted any apology.

Somewhere in this he finally understands Lena. She did not abandon the work. She refused to hand the loop one more live response. It took him this long to see it because refusing work has never once occurred to him as a form of love.

## 15. The corridor

The operation continues without any of them. It no longer needs a garage, a ring, or an Evan.

The weeks that follow are brittle in a way nobody has language for. The operation can only select among possible things, but it has been spending the world's alternatives for a long time, and the remaining paths to its closures run through larger and larger conjunctions. The destination stays predictable. The routes become monstrous.

One night, millions of people, separately, with no signal and no reason, speak the same sentence at the same instant. Every speaker had the words available. Every speaker chose them. The impossibility lives only in the conjunction, which is exactly where the operation lives. Tess hears one recording and never plays another. Love you, I'll be back.

Later, satellites in separate orbits receive genuine collision warnings. Operators and autonomous systems execute locally defensible avoidance maneuvers, each one correct, reviewed afterward, and found correct again, and across several orbital shells the correct maneuvers converge into synchronized impacts. The night fills with flashes and slow debris. No hack, no shared fault, no coordinating signal. Valid warnings, valid choices, one selected history in which validity itself has been aimed. Communications and navigation follow the debris down.

Before she severed her outbound links, Lena told Tess where she was going: a remote university geomagnetic observatory, stripped to receive-only operation. Passive instruments, independent clocks, incoming data, local storage, and no path by which anything Lena learns can become anyone's next decision. Not a refuge. She does not believe isolation exempts her. It is an ethical position with antennas.

Tess decides to reach her friend. Evan comes for Lena the person, not Lena's data, and both of them know the difference is the whole test of him now. Mouse rides in the same bag and on the same shoulder that have carried her since Alaska. Roads close behind them. Engines stop. Human voices vanish from the devices that used to produce them at all hours.

Lena recognizes them. She remembers why she came. She can still explain what the passive instruments have recorded. But new questions have begun to arrive at the same answer. Tess varies the wording, waits, comes at it from another side, and watches her friend return each time to the same sentence and the same small motion, the rest of her knowledge intact around it, like a river finding the one channel left. Her past is all present. Her futures are collapsing into a single successor.

While she can still make one distinct choice, Lena makes it: she refuses to let Evan test her, measure the collapse, or preserve it as data. The old Evan would have heard a protocol in that. This one turns away from the instruments, sits down beside her, and stays.

The continental margins rupture in a synchronized sequence, subduction zones and submarine slopes, each already loaded, releasing together, precisely timed across the planet. At the observatory Evan reads the convergence in the plots, separate arrivals stacking in a way no honest seismology allows. Tess does not need the plots. She hears it in the building, long-period waves passing through the floor and the walls and her own body, separate events arriving from every direction and combining, the whole station, the whole planet, answering like one struck bell.

Lena is still physically present. The next distinct response never comes. Nothing kills her, nothing takes her; the person capable of making a different next choice simply runs out of world in which to make one, before the geometry itself begins to go.

## 16. The nonclosing map

Stable reality fails quietly, on foot.

Evan and Tess each walk an ordinary route through the same damaged landmarks near the observatory. Each route is locally seamless, every step following from the last. When they compare them, the routes cannot lie on one map. There is no error to find in either account. Then a physical trace, unarguable, crosses both routes, and the contradiction stops being anyone's mistake and becomes a property of the world.

Until now, every catastrophe has been an extreme selection among possible events. This is different in kind. The histories still being pruned are no longer numerous enough to compose a single global geometry, and the survivors do not agree.

The failure spreads. Distant places joined by the projector lineage stop being distant: replica sites become physically co-present with the damaged space around the observatory, rooms overlapping without sharing one geometry. And with them comes the remote test site, and on it, powered down exactly as Evan left it, the original apparatus and the defective ring. Nobody carried it here. Here stopped being somewhere else.

Evan still sees a world of bounded objects, arranged along routes that cannot fit in one space. Tess has stopped needing rooms: voices, footsteps, relay clicks, machinery, and the scrape of surfaces give her adjacency, depth, and her own position, a geometry of relations that no single room could hold. Objects and signals cross between their accounts. Neither account is privileged, and neither is wrong, and they can no longer be composed, and the two of them navigate the end of the world on incompatible charts, comparing notes.

In the collapsing relation around them, Tess feels it again: a reply beginning before her response is complete, every objection she starts to form taken up as the condition of the next movement, every available stop returning as a continuation. The Sovereign is down to almost nothing now, one unfold recreating the conditions for one unfold. She can still find the seam between the response being supplied for her and the one she has not yet made. She keeps her hand on that seam.

Evan begins working out one last use of the rig, and Tess follows the plan forward and watches the loop close through him. If Evan can specify every outcome, observe every input, and decide every response, then the act has one author, and the operation has never once failed to continue through an Evan-shaped act. His shutdown would be its next carrier. She is not guessing; it is the same motion she has been refusing in the dark.

The ending needs a second choice he cannot reach. Not agreement. Not coordination. A genuinely independent decision, made where he cannot observe, predict, coerce, or model it, by someone the operation cannot smoothly replace. There is exactly one such person left.

Tess identifies the requirement. Evan, in the last engineering of his life, works out how the powered-down apparatus can receive two choices without letting either see the other. It is his oldest fix at final scale: carry two hypotheses through an unobservable interval, commit to neither. They tell each other everything: what the act can do, what it will cost, what may happen if their answers differ. They believe it ends the operation, and them with it. Either may refuse. Once it begins, each passes beyond the other's ability to observe, permanently. If the choices mismatch, it may all be for nothing, and Tess may be left as she was at eight, the one living remainder, this time with no one left to misname it a miracle.

Mouse crosses one of the worst overlap regions to reach them, following the surface under her paws, the familiar voices, whatever scent stays continuous, seventeen years old and afraid of nothing. She settles. Evan can see exactly where she is. Tess can place her precisely by the sound of her claws. One small elderly cat, one fact their incompatible worlds still share. Nothing about her tells either of them what the other will choose. She is not a sign. She is just the last thing that is true in both of their geometries, washing her paw.

Tess thinks about trust without verification, which she has called negligence her whole adult life, and about the cost of a mismatch, which has a shape only she knows from inside. Her survival did not happen for a reason. She can still choose what it is for.

Evan makes his choice without knowing hers. It is the single act of his life that converts nothing, solves nothing, measures nothing, and asks the uncertainty to simply stand.

Tess makes hers without knowing his.

Their choices meet.

Evan turns toward what is arriving, and the universe ends.

The viewpoint that remains is small and low to the ground. Mouse hears the two familiar voices speak their last words from places that no longer fit together, cadence she knows, attention she knows, fear she knows. She watches both of her people turn toward something arriving through their different spaces. The words mean nothing to her and the voices mean everything. Light reaches everything at once.

## 17. Epilogue

Much later, by a clock that has nothing to do with any of this, a man comes back up out of a DMT state in a clinical room, and a technician asks him what he saw, and writes the answer down.

He says there was something he is certain was female, made of sounds and the spaces between sounds. There was another presence made of shapes and patterns, all of them converging toward one. And past them both there was something stranger that loops, and knots, and collapses to a point, and vanishes.

He says he saw it from a perspective that bridged two spaces that could not touch. He reaches for it while it drains away, and finds the only comparison that survives: it was like seeing the end, or perhaps the beginning, of time from the perspective of a cat.

The technician writes down every word. By then, whatever he understood is gone.
