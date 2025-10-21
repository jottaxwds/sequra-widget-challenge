const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const creditAgreement = require("./credit_agreement_calculator");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(Buffer.from('<body style="margin:0"><div style="font-family:Arial;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100vw;height:100vh;"><div style="display:flex;margin-left:auto;margin-right:auto;flex-direction:column;justify-content:center;width:100%;"><div style="display:flex;text-align:center;flex-direction:column;"><svg style="width:auto;height:3rem;" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 100 100"><path id="Q" data-name="Q logo" d="M1068.051,59.713a27.394,27.394,0,0,1-6.979,12.913,22.083,22.083,0,0,0,7.071,1.165,1.634,1.634,0,0,1,1.673,1.592V80.21a1.634,1.634,0,0,1-1.673,1.592c-11.9.023-22.639-6.768-27.222-17.211a26.624,26.624,0,0,1-2.232-10.674,1.634,1.634,0,0,1,1.674-1.592h5.1a1.634,1.634,0,0,1,1.672,1.593,19.357,19.357,0,0,0,6.153,14.052c.071.067.147.131.223.2s.122.1.182.159a19.242,19.242,0,0,0,6.145-18.231,20.123,20.123,0,0,0-12.922-14.678,21.622,21.622,0,0,0-25.712,8.314,19.136,19.136,0,0,0,4.452,25.345,21.749,21.749,0,0,0,13.587,4.712,1.271,1.271,0,0,1,1.3,1.238v5.537a1.208,1.208,0,0,1-.381.876,1.336,1.336,0,0,1-.921.362c-14.376.026-26.666-9.833-29.067-23.314-2.36-13.482,5.914-26.6,19.53-30.966,13.621-4.395,28.591,1.168,35.471,13.182a26.572,26.572,0,0,1,2.875,19.011Z" transform="translate(-990 -5)" fill="#00c2a3"></path></svg><h1 style="margin:10px 0;font-size:1.5rem;line-height:2rem;font-weight:600;letter-spacing:-0.025em;">SeQura Mocked API</h1><p style="margin:0;color:#9CA3AF;font-size:0.875rem;line-height:1.25rem;">version 1.0.1</p></div></div></div></body>'));
});

app.get("/credit_agreements", (req, res) => {
  const totalWithTax = parseInt(req.query.totalWithTax, 10);
  if (isNaN(totalWithTax)) {
    res.status(400).json({ error: "'totalWithTax' is not numeric" });
  } else {
    res.status(200).json(creditAgreement.calculate(totalWithTax));
  }
});

app.post("/events", (req, res) => {
  if (Math.random() >= 0.1) {
    console.log(`\n✨ \x1b[32mEvent received\x1b[0m!\n`, req.body);
    res.status(200).send();
  } else {
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () =>
  console.log(`🚀 \x1b[32mReady\x1b[0m - seQura Mocked API started at http://localhost:${port}`)
);
