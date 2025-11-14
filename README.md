# Catalog Scoring & Suggestions API

Live Demo: https://incision-assesment.boz.black/docs  
Architecture: https://excalidraw.com/#json=P_SBj9kr_-jkYNU7R4Uvs,LLlIpW2dcf-sli1WL3utvQ

### Deploy:
Prerequisits:
```sh
npm install -g aws-cdk
```

Once CDK is installed:
```sh
npm run deploy
```

### Insomnia Collection

Insomnia collection available in `./insomnia_collection.yaml`

### API Reference:

The API provides catalog item management with AI-powered suggestions for improving item titles and descriptions. All endpoints are available at the base URL with `/prod` prefix.

**Base URL:** `https://incision-assesment.boz.black`

**Interactive Documentation:** [Swagger UI](https://incision-assesment.boz.black/docs)

---

#### Endpoints

##### 1. Create Catalog Item
**POST** `/items`

Creates a new catalog item with automatic quality scoring. Items with a quality score > 69 are set to `PENDING` status, otherwise `REJECTED`.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "catagory": "string (optional)",
  "tags": ["string (optional)"]
}
```

**Response:**
```json
{
  "id": "string",
  "status": "PENDING | REJECTED",
  "title": "string",
  "description": "string",
  "catagory": "string",
  "tags": ["string"],
  "quality_score": "number",
  "created_by": "string",
  "created_at": "number"
}
```

**Quality Score Calculation:**
- Base score: 40 points
- +20 if title length is between 12-50 characters
- +15 if description length is 60+ characters
- +10 if item has tags
- +10 if item has more than 3 tags
- +10 if item has a category
- +5 if title is unique

---

##### 2. Get Items by Status
**GET** `/items?status={status}`

Retrieves all catalog items filtered by status.

**Query Parameters:**
- `status` (required): One of `APPROVED`, `PENDING`, or `REJECTED`

**Response:**
```json
[
  {
    "id": "string",
    "status": "APPROVED | PENDING | REJECTED",
    "title": "string",
    "description": "string",
    "catagory": "string",
    "tags": ["string"],
    "quality_score": "number",
    "created_by": "string",
    "approved_by": "string",
    "created_at": "number",
    "updated_at": "number"
  }
]
```

**Example:**
```bash
curl "https://incision-assesment.boz.black/items?status=PENDING"
```

---

##### 3. Update Item Status
**PATCH** `/items/:id`

Updates the status of a catalog item (e.g., approve or reject pending items).

**Path Parameters:**
- `id` (required): The item ID

**Request Body:**
```json
{
  "id": "string",
  "status": "APPROVED | PENDING | REJECTED"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "APPROVED | PENDING | REJECTED",
  "approved_by": "string",
  "updated_at": "number"
}
```

**Example:**
```bash
curl -X PATCH \
  "https://incision-assesment.boz.black/items/abc123" \
  -H "Content-Type: application/json" \
  -d '{"id": "abc123", "status": "APPROVED"}'
```

---

##### 4. Get AI-Powered Suggestions
**GET** `/suggestions?title={title}&description={description}`

Generates improved title and description suggestions using AWS Bedrock AI (Amazon Nova Micro model). Returns 5 suggestions each for titles and descriptions optimized for the quality scoring system.

**Query Parameters:**
- `title` (required): The current title
- `description` (required): The current description

**Response:**
```json
{
  "titles": [
    "Improved Title Suggestion 1",
    "Improved Title Suggestion 2",
    "Improved Title Suggestion 3",
    "Improved Title Suggestion 4",
    "Improved Title Suggestion 5"
  ],
  "descriptions": [
    "Improved Description Suggestion 1",
    "Improved Description Suggestion 2",
    "Improved Description Suggestion 3",
    "Improved Description Suggestion 4",
    "Improved Description Suggestion 5"
  ]
}
```

**Example:**
```bash
curl "https://incision-assesment.boz.black/suggestions?title=Old%20Title&description=Short%20desc"
```

---

#### Status Values

- `PENDING`: Item is awaiting approval (quality score > 69)
- `APPROVED`: Item has been approved by a moderator
- `REJECTED`: Item was rejected due to low quality score or manual rejection

---

#### Notes

- All timestamps are in Unix epoch format (milliseconds)
- Authentication is currently not enforced (placeholder implementation)
