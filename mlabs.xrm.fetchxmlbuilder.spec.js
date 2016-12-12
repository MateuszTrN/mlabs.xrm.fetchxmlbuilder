var assert = require("assert");
var formattor = require("formattor");
xmlFormat = function (xml) {
    return formattor(xml, { method: 'xml' });
}

var mlabs = require("./mlabs.xrm.fetchxmlbuilder");

describe("My very first javascript unit test ever ", function () {
    it("The very first test should just work", function () {
        assert.equal(1, 1);
    });
});

describe("Xml Builder", function () {
    it("should create simple XML without exception", function () {
        assert.doesNotThrow(function () {
            var builder = new mlabs.xrm.xmlStringBuilder();
            builder.openTag("root");
            builder.closeTag();
        });
    });
});

describe("Query Builder", function () {
    it("doesn't throw an exception on complete usage example", function () {
        try {
            var query = new mlabs.xrm.queryBuilder();

            query.setEntityName("account")
                .addFilter(function (filter) {
                    filter
                        .type("or")
                        .addCondition(function (where) {
                            where.attribute("name").equals("Test");
                        })
                        .addCondition(function (where) {
                            where.attribute("counter").isIn(1, 2, 3, 4, 5);
                        })
                        .addFilter(function (filter) {
                            filter.type("and")
                                .addCondition(function (where) {
                                    where.attribute("type").equals("MyType");
                                })
                                .addCondition(function (where) {
                                    where.attribute("statusreason").equals(0);
                                });
                        });
                })
                .addEntityLink(function (queryBuilder) {
                    queryBuilder
                        .setEntityName("contact")
                        .setFrom("contactid")
                        .setTo("parentaccountid")
                        .setLinkType("outer")
                        .addFilter(function (filter) {
                            filter
                                .type("or")
                                .addCondition(function (where) {
                                    where.attribute("id").equals("{00000000-0000-0000-0000-000000000000}");
                                })
                        });
                });

            var xml = xmlFormat(query.getFetchXml());

            assert.ok(true);
            console.log(xml);
        } catch (err) {
            assert.fail(err);
        }
    });

    it("sets entity name correctly", function () {
        var query = new mlabs.xrm.queryBuilder();
        query.setEntityName("account");
        var xml = xmlFormat(query.getFetchXml());

        assert.ok(/\<entity\s+name\=('|\"(.*)\")\s*\>/i.test(xml));
        console.log(xml);
    });

    it("should remove all-attributes element when addAttribute method is called", function () {
        var query = new mlabs.xrm.queryBuilder();
        query.setEntityName("account");
        query.addAttribute("Name");
        var xml = xmlFormat(query.getFetchXml());

        assert.ok(!(/\<all-attributes(.*)\>/i.test(xml)));
        console.log(xml);
    });

    it("should add filter element when addFilter method is called", function () {
        var query = new mlabs.xrm.queryBuilder();
        query.setEntityName("account");
        query.addFilter(function (filter) {
            filter.type("or").addCondition(function (where) {
                where.attribute("name").equals("Test");
            });
        });

        var xml = xmlFormat(query.getFetchXml());

        assert.ok(/\<filter\s+type\=(\'|\")or(\'|\")(.*)\>\s+(\<condition(.*)\>)\s+\<\/filter\>/i.test(xml));
        console.log(xml);
    });

    it("should add correct condition with single value", function () {
        var query = new mlabs.xrm.queryBuilder();
        query.setEntityName("account");
        query.addFilter(function (filter) {
            filter.addCondition(function (where) {
                where.attribute("new_counter").equals(1);
            });
        });

        var xml = xmlFormat(query.getFetchXml());

        assert.ok(/(\<condition\s+(((attribute|operator|value)=[\"|\']\w+[\"|\'])\s?)+(\s?)+\>).*\<\/condition\>/igm.test(xml));
        console.log(xml);
    });

    it("should add correct condition with multiple values", function () {
        var query = new mlabs.xrm.queryBuilder();
        query.setEntityName("account");
        query.addFilter(function (filter) {
            filter.addCondition(function (where) {
                where.attribute("new_counter").isIn(1, 2);
            });
        });

        var xml = xmlFormat(query.getFetchXml());

        assert.ok(/(\<condition\s+(((attribute|operator)=[\"|\']\w+[\"|\'])\s?)+(\s?)+\>)(\s*(\<value\>\d\<\/value\>)\s*)*\<\/condition\>/igm.test(xml));
        console.log(xml);
    });
});
