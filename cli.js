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

// this function is called and shows the help options when an error is found
function notWorking() {
	var yargs = require('yargs')
	.help()
	.check(function (argv){
		throw false
	})
	.argv
	}

// this is if the user just wants to see the help options
var yargs = require('yargs')
.options({
	'no-browser' : {
		alias: 'b',
		describe: 'Stop file from openning in browser'
	},
	'no-link' : {
		alias: 'l',
		describe: 'Open file without any links'
	}
})
.help()
.alias('help', 'h')
.argv


function readFile(name) {
	var file = '';
	try {
		file = fs.readFileSync(name, 'utf8');
	}

	/* catches if the .csv file is empty (meaning it's non-existing or the path is wrong) and calls the help */
	catch (e) {
		console.log('Error: ' + '"' + process.argv[2] + '"' + ' could not be located or does not exist. Please check your file name and path');
		notWorking();
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
	var yargy = require('yargs')

	// if the user does not type in a .csv file, it will display an error and call the help
	if (/.csv/.exec(csvFileName) === null) {
		console.log('Error: Your input did not include a .csv file')
		notWorking()
	} 
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
			// loop through each item and replace it with a clickable URL via <a> tag
			for(var key in row){
				if(typeof row[key] === "string") {
					// the code for first parameter was taken from regexr.com
					row[key] = row[key].replace(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g, "<a href='$&' target='_blank'>$&</a>")

				}
			}
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