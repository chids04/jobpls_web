export const EDU_TEMPLATE = String.raw`
#grid(
  columns: (1fr, auto),
  [*{EDU_TITLE} - {EDU_GRADE}*], [*{EDU_YEAR}*]
)
#grid(
  columns: (1fr, auto),
  [_{EDU_NAME}_], [_{EDU_LOCATION}_]
)
#text(size: 8pt, weight: "bold")[Notable Modules:]
#text(size: 8pt)[{EDU_MODULES}]
#v(0.3em);
`;

export const PROJECT_TEMPLATE = String.raw`
#text(size:10pt, weight: "bold")[{P_N}] | {P_TECH} - #link("{P_URL}")[{P_URL}]
#v(0.1em)
- {P_B1}
#v(0.05em)
- {P_B2}
#v(0.3em)
`;

export const EXPERIENCE_TEMPLATE = String.raw`
#grid(
  columns: (1fr, auto),
  [*{J_T} | {J_C}*], [*{J_D}*]
)

#v(0.1em)
- {J_B1}
#v(0.1em)
- {J_B2}
#v(0.3em)
`;

export const TECH_TEMPLATE_1 = String.raw`
// CV Template - Typst Skeleton

#set page(
  paper: "a4",
  margin: (x: 1.5cm, y: 1.5cm),
)

#set text(
  font: "New Computer Modern",
  size: 10pt,
)

#set par(justify: true)

// Header with name and contact info
#align(center)[
  #text(size: 14pt, weight: "bold")[{FULL_NAME}]

  #text(size: 10pt)[
    Email: #link("mailto:{EMAIL}")[{EMAIL}] #h(1em) GitHub: #link("{GITHUB}")[{GITHUB}] #h(1em) {RESIDENCY}
  ]
]

#v(0.5em)

// Professional Summary Section
#text(size: 12pt, weight: "bold")[ABOUT ME]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

#text(size: 10pt)[{ABOUT_ME}]


#v(0.5em)

// Technical Skills Section
#text(size: 12pt, weight: "bold")[TECHNICAL SKILLS]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

#text(size: 10pt, weight: "bold")[{LANGUAGES}]

#v(0.5em)

// Education Section
#text(size: 12pt, weight: "bold")[EDUCATION]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

//{EDU_SECTION}

// Projects Section
#text(size: 12pt, weight: "bold")[PROJECTS]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

//{PROJ_SECTION}

// Work Experience Section
#text(size: 12pt, weight: "bold")[WORK EXPERIENCE]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

//{WORK_SECTION}
`;

export const GENERAL_TEMPLATE_1 = String.raw`
// General Employment CV Template - Typst
#set page(
  paper: "a4",
  margin: (x: 2cm, y: 2cm),
)
#set text(
  font: "New Computer Modern",
  size: 11pt,
)
#set par(justify: true)

// Header with name and contact info
#align(center)[
  #text(size: 16pt, weight: "bold")[Chidubem Osuala]
  #v(0.3em)
  #text(size: 11pt)[
    Email: #link("mailto:chidubemosuala@yahoo.com")[chidubemosuala\@yahoo.com] #h(2em) British Citizen
  ]
]

#v(0.4em)

// Professional Summary Section
#text(size: 12pt, weight: "bold")[PROFESSIONAL SUMMARY]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)
#text(size: 11pt)[{SUMMARY}]

#v(0.4em)

// Skills Section
#text(size: 12pt, weight: "bold")[SKILLS]
#line(length: 100%, stroke: 0.5pt)
#v(0.15em)
#text(size: 11pt)[{SKILLS}]

#v(0.4em)

// Work Experience Section
#text(size: 12pt, weight: "bold")[WORK EXPERIENCE]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

//{WORK_SECTION}

#v(0.4em)

// Education Section
#text(size: 12pt, weight: "bold")[EDUCATION]
#line(length: 100%, stroke: 0.5pt)
#v(0.3em)

//{EDU_SECTION}

#v(0.4em)

// References Section
#text(size: 12pt, weight: "bold")[REFERENCES]
#line(length: 100%, stroke: 0.5pt)
#v(0.25em)

#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  [
    *Richard Mitchell* #v(0.8em, weak: true) Academic Tutor at University\
    r.j.mitchell\@reading.ac.uk
  ],
  [
    *Jonathan Yates* #v(0.8em, weak: true)Supervisor \@ Iron Mountain\
    jonathan.yates\@ironmountain.com
  ]
)
`;

export const COVER_PARA = String.raw`
#text(size: 11pt)[{PARA}]
`;

export const COVER_TEMPLATE = String.raw`
// Cover Letter Template - Typst
#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
)
#set text(
  font: "New Computer Modern",
  size: 11pt,
)
#set par(
  justify: true,
  leading: 0.65em,
)

// Your details (top left)
#text(size: 11pt)[
  *{FULL_NAME}*\
  {E_MAIL}
]

#v(1.5em)

// Date
#text(size: 11pt)[{DATE}]

#v(1.5em)

// Recipient details
#text(size: 11pt)[
  {HIRING_MANAGER}\
  {COMPANY_NAME}\
]

#v(1.5em)

// Salutation
#text(size: 11pt)[Dear {SALUTATION},]

#v(1em)

// paragraphs
{PARAGRAPHS}

#v(1em)

// Sign off
#text(size: 11pt)[
  Yours sincerely,\
  #v(1em)
  {FULL_NAME}
]
;
`;
