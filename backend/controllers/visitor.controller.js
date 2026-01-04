const { createVisitor, countVisitors } = require("../models/database");

// CREATE visitor (user masuk website)
exports.create = (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({
      error: "session_id is required",
    });
  }

  createVisitor(session_id, (err, id) => {
    if (err) {
      // session_id sudah ada → visitor sudah tercatat
      if (err.message?.includes("UNIQUE")) {
        return res.status(200).json({
          message: "Visitor already counted",
        });
      }

      return res.status(500).json({
        error: "Failed to create visitor",
      });
    }

    res.status(201).json({
      id,
      session_id,
      message: "Visitor recorded",
    });
  });
};

// OPTIONAL: get total visitor aktif
exports.count = (req, res) => {
  countVisitors((err, total) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to count visitors",
      });
    }

    res.json({ total });
  });
};
