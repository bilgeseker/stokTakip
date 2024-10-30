sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Fragment,Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Overview", {
        
        onInit: function () {
            var isLoggedIn = sessionStorage.getItem("isLoggedIn");
            console.log("isLoggedIn:", isLoggedIn);
        
            if (isLoggedIn === "true") {
                console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
            } else {
                console.log("Kullanıcı giriş yapmadı, login sayfasına yönlendiriliyor.");
                this.getOwnerComponent().getRouter().navTo("login");
                return; // Giriş yapmamışsa fonksiyonu sonlandır
            }

            const oModel = this.getOwnerComponent().getModel("products");
            if (oModel) {
                this.getView().setModel(oModel);
            } else {
                console.error("Products modeli bulunamadı!");
            }
        
            this._formFragments = {};
			this._showFormFragment("ProductList");
        },
        _toggleButtonsAndView : function (bEdit) {

			this._showFormFragment(bEdit ? "AddProductFragment" : "ProductList");
		},
		_getFormFragment: function (sFragmentName) {
            var pFormFragment = this._formFragments[sFragmentName],
                oView = this.getView();

            if (!pFormFragment) {
                pFormFragment = Fragment.load({
                    id: oView.getId(),
                    name: "ui5.walkthrough.view." + sFragmentName // Fragment ismi
                }).then(function (oVBox) {
                    oVBox.setModel(this.getView().getModel("products"), "products"); // Model ayarla
                    oVBox.setModel(this.getView().getModel("categories"), "categories"); // Kategoriler için model ayarla
                    oVBox.setModel(this.getView().getModel("colors"), "colors"); // Renkler için model ayarla
                    return oVBox;
                }.bind(this));
                this._formFragments[sFragmentName] = pFormFragment;
            }

            return pFormFragment;
        },

        _showFormFragment: function (sFragmentName) {
            var oPage = this.byId("contentArea"); // contentArea'nın id'sini belirtin
            oPage.removeAllContent(); // Mevcut içeriği kaldır

            this._getFormFragment(sFragmentName).then(function (oVBox) {
                oPage.insertContent(oVBox); // Fragment'i ekle
            });
        },
        
        onAdd: function(){
            this._toggleButtonsAndView(true);
        },
        onFilterProducts(oEvent) {
			const aFilter = []; 
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}

			const oList = this.byId("productFragmentList");
			const oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
		}

    });
});
