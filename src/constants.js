export const COLORS = {
  accent: "#1D9E75",
  accentLight: "#E1F5EE",
  accentDark: "#0F6E56",
  amber: "#BA7517",
  amberLight: "#FAEEDA",
  red: "#A32D2D",
  redLight: "#FCEBEB",
  blue: "#185FA5",
  blueLight: "#E6F1FB",
  purple: "#534AB7",
  purpleLight: "#EEEDFE",
};

export const STATUS_META = {
  Pending:     { bg: "#FAEEDA", color: "#633806", border: "#FAC775" },
  "In Review": { bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  Resolved:    { bg: "#EAF3DE", color: "#27500A", border: "#97C459" },
  Rejected:    { bg: "#FCEBEB", color: "#791F1F", border: "#F09595" },
};

export const MOCK_FAQS = [
  { id: 1, question: "What is Samagama?", category: "General", answer: "Samagama is the internal portal used for managing intern activities, projects, and communications during the internship period." },
  { id: 2, question: "What is the full form of VINS?", category: "General", answer: "VINS stands for Virtual INternship System — the platform powering your internship workflow." },
  { id: 3, question: "What are SP Points?", category: "Engagement", answer: "SP Points (Session Points) are a measure of your engagement in Zoom sessions and activities. They influence the ranking of your replies on the platform." },
  { id: 4, question: "What is meant by a Zoom Call?", category: "Meetings", answer: "Zoom calls are scheduled virtual meetings for interns to discuss project progress, doubts, and updates with the team." },
  { id: 5, question: "How do I raise an issue?", category: "Platform", answer: "Click the + button at the bottom-right corner of the FAQ page to raise a new query. It will appear in the Resolve Queries page for others to answer." },
  { id: 6, question: "What is a confirmed reference?", category: "Platform", answer: "When you reply to a query with an uploaded reference file and the original poster confirms it as helpful, that reply is marked as a confirmed reference and gets pinned to the top." },
];

export const MOCK_QUERIES = [
  {
    id: 1, title: "How to connect to the company VPN from Linux?", tag: "Infrastructure",
    status: "In Review", upvotes: 14, downvotes: 1, authorId: "OP_Ravi", createdAt: "2 hours ago",
    replies: [
      { id: 1, authorId: "Priya_S", experience: 45, spPoints: 120, upvotes: 23, createdAt: "1 hour ago", hasReference: true, body: "Install the Cisco AnyConnect package and use the credentials sent to your email. Reference doc attached.", confirmed: false },
      { id: 2, authorId: "Arjun_K", experience: 20, spPoints: 80, upvotes: 5, createdAt: "45 mins ago", hasReference: false, body: "You can also try OpenVPN — works better on Ubuntu 22+.", confirmed: false },
      { id: 3, authorId: "Nandini_T", experience: 60, spPoints: 200, upvotes: 11, createdAt: "30 mins ago", hasReference: false, body: "Use the official portal link from the welcome email. IT support can help if it fails.", confirmed: false },
    ],
  },
  {
    id: 2, title: "Is there a codebase style guide we need to follow?", tag: "Development",
    status: "Pending", upvotes: 9, downvotes: 0, authorId: "OP_Meera", createdAt: "5 hours ago",
    replies: [],
  },
  {
    id: 3, title: "What are the working hours during the internship?", tag: "General",
    status: "Resolved", upvotes: 31, downvotes: 2, authorId: "OP_Kiran", createdAt: "1 day ago",
    replies: [
      { id: 1, authorId: "Admin_Team", experience: 365, spPoints: 999, upvotes: 45, createdAt: "23 hours ago", hasReference: false, body: "Standard working hours are 9 AM – 6 PM IST, Monday to Friday. Flexibility is allowed but attendance in Zoom calls is mandatory.", confirmed: true },
    ],
  },
  {
    id: 4, title: "How are SP points calculated each week?", tag: "Engagement",
    status: "Pending", upvotes: 6, downvotes: 0, authorId: "OP_Divya", createdAt: "3 hours ago",
    replies: [],
  },
];

export const MOCK_USER = {
  name: "Arjun Kumar",
  initials: "AK",
  joinDate: "March 2025",
  spPoints: 185,
  queriesRaised: 3,
  repliesGiven: 12,
  confirmedReplies: 2,
  activity: [
    { type: "reply",   text: "Replied to 'How to connect VPN from Linux?'",      time: "45 mins ago" },
    { type: "upvote",  text: "Upvoted Priya_S's reply",                           time: "2 hours ago" },
    { type: "query",   text: "Raised 'What is the onboarding timeline?'",         time: "Yesterday" },
    { type: "confirm", text: "Confirmed reference on 'Zoom best practices' query",time: "2 days ago" },
    { type: "reply",   text: "Replied to 'Is there a code style guide?'",         time: "3 days ago" },
  ],
  pendingQueries: [
    { title: "What is the onboarding timeline?", status: "In Review" },
    { title: "How to access the internal wiki?",  status: "Pending"  },
  ],
};

/** Sorting algorithm: Score = Ct(-1) + Cexp*0.5 + Csp*3 + Cuv*5 */
export function scoreReply(reply) {
  const t   = parseFloat(reply.createdAt) || 1;
  const exp = reply.experience;
  const sp  = reply.spPoints;
  const uv  = reply.upvotes;
  return (t * -1) + (exp * 0.5) + (sp * 3) + (uv * 5);
}