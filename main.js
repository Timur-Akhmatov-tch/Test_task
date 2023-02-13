const path = require('path')
const fetch = require('node-fetch');
const AdmZip = require('adm-zip')
const { writeFile } = require('fs').promises;
const iconv = require('iconv-lite')
const fs = require('fs');

const jsdom = require("jsdom")
const { JSDOM } = jsdom
global.DOMParser = new JSDOM().window.DOMParser

const url ='http://www.cbr.ru/s/newbik';

async function zip  () {
    const archiveFolder = path.resolve(__dirname, 'archive')
    const archive = path.resolve(archiveFolder, 'archive.zip')
    const response = await fetch(url);
    const buffer = await response.buffer();
    await writeFile(archive, buffer);
    const zip = new AdmZip(archive)
    zip.extractAllTo(archiveFolder, true)
    console.log("Done")
}

function parse()  {
    var files = fs.readdirSync('.\\archive');
    console.log(".\\archive\\" + files[files.length-2])

    fs.readFile(".\\archive\\" + files[files.length - 2], null, (err, data) => {
    if(err){

    console.error(err)
    return
    }
    const encodedData = iconv.encode(iconv.decode(data, 'win1251'), 'utf8')
let est = parseXML(encodedData.toString()).getElementsByTagName("BICDirectoryEntry")
const result = []
for (index = 0; index < est.length; ++index) {
    // console.log(est[index].getAttribute("BIC"));
    // console.log(est[index].children[0].getAttribute("NameP"));
    for(jndex = 1; jndex < est[index].children.length; ++jndex){
    if(est[index].children[jndex].getAttribute("Account")){
        // console.log(est[index].children[jndex].getAttribute("Account"))
        result.push("bic: " + est[index].getAttribute("BIC") + " name: " + est[index].children[0].getAttribute("NameP") + " corrAccound: " + est[index].children[jndex].getAttribute("Account"))
    }
    }
}
console.log(result)


})
}

function parseXML(xmlString) {
    var parser = new DOMParser();
    // Parse a simple Invalid XML source to get namespace of <parsererror>:
    var docError = parser.parseFromString('INVALID', 'text/xml');
    var parsererrorNS = docError.getElementsByTagName("parsererror")[0].namespaceURI;
    // Parse xmlString:
    // (XMLDocument object)
    var doc = parser.parseFromString(xmlString, 'text/xml');
    if (doc.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
        throw new Error('Error parsing XML');
    }
    return doc;
}

async function main(){
await zip()
parse()
}

main()

