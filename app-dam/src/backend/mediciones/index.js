const express = require('express')
const routerMediciones = express.Router()
var pool = require('../mysql-connector')

// Get all measurements for a specific device
routerMediciones.get('/api/mediciones/:id', function(req, res) {
    const dispositivoId = req.params.id

    if (!dispositivoId || isNaN(dispositivoId)) {
        return res.status(400).json({
            error: 'Invalid device ID',
            message: 'Device ID must be a valid number'
        })
    }

    pool.query('SELECT * FROM Mediciones WHERE dispositivoId = ?', [dispositivoId], function(err, result, fields) {
        if (err) {
            console.error('Database error: ', err);
            return res.status(400).json({
                error: 'Database error',
                message: err.message
            })
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Measurements not found',
                message: `No measurements found for device ID ${dispositivoId}`
            })
        }

        res.status(200).json({
            success: true,
            data: result,
            count: result.length
        })
    })
})

// Get latest measurement for a device
routerMediciones.get('/api/mediciones/:id/latest', function(req, res) {
    const dispositivoId = req.params.id

    if (!dispositivoId || isNaN(dispositivoId)) {
        return res.status(400).json({
            error: 'Invalid device ID',
            message: 'Device ID must be a valid number'
        })
    }

    pool.query('SELECT * FROM Mediciones WHERE dispositivoId = ? ORDER BY fecha DESC LIMIT 1', [dispositivoId], function(err, result, fields) {
        if (err) {
            console.error('Database error: ', err);
            return res.status(400).json({
                error: 'Database error',
                message: err.message
            })
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Measurements not found',
                message: `No measurements found for device ID ${dispositivoId}`
            })
        }

        res.status(200).json({
            success: true,
            data: result[0]
        })
    })
})

module.exports = routerMediciones