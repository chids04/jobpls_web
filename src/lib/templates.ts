export const HEADER_TEMPLATE = String.raw`
  #text(size: 12pt, weight: "bold")[{HEADER}]
  #line(length: 100%, stroke: 0.5pt)
  #v(0.3em)
  {CONTENT}
`;

export const SKILLS_TEMPLATE = String.raw`
#text(size: 9pt, weight: "bold")[{TITLE}] #h(0em) #text(size: 9pt)[{CONTENT}]
  `;
export const EMAIL_TEMPLATE = String.raw`
Email: #link("mailto:{EMAILTO}")[{EMAIL}]
`;

export const GITHUB_TEMPLATE = String.raw`
GitHub: #link("{GITHUB}")[{GITHUB}]
`;

export const EDU_TEMPLATE = String.raw`
#grid(
  columns: (1fr, auto),
  [*{EDU_TITLE} - {EDU_GRADE}*], [*{EDU_YEAR}*]
)
#grid(
  columns: (1fr, auto),
  [_{EDU_NAME}_], [_{EDU_LOCATION}_]
)
#text(size: 9pt, weight: "bold")[Notable Modules:]
#text(size: 9pt)[{EDU_MODULES}]
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

export const PARAGRAPH_TEMPLATE = String.raw`
  #text(size: 11pt)[{PARA}]
`;

export const TECH_TEMPLATE_1 = String.raw`
  #set page(
    paper: "a4",
    margin: (x: 1.5cm, y: 1.5cm),
  )

  #set text(
    font: "New Computer Modern",
    size: 10pt,
  )

  #set par(justify: true)

  #align(center)[
    #text(size: 14pt, weight: "bold")[{FULL_NAME}]

    {EMAIL} #h(1em) {GITHUB} #h(1em) {RESIDENCY}
  ]

  #v(0.5em)

  {ABOUT_ME}

  #v(0.3em)

  {SKILLS}

  #v(0.3em)

  {EDUCATION}

  #v(0.3em)

  {PROJECTS}

  #v(0.3em)

  {WORK}

`;

export const GENERAL_TEMPLATE_1 = String.raw`
  #set page(
    paper: "a4",
    margin: (x: 1.5cm, y: 1.5cm),
  )

  #set text(
    font: "New Computer Modern",
    size: 10pt,
  )

  #set par(justify: true)

  #align(center)[
    #text(size: 14pt, weight: "bold")[{FULL_NAME}]

    {EMAIL} #h(1em) {RESIDENCY}
  ]

  #v(0.5em)

  {ABOUT_ME}

  #v(0.3em)

  {EDUCATION}

  #v(0.3em)

  {WORK}

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
  *{FULL_NAME}*
]
#v(0.1em)
#link("mailto:{EMAIL}")[{EMAIL}]

#v(1.5em)

// Date
#text(size: 11pt)[{DATE}]

#v(1.5em)

// Recipient details
#text(size: 11pt)[
  {HIRING_MANAGER}
]

#text(size: 11pt)[
  {COMPANY_NAME}
]

#v(1.5em)

// Salutation
#text(size: 11pt)[{SALUTATION},]

#v(1em)

// paragraphs
{PARAGRAPHS}

#v(1em)

// Sign off
#text(size: 11pt)[
  Yours sincerely,\
  #v(1em)
  {FULL_NAME}
]`;
