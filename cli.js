#!/usr/bin/env node

/*eslint-env node*/
/*eslint no-unused-vars:2, no-console:0*/
var title,
    fs = require('fs'),
    path = require('path'),
    makeReport = require('./index.js');

function readFile(name) {
    var file = fs.readFileSync(name, 'utf8');

    if (file.length === 0) {
        throw new Error("The file csv was empty.")
    }

    return file;

}

// this is if the user just wants to see the help options
var argv = require('yargs')
    .options({
        'no-browser': {
            alias: 'b',
            describe: 'Stop file from openning in browser',
        },
        'no-link': {
            alias: 'l',
            describe: 'Open file without clickable links',

        }
    })
    .help()
    .alias('help', 'h')
    .check(function (argv) {
        //make the fileName a named prop
        argv.fileName = argv._[0];

        //check if file ending is a csv
        if (path.extname(argv.fileName) !== '.csv') {
            throw new Error("The file name you supplied is not a '.csv'")
        } else {
            argv.fileContents = readFile(argv.fileName);
        }
        return true;
    })
    .argv


/************************  Start *************************/


//get the title of the report
title = path.parse(argv.fileName).name;
makeReport.fromCSVString(argv.fileContents, argv.l, argv.b, title)
