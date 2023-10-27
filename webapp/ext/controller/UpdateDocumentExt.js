sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        updateDocument: function(oEvent) {
            this.file = {};
            const oDocument = oEvent.getObject();

            this.uploadCompleteFile = async function (oEvent) {
                console.log(oEvent);
                const file = oEvent.getParameters().files[0];

                this.file.filename = file.name
                this.file.mimeType = file.type;

                const fileReader = new FileReader();
                fileReader.onload = function (event) {
                    const content = event.target.result;
                    console.log(content);
                    const base64Encoded = btoa(content);
                    this.file.content = base64Encoded;
                }.bind(this);

                fileReader.readAsText(file);
            }

            this.uploadFile = async function (oEvent) {
                if (this.file.content) {
                    console.log(this.file);
                    await this.callAPI(this.file);
                    this.dialog.close();
                }
            }

            this.callAPI = async function (payload) {

                var appId = 'ncsdemo';
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                const id = oDocument.ID;

                var settings = {
                    "url": `${appModulePath}/service/general/updateDocument?id=${id}`,
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(payload),
                };

                $.ajax(settings).done(function (response) {
                    console.log(response);
                    MessageToast.show("Document Uploaded.");
                });
            }

            
            if (!this.dialog) {
                this.dialog = new sap.m.Dialog({
                    title: "Upload Document",
                    content: new sap.ui.unified.FileUploader({
                        id: "fileUploader",
                        name: "myFileUpload",
                        change: function (event) {
                            this.uploadCompleteFile(event);
                        }.bind(this)
                    }),
                    beginButton: new sap.m.Button({
                        text: "Upload",
                        press: function () {
                            this.uploadFile("ew");
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this.dialog.close();
                        }.bind(this)
                    })
                });

                this._view.addDependent(this.dialog);
            }

            this.dialog.open();
        }
    };
});
