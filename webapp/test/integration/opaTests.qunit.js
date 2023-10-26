sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ncsdemo/test/integration/FirstJourney',
		'ncsdemo/test/integration/pages/DOCUMENT_TABLEList',
		'ncsdemo/test/integration/pages/DOCUMENT_TABLEObjectPage'
    ],
    function(JourneyRunner, opaJourney, DOCUMENT_TABLEList, DOCUMENT_TABLEObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ncsdemo') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheDOCUMENT_TABLEList: DOCUMENT_TABLEList,
					onTheDOCUMENT_TABLEObjectPage: DOCUMENT_TABLEObjectPage
                }
            },
            opaJourney.run
        );
    }
);