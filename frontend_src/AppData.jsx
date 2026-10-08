// AccessPath — Shared application data

const ALL_LECTURES = [
  { id: "lec1", name: "Lecture 1 — Introduction to Dynamics",    total: 12, approved: 12, flagged: 0 },
  { id: "lec2", name: "Lecture 2 — Kinematics of Particles",     total: 18, approved: 15, flagged: 0 },
  { id: "lec3", name: "Lecture 3 — Newton's Laws",               total: 6,  approved: 5,  flagged: 1 },
  { id: "lec4", name: "Lecture 4 — Work & Energy",               total: 8,  approved: 2,  flagged: 1 },
  { id: "lec5", name: "Lecture 5 — Impulse & Momentum",          total: 4,  approved: 0,  flagged: 0 },
  { id: "ps3",  name: "Problem Set 3",                            total: 3,  approved: 1,  flagged: 1 },
];

const ALL_NODES = [
  // Lecture 4 — Work & Energy
  {
    id: "n001", lectureId: "lec4", title: "Figure 1: Particle on Incline", type: "Figure",
    stage: "approved", confidence: 94, assignee: "ta@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 26",
    flagReason: null,
    aiOutput: "A free body diagram of a rectangular block resting on an inclined surface at angle θ. Three force vectors are shown: normal force N perpendicular to the surface, weight W pointing straight downward, and friction force f parallel to the surface pointing up the incline.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 94% confidence", at: "Apr 26, 9:02 AM" },
      { by: "ta@example.com", label: "Edited", note: "Added θ angle description", at: "Apr 26, 11:15 AM" },
      { by: "prof@example.com", label: "Approved", note: "Looks good", at: "Apr 26, 2:30 PM" },
    ],
    comments: [
      { author: "ta@example.com", text: "I added a mention of the theta angle since it wasn't in the original AI output.", at: "Apr 26, 11:15 AM" },
      { author: "prof@example.com", text: "Good catch. Approved.", at: "Apr 26, 2:30 PM" },
    ],
    approvalChain: [
      { role: "TA", email: "ta@example.com", action: "Reviewed", at: "Apr 26, 11:15 AM" },
      { role: "Instructor", email: "prof@example.com", action: "Approved", at: "Apr 26, 2:30 PM" },
    ],
  },
  {
    id: "n002", lectureId: "lec4", title: "Equation 1: Work-Energy Theorem", type: "Equation",
    stage: "approved", confidence: 99, assignee: "ta@example.com", model: "gpt-4o", updatedAt: "Apr 26",
    flagReason: null,
    aiOutput: "Mathematical equation: The net work done on a particle equals the change in its kinetic energy. Written as W-net equals one-half m v-squared minus one-half m v-naught-squared, where m is mass, v is final speed, and v-naught is initial speed.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 99% confidence", at: "Apr 26, 9:02 AM" },
      { by: "ta@example.com", label: "Approved", note: "No changes needed", at: "Apr 26, 10:50 AM" },
    ],
    comments: [],
    approvalChain: [
      { role: "TA", email: "ta@example.com", action: "Approved", at: "Apr 26, 10:50 AM" },
    ],
  },
  {
    id: "n003", lectureId: "lec4", title: "Figure 2: Spring-Mass System", type: "Figure",
    stage: "in-review", confidence: 87, assignee: "ta@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "A spring-mass system diagram showing a horizontal spring attached to a fixed wall on the left and a block of mass m on the right. The spring has natural length L-naught. A displacement x is shown from the equilibrium position.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 87% confidence", at: "Apr 27, 8:14 AM" },
    ],
    comments: [
      { author: "ta@example.com", text: "Assigned to me. Will review shortly — need to double-check the spring constant notation.", at: "Apr 27, 9:00 AM" },
    ],
    approvalChain: [],
  },
  {
    id: "n004", lectureId: "lec4", title: "Equation 2: Elastic Potential Energy", type: "Equation",
    stage: "in-review", confidence: 99, assignee: "ta@example.com", model: "gpt-4o", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "Mathematical equation: Elastic potential energy V-e equals one-half times spring constant k times displacement x squared. This represents the energy stored in a linearly elastic spring deformed by distance x from its natural length.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 99% confidence", at: "Apr 27, 8:14 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n005", lectureId: "lec4", title: "Figure 3: Pulley System", type: "Figure",
    stage: "flagged", confidence: 41, assignee: "ta@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 27",
    flagReason: "Alt text is too vague — 'a pulley' does not describe the geometry, rope routing, or mass positions.",
    aiOutput: "A pulley.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 41% confidence", at: "Apr 27, 8:14 AM" },
      { by: "ta@example.com", label: "Flagged", note: "Output too vague, needs rewrite", at: "Apr 27, 9:45 AM" },
    ],
    comments: [
      { author: "ta@example.com", text: "Flagging this — AI confidence was already low at 41%. The output is completely insufficient. Needs full regeneration or manual write.", at: "Apr 27, 9:45 AM" },
      { author: "prof@example.com", text: "Agreed. Please regenerate and if confidence is still low, write it manually. This figure is complex.", at: "Apr 27, 10:10 AM" },
    ],
    approvalChain: [],
  },
  {
    id: "n006", lectureId: "lec4", title: "Video 1: Energy Conservation Demo", type: "Video",
    stage: "in-review", confidence: 88, assignee: "prof@example.com", model: "whisper-v3", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "Video caption transcript: [00:00] Professor places a ball at the top of a ramp. [00:04] The ball rolls down, demonstrating conversion of potential to kinetic energy. [00:09] At the bottom, the ball's speed is measured using a photogate. [00:14] Results confirm the work-energy theorem within 2% error.",
    editHistory: [
      { by: "ai", label: "Captions Generated", note: "whisper-v3 · 88% confidence", at: "Apr 27, 8:20 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n007", lectureId: "lec4", title: "Problem 1: Cart on Ramp", type: "Problem",
    stage: "ai-generated", confidence: 91, assignee: null, model: "gpt-4o", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "Problem statement with accessible markup: A cart of mass 2.5 kilograms starts from rest at the top of a frictionless ramp inclined at 30 degrees to the horizontal. The ramp is 4 meters long. Find: (a) the speed of the cart at the bottom, (b) the time taken to travel the full length.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 91% confidence", at: "Apr 27, 8:14 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n008", lectureId: "lec4", title: "Table 1: Spring Constants", type: "Figure",
    stage: "ai-generated", confidence: 76, assignee: null, model: "claude-3-5-sonnet", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "Table with three columns: Material, Spring Constant k (N/m), and Application. Row 1: Steel coil spring, 500–5000 N/m, automotive suspensions. Row 2: Rubber band, 10–50 N/m, everyday use. Row 3: Bone, 1000–5000 N/m, biomechanics.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 76% confidence", at: "Apr 27, 8:14 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  // Lecture 3 — Newton's Laws
  {
    id: "n009", lectureId: "lec3", title: "Figure 1: Force Diagram", type: "Figure",
    stage: "approved", confidence: 96, assignee: "ta@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 22",
    flagReason: null,
    aiOutput: "A force diagram showing three concurrent forces acting on a point. Force F1 points upward at 60 degrees from horizontal. Force F2 points horizontally to the right. Force F3 points downward-left at 45 degrees below horizontal.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 96% confidence", at: "Apr 22, 9:00 AM" },
      { by: "ta@example.com", label: "Approved", note: "", at: "Apr 22, 3:00 PM" },
    ],
    comments: [],
    approvalChain: [{ role: "TA", email: "ta@example.com", action: "Approved", at: "Apr 22, 3:00 PM" }],
  },
  {
    id: "n010", lectureId: "lec3", title: "Equation 1: Newton's Second Law", type: "Equation",
    stage: "approved", confidence: 99, assignee: "ta@example.com", model: "gpt-4o", updatedAt: "Apr 22",
    flagReason: null,
    aiOutput: "Mathematical equation: The sum of all external forces on a body equals mass times acceleration. Written as sigma-F equals m times a, where sigma-F is the vector sum of all applied forces, m is mass in kilograms, and a is acceleration in metres per second squared.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 99% confidence", at: "Apr 22, 9:00 AM" },
      { by: "ta@example.com", label: "Approved", note: "", at: "Apr 22, 3:05 PM" },
    ],
    comments: [],
    approvalChain: [{ role: "TA", email: "ta@example.com", action: "Approved", at: "Apr 22, 3:05 PM" }],
  },
  {
    id: "n011", lectureId: "lec3", title: "Figure 2: Newton's Third Law", type: "Figure",
    stage: "approved", confidence: 93, assignee: "ta@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 23",
    flagReason: null,
    aiOutput: "Diagram illustrating Newton's Third Law: two objects, a hand and a wall, with equal and opposite arrows between them. The arrow from hand to wall labeled F (action), and the arrow from wall to hand labeled negative-F (reaction), both equal in magnitude.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 93% confidence", at: "Apr 23, 8:00 AM" },
      { by: "ta@example.com", label: "Approved", note: "", at: "Apr 23, 11:00 AM" },
    ],
    comments: [],
    approvalChain: [{ role: "TA", email: "ta@example.com", action: "Approved", at: "Apr 23, 11:00 AM" }],
  },
  {
    id: "n012", lectureId: "lec3", title: "Video 1: Ball Drop Demo", type: "Video",
    stage: "approved", confidence: 90, assignee: "prof@example.com", model: "whisper-v3", updatedAt: "Apr 23",
    flagReason: null,
    aiOutput: "[00:00] A tennis ball and a bowling ball are held at the same height. [00:03] Both are released simultaneously. [00:05] Both balls hit the ground at the same moment, demonstrating that gravitational acceleration is independent of mass.",
    editHistory: [
      { by: "ai", label: "Captions Generated", note: "whisper-v3 · 90% confidence", at: "Apr 23, 8:00 AM" },
      { by: "prof@example.com", label: "Approved", note: "", at: "Apr 23, 1:00 PM" },
    ],
    comments: [],
    approvalChain: [{ role: "Instructor", email: "prof@example.com", action: "Approved", at: "Apr 23, 1:00 PM" }],
  },
  {
    id: "n013", lectureId: "lec3", title: "Problem 1: Elevator Problem", type: "Problem",
    stage: "flagged", confidence: 62, assignee: "ta@example.com", model: "gpt-4o", updatedAt: "Apr 24",
    flagReason: "Mathematical notation rendered incorrectly — screen reader will misread 'N_apparent' as a variable N with subscript.",
    aiOutput: "A person of mass 70 kg stands on a scale in an elevator. N_apparent = m(g + a). Find the scale reading when the elevator accelerates upward at 2 m/s².",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 62% confidence", at: "Apr 24, 9:00 AM" },
      { by: "ta@example.com", label: "Flagged", note: "Notation issue", at: "Apr 24, 2:00 PM" },
    ],
    comments: [
      { author: "ta@example.com", text: "The variable N_apparent uses underscore notation which won't be read correctly by screen readers. Needs to be written out as 'N-apparent' or 'apparent normal force'.", at: "Apr 24, 2:00 PM" },
    ],
    approvalChain: [],
  },
  {
    id: "n014", lectureId: "lec3", title: "Text: Concept of Inertia", type: "Text",
    stage: "approved", confidence: 100, assignee: "prof@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 22",
    flagReason: null,
    aiOutput: "Inertia is the tendency of an object to resist any change in its state of motion. An object at rest tends to stay at rest, and an object in motion tends to stay in motion at constant velocity, unless acted upon by a net external force.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 100% confidence", at: "Apr 22, 9:00 AM" },
      { by: "prof@example.com", label: "Approved", note: "", at: "Apr 22, 9:30 AM" },
    ],
    comments: [],
    approvalChain: [{ role: "Instructor", email: "prof@example.com", action: "Approved", at: "Apr 22, 9:30 AM" }],
  },
  // Lecture 5 — Impulse & Momentum (freshly ingested)
  {
    id: "n015", lectureId: "lec5", title: "Figure 1: Impulse-Momentum Diagram", type: "Figure",
    stage: "ai-generated", confidence: 89, assignee: null, model: "claude-3-5-sonnet", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "A graph showing force versus time. The area under the curve, shaded in blue, represents the impulse J. The x-axis shows time in seconds from t1 to t2, and the y-axis shows force in Newtons.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 89% confidence", at: "Apr 27, 7:50 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n016", lectureId: "lec5", title: "Equation 1: Impulse-Momentum Theorem", type: "Equation",
    stage: "ai-generated", confidence: 99, assignee: null, model: "gpt-4o", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "Mathematical equation: Impulse J equals the change in linear momentum. Written as J equals m times v-final minus m times v-initial, equivalently as J equals delta-p, where p represents linear momentum in kilogram-metres per second.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 99% confidence", at: "Apr 27, 7:50 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n017", lectureId: "lec5", title: "Equation 2: Conservation of Momentum", type: "Equation",
    stage: "ai-generated", confidence: 98, assignee: null, model: "gpt-4o", updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: "Mathematical equation: In a closed system with no external forces, total linear momentum is conserved. Written as m1 times v1 plus m2 times v2 equals m1 times v1-prime plus m2 times v2-prime, where primes denote post-collision velocities.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 98% confidence", at: "Apr 27, 7:50 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n018", lectureId: "lec5", title: "Video 1: Collision Demo", type: "Video",
    stage: "ingested", confidence: null, assignee: null, model: null, updatedAt: "Apr 27",
    flagReason: null,
    aiOutput: null,
    editHistory: [
      { by: "system", label: "Ingested", note: "Detected from Lecture5.mp4 · Queued for AI processing", at: "Apr 27, 7:50 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  // Problem Set 3
  {
    id: "n019", lectureId: "ps3", title: "Problem 1: Spring Energy", type: "Problem",
    stage: "approved", confidence: 94, assignee: "ta@example.com", model: "gpt-4o", updatedAt: "Apr 25",
    flagReason: null,
    aiOutput: "A spring with constant k equals 200 N/m is compressed 0.15 metres from its natural length. Find the elastic potential energy stored. Solution: V-e equals one-half times 200 times 0.15 squared, which equals 2.25 joules.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 94% confidence", at: "Apr 25, 10:00 AM" },
      { by: "ta@example.com", label: "Approved", note: "", at: "Apr 25, 2:00 PM" },
    ],
    comments: [],
    approvalChain: [{ role: "TA", email: "ta@example.com", action: "Approved", at: "Apr 25, 2:00 PM" }],
  },
  {
    id: "n020", lectureId: "ps3", title: "Problem 2: Momentum Conservation", type: "Problem",
    stage: "in-review", confidence: 88, assignee: "ta@example.com", model: "gpt-4o", updatedAt: "Apr 26",
    flagReason: null,
    aiOutput: "Two carts on a frictionless track collide and stick together (perfectly inelastic). Cart 1 has mass 1.2 kg moving at 3.0 m/s to the right. Cart 2 has mass 0.8 kg at rest. Find the velocity of the combined system after collision.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "gpt-4o · 88% confidence", at: "Apr 26, 8:00 AM" },
    ],
    comments: [],
    approvalChain: [],
  },
  {
    id: "n021", lectureId: "ps3", title: "Figure 1: Problem Setup Diagram", type: "Figure",
    stage: "flagged", confidence: 55, assignee: "ta@example.com", model: "claude-3-5-sonnet", updatedAt: "Apr 26",
    flagReason: "Figure description missing coordinate system labels and direction conventions.",
    aiOutput: "Two carts on a track. One is moving.",
    editHistory: [
      { by: "ai", label: "AI Generated", note: "claude-3-5-sonnet · 55% confidence", at: "Apr 26, 8:00 AM" },
      { by: "ta@example.com", label: "Flagged", note: "Missing coordinate labels", at: "Apr 26, 9:30 AM" },
    ],
    comments: [
      { author: "ta@example.com", text: "This is way too sparse. The diagram shows a coordinate axis, direction arrows, and labels. None of that is in the alt text.", at: "Apr 26, 9:30 AM" },
    ],
    approvalChain: [],
  },
];

Object.assign(window, { ALL_LECTURES, ALL_NODES });
