const express = require('express')
const routerDispositivos = express.Router()
var pool = require('../mysql-connector')

// Get all devices
routerDispositivos.get('/api/dispositivos', function(req, res) {
    pool.query('Select * from Dispositivos', function(err, result, fields) {
        if (err) {
            console.error('Databse error: ', err);
            return res.status(400).json({
                error: 'Database error',
                message: err.message
            })
        }

        res.status(200).json({
            success: true,
            data: result,
            count: result.length
        })
    })
})

// Get device by ID
routerDispositivos.get('/api/dispositivo/:id', function(req, res) {
    const dispositivoId = req.params.id

    if (!dispositivoId || isNaN(dispositivoId)) {
        return res.status(400).json({
            error: 'Invalid device ID',
            message: 'Device ID must be a valid number'
        })
    }

    pool.query('SELECT * FROM Dispositivos WHERE dispositivoId = ?', [dispositivoId], function(err, result, fields) {
        if (err) {
            console.error('Databse error: ', err);
            return res.status(400).json({
                error: 'Database error',
                message: err.message
            })
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Device not found',
                message: `No device found with ID ${dispositivoId}`
            })
        }
        res.status(200).json({
            success: true,
            data: result[0]
        })
    })
})

module.exports = routerDispositivos
