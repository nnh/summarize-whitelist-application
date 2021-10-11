# summarize-whitelist-application
ホワイトリスト登録申請情報をまとめるスクリプトです。  
スタンドアロンではなく、出力用スプレッドシートに取り込んで使用します。  
# 実行手順
スプレッドシートのConfigシートB列の値をクリアしてください。  
最新のConfig情報を下記の手順で取得し、ConfigシートのB列に貼り付けてください。  
[nnh/format-config-web-filtering](https://github.com/nnh/format-config-web-filtering)  
スプレッドシートのメニューから「申請情報まとめ」を実行してください。  
# 実行結果
実行結果は「申請情報まとめ」シートに出力されます。  
入力スプレッドシートのN列から右の情報は出力しません。  
D列にドメイン名が出力されます。  
N列にConfig登録状況が出力されます。  
O列に申請されたURLが出力されます。  
それ以外は入力スプレッドシートと同一です。  
# 出力内容
## ドメイン名
申請されたURLからドメイン名を取得し、出力列に出力します。  
申請したURLをそのまま出力する場合、「!yahoo.co.jp」のように頭に半角の!を付けてください。  
## Config登録状況
Configの文字列と比較し、既に登録があれば「既にConfig登録済み」、該当する文字列がない場合は「未登録」と出力します。  
申請状況まとめシートの上の行に既に存在するURLの場合は「重複」と出力します。  
入力スプレッドシートのM列に「登録不要」と入っていてConfigに登録されていない場合、、Config登録状況が「登録不要」になります。  
# 事前作業（入力スプレッドシートが変更になった場合のみ必要）
入力スプレッドシートの設定を行う必要があります。  
1. スクリプトの下記箇所のURLを該当スプレッドシートのものに書き換えてください。
```
function registerScriptPropertyInputSsInfo1(){
  // URL of the input spreadsheet
  PropertiesService.getScriptProperties().setProperty('inputSsUrl1', 'https://docs.google.com/spreadsheets/d/.../edit');
}
```
2. function registerScriptProperty を実行してください。
# 制限事項
出力用スプレッドシートに下記名称のシートがない場合場合異常終了します。
- Config
- 申請情報まとめ
