let pendingPrintJobs = [];
let invoiceCounter = 1000;  // Starting invoice number

export const createPrintJob = (req, res) => {
  const { printerId, text } = req.body;

  if (!text) return res.status(400).json({ message: "Print text required" });

  const job = {
    id: Date.now().toString(),
    printerId: printerId || null,
    text,
    invoiceNo: invoiceCounter++, // increment here
    status: "pending",
  };

  pendingPrintJobs.push(job);
  res.status(201).json({ success: true, job });
};


export const getPendingPrintJobs = (req, res) => {
  const { printerId } = req.query;

  const jobs = pendingPrintJobs.filter(
    (job) => !printerId || job.printerId === printerId
  );

  res.json(jobs);
};

export const markJobDone = (req, res) => {
  const { jobId } = req.params;

  const index = pendingPrintJobs.findIndex((job) => job.id === jobId);
  if (index === -1) {
    // Instead of 404, just return success (idempotent)
    return res.json({ message: "Job already marked done" });
  }

  pendingPrintJobs.splice(index, 1);
  res.json({ message: "Job marked done" });
};

