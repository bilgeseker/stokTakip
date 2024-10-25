sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
	"sap/ui/core/UIComponent"
 ], (Controller,MessageToast,UIComponent) => {
    "use strict";
 
    return Controller.extend("ui5.walkthrough.controller.AddProduct", {
		onInit: function(){
			var isLoggedIn = sessionStorage.getItem("isLoggedIn");
			console.log("isLoggedIn:", isLoggedIn);

			if (isLoggedIn === "true") {
				console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
			} else {
				this.getOwnerComponent().getRouter().navTo("login");
			}
		},
        onSavePress: function() {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
            const randomNumber = Math.floor(10000 + Math.random() * 90000);

            var url = 'http://dummyimage.com/191x100.png/dddddd/'+randomNumber;

            const updatedData = {
				ProductName: this.getView().byId("addProductName").getValue(),
				ProductCode: randomLetter+randomNumber,
				Quantity: parseInt(this.getView().byId("addQuantity").getValue(), 10),
				ExtendedPrice: parseFloat(this.getView().byId("addExtendedPrice").getValue()),
				SizeId: this.getView().byId("addSize").getSelectedKey(),
				ColorId: this.getView().byId("addColor").getSelectedKey(), 
				CategoryId: this.getView().byId("addCategory").getSelectedKey(), 
				SubCategoryId: this.getView().byId("addSubcategory").getSelectedKey(), 
				ImageUrl: url
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
				url: 'http://localhost:3000/addProduct', 
				method: 'POST',
				data: JSON.stringify(updatedData), 
				contentType: 'application/json',
				success: function (response) {
					MessageToast.show("Ürün başarıyla eklendi");
					const oModel = this.getOwnerComponent().getModel("products");
            		oModel.loadData("http://localhost:3000/products", null, true);
					this.getView().byId("addProductName").setValue("");
					this.getView().byId("addQuantity").setValue("");
					this.getView().byId("addExtendedPrice").setValue("");
					this.getView().byId("addSize").setSelectedKey("");
					this.getView().byId("addColor").setSelectedKey("");
					this.getView().byId("addCategory").setSelectedKey("");
					this.getView().byId("addSubcategory").setSelectedKey("");
					var oRouter = UIComponent.getRouterFor(this);
					oRouter.navTo("home");
				}.bind(this), 
				error: function () {
					MessageToast.show("Ekleme sırasında hata oluştu.");
				}
			});
        }
    });
});