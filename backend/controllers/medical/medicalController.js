const MedicationModel = require('../models/medical/medicationModel');

async function createMedication(req, res) {
    try {
      const medicationData = req.body;
      const result = await MedicationModel.createMedication(medicationData);
      
      res.status(201).json({
        success: true,
        message: 'Medication reminder created successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }


module.exports = {
    createMedication
}