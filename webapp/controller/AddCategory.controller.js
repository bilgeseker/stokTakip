sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
 ], (Controller, MessageToast) => {
    "use strict";
 
    return Controller.extend("ui5.walkthrough.controller.AddCategory", {
        onInit() {
			var isLoggedIn = sessionStorage.getItem("isLoggedIn");
			console.log("isLoggedIn:", isLoggedIn);

			if (isLoggedIn === "true") {
				console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
			} else {
				this.getOwnerComponent().getRouter().navTo("login");
			}
        },
        onAddCategory: function(){
            const updatedData = {
				CategoryName: this.getView().byId("addCategoryName").getValue()
			};

            if (!updatedData.CategoryName) {
				MessageToast.show("Kategori adı zorunludur.");
				return;
			}

            $.ajax({
                url: 'http://localhost:3000/categories', 
                method: 'GET',
                success: function (response) {
                    const existingCategories = response;

                    const categoryExists = existingCategories.some(function(category) {
                        return category.CategoryName.toLowerCase() === updatedData.CategoryName.toLowerCase(); 
                    });

                    if (categoryExists) {
                        MessageToast.show("Bu kategori zaten mevcut.");
                    } else {
                        $.ajax({
                            url: 'http://localhost:3000/addCategory',
                            method: 'POST',
                            data: JSON.stringify(updatedData),
                            contentType: 'application/json',
                            success: function (response) {
                                MessageToast.show("Kategori başarıyla eklendi");
                                const oModel = this.getView().getModel("categories");
                                oModel.loadData("http://localhost:3000/categories");
                                this.getView().byId("addCategoryName").setValue("");
                            }.bind(this),
                            error: function () {
                                MessageToast.show("Ekleme sırasında hata oluştu.");
                            }
                        });
                    }
                }.bind(this),
                error: function () {
                    MessageToast.show("Kategoriler alınamadı.");
                }
            });
        },

        onAddSubCategory: function(){
            const updatedData = {
				SubCategoryName: this.getView().byId("addSubCategoryName").getValue(),
                CategoryId: this.getView().byId("addSubCategoryList").getSelectedKey()
			};

            if (!updatedData.SubCategoryName) {
				MessageToast.show("Alt kategori adı zorunludur.");
				return;
			}

            $.ajax({
                url: 'http://localhost:3000/subCategories', 
                method: 'GET',
                success: function (response) {
                    const existingCategories = response;

                    const categoryExists = existingCategories.some(function(category) {
                        return category.SubCategoryName.toLowerCase() === updatedData.SubCategoryName.toLowerCase(); 
                    });

                    if (categoryExists) {
                        MessageToast.show("Bu alt kategori zaten mevcut.");
                    } else {
                        $.ajax({
                            url: 'http://localhost:3000/addSubCategory',
                            method: 'POST',
                            data: JSON.stringify(updatedData),
                            contentType: 'application/json',
                            success: function (response) {
                                MessageToast.show("Alt kategori başarıyla eklendi");
                                const oModel = this.getView().getModel("subCategories");
                                oModel.loadData("http://localhost:3000/subCategories");
                                this.getView().byId("addSubCategoryName").setValue("");
                                this.getView().byId("addSubCategoryList").setSelectedKey("");
                            }.bind(this),
                            error: function () {
                                MessageToast.show("Ekleme sırasında hata oluştu.");
                            }
                        });
                    }
                }.bind(this),
                error: function () {
                    MessageToast.show("Alt kategoriler alınamadı.");
                }
            });
        }
    });

});