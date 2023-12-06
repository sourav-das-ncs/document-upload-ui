sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox) {
        "use strict";

        return Controller.extend("com.ncs.porequest.poui.controller.View1", {
            onInit: function () {

                this.PRODUCTS = [
                    {matcode: "D1201", matname: "LED Ligths", matgroup: "Utilities", price: "5000"},
                    {matcode: "D1200", matname: "AC Filters", matgroup: "Retail", price: "1000"},
                    {matcode: "C0012", matname: "Long Wire", matgroup: "Utilities", price: "100"}
                ];


                var oProducts = [
                ];

                // this.getView().setModel(new sap.ui.model.json.JSONModel(oProducts), "products");


                var oRequestDetails = {
                    "RequestId": "PO0001",
                    "Title": "PO Approval",
                    "Requester": {
                        "Name": "Sourav",
                        "UserId": "sourav.das@gmail.com",
                        "Comment": "Please review and approve"
                    },
                    "BasicData": {
                        "ponumber": "",
                        "supplier": "Semi Corporation",
                        "vendorcode": "100989",
                        "netValue": 200000
                    },
                    "Receipent": {
                        "cc": "100",
                        "purchGroup": "GRP 001",
                        "purchOrg": "100"
                    },
                    "approvalstep": "LocalManager",
                    attachments: oProducts,
                    POs: [
                        {name: "PO00001"},
                        {name: "PO00002"},
                        {name: "PO00003"},
                        {name: "PO00004"}
                    ]
                };
                this.getView().setModel(new sap.ui.model.json.JSONModel(oRequestDetails), "PO");
                this.fetchCSRFToken();
            },
            getModulePath: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                return jQuery.sap.getModulePath(appPath);

            },

            onAdd: function () {
                var oPOModel = this.getView().getModel("PO");
                var oPOModelData = oPOModel.getData();
                oPOModelData.products.push({
                    "no": oPOModelData.products[oPOModelData.products.length - 1].no + 10,
                    "name": "",
                    "desc": "",
                    "matGroup": "",
                    "poqty": "",
                    "netorderprice": "",
                    "netorderval": ""
                });
                oPOModel.checkUpdate(true);
            },

            callRESTService: function (sPath, oPayload, sMethod, sCSRFToken, fnSuccess) {
                $.ajax({
                    url: sPath,
                    type: sMethod,
                    data: JSON.stringify(oPayload),
                    headers: {
                        "X-CSRF-Token": sCSRFToken,
                        "Content-Type": "application/json"
                    },
                    async: false,
                    success: fnSuccess,
                    error: function (data) {

                    }
                });
            },
            fetchCSRFToken: async function () {
                var appModulePath = this.getModulePath();
                var that = this;
                await $.ajax({
                    url: appModulePath + "/bpmworkflowruntime/public/workflow/rest/v1/xsrf-token",
                    async: true,
                    method: "GET",
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    success: function (result, xhr, data) {
                        this.TOKEN = data.getResponseHeader("X-CSRF-Token");
                        if (this.TOKEN === null)
                            console.log("ERROR in fetching csrf token");
                    }.bind(this)
                });
            },

            onChangeMat: function (oEvent) {


                var sMatCode = oEvent.getParameter("selectedItem").getKey();
                var sPath = oEvent.getSource().getBindingContext("PO").getPath();
                var oProduct = this.getView().getModel("PO").getObject(sPath);
                $.each(this.PRODUCTS, function (i, oMat) {
                    if (oMat.matname === sMatCode) {
                        oProduct.desc = oMat.matcode;
                        oProduct.matGroup = oMat.matgroup;
                        oProduct.netorderprice = oMat.price;
                        return false;
                    }
                }.bind(this));
                this.getView().getModel("PO").checkUpdate(true);
            },
            onChangeQty: function (oEvent) {

                var sPath = oEvent.getSource().getBindingContext("PO").getPath();
                var oProduct = this.getView().getModel("PO").getObject(sPath);
                oProduct.netorderval = (parseInt(oProduct.netorderprice) * parseInt(oEvent.getParameter("value"))) + " SGD";

                var aProducts = this.getView().getModel("PO").getData().products;
                var iNetOrderValue = 0;
                $.each(aProducts, function (i, oProduct) {
                    iNetOrderValue = iNetOrderValue + (parseInt(oProduct.netorderprice) * parseInt(oProduct.poqty));
                }.bind(this));
                this.getView().getModel("PO").getData().BasicData.netValue = iNetOrderValue;

                this.getView().getModel("PO").checkUpdate(true);
            },
            onCreate: async function () {
                // var sPONumber = Math.floor(100000000 + Math.random() * 900000000);
                // this.getView().getModel("PO").setProperty("/RequestId", sPONumber);
                // this.onStartPress(sPONumber + "");
                await this.createDocument();

            },
            onReset: function () {

            },

            triggerWorkflow: function () {
                // create busy dialog

                // var orderBusyDialog = new sap.m.BusyDialog();
                // orderBusyDialog.open();

                // sap.m.MessageBox.information("Workflow started with PO Number: "+sPONumber);

                var startContext = this.getView().getModel("PO").getData();
                let attachment = startContext.attachments[0];


                var workflowStartPayload = {
                    definitionId: "us10.demo-nrdspy5x.documentapproval.documentApprovalVerification",
                    context: {
                        docid: "#PO_DOC_0001",
                        docname: attachment.NAME,
                        doctype: "PURDOC",
                        docmime: attachment.MIME_TYPE,
                        docsize: attachment.SIZE
                    }
                }

                var sPath = this.getModulePath() + "/bpmworkflowruntime/public/workflow/rest/v1/workflow-instances";


                this.callRESTService(sPath, workflowStartPayload, "POST", this.TOKEN, function () {
                    MessageBox.information("Document Workflow started for PO Doc No: #PO_DOC_0001 ");
                });


            },

            onSubmit: async function () {
                await this.fetchCSRFToken();
                this.triggerWorkflow();
            },

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
                        // await this.callAPI(this.file);
                        this.dialog.close();
                        const oRequestDetails = this.getView().getModel("PO").getData();

                        oRequestDetails.attachments.push({
                            "DOC_NO": "#PO_DOC_0001",
                            "NAME": this.file.filename,
                            "MIME_TYPE": this.file.mimeType,
                            "STATUS": "PENDING",
                            "SIZE": "5 Kb"
                        });
                        this.getView().getModel("PO").setData(oRequestDetails);
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

                    this.getView().addDependent(this.dialog);
                }

                this.dialog.open();

            },
        });
    });
