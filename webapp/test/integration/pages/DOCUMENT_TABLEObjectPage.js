sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'ncsdemo',
            componentId: 'DOCUMENT_TABLEObjectPage',
            contextPath: '/DOCUMENT_TABLE'
        },
        CustomPageDefinitions
    );
});