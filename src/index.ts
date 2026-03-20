import express, { Request, Response } from "express";
import cors from "cors";
import { prisma } from "./lib/db.js";

const app = express();

app.use(cors());
app.use(express.json());

type LeadStatus =
  | "New"
  | "Engaged"
  | "Proposal Sent"
  | "Closed-Won"
  | "Closed-Lost";

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

app.get("/", (_req: Request, res: Response) => {
  res
    .type("html")
    .send(
      `<h1>Lead Manager API 🚀</h1><p>Use <code>/leads</code> endpoint.</p>`,
    );
});

app.get("/leads", async (_req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

app.post(
  "/leads",
  async (req: Request<{}, {}, CreateLeadDTO>, res: Response) => {
    const { name, email, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    try {
      const lead = await prisma.lead.create({
        data: {
          name,
          email,
          status,
        },
      });

      res.status(201).json(lead);
    } catch (err) {
      // This usually triggers if the email @unique constraint is violated
      res.status(400).json({ error: "Email must be unique" });
    }
  },
);

export default app;
