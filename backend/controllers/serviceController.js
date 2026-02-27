const ServiceRequest = require('../models/ServiceRequest');

exports.createService = async (req, res) => {
  try {
    const { type, details, pg } = req.body;
    
    // Validate required fields
    if (!type || type.trim() === '') {
      return res.status(400).json({ message: 'Service type is required' });
    }

    const data = {
      user: req.user.id,
      type: type.trim(),
      details: details || '',
      pg: pg || null
    };

    const sr = await ServiceRequest.create(data);
    res.json(sr);
  } catch (err) { 
    console.error('Error in createService:', err);
    res.status(500).json({ message: err.message }); 
  }
};

exports.getUserServices = async (req, res) => {
  try { 
    const list = await ServiceRequest.find({ user: req.user.id }).populate('pg').lean(); 
    res.json(list || []); 
  } catch (err) { 
    console.error('Error in getUserServices:', err);
    res.status(500).json({ message: err.message }); 
  }
};

exports.getAllServices = async (req, res) => {
  try { 
    // Fetch services with null refs allowed
    const list = await ServiceRequest.find().select('-__v');
    
    // Return immediately with basic data (avoid population if it fails)
    if (!list || list.length === 0) {
      return res.json([]);
    }

    // Try to populate, but don't fail if it doesn't work
    try {
      const populated = await ServiceRequest.find()
        .populate('pg')
        .populate('user','name email')
        .select('-__v')
        .lean();
      return res.json(populated || []);
    } catch (populateErr) {
      console.warn('Population failed, returning raw data:', populateErr.message);
      return res.json(list || []);
    }
  } catch (err) { 
    console.error('Error in getAllServices:', err);
    res.status(500).json({ message: err.message }); 
  }
};

exports.updateServiceStatus = async (req, res) => {
  try { 
    const { id } = req.params; 
    const { status } = req.body;
    
    // Update without population first
    const s = await ServiceRequest.findByIdAndUpdate(id, { status }, { new: true });
    if (!s) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Try to populate for response, but return basic data if it fails
    try {
      const populated = await ServiceRequest.findById(id)
        .populate('pg')
        .populate('user','name email')
        .lean();
      return res.json(populated || s);
    } catch (populateErr) {
      console.warn('Population failed in updateStatus, returning basic data:', populateErr.message);
      return res.json(s.toObject ? s.toObject() : s);
    }
  } catch (err) { 
    console.error('Error in updateServiceStatus:', err);
    res.status(500).json({ message: err.message }); 
  }
};

module.exports = exports;
