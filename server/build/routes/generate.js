"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const express = require('express');
const { Request, Response, Router } = require('express');
const multer = require('multer');
const getColors = require('get-image-colors');
const splashy = require('splashy')();
const zip = require('express-easy-zip');
const fs = require('fs');
const imgur = require('imsave')(config_1.apiKey);
const path = require('path');
const storage = multer.diskStorage({
    inMemory: (req, file, cb) => {
        cb(null, false);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });
const router = Router();
router.use(zip());
router.use(express.static(path.resolve('../', 'build')));
router.get('*', (req, res, next) => {
    res.sendFile(path.resolve('../', 'build/index.html'));
});
router.post('/palette', upload.any(), (req, res) => {
    const mainArr = [];
    const arr = [];
    (async () => {
        const image = req.files[0].path;
        const splashyColors = await splashy.fromFile(image);
        console.log(splashyColors);
        mainArr.push(splashyColors);
        getColors(image, { paletteSize: 7 })
            .then((colors) => {
            for (let i = 0; i < colors.length; i++) {
                let colorIndex = colors[i];
                arr.push(colorIndex.hex());
                console.log(arr);
            }
            mainArr.push(arr);
            console.log('Main Array:', mainArr);
            res.send(mainArr);
        });
    })();
});
router.post('/theme/:editor', (req, res) => {
    switch (req.params.editor) {
        case 'VS Code':
            res.zip({
                files: [
                    {
                        content: req.body.tmTheme,
                        name: `/theme/${req.body.name}.tmtheme`,
                        type: 'file'
                    },
                    {
                        content: req.body.colorJSON,
                        name: `/theme/${req.body.name}-theme.json`,
                        type: 'file'
                    },
                    {
                        content: req.body.metaJSON,
                        name: `package.json`,
                        type: 'file'
                    },
                    {
                        content: req.body.readMe,
                        name: `README.md`,
                        type: 'file'
                    },
                ],
            });
            break;
        case 'Sublime':
            res.zip({
                files: [
                    {
                        content: req.body.tmTheme,
                        name: `./${req.body.name} (Sublime PicTheme)/${req.body.name}.tmTheme`,
                        type: 'file'
                    },
                    {
                        content: req.body.readMe,
                        name: `README.md`,
                        type: 'file'
                    },
                ]
            });
            break;
        default:
            console.log('Recieved no editor param');
            console.error(error);
    }
});
router.post('/imgurLink', upload.any(), (req, res) => {
    console.log(req.files[0].path);
    imgur(fs.readFileSync(req.files[0].path), (err, url) => {
        if (err) {
            console.err;
        }
        console.log(`Imgur Url: ${url}`);
        res.send(url);
    });
});
exports.GeneratorController = router;
