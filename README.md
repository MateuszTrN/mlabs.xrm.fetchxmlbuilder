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
            filter.type("and")
              .addCondition(function (where) { 
                where.attribute('statuscode').equals(0); /* active */ 
              })
              .addCondition(function (where) {
                where.attribute("parentaccountid").equals(Xrm.Page.getAttribute("new_relatedaccount")[0].id);
              });
        });
        
 var gridControl = GetGridControl(); 
 gridControl.SetParameter("fetchXml", query.getFetchXml());        
```

4. API

 1) mlabs.xrm.xmlStringBuilder - builder for XMLs 
    - function getXmlString() : string - returns built FetchXML
    - function openTag([string]tagName, [object]attributes) : xmlStringBuilder - adds new opening tag
    - function closeTag() : xmlStringBuilder - close first tag from the stack
    - function insertString([string]text) : xmlStringBuilder - inserts string (xml)
    - function closeAllTags() : xmlStringBuilder - close all opened tags from the stack
    
 2) mlabs.xrm.queryBuilder - builds the "fetch" node.
    - function setCount([number]count) : queryBuilder  - sets 'count' attribute
    - function setTop([number]count) : queryBuilder - sets 'top' attribute
    - function getFetchXml() : string - gets complete fetchXml
    - function addFilter([function: filterBuilder -> undefined]filteringFunction) : queryBuilder - adds filter
    - function setEntityName([string]entityName) : queryBuilder - sets 'name' attribute in 'entity' node.
    - function addAttribute([string]name) : queryBuilder - adds attribute node. Called for the first time marks '&lt;all-attributes /&gt;' as not needed
    - function addEntityLink([function: mlabs.xrm.entityBuilder -> mlabs.xrm.queryBuilder]entityBuilder) : queryBuilder - builds entityLink node.
  3) filterBuilder - injected in .addFilter function
    - function type([string]type) : filterBuilder - accepts values "or" / "and". defines filter type (filter 'type' attribute). 
    - addCondition([function: conditionBuilder -> undefined]conditionFunction) : filterBuilder - adds condition node. injected argument is a condition builder
    - function addFilter([function: filterBuilder -> undefined]filteringFunction) : filterBuilder - adds nested filter node 
    
  4) conditionBuilder - injected in .addCondition function
    - attribute([string]name): operatorBuilder - sets filtered attribute name and returns condition operator setter
  5) operatorBuilder - returned by 'attribute' function from conditionBuilder. Available operators: 
    - equals
    - isNotEqual
    - isLessThan
    - isLessEqual
    - isGreaterThan
    - isGreaterEqual
    - contains
    - isIn
    - isBetween
    - doesNotContain
    
    each operator has signature: function: object -> undefined - sample: ...attribute("new_number").equals(1) or  ...attribute("new_number").isIn(1,2,3) 
  
  
    
