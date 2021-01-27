const express = require('express');

let { verificaToken } = require('../middlewares/atenticacion');

let app = express();

let Producto = require('../models/producto');


// ==================
// Obtener productos
// ==================
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });

});

// ==================
// Mostrar un producto por ID
// ==================
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no existe'
                    }
                });
            };

            res.json({
                ok: true,
                producto
            });

        })

});

// ==================
// Buscar productos
// ==================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        })

});

// ==================
// Crear nuevo producto
// ==================
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
        nombre: body.nombre,
        disponible: body.disponible,
        precioUni: body.precioUni,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            categoria: productoDB
        });

    });

});

// ==================
// Acutalizar un produto
// ==================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.descripcion = body.descripcion;
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;

        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoria: productoGuardado
            })

        });


    })


});

// ==================
// desabilitar un producto
// ==================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let cambiaEstado = { disponible: false };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            usuario: productoBorrado
        });
    });

});

module.exports = app;