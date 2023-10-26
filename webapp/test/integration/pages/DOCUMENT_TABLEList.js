sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'ncsdemo',
            componentId: 'DOCUMENT_TABLEList',
            contextPath: '/DOCUMENT_TABLE'
        },
        CustomPageDefinitions
    );
});