<div align="center">
<img width="46" height="42" alt="image" src="https://github.com/user-attachments/assets/8d9dea41-acf5-4ba1-9a5f-c73ee46870bf" />
</div>
<h1 align="center">jobpls</h1>

<p align="center">a web app to generate resumes and cover letters and personalise them for the role you are applying for</p>
<p align="center">www.jobpls.lol</p>


<h2>how it works</h2>

- create (or import from a pdf/docx) templates of your cv

- select a pdf template that you would like the generated CV to have
  
- add a job description
  
- a resume and a cover letter will be made that perfectly fits the job at hand

no copy-pasteing the LLM response into your cv for every job, instead your full document(s) are generated in one go, in ~10 seconds

<h3>cool features</h3>

- completely free, all you need is a Gemini API key which has a very generous free tier
  
- documents are compiled into PDFs directly in browser using the [typst.ts](https://github.com/Myriad-Dreamin/typst.ts) wasm package

- create multiple different templates so you can switch depending on the type of job you are going for (templates for tech roles, retail roles, warehouse roles etc)

- all data is saved and processed on the client, with the only requests being made is to the LLM for personalising documents or importing templates form files

<h3>how to run</h3>
  
```bash
npm install
npm run start
```


<h3>how to build</h3>

```bash
npm run build
```

<h3>contributing</h3>

feel free to submit any pull requests that you would like to make. some tests need to be written and the design of the site could do with some work.
