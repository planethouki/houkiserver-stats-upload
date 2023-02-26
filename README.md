# houkiserver-stats-upload


## GitHub ActionsでAzure Function Appにデプロイしようとしたらエラー

たぶんPublic Accessを選択しなかったから

```
Error: Execution Exception (state: ValidateAzureResource) (step: Invocation)
Error:   When request Azure resource at ValidateAzureResource, Get Function App Settings : Failed to acquire app settings from https://<scmsite>/api/settings with publish-profile
Error:     Failed to fetch Kudu App Settings.
Ip Forbidden (CODE: 403)
Error:       Error: Failed to fetch Kudu App Settings.
Ip Forbidden (CODE: 403)
    at Kudu.<anonymous> (D:\a\_actions\Azure\functions-action\v1\node_modules\azure-actions-appservice-rest\Kudu\azure-app-kudu-service.js:62:23)
    at Generator.next (<anonymous>)
    at fulfilled (D:\a\_actions\Azure\functions-action\v1\node_modules\azure-actions-appservice-rest\Kudu\azure-app-kudu-service.js:5:58)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
Error: Deployment Failed!
```

対応方法

https://stackoverflow.com/questions/64873031/azure-functions-deploy-from-github-actions-results-in-error-failed-to-fetch-ku