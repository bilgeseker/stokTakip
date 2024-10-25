
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox" 
], (Controller, JSONModel, Filter, FilterOperator,MessageToast, MessageBox) => {
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

        onDelete: function () {
			const oTable = this.byId("productList");
			const selectedIndices = oTable.getSelectedIndices();
		
			if (selectedIndices.length === 0) {
				MessageToast.show("Silmek için lütfen bir ürün seçin.");
				return;
			}
		
			MessageBox.confirm("Seçilen ürünü silmek istediğinize emin misiniz?", {
				onClose: (oAction) => {
					if (oAction === MessageBox.Action.OK) {
						this._deleteProducts(selectedIndices);
					}
				}
			});
		},
		
		_deleteProducts: function (selectedIndices) {
			const oModel = this.getView().getModel("products");
			const aProducts = oModel.getData();
			const deletedProductIds = selectedIndices.map(index => aProducts[index].ProductID);
		
			const sUrl = 'http://localhost:3000/deleteProduct'; 
		
			const deletePromises = deletedProductIds.map(id => {
				return $.ajax({
					url: `${sUrl}/${id}`,
					method: 'DELETE',
					success: function () {
						MessageToast.show("Ürün başarıyla silindi.");
					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.error("Silme hatası:", textStatus, errorThrown);
						console.error("Sunucu yanıtı:", jqXHR.responseText); // Yanıtı konsolda göster
						MessageToast.show("Bir hata oluştu, ürün silinemedi.");
					}
				});
				
			});
		
			Promise.all(deletePromises)
				.then(() => {
					// Silme işlemi başarılı ise
					MessageToast.show("Seçilen ürün(ler) başarıyla silindi.");
					// Seçilen ürünleri modelden kaldır
					for (let i = selectedIndices.length - 1; i >= 0; i--) {
						const index = selectedIndices[i];
						aProducts.splice(index, 1);
					}
					oModel.setData(aProducts); // Model verilerini güncelle
				})
				.catch(() => {
					MessageToast.show("Bir hata oluştu, ürün silinemedi.");
				});
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
			const subCategoriesModel = this.getView().getModel("subCategories"); 
			const subCategoriesData = subCategoriesModel.getData(); 
			const subCategory = subCategoriesData.find(subCategory => subCategory.SubCategoryID === subCategoryId); 
			return subCategory ? subCategory.SubCategoryName : 'Bilinmiyor';
		},
		getCategoryName: function (categoryId) {
			const categoriesModel = this.getView().getModel("categories");
			const categoriesData = categoriesModel.getData(); 
			const category = categoriesData.find(category => category.CategoryID === categoryId); 
			return category ? category.CategoryName : 'Bilinmiyor'; 
		}
		
	});
});
