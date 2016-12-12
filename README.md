# mlabs.xrm.fetchxmlbuilder
## 1. Installation 
 - Add mlabs.xrm.fetchxmlbuilder.js to the form: 
  ![Instalaltion](http://i.imgur.com/yHGdfCA.png)

## 2. Usage 
 - Easiest way to learn how to use it, is to take a look at the tests. (mlabs.xrm.fetchxmlbuilder.spec.js)

## 3. Sample 101: 

```javascript
//Imagine you're on some entity that has relation with account, but doesn't have direct relation with contacts.
var query = new mlabs.xrm.queryBuilder();
query.setEntityName("contact");
query.addFilter(
  function (filter) {
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

## 4. API

### mlabs.xrm.xmlStringBuilder - builder for XMLs 

##### function getXmlString() : string 
    returns built FetchXML
##### function openTag([string]tagName, [object]attributes) : xmlStringBuilder
    adds new opening tag
##### function closeTag() : xmlStringBuilder
    close first tag from the stack
##### function insertString([string]text) : xmlStringBuilder
    inserts string (xml)
##### function closeAllTags() : xmlStringBuilder 
    close all opened tags from the stack
--- 

### mlabs.xrm.queryBuilder - builds the "fetch" node.

##### function setCount([number]count) : queryBuilder 
    sets 'count' attribute
##### function setTop([number]count) : queryBuilder
    sets 'top' attribute
##### function getFetchXml() : string 
    gets complete fetchXml
##### function addFilter([function: filterBuilder -> undefined]filteringFunction) : queryBuilder 
    adds filter. See "filterBuilder" section for more info
##### function setEntityName([string]entityName) : queryBuilder
    sets 'name' attribute in 'entity' node.
##### function addAttribute([string]name) : queryBuilder 
    adds attribute node. Called for the first time marks '&lt;all-attributes /&gt;' as not needed
##### function addEntityLink([function: mlabs.xrm.entityBuilder -> mlabs.xrm.queryBuilder]entityBuilder) : queryBuilder
    builds entityLink node.
---  

### filterBuilder - injected in .addFilter function
  
##### function type([string]type) : filterBuilder 
    accepts values "or" / "and". defines filter type (filter 'type' attribute). 
##### addCondition([function: conditionBuilder -> undefined]conditionFunction) : filterBuilder 
    adds condition node. injected argument is a conditionBuilder object.
##### function addFilter([function: filterBuilder -> undefined]filteringFunction) : filterBuilder 
    adds nested filter node. injected argument is a new filterBuilder object.
   
---
### conditionBuilder - injected in .addCondition function
  
##### function attribute([string]name): object [operators]
     sets filtered attribute name and returns condition operator builder
    
##### function operator - returned by 'attribute' function from conditionBuilder. Available operators: 
  
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
    
    each operator has signature: function: object -> undefined - sample: 
  ```javascript
  function(where) { 
    where.attribute("new_number").equals(1)     
  }
  //or   
  function(where) { 
   where.attribute("new_number").isIn(1,2,3)     
  }
  ```
## Examples

#### Get all active accounts where 'name' contains "Ltd" (EcmaScript syntax)
   ```ES6
    let query = new mlabs.xrm.fetchXmlBuilder(); 
    let fetchXml = query.setEntityName("account")
      .addFilter(filter => 
        filter
         .type('and')
         .addCondition(where => where.attribute("statuscode").equals(0))
         .addCondition(where => where.attribute("name").contains("Ltd"))
      )
    .getFetchXml();     
    
    /* output:
    <fetch count="5000" distinct="true">
      <entity name="account">
        <all-attributes/>
        <filter type="and">
            <condition attribute="statuscode" operator="eq" value="0"/>
            <condition attribute="name" operator="like" value="Ltd"/>
        </filter>
    </entity>
   </fetch>
   */ 
   ```
   
   
   
#### Add Link entity (EcmaScript syntax)
   ```ES6
    let query = new mlabs.xrm.fetchXmlBuilder(); 
    let fetchXml = query.setEntityName("account")
       .addEntityLink(link => 
         link.setTo('owninguser')
          .setName('systemuser')
          .addFilter(filter => 
            filter.addCondition(where => where.attribute("lastname").isNotEqual("Cannon"))))
     .getFetchXml();
     /*
     Output: 
     <fetch count="5000" distinct="true">
       <entity name="account">
          <all-attributes/>
          <link-entity to="owninguser" name="systemuser">
            <all-attributes/>
            <filter type="and">
                <condition attribute="lastname" operator="ne" value="Cannon"/>
            </filter>
          </link-entity>
        </entity>
      </fetch>
     */
   ```
