
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	'sap/ui/core/Fragment',
	"sap/m/MessageToast" 
], (Controller, History, Fragment, MessageToast) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Detail", {

		onInit() {
			var isLoggedIn = localStorage.getItem("isLoggedIn");
			if (!isLoggedIn) {
				this.getOwnerComponent().getRouter().navTo("login");
			}

			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detail").attachPatternMatched(this.onObjectMatched, this);

			this._formFragments = {};
			this._showFormFragment("DetailDisplay");
		},

		onObjectMatched(oEvent) {
			const sPath = "/" + window.decodeURIComponent(oEvent.getParameter("arguments").invoicePath);
	
			this.getView().bindElement({
				path: sPath,
				model: "product"
			});
			console.log("Veri detay sayfasına bağlandı: ", this.getView().getModel("product").getProperty(sPath));
			console.log("Bağlam: ", this.getView().getBindingContext("product"));
		},			
		
		handleEditPress() {
            // Clone the current product data
			const oModel = this.getView().getModel("product");
			const sPath = this.getView().getBindingContext("product").getPath();
			
			const oProductData = oModel.getProperty(sPath);
			
			if (oProductData) {
				this._oProducts = Object.assign({}, oProductData);
				this._toggleButtonsAndView(true);
			} else {
				console.error("Ürün verisi alınamadı.");
   			 }
        },


		handleCancelPress : function () {

			const oModel = this.getView().getModel("product");
			const sPath = this.getView().getBindingContext("product").getPath();

			if (this._oProducts) {
				oModel.setProperty(sPath, this._oProducts); // Restore cloned product data
			} else {
				console.error("Geri yüklemek için geçerli veriler yok.");
			}

			this._toggleButtonsAndView(false);

		},

		handleSavePress : function () {
			const oModel = this.getView().getModel("product");
			const sPath = this.getView().getBindingContext("product").getPath();
			
			const extendedPrice = oModel.getProperty(sPath + "/ExtendedPrice");
			const quantity = oModel.getProperty(sPath + "/Quantity");

			if (isNaN(extendedPrice) || extendedPrice < 1) {
				MessageToast.show("Birim fiyatı geçerli bir sayı olmalı ve 0'dan küçük olmamalıdır.");
				return;
			}

			if (isNaN(quantity) || quantity < 1) {
				MessageToast.show("Miktar geçerli bir sayı olmalı ve 1'den az olmamalıdır.");
				return;
			}
			this._toggleButtonsAndView(false)

		},
		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "DetailChange" : "DetailDisplay");
		},
		_getFormFragment: function (sFragmentName) {
			var pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();

			if (!pFormFragment) {
				pFormFragment = Fragment.load({
					id: oView.getId(),
					name: "ui5.walkthrough.view." + sFragmentName
				});
				this._formFragments[sFragmentName] = pFormFragment;
			}

			return pFormFragment;
		},
		_showFormFragment: function (sFragmentName) {
			var oPage = this.byId("page");
		
			oPage.removeAllContent();
			
			this._getFormFragment(sFragmentName).then(function (oVBox) {
				// Fragmente ait binding context'in doğru ayarlandığından emin olun
				oVBox.setModel(this.getView().getModel("product"), "product"); // Modele bağlama
				oPage.insertContent(oVBox);
			}.bind(this)); // Bağlamı korumak için bind kullanıyoruz
		},		

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("home", {}, true);
			}
		}
	});
});
