const express = require('express')
const routerElValvulas = express.Router()
var pool = require('../mysql-connector')

// Get electrovalvulas by ID
routerElValvulas.get('/api/electrovalvulas/:id', function (req, res) {
    const electrovalvulaId = req.params.id

    if (!electrovalvulaId || isNaN(electrovalvulaId)) {
        return res.status(400).json({
            error: 'Invalid electrovalvula ID',
            message: 'Electrovalvula ID must be a valid number'
        })
    }

    pool.query('SELECT * FROM Electrovalvulas WHERE electrovalvulaId = ?', [electrovalvulaId], function (err, result, fields) {
        if (err) {
            console.error('Databse error: ', err);
            return res.status(400).json({
                error: 'Database error',
                message: err.message
            })
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Electrovalvula not found',
                message: `No electrovalvula found with ID ${electrovalvulaId}`
            })
        }
        res.status(200).json({
            success: true,
            data: result[0]
        })
    })
})

// Update electrovalvula by ID
routerElValvulas.patch('/api/electrovalvulas/:id', function (req, res) {
    const electrovalvulaId = req.params.id
    const estado = req.body.state


    if (!electrovalvulaId || isNaN(electrovalvulaId)) {
        return res.status(400).json({
            error: 'Invalid electrovalvula ID',
            message: 'Electrovalvula ID must be a valid number'
        })
    }

    const estadoNum = estado ? 1 : 0;
    console.log('Updating electrovalvula:', electrovalvulaId, 'to state:', estadoNum);

    pool.query(
        'UPDATE Electrovalvulas SET estado = ? WHERE electrovalvulaId = ?',
        [estadoNum, electrovalvulaId],
        (err, result) => {
            if (err) {
                console.error('Database error: ', err);
                return res.status(400).json({
                    error: 'Database error',
                    message: err.message
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Electrovalvula not found',
                    message: `No electrovalvula found with ID ${electrovalvulaId}`
                })
            }

            pool.query('INSERT INTO Log_Riegos (apertura, fecha, electrovalvulaId) VALUES (?, NOW(), ?)', [estadoNum, electrovalvulaId], function (err2, result) {
                if (err2) {
                    console.error('Database error: ', err2);
                    return res.status(400).json({
                        error: 'Database error',
                        message: err2.message
                    })
                }
            });

            // Esto es para simular la toma de mediciones
            pool.query(
                'SELECT dispositivoId FROM Dispositivos WHERE electrovalvulaId = ? LIMIT 1',
                [electrovalvulaId],
                (err, result) => {
                    if (err) {
                        console.error('Database error: ', err);
                        return res.status(400).json({
                            error: 'Database error',
                            message: err.message
                        })
                    }

                    if (result.length === 0) {
                        console.warn(`No dispositivo found linked to electrovalvula ID ${electrovalvulaId}`);
                        return;
                    }

                    const dispositivoId = result[0].dispositivoId;
                    const randomMedicion = Math.floor(Math.random() * 101); // Random value between 0 and 100

                    pool.query(
                        'INSERT INTO Mediciones (fecha, valor, dispositivoId) VALUES (NOW(), ?, ?)',
                        [randomMedicion, dispositivoId],
                        (err2, result) => {
                            if (err2) {
                                console.error('Database error: ', err2);
                                return res.status(400).json({
                                    error: 'Database error',
                                    message: err2.message
                                });
                            }
                        });
                }
            );
        });

    res.status(200).json({
        success: true,
        message: `Electrovalvula with ID ${electrovalvulaId} updated successfully`
    })
})


module.exports = routerElValvulas
