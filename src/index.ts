import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

type LeadStatus =
  | "New"
  | "Engaged"
  | "Proposal Sent"
  | "Closed-Won"
  | "Closed-Lost";

interface Lead {
  name: string;
  email: string;
  status: LeadStatus;
  createdAt: string;
}

interface CreateLeadDTO {
  name: string;
  email: string;
  status: LeadStatus;
}

const VALID_STATUS: LeadStatus[] = [
  "New",
  "Engaged",
  "Proposal Sent",
  "Closed-Won",
  "Closed-Lost",
];

// Initial data (Will reset every time the serverless function restarts)
const leads: Lead[] = [
  {
    name: "John Doe",
    email: "john@example.com",
    status: "New",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

app.get("/", (_req: Request, res: Response) => {
  res
    .type("html")
    .send(
      `<h1>Lead Manager API 🚀</h1><p>Use <code>/leads</code> endpoint.</p>`,
    );
});

app.get("/leads", (_req: Request, res: Response) => {
  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json(sortedLeads);
});

// Fixed POST route syntax
app.post("/leads", (req: Request<{}, {}, CreateLeadDTO>, res: Response) => {
  const { name, email, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const existing = leads.find((l) => l.email === email);
  if (existing) {
    return res.status(400).json({ error: "Email must be unique" });
  }

  const newLead: Lead = {
    name,
    email,
    status,
    createdAt: new Date().toISOString(),
  };

  leads.push(newLead);
  return res.status(201).json(newLead);
});

export default app;
