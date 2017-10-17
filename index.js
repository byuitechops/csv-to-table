/*eslint-env node*/
/*eslint no-console:0*/
var dsv = require('d3-dsv'),
    Handlebars = require('handlebars'),
    fs = require('fs'),
    path = require('path'),
    open = require('open'),
    templateFileName = 'template.handlebars';

/* writes out table of the csv data into an html page and 
opens in the browser (if user didn't use "no browser" option) */
function writeAndOpenHtmlFile(htmlString, htmlFileName, noBrowser) {
    try {
        fs.writeFileSync(htmlFileName, htmlString, 'utf8')
        console.log('Output:', htmlFileName);
        if (!noBrowser) {
            open(htmlFileName);
        }
    } catch (e) {
        console.log(e);
    }
}

// finds and retruns the name of the file
function readFile(name) {
    var file = '';
    file = fs.readFileSync(name, 'utf8');
    return file;

}

// combines paths into one string and returns its name
function getTemplate() {
    var fileName = path.join(__dirname, templateFileName)
    return readFile(fileName);
}


// compiles and runs the template
function runTemplate(csvData, columns, title, makeLinksClickable) {
    //compile the template
    var template = Handlebars.compile(getTemplate());

    //run the template
    return template({
        title: title,
        columnsJSON: JSON.stringify(columns, null, 4),
        tableJSON: JSON.stringify(csvData, null, 4),
        makeLinksClickableText : makeLinksClickable ? "true": "false"
    });

}


// this takes the raw data and puts it all together into a nice layout (I think)
function makeReportFromCSVString(csvString, noLinks, noBrowser, title) {
    var csvData,
        columns;

    // d3-dsv expects the csv string to end with a new line, add a \n if needed
    if (csvString[csvString.length - 2] !== '\n') {
        csvString += '\n';
    }

    //make an array
    csvData = dsv.csvParse(csvString);
    //save the columns before we delete them
    columns = csvData.columns;

    //d3-dsv adds a bunch of properties to the data array when it parses a string, this map rips them off
    csvData = csvData.map(function (data) {
        return data;
    })


    makeReportFromArray(csvData, columns, noLinks, noBrowser, title);
}


// makes csv data, mainly the urls, more responsive 
function makeReportFromArray(csvData, columnsArray, noLinks, noBrowser, title) {
    var htmlString,
        makeLinksClickable = !noLinks;

    //make the html page
    htmlString = runTemplate(csvData, columnsArray, title, makeLinksClickable);

    //write the html file and open in browser
    writeAndOpenHtmlFile(htmlString, title + '.html', noBrowser);

}

module.exports = {
    fromCSVString: makeReportFromCSVString,
    fromArray: makeReportFromArray
}
