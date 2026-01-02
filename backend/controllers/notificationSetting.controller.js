const {
  getAllNotificationSettings,
  getNotificationSettingById,
  createNotificationSetting,
  updateNotificationSetting,
  deleteNotificationSetting,
} = require("../models/database");

/* List */
exports.index = (req, res) => {
  getAllNotificationSettings(req.user.id, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
    res.json(rows);
  });
};

/* Detail */
exports.show = (req, res) => {
  getNotificationSettingById(req.params.id, req.user.id, (err, row) => {
    if (err) return res.status(500).json({ error: "Failed to fetch setting" });
    if (!row) return res.status(404).json({ error: "Setting not found" });
    res.json(row);
  });
};

/* Create */
exports.create = (req, res) => {
  const required = [
    "name",
    "host",
    "port",
    "security",
    "from_email",
    "to_email",
    "username",
    "password",
  ];

  for (const field of required) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  createNotificationSetting(req.body, req.user.id, (err, id) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to create setting" });
    }

    res.status(201).json({
      id,
      message: "Notification setting created",
    });
  });
};

/* Update */
exports.update = (req, res) => {
  updateNotificationSetting(
    req.params.id,
    req.body,
    req.user.id,
    (err, changes) => {
      if (err)
        return res.status(500).json({ error: "Failed to update setting" });
      if (!changes) return res.status(404).json({ error: "Setting not found" });

      res.json({ message: "Notification setting updated" });
    }
  );
};

/* Delete */
exports.destroy = (req, res) => {
  deleteNotificationSetting(req.params.id, req.user.id, (err, changes) => {
    if (err) return res.status(500).json({ error: "Failed to delete setting" });
    if (!changes) return res.status(404).json({ error: "Setting not found" });

    res.json({ message: "Notification setting deleted" });
  });
};
