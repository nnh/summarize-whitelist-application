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
N列にConfig登録状況が出力されます。  
# 制限事項
出力用スプレッドシートに下記名称のシートがない場合場合異常終了します。
- Config
- 申請情報まとめ
