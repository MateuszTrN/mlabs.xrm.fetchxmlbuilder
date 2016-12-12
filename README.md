# xrm.fetchxmlbuilder
1. Installation 
 - Add mlabs.xrm.fetchxmlbuilder.js to the form: 
  ![Instalaltion](http://i.imgur.com/yHGdfCA.png)

2. Usage 
 - Easiest way to learn how to use it, is to take a look at the tests. (mlabs.xrm.fetchxmlbuilder.spec.js)

3. Sample 101: 

```
//Imagine you're on some entity that has relation with account, but doesn't have direct relation with contacts.
var query = new mlabs.xrm.queryBuilder();
        query.setEntityName("contact");
        query.addFilter(function (filter) {
            filter.addCondition(function (where) {
                where.attribute("parentaccountid").equals(Xrm.Page.getAttribute("new_relatedaccount")[0].id);
            });
        });
        
 var gridControl = GetGridControl(); 
 gridControl.SetParameter("fetchXml", query.getFetchXml());        
```
