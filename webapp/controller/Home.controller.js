
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat"
	
], (Controller, DateFormat) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Home", {
		onInit: function(){
			const oModel = this.getOwnerComponent().getModel("products");
            if (oModel) {
                this.getView().setModel(oModel);
            } else {
                console.error("Products modeli bulunamadı!");
            }
			const today = new Date();
			const oDateFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
			const formattedDate = oDateFormat.format(today);

			// Set to a model property
			const oDateModel = new sap.ui.model.json.JSONModel({ today: formattedDate });
			this.getView().setModel(oDateModel, "dateModel");

			this.fetchCount();
			this.fetchProductCount();
		},
		fetchCount: function () {
			const that = this; 
		
			fetch('http://localhost:3000/getCount')
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					return response.json();
				})
				.then(data => {
					const count = data[0]['Count(*)']; 
					
					const oModel = new sap.ui.model.json.JSONModel({ decStockCount: count });
					that.getView().setModel(oModel, "productModel");
				})
				.catch(error => {
					console.error('Error fetching count:', error);
				});
		},
		fetchProductCount: function () {
			const that = this; 
		
			fetch('http://localhost:3000/getProductCount')
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					return response.json();
				})
				.then(data => {
					const count = data[0]['Count(*)']; 
					
					const oModel = new sap.ui.model.json.JSONModel({ productCount: count });
					that.getView().setModel(oModel, "totalProductModel");
				})
				.catch(error => {
					console.error('Error fetching count:', error);
				});
		}
		
		
	});
});
