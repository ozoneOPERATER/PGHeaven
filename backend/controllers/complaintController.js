const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try { const data = { ...req.body, user: req.user.id }; const c = await Complaint.create(data); res.json(c); } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUserComplaints = async (req, res) => {
  try { const list = await Complaint.find({ user: req.user.id }).populate('pg'); res.json(list); } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllComplaints = async (req, res) => {
  try { const list = await Complaint.find().populate('pg').populate('user','name email'); res.json(list); } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateComplaintStatus = async (req, res) => {
  try { const { id } = req.params; const { status } = req.body; const c = await Complaint.findByIdAndUpdate(id, { status }, { new: true }); res.json(c); } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = exports;
