sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
], function (Controller, Fragment,Filter, FilterOperator,MessageBox,MessageToast) {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.CategoryOverview", {
        
        onInit: function () {
            var isLoggedIn = sessionStorage.getItem("isLoggedIn");
            console.log("isLoggedIn:", isLoggedIn);
        
            if (isLoggedIn === "true") {
                console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
            } else {
                console.log("Kullanıcı giriş yapmadı, login sayfasına yönlendiriliyor.");
                this.getOwnerComponent().getRouter().navTo("login");
                return;
            }

            const oCategoryModel = this.getOwnerComponent().getModel("categories");
            if (oCategoryModel) {
                this.getView().setModel(oCategoryModel);
            } else {
                console.error("Products modeli bulunamadı!");
            }

            const oSubCategoryModel = this.getOwnerComponent().getModel("subCategories");
            if (oSubCategoryModel) {
                this.getView().setModel(oSubCategoryModel);
            } else {
                console.error("Products modeli bulunamadı!");
            }
            this._formFragments = {};
            this._toggleButtonsAndView(false);
        },
        _toggleButtonsAndView : function (bEdit) {
			this._showFormFragment(bEdit ? "AddCategoryFragment" : "CategoryList");
		},
        _getFormFragment: function (sFragmentName) {
            var pFormFragment = this._formFragments[sFragmentName],
                oView = this.getView();

            if (!pFormFragment) {
                pFormFragment = Fragment.load({
                    id: oView.getId(),
                    name: "ui5.walkthrough.view." + sFragmentName,
                    controller: this 
                }).then(function (oVBox) {
                    oVBox.setModel(this.getView().getModel("products"), "products"); 
                    oVBox.setModel(this.getView().getModel("categories"), "categories");
                    oVBox.setModel(this.getView().getModel("colors"), "colors");
                    return oVBox;
                }.bind(this));
                this._formFragments[sFragmentName] = pFormFragment;
            }

            return pFormFragment;
        },

        _showFormFragment: function (sFragmentName) {
            var oPage = this.byId("categoryContent"); 
            oPage.removeAllContent();

            this._getFormFragment(sFragmentName).then(function (oVBox) {
                oPage.insertContent(oVBox);
            });
        },
        onAdd: function () {
            if (!this._oAddCategoryDialog) {
                this._oAddCategoryDialog = sap.ui.xmlfragment("ui5.walkthrough.view.AddCategoryFragment", this);
                this.getView().addDependent(this._oAddCategoryDialog);
            }
            this._oAddCategoryDialog.open();
        },
        onFilterProducts(oEvent) {
			const aFilter = []; 
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("SubCategoryName", FilterOperator.Contains, sQuery));
			}

			const oList = this.byId("categoryListFragment");
			const oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
		},
        onCancelPress: function(){
            const oCatModel = this.getView().getModel("addCategoryModel");
            oCatModel.setProperty("/CategoryName", "");

            const oSubCatModel = this.getView().getModel("addSubCategoryModel");
            oSubCatModel.setProperty("/SubCategoryName", "");
            oSubCatModel.setProperty("/CategoryId", "");

            oCatModel.refresh(true);
            oSubCatModel.refresh(true);

            this._oAddCategoryDialog.close();
            this._toggleButtonsAndView(false);
        },
        onCatNameChange: function(oEvent) {
            const sValue = oEvent.getParameter("value");
            const oModel = this.getView().getModel("addCategoryModel");
            oModel.setProperty("/CategoryName", sValue);
        },
        onSubCatNameChange: function(oEvent) {
            const sValue = oEvent.getParameter("value");
            const oModel = this.getView().getModel("addSubCategoryModel");
            oModel.setProperty("/SubCategoryName", sValue);
        },
        onCategoryChange: function(oEvent) {
            const selectedItem = oEvent.getParameter("selectedItem");
            if (selectedItem) {
                const sValue = selectedItem.getKey(); 
                const oModel = this.getView().getModel("addSubCategoryModel");
                oModel.setProperty("/CategoryId", sValue);
            } else {
                console.log("Hiçbir öğe seçilmedi.");
            }
            
        },
        getCategoryName: function (categoryId) {
			const categoriesModel = this.getView().getModel("categories");
			const categoriesData = categoriesModel.getData(); 
			const category = categoriesData.find(category => category.CategoryID === categoryId); 
			return category ? category.CategoryName : 'Bilinmiyor'; 
		},
        onAddCategory: function(){
            const oModel = this.getView().getModel("addCategoryModel");
            const updatedData = {
				CategoryName: oModel.getProperty("/CategoryName")
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
                                oModel.setProperty("/CategoryName", "");
                                
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
            const oModel = this.getView().getModel("addSubCategoryModel");
            oModel.setProperty("/CategoryId", sap.ui.getCore().byId("addSubCategoryListF").getSelectedKey());
            const updatedData = {
				SubCategoryName: oModel.getProperty("/SubCategoryName"),
                CategoryId: oModel.getProperty("/CategoryId")
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
                                oModel.setProperty("/SubCategoryName", "");
                                oModel.setProperty("/CategoryId", "");
                                
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
        },
        onDelete: function () {
			const oTable = this.byId("categoryListFragment");
			const selectedIndices = oTable.getSelectedIndices();
		
			if (selectedIndices.length === 0) {
				MessageToast.show("Silmek için lütfen bir ürün seçin.");
				return;
			}
		
			MessageBox.confirm("Seçilen kategoriyi silmek istediğinize emin misiniz?", {
				onClose: (oAction) => {
					if (oAction === MessageBox.Action.OK) {
						this._deleteProducts(selectedIndices);
					}
				}
			});
		},
		
		_deleteProducts: function (selectedIndices) {
			const oModel = this.getView().getModel("subCategories");
			const aSubCategories = oModel.getData();
			const deletedSubCategoryIds = selectedIndices.map(index => aSubCategories[index].SubCategoryID);
		
			const sUrl = 'http://localhost:3000/deleteSubCategory'; 
		
			const deletePromises = deletedSubCategoryIds.map(id => {
				return $.ajax({
					url: `${sUrl}/${id}`,
					method: 'DELETE',
					success: function () {
						MessageToast.show("Kategori başarıyla silindi.");
					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.error("Silme hatası:", textStatus, errorThrown);
						console.error("Sunucu yanıtı:", jqXHR.responseText); 
						MessageToast.show("Bir hata oluştu, ürün silinemedi.");
					}
				});
				
			});
		
			Promise.all(deletePromises)
				.then(() => {
					MessageToast.show("Seçilen kategori(ler) başarıyla silindi.");
					
					for (let i = selectedIndices.length - 1; i >= 0; i--) {
						const index = selectedIndices[i];
						aSubCategories.splice(index, 1);
					}
					oModel.setData(aSubCategories); 
				})
				.catch(() => {
					MessageToast.show("Bir hata oluştu, kategori silinemedi.");
				});
		}
    });
});