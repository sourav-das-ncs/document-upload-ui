sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    'use strict';

    return {

        createDocument: async function (oEvent) {

            this.file = {};

            this.uploadCompleteFile = async function (oEvent) {
                console.log(oEvent);
                const file = oEvent.getParameters().files[0];

                this.file.filename = file.name
                this.file.mimeType = file.type;

                const fileReader = new FileReader();
                fileReader.onload = function (event) {
                    let content = event.target.result;
                    console.log(content);
                    const base64Encoded = btoa(unescape(encodeURIComponent(content)));
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

            this.callAPI = function (payload) {

                var appId = 'ncsdemo';
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                var settings = {
                    "url": `${appModulePath}/docapprsrv/service/general/createDocument`,
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify(payload),
                };

                return new Promise((resolve, reject) => {
                    $.ajax(settings).done(function (response) {
                        console.log(response);
                        MessageToast.show("Document Uploaded.");
                        resolve(response);
                    });
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
                        press: async function () {
                            let orderBusyDialog = new sap.m.BusyDialog();
                            orderBusyDialog.open();
                            await this.uploadFile("ew");
                            orderBusyDialog.close();
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

        },




    };
});
