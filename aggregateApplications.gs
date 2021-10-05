/**
 * Consolidate application information entered in "ホワイトリスト登録申請".
 * @param none
 * @return none
 */
class AggregateApplications{
  constructor(target){
    this.targetSheetList = target.inputSheets;
  }
  get sheetValues(){
    return this.getSheetValues();
  }
  getSheetValues(){
    const urlCol = parseInt(PropertiesService.getScriptProperties().getProperty('inputUrlCol'));
    const targetSheetsValues = this.targetSheetList.map(x => {
    let temp = x.getDataRange().getValues();
    // Delete the first line as it is a heading.
    temp.shift();
    // Leave only columns A to E. 
    temp = temp.map(x => x.slice(0, 5));
    return temp;
    }); 
    let targetValues = targetSheetsValues.reduce((newArr, elm) => newArr.concat(elm), []);
    // Delete lines that do not contain a URL.
    targetValues = targetValues.filter(x => x[urlCol] != '');
    return targetValues;
  }
}
class GetTargetSheetsInfoExcluded{
  constructor(target){
    const inputSs = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty(target.targetFileUrl));
    this.allSheets = inputSs.getSheets();
    this.targetSheetInfo = target.targetSheets;
  }
  get targetSheets(){
    return this.getSheetList();
  }
  getTargetSheets(){
    const targetSheetList = this.allSheets.filter(x => !(this.targetSheetInfo.includes(x.getName())));
    return targetSheetList;
  }
  getSheetList(){
    let targetInfo = {};
    targetInfo.inputSheets = this.getTargetSheets();
    return targetInfo;
  }
}
class GetTargetSheetsInfo extends GetTargetSheetsInfoExcluded{
  getTargetSheets(){
    const targetSheetList = this.allSheets.filter(x => this.targetSheetInfo.includes(x.getName()));
    return targetSheetList;
  }
}
function aggregateApplications(){
  const listFirst = aggregateApplications_first();
  const listByForm = aggregateApplications_byForm();
  const targetValues = listFirst.concat(listByForm);
  // Get header information 
  const copyFromSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Web Service');
  const strHeader = copyFromSheet.getRange(1, 1, 1, copyFromSheet.getLastColumn()).getValues();
  // Output
  const outputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PropertiesService.getScriptProperties().getProperty('outputSheetName'));
  outputSheet.clearContents();
  outputSheet.getRange(1, 1, 1, strHeader[0].length).setValues(strHeader);
  outputSheet.getRange(2, 1, targetValues.length, targetValues[0].length).setValues(targetValues);
  // Check URLs
  checkUrl1stReg();
}
function aggregateApplications_first(){
  let target = {};
  target.targetFileUrl = 'inputSsUrl1'; 
  target.targetSheets = ['入力例', '登録済み一覧'];
  const targetInfo = new GetTargetSheetsInfoExcluded(target).targetSheets;
  const targetValues = new AggregateApplications(targetInfo).sheetValues;
  return targetValues;
}
function aggregateApplications_byForm(){
  let target = {};
  target.targetFileUrl = 'inputSsUrl2';
  target.targetSheets = ['フォームの回答 1'];
  const targetInfo = new GetTargetSheetsInfo(target).targetSheets;
  const targetValues = new AggregateApplications(targetInfo).sheetValues;
  return targetValues;
}
/**
 * If the requested URL is already registered in Config, output "既にconfig登録済", if the same domain exists in the upper line, output "重複", otherwise it is output as "未登録" in the N column.
 * @param none
 * @return none
 */
function checkUrl1stReg(){
  const strUnregistered = '未登録';
  const strRegistered = '既にconfig登録済';
  const strDuplicate = '重複'
  const configUrls = getConfigUrls();
  const targetSheetName = PropertiesService.getScriptProperties().getProperty('outputSheetName');
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(targetSheetName);
  const outputCol = 14;
  const outputRawUrlCol = outputCol + 1;
  const urlCol = parseInt(PropertiesService.getScriptProperties().getProperty('inputUrlCol'));
  const targetUrlData = targetSheet.getDataRange().getValues().map(x => x[urlCol]);
  const targetDomains = targetUrlData.map(x => {
    const temp1 = x.replace(/^(http|https):\/\//g, '');
    const temp2 = temp1.match(/^[^\/]+/g);
    return temp2;
  });
  let outputData = targetDomains.map((x, idx) => {
    let temp = strUnregistered;
    // Perfect matching
    temp = configUrls.includes(x[0]) ? strRegistered : temp;
    // Duplicate check
    const tempDomains = targetDomains.slice(0, idx);
    const duplicateCheck = tempDomains.filter(y => y == x[0]);
    if (duplicateCheck.length > 0){
        temp = strDuplicate;
    }
    // Partial Match
    if (temp == strUnregistered){
      for (let i = 0; i < configUrls.length; i++){
        const tempTargetStr = x[0].substr(configUrls[i].length * -1);
        if (tempTargetStr == configUrls[i]){
          temp = strRegistered;
          break;
        }
      }
    }
    return [temp];
  });
  outputData[0] = ['備考'];
  const outputSheet = targetSheet;
  outputSheet.getRange(1, outputCol, outputData.length, 1).setValues(outputData);
  let requestedUrlData = outputSheet.getRange(1, urlCol + 1, outputSheet.getLastRow(), 1).getValues();
  requestedUrlData[0][0] = '申請URL';
  outputSheet.getRange(1, outputRawUrlCol, requestedUrlData.length, 1).setValues(requestedUrlData);
  outputSheet.getRange(1, urlCol + 1, targetDomains.length, 1).setValues(targetDomains);
}
/**
 * Get the URL information from "Config" sheet.
 * @param none
 * @return {Array.<string>} URL list
 */
function getConfigUrls(){
  const configColUrl = 1;
  const configSheetName = 'config';
  const configData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(configSheetName).getDataRange().getValues();
  // Delete header row and rows with no data
  configData.shift();
  let configUrls = configData.filter(x => x[configColUrl] != '');
  configUrls = configUrls.map(x => {
    // Remove '^*.'
    const replaceAsterisk = x[configColUrl].replace(/^\*\./g, '');
    const temp = replaceAsterisk.match(/\./g);
    const len = temp != null ? temp.length : 0;
    return [replaceAsterisk, len];
  });
  // Sort
  configUrls.sort((a, b) => a[1] - b[1]);
  configUrls = configUrls.map(x => x[0]);
  return configUrls;
}
/**
 * Functions for setting properties.
 * @param none
 * @return none
 */
function registerScriptProperty(){
  PropertiesService.getScriptProperties().deleteAllProperties;
  registerScriptPropertyInputSsInfo1();
  registerScriptPropertyInputSsInfo2();
  registerScriptPropertySheetInfo();
}
function registerScriptPropertyInputSsInfo1(){
  // URL of the input spreadsheet
  PropertiesService.getScriptProperties().setProperty('inputSsUrl1', 'https://docs.google.com/spreadsheets/d/.../edit');
}
function registerScriptPropertyInputSsInfo2(){
  // URL of the input spreadsheet
  PropertiesService.getScriptProperties().setProperty('inputSsUrl2', 'https://docs.google.com/spreadsheets/d/.../edit');
}
function registerScriptPropertySheetInfo(){
  PropertiesService.getScriptProperties().setProperty('outputSheetName', '申請情報まとめ');
  PropertiesService.getScriptProperties().setProperty('inputUrlCol', 3);
}
/**
* Add to menu.
* @param none
* @return none
*/
function onOpen() {
  const arr = [
    {name: "申請情報まとめ", functionName: "aggregateApplications"}
  ];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu("申請情報まとめ", arr);
}
