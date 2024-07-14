import * as vscode from 'vscode';
import axios from 'axios';
const qs = require('qs');

export async function lintDocument(document: vscode.TextDocument) {
  let documentData = document.getText();

  let data = qs.stringify({
    'code': documentData
  });

  // let config = {
  //   method: 'post',
  //   maxBodyLength: Infinity,
  //   url: 'http://localhost:3000/lint',
  //   headers: {
  //     'Cookie': 'ARRAffinity=c82c30dbd554f70842d9b1bd407167e0fe5bf4a88594522e4dc923b169330686',
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   data: data
  // };y

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://capllintserver.azurewebsites.net/lint',
    headers: {
      'Cookie': 'ARRAffinity=c82c30dbd554f70842d9b1bd407167e0fe5bf4a88594522e4dc923b169330686',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    let dataFromServer = response.data;
    console.log(dataFromServer);
    return dataFromServer; // Now this return statement will correctly return the data to the caller
  } catch (error) {
    console.error('Error linting the document:', error);
    vscode.window.showErrorMessage('Error linting the document. See the console for more information.');
    return {errors : {errors: []}}; // Return an empty array in case of error to avoid further errors in the caller function
  }
}



function convertString(input : String) {
  // Split the input string into lines based on the newline character
  const lines = input.split('\n');

  // Add a newline character to the end of each line and join them back into a single string
  const convertedData = lines.map(line => line + "\\n").join('');

  return convertedData;
}

