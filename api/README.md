# SeQura Mocked API

SeQura mocked API is a simple `express` server that acts as some of seQura APIs.

Contents:
- [SeQura Mocked API](#sequra-mocked-api)
  - [Starting the server](#starting-the-server)
  - [Credit Agreements API](#credit-agreements-api)
    - [Credit Agreements Request](#credit-agreements-request)
    - [Credit Agreements Response](#credit-agreements-response)
  - [Events API](#events-api)
    - [Events Request](#events-request)
    - [Events Body](#events-body)
    - [Events Response](#events-response)

## Starting the server
Install the dependencies:
```bash
cd api
npm install
```
Run the server:
```bash
npm start
```
_API server should be running on http://localhost:8080._


## Credit Agreements API

- The credit agreement API allows a merchant to get SeQura's credit conditions with a single request.
- SeQura's credit conditions depend on order value, currency, and merchant.

### Credit Agreements Request

`GET <base>/credit_agreements`

```bash
$ curl -i http://localhost:8080/credit_agreements?totalWithTax=15000
```

**Parameters**
| Name | Value | Notes |
| ---- | ----- | ----- |
| totalWithTax | 15000 | Sample. Total value of the items (in EUR cents).|

### Credit Agreements Response

The response is a list of the requested financing products as keys and corresponding credit agreements as values. (the example has been reformatted for easier reading)

Each credit agreement contains fields specific to the financing product. Many of them include a numerical value together with a formatted string, which is ready to show.

```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
...

[
    {
      "instalment_count":        3,
      "apr":                     { "value":  10408, "string":   "104,08 %" },
      "total_with_tax":          { "value":  15000, "string":   "150,00 €" },
      "cost_of_credit":          { "value":    900, "string":     "9,00 €" },
      "cost_of_credit_pct":      { "value":    600, "string":     "6,00 %" },
      "grand_total":             { "value":  15900, "string":   "159,00 €" },
      "max_financed_amount":     { "value": 200000, "string": "2.000,00 €" },
      "instalment_amount":       { "value":   5000, "string":    "50,00 €" },
      "instalment_fee":          { "value":    300, "string":     "3,00 €" },
      "instalment_total":        { "value":   5300, "string":    "53,00 €" },
    },
    {
      "instalment_count":        6,
      ... //analgous details as above, but for 6 months credits
    },
    {
      "instalment_count":        12,
      ... //analgous details as above, but for 12 months credits
    }
  ]
```

## Events API

The events API allows seQura to store different user interactions during the purchase for further analysis.

### Events Request
`POST <base>/events`

```bash
$ curl -d '{"context":"checkoutWidget", "type":"simulatorInstalmentChanged", "selectedInstalment": 12}' -H "Content-Type: application/json" -X POST http://localhost:8080/events
```

### Events Body

Events API expects a `JSON` object describing the event that wants to be stored. The only requirements for this object are a `contenxt` and `type` keys with `string` values. The object can also include any extra information to help future analysis.

### Events Response

The status code for a successful response is `200` with an empty `body`, anything else should be treated as an error.
