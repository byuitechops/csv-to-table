#!/usr/bin/env node

/*eslint-env node*/
/*eslint no-unused-vars:0, no-console:0*/
var fs = require('fs'),
    path = require('path'),
    Handlebars = require('handlebars'),
    dsv = require('d3-dsv'),
    open = require('open'),
    templateFileName = 'template.handlebars',
    csvFileName = process.argv[2],
    templateString, csvData, htmlString, htmlFileName;


function readFile(name) {
    var file = '';
    try {
        file = fs.readFileSync(name, 'utf8');
    } catch (e) {
        console.log('Error:', e);
    }
    return file;

}

//read in the template
function getTemplate() {
    var fileName = path.join(__dirname, templateFileName)
    return readFile(fileName);
}

//read in the csv file
function getCSV(csvFileName) {
    var csv = '';

    if (path.extname(csvFileName) !== '.csv') {
        return csv;
    }

    //get the file
    csv = readFile(csvFileName);

    //did we get something
    if (csv !== '') {
        //add a \n if needed
        if(csv[csv.length-2] !== '\n'){
            csv +='\n';
        }
        
        csv = dsv.csvParse(csv, function (d,i) {
            d.index = i;
            return d;
        });
        
        csv.columns.unshift('index');
    }

    return csv;

}

//run the template 
function runTemplate(templateString, csvData, csvFileName) {
    //compile the template
    var template = Handlebars.compile(getTemplate());

    //run the template
    htmlString = template({
        title: csvFileName,
        columnsJSON: JSON.stringify(csvData.columns),
        //the map is because d3-dsv adds properties to the array
        tableJSON: JSON.stringify(csvData.map(function (row) {
            return row;
        }))
    });

}

//write the html file
function writeHtmlFile(htmlString, htmlFileName) {
    try {
        fs.writeFileSync(htmlFileName, htmlString, 'utf8')
        console.log('Output:', htmlFileName);
        open(htmlFileName);
    } catch (e) {
        console.log(e);
    }
}


/************************  Start *************************/

//read in the template
templateString = getTemplate();

//read in the csv file
csvData = getCSV(csvFileName);

//make sure that we have what we need a template
if (templateString !== '' && csvData !== '') {

    //run the template
    runTemplate(templateString, csvData, csvFileName);

    //filenameOut
    htmlFileName = csvFileName.slice(0, csvFileName.length - 4) + '.html';

    //write the html file
    writeHtmlFile(htmlString, htmlFileName);
}