
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	'sap/ui/core/Fragment',
	"sap/m/MessageToast" 
], (Controller, History, Fragment, MessageToast) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Detail", {

		onInit() {
			var isLoggedIn = sessionStorage.getItem("isLoggedIn");
			console.log("isLoggedIn:", isLoggedIn);

			if (isLoggedIn === "true") {
				console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
			} else {
				this.getOwnerComponent().getRouter().navTo("login"); 
			}
			const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    		oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);

			this._formFragments = {};
			this._showFormFragment("DetailDisplay");
		},

		_onObjectMatched: function (oEvent) {
			const sProductPath = decodeURIComponent(oEvent.getParameter("arguments").productPath);
			const oModel = this.getView().getModel("products");
			this.getView().bindElement({
				path: sProductPath,
				model: "products"
			});
			this._toggleButtonsAndView(false);
		},				
		
		handleEditPress() {
			const oModel = this.getView().getModel("products");
			const sPath = this.getView().getBindingContext("products").getPath();
			const oProductData = oModel.getProperty(sPath);
			if (oProductData) {
				console.log(oProductData.CategoryId);
				this._oProducts = Object.assign({}, oProductData);
				this._toggleButtonsAndView(true);
			} else {
				console.error("Ürün verisi alınamadı.");
   			 }
        },


		handleCancelPress : function () {

			const oModel = this.getView().getModel("products");
			const sPath = this.getView().getBindingContext("products").getPath();

			if (this._oProducts) {
				oModel.setProperty(sPath, this._oProducts); 
			} else {
				console.error("Geri yüklemek için geçerli veriler yok.");
			}

			this._toggleButtonsAndView(false);

		},

		handleSavePress: function () {
			const oModel = this.getView().getModel("products");
			const sPath = this.getView().getBindingContext("products").getPath();
		
			const updatedData = {
				ProductID: oModel.getProperty(sPath + "/ProductID"), 
				ProductName: this.getView().byId("updateProductName").getValue(),
				ProductCode: this.getView().byId("updateProductCode").getValue(),
				Quantity: parseInt(this.getView().byId("updateQuantity").getValue(), 10),
				ExtendedPrice: parseFloat(this.getView().byId("updateExtendedPrice").getValue()),
				SizeId: this.getView().byId("updateSize").getSelectedKey(),
				ColorId: this.getView().byId("updateColor").getSelectedKey(),
				CategoryId: this.getView().byId("updateCategory").getSelectedKey(), 
				SubCategoryId: this.getView().byId("updateSubcategory").getSelectedKey(), 
				ImageUrl: null
			};
		
			if (!updatedData.ProductName) {
				sap.m.MessageToast.show("Ürün adı zorunludur.");
				return;
			}
		
			if (isNaN(updatedData.Quantity) || updatedData.Quantity < 1) {
				sap.m.MessageToast.show("Miktar geçerli bir sayı olmalı ve 1'den az olmamalıdır.");
				return;
			}
		
			if (isNaN(updatedData.ExtendedPrice) || updatedData.ExtendedPrice <= 0) {
				sap.m.MessageToast.show("Fiyat geçerli bir sayı olmalı ve 0'dan büyük olmalıdır.");
				return;
			}
		
			$.ajax({
				url: 'http://localhost:3000/updateProduct', 
				method: 'POST',
				data: JSON.stringify(updatedData), 
				contentType: 'application/json',
				success: function (response) {
					oModel.refresh(true);
					sap.m.MessageToast.show("Ürün başarıyla güncellendi");
					this._toggleButtonsAndView(false);

					sap.m.MessageToast.show("Ürün başarıyla güncellendi.");
				}.bind(this), 
				error: function () {
					sap.m.MessageToast.show("Güncelleme sırasında hata oluştu.");
				}
			});
		},

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

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
				oVBox.setModel(this.getView().getModel("products"), "products"); 
				oPage.insertContent(oVBox);
			}.bind(this));
		},		

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
			}
		}
	});
});
