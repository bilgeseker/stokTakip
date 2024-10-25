
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
			var isLoggedIn = sessionStorage.getItem("isLoggedIn");
			console.log("isLoggedIn:", isLoggedIn); 

			if (isLoggedIn === "true") {
				console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
			} else {
				this.getOwnerComponent().getRouter().navTo("login"); 
			}

			var oModel = new JSONModel();

            oModel.loadData("http://localhost:3000/products");

            this.getView().setModel(oModel, "products");


			const oViewModel = new JSONModel({
				currency: "TL"
			});
			this.getView().setModel(oViewModel, "view");
		},
		onFilterProducts(oEvent) {
			const aFilter = []; 
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}

			const oList = this.byId("productList");
			const oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
		},
		onPress: function(oEvent) {
			const oButton = oEvent.getSource(); 
			const oContext = oButton.getBindingContext("products"); 

			if (!oContext) {
				console.error("Bağlam bulunamadı.");
				return; 
			}

			const oRouter = this.getOwnerComponent().getRouter();
			const sPath = encodeURIComponent(oContext.getPath());
			
			oRouter.navTo("detail", {
				productPath: sPath 
			});
			console.log(`Navigating to detail page with path: ${sPath}`);
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
