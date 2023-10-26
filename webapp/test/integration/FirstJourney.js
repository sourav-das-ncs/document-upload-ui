sap.ui.define([
    "sap/ui/test/opaQunit"
], function (opaTest) {
    "use strict";

    var Journey = {
        run: function() {
            QUnit.module("First journey");

            opaTest("Start application", function (Given, When, Then) {
                Given.iStartMyApp();

                Then.onTheDOCUMENT_TABLEList.iSeeThisPage();

            });


            opaTest("Navigate to ObjectPage", function (Given, When, Then) {
                // Note: this test will fail if the ListReport page doesn't show any data
                When.onTheDOCUMENT_TABLEList.onFilterBar().iExecuteSearch();
                Then.onTheDOCUMENT_TABLEList.onTable().iCheckRows();

                When.onTheDOCUMENT_TABLEList.onTable().iPressRow(0);
                Then.onTheDOCUMENT_TABLEObjectPage.iSeeThisPage();

            });

            opaTest("Teardown", function (Given, When, Then) { 
                // Cleanup
                Given.iTearDownMyApp();
            });
        }
    }

    return Journey;
});