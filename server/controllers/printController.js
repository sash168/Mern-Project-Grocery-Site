let pendingPrintJobs = [];

export const createPrintJob = (req, res) => {
  const { printerId, text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Print text is required" });
  }

  const job = {
    id: Date.now().toString(),
    printerId: printerId || null,
    text,
    status: "pending",
  };

  pendingPrintJobs.push(job);

  console.log("🖨️ New print job:", job);

  // ✅ Emit instantly via Socket.IO
  try {
    const order = JSON.parse(text); // since frontend sends JSON string
  } catch (e) {
    console.error("Error emitting print job:", e);
  }

  res.status(201).json({ success: true, message: "Print job created & sent", job });
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
    return res.status(404).json({ message: "Job not found" });
  }

  pendingPrintJobs.splice(index, 1);
  res.json({ message: "Job marked done" });
};
