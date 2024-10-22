
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], (Controller, JSONModel, Filter, FilterOperator,MessageToast) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Home", {
		onInit() {
			
			// const oJSONModel = this.initSampleDataModel();
			// this.getView().setModel(oJSONModel);
			
			var isLoggedIn = localStorage.getItem("isLoggedIn");
			if (!isLoggedIn) {
				this.getOwnerComponent().getRouter().navTo("login");
			}

			var oModel = new JSONModel();
            
            oModel.loadData("Products.json");
            
            this.getView().setModel(oModel);


			const oViewModel = new JSONModel({
				currency: "TL"
			});
			this.getView().setModel(oViewModel, "view");
		},
		// initSampleDataModel: function() {
		// 	const oModel = new JSONModel();

		// 	jQuery.ajax(sap.ui.require.toUrl("Products.json"), {
		// 		dataType: "json",
		// 		success: function(oData) {
		// 			const aTemp2 = [];
		// 			const aCategoryData = [];
		// 			for (let i = 0; i < oData.Products.length; i++) {
		// 				const oProduct = oData.Products[i];
		// 				if (oProduct.Category && aTemp2.indexOf(oProduct.Category) < 0) {
		// 					aTemp2.push(oProduct.Category);
		// 					aCategoryData.push({ProductName: oProduct.Category});
		// 				}
		// 			}

		// 			oData.Categories = aCategoryData;

		// 			oModel.setData(oData);
		// 		},
		// 		error: function() {
		// 			Log.error("failed to load json");
		// 		}
		// 	});

		// 	return oModel;
		// },
		onFilterProducts(oEvent) {
			// build filter array
			const aFilter = []; //holds filter object. If there are multiple criteria to filter by, each filter will be added to this array.
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}

			// filter binding
			const oList = this.byId("productList");
			const oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
		},
		onPress: function(oEvent) {
			const oButton = oEvent.getSource();
			const oContext = oButton.getBindingContext(); 
		
			if (oContext) {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("detail", {
					invoicePath: window.encodeURIComponent(oContext.getPath().substr(1))
				});
				console.log(oContext.getPath());
			} else {
				console.error("Bağlam bulunamadı.");
			}
		},
		clearFilters: function() {
			const oTable = this.byId("productList");
			const oBinding = oTable.getBinding("rows");
		
			oBinding.filter([]);
			oBinding.sort(null);
		},

        onQuantitySort: function() {
            const oTable = this.byId("productList");
            const oColumn = this.byId("quantity");
            const bDescending = oColumn.getSortOrder() === "Ascending";
            oTable.sort(oColumn, bDescending ? "Descending" : "Ascending");
        }
		
		
	});
});