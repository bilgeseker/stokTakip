

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
		
			const oUpdateModel = this.getView().getModel("updateProductModel");
			oUpdateModel.setProperty("/ProductName", this.getView().byId("updateProductName").getValue());
			oUpdateModel.setProperty("/Quantity", parseInt(this.getView().byId("updateQuantity").getValue(), 10));
			oUpdateModel.setProperty("/ExtendedPrice", this.getView().byId("updateExtendedPrice").getValue());
			oUpdateModel.setProperty("/SizeId", this.getView().byId("updateSize").getSelectedKey());
			oUpdateModel.setProperty("/ColorId", this.getView().byId("updateColor").getSelectedKey());
			oUpdateModel.setProperty("/CategoryId", this.getView().byId("updateCategory").getSelectedKey());
			oUpdateModel.setProperty("/SubCategoryId", this.getView().byId("updateSubcategory").getSelectedKey());
			const updatedData = {
				ProductID: oModel.getProperty(sPath + "/ProductID"), 
				ProductName: oUpdateModel.getProperty("/ProductName"),
				ProductCode: this.getView().byId("updateProductCode").getValue(),
                Quantity: parseInt(oUpdateModel.getProperty("/Quantity"), 10),
                ExtendedPrice: parseFloat(oUpdateModel.getProperty("/ExtendedPrice")),
                SizeId: oUpdateModel.getProperty("/SizeId"),
                ColorId: oUpdateModel.getProperty("/ColorId"), 
                CategoryId: oUpdateModel.getProperty("/CategoryId"), 
                SubCategoryId: oUpdateModel.getProperty("/SubCategoryId"), 
                ImageUrl: this.ImageUrl
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
					name: "ui5.walkthrough.view." + sFragmentName,
					controller:this
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
		},
		getSizeName: function (sizeId) {
			const sizesModel = this.getView().getModel("sizes");
			const sizesData = sizesModel.getData(); 
			const size = sizesData.find(size => size.SizeID === sizeId); 
			return size ? size.SizeName : 'Bilinmiyor';
		},
		getColorName: function (colorId) {
			const colorsModel = this.getView().getModel("colors");
			const colorsData = colorsModel.getData(); 
			const color = colorsData.find(color => color.ColorID === colorId);
			return color ? color.ColorName : 'Bilinmiyor';
		},
		getSubCategoryName: function (subCategoryId) {
			const subCategoriesModel = this.getOwnerComponent().getModel("subCategories"); 
			const subCategoriesData = subCategoriesModel.getData(); 
			const subCategory = subCategoriesData.find(subCategory => subCategory.SubCategoryID === subCategoryId); 
			return subCategory ? subCategory.SubCategoryName : 'Bilinmiyor';
		},
		getCategoryName: function (categoryId) {
			const categoriesModel = this.getView().getModel("categories");
			const categoriesData = categoriesModel.getData(); 
			const category = categoriesData.find(category => category.CategoryID === categoryId); 
			return category ? category.CategoryName : 'Bilinmiyor'; 
		},
		// onQuantityChange: function(oEvent) {
        //     const sValue = oEvent.getParameter("value");
        //     const oModel = this.getView().getModel("updateProductModel");
        //     oModel.setProperty("/Quantity", sValue); 
        // },  
        // onNameChange: function(oEvent) {
        //     const sValue = oEvent.getParameter("value");
        //     const oModel = this.getView().getModel("updateProductModel");
        //     oModel.setProperty("/ProductName", sValue);
        // },    
        // onPriceChange: function(oEvent) {
        //     const sValue = oEvent.getParameter("value");
        //     const oModel = this.getView().getModel("updateProductModel");
        //     oModel.setProperty("/ExtendedPrice", sValue);
        // },    
        // onSizeChange: function(oEvent) {
        //     const selectedItem = oEvent.getParameter("selectedItem");
        //     if (selectedItem) {
        //         const sValue = selectedItem.getKey(); // Seçilen öğenin anahtarını al
        //         const oModel = this.getView().getModel("updateProductModel");
        //         oModel.setProperty("/SizeId", sValue);
        //     } else {
        //         console.log("Hiçbir öğe seçilmedi.");
        //     }
        // }, 
        // onColorChange: function(oEvent) {
        //     const selectedItem = oEvent.getParameter("selectedItem");
        //     if (selectedItem) {
        //         const sValue = selectedItem.getKey(); // Seçilen öğenin anahtarını al
        //         const oModel = this.getView().getModel("updateProductModel");
        //         oModel.setProperty("/ColorId", sValue);
        //     } else {
        //         console.log("Hiçbir öğe seçilmedi.");
        //     }
        // },
        // onCategoryChange: function(oEvent) {
        //     const selectedItem = oEvent.getParameter("selectedItem");
        //     if (selectedItem) {
        //         const sValue = selectedItem.getKey(); // Seçilen öğenin anahtarını al
        //         const oModel = this.getView().getModel("updateProductModel");
        //         oModel.setProperty("/CategoryId", sValue);
        //     } else {
        //         console.log("Hiçbir öğe seçilmedi.");
        //     }
            
        // },
        // onSubCategoryChange: function(oEvent) {
        //     const selectedItem = oEvent.getParameter("selectedItem");
        //     if (selectedItem) {
        //         const sValue = selectedItem.getKey(); // Seçilen öğenin anahtarını al
        //         const oModel = this.getView().getModel("updateProductModel");
        //         oModel.setProperty("/SubCategoryId", sValue);
        //     } else {
        //         console.log("Hiçbir öğe seçilmedi.");
        //     }
        // }
	});
});
