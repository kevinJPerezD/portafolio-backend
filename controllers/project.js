'use strict'

const project = require('../models/project');
var Project = require('../models/project');
var path = require('path');

var fs = require('fs');

var controller = {

    home: function(req, res) {
        return res.status(200).send({
            message: 'soy la home'
        });
    },
    test: function(req, res) {
        return res.status(200).send({
            message: 'soy el metodo test'
        });
    },

    saveProject: function(req, res) {
        var project = new Project();
        var params = req.body;

        project.name = params.name;
        project.description = params.description;
        project.category = params.category;
        project.year = params.year;
        project.langs = params.langs;
        project.image = null;

        project.save((err, projectStored) => {
            if (err) return res.status(500).send({ message: 'Error al guardar', project: project });
            if (!projectStored) return res.status(404).send({ message: 'No se ha podido guardar el proyecto' });
            return res.status(200).send({ project: projectStored });
        });
    },
    getProject: function(req, res) {
        var projectId = req.params.id;

        if (projectId == null) return res.status(404).send({ message: "El proyecto no existe" });

        Project.findById(projectId, (err, project) => {
            if (err) return res.status(500).send({ message: "Error al devolver los datos" });
            if (!project) return res.status(404).send({ message: "El proyecto no existe" });
            return res.status(200).send({
                project
            });
        });
    },

    getProjects: function(req, res) {
        // Project.find({year: 2021}, (err, project) => {
        Project.find().sort('-year').exec((err, projects) => {
            if (err) return res.status(500).send({ message: "Error al devolver los datos" });
            if (!projects) return res.status(404).send({ message: "No hay proyectos para mostrar" });
            return res.status(200).send({
                projects
            });
        });
    },

    updateProject: function(req, res) {
        var projectId = req.params.id;
        var update = req.body;

        project.findByIdAndUpdate(projectId, update, { new: true }, (err, projectUpdated) => {
            if (err) return res.status(500).send({ message: "Error al actualizar" });
            if (!projectUpdated) return res.status(404).send({ message: "No existe el proyecto para actualizar" });
            return res.status(200).send({
                project: projectUpdated
            });
        });

    },
    deleteProject: function(req, res) {
        var projectId = req.params.id;

        project.findByIdAndRemove(projectId, (err, projectDelete) => {
            if (err) return res.status(500).send({ message: "No se ha podido borrar el proyecto" });
            if (!projectDelete) return res.status(404).send({ message: "No existe el proyecto para eliminar" });
            return res.status(200).send({
                project: projectDelete
            });
        });

    },
    uploadImage: function(req, res) {
        var projectId = req.params.id;
        var fileName = 'Imagen no subida...';

        if (req.files) {


            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');

            var fileName = fileSplit[1];
            var extSplit = fileName.split('\.');

            var fileExt = extSplit[1];

            if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
                Project.findByIdAndUpdate(projectId, { image: fileName }, { new: true }, (err, projectUpdated) => {
                    if (err) return res.status(500).send({ message: "La imagen no se ha subido" });
                    if (!projectUpdated) return res.status(404).send({ message: "Proyecto no existe" });

                    return res.status(200).send({
                        project: projectUpdated
                    });
                });
            } else {
                fs.unlink(filePath, (err) => {
                    return res.status(200).send({ message: 'La extension no es valida' })
                })
            }

        } else {
            return res.status(200).send({
                message: fileName
            });
        }

    },
    getImageFile: function(req, res) {
        var file = req.params.image;
        var path_file = './uploads/' + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(200).send({
                    message: 'No existe la imagen'
                });
            }
        });
    }
};

module.exports = controller;