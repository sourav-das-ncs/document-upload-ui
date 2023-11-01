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
                    {
                        "ID": "6aaecb21-571c-427e-b446-3ce09db9eff1",
                        "DOC_TYPE": "PURDOC",
                        "DOC_ID": "LeWBw1kyahONwG7DJZbwM-LJEM4C2z07AHxOt11uVAY",
                        "DOC_NO": "6AAECB21",
                        "NAME": "Purchase Agreement.pdf",
                        "MIME_TYPE": "application/pdf",
                        "STATUS": "PENDING",
                        "WF_INSTANCE_ID": "249420d2-7543-11ee-9266-eeee0a87eb5a",
                        "L1APPR_COMMENTS": null,
                        "CREATED_BY": "",
                        "CREATED_AT": "2023-10-28T03:36:12Z"
                    },
                    // {
                    //     "ID": "6aaecb21-571c-427e-b446-3ce09db9eff1",
                    //     "DOC_TYPE": "PURDOC",
                    //     "DOC_ID": "LeWBw1kyahONwG7DJZbwM-LJEM4C2z07AHxOt11uVAY",
                    //     "DOC_NO": "6AAECB21",
                    //     "NAME": "Purchase Agreement.pdf",
                    //     "MIME_TYPE": "application/pdf",
                    //     "STATUS": "PENDING",
                    //     "WF_INSTANCE_ID": "249420d2-7543-11ee-9266-eeee0a87eb5a",
                    //     "L1APPR_COMMENTS": null,
                    //     "CREATED_BY": "",
                    //     "CREATED_AT": "2023-10-28T03:36:12Z"
                    // }
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
            fetchCSRFToken: function () {
                var appModulePath = this.getModulePath();
                var that = this;
                $.ajax({
                    url: appModulePath + "/bpmworkflowruntime/public/workflow/rest/v1/xsrf-token",
                    async: false,
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
            onStartPress: function (sPONumber) {
                // create busy dialog

                // var orderBusyDialog = new sap.m.BusyDialog();
                // orderBusyDialog.open();

                // sap.m.MessageBox.information("Workflow started with PO Number: "+sPONumber);

                var startContext = this.getView().getModel("PO").getData();
                startContext.RequestId = sPONumber;
                startContext.BasicData.ponumber = sPONumber;

                var workflowStartPayload = {
                    definitionId: "us10.demo-nrdspy5x.purchaseorderprocess.purchaseOrderFlow",
                    context: {input: startContext}
                }

                var sPath = this.getModulePath() + "/bpmworkflowruntime/public/workflow/rest/v1/workflow-instances";


                this.callRESTService(sPath, workflowStartPayload, "POST", this.TOKEN, function () {
                    MessageBox.information("Workflow started with PO Number: " + sPONumber);
                });


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

                    this.getView().addDependent(this.dialog);
                }

                this.dialog.open();

            },
        });
    });
