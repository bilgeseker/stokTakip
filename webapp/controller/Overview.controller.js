sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, Fragment,Filter, FilterOperator,MessageBox,MessageToast) {
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
            this._toggleButtonsAndView(false);
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
            var oPage = this.byId("contentArea"); 
            oPage.removeAllContent();

            this._getFormFragment(sFragmentName).then(function (oVBox) {
                oPage.insertContent(oVBox);
            });
        },
        onAdd: function () {
            if (!this._oAddProductDialog) {
                this._oAddProductDialog = sap.ui.xmlfragment("ui5.walkthrough.view.AddProductFragment", this);
                this.getView().addDependent(this._oAddProductDialog);
            }
            this._oAddProductDialog.open();
        },
        
        // onAdd: function(){
        //     this._toggleButtonsAndView(true);
        // },
        onFilterProducts(oEvent) {
			const aFilter = []; 
			const sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}

			const oList = this.byId("productFragmentList");
			const oBinding = oList.getBinding("rows");
			oBinding.filter(aFilter);
		},
        onCancelPress: function(){
            const oModel = this.getView().getModel("addProductModel");
            oModel.setProperty("/ProductName", "");
            oModel.setProperty("/Quantity", "");
            oModel.setProperty("/ExtendedPrice", "");
            oModel.setProperty("/SizeId", ""); 
            oModel.setProperty("/ColorId", "");
            oModel.setProperty("/CategoryId", ""); 
            oModel.setProperty("/SubCategoryId", ""); 
            oModel.setProperty("/ImageUrl", "");
            this._oAddProductDialog.close();
            this._toggleButtonsAndView(false);
        },
        onDelete: function () {
			const oTable = this.byId("productFragmentList");
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
						console.error("Sunucu yanıtı:", jqXHR.responseText); 
						MessageToast.show("Bir hata oluştu, ürün silinemedi.");
					}
				});
				
			});
		
			Promise.all(deletePromises)
				.then(() => {
					MessageToast.show("Seçilen ürün(ler) başarıyla silindi.");
					
					for (let i = selectedIndices.length - 1; i >= 0; i--) {
						const index = selectedIndices[i];
						aProducts.splice(index, 1);
					}
					oModel.setData(aProducts); 
				})
				.catch(() => {
					MessageToast.show("Bir hata oluştu, ürün silinemedi.");
				});
		},
        onQuantitySort: function() {
            const oTable = this.byId("productList");
            const oColumn = this.byId("quantity");
            const bDescending = oColumn.getSortOrder() === "Ascending";
            oTable.sort(oColumn, bDescending ? "Descending" : "Ascending");
        },
        clearFilters: function() {
			const oTable = this.byId("productFragmentList");
			const oBinding = oTable.getBinding("rows");
		
			oBinding.filter([]);
			oBinding.sort(null);
		},
        onExport: function() {
			const oModel = this.getView().getModel("products");
            const aData = oModel.getData();

            const exportData = aData.map(item => ({
                "Ürün Adı": item.ProductName,
                "Ürün Kodu": item.ProductCode,
                "Miktar": item.Quantity,
                "Fiyat": item.ExtendedPrice,
                "Beden": this.getSizeName(item.SizeId),
                "Renk": this.getColorName(item.ColorId),
                "Alt Kategori": this.getSubCategoryName(item.SubCategoryId),
                "Ana Kategori": this.getCategoryName(item.CategoryId)
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

			XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

            XLSX.writeFile(wb, "Ürünler.xlsx");
			MessageToast.show("Excel dosyası yüklendi.");
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
        onQuantityChange: function(oEvent) {
            const sValue = oEvent.getParameter("value");
            const oModel = this.getView().getModel("addProductModel");
            oModel.setProperty("/Quantity", sValue); 
        },  
        onNameChange: function(oEvent) {
            const sValue = oEvent.getParameter("value");
            const oModel = this.getView().getModel("addProductModel");
            oModel.setProperty("/ProductName", sValue);
        },    
        onPriceChange: function(oEvent) {
            const sValue = oEvent.getParameter("value");
            const oModel = this.getView().getModel("addProductModel");
            oModel.setProperty("/ExtendedPrice", sValue);
        },    
        onSizeChange: function(oEvent) {
            const selectedItem = oEvent.getParameter("selectedItem");
            
            if (selectedItem) {
                const selectedKey = selectedItem.getKey();
                const oModel = this.getView().getModel("addProductModel");
                oModel.setProperty("/SizeId", selectedKey);
                console.log("Seçilen Boyut ID: ", selectedKey);
            } else {
                console.log("Hiçbir boyut seçilmedi.");
            }
        }, 
        onColorChange: function(oEvent) {
            const selectedItem = oEvent.getParameter("selectedItem");
            if (selectedItem) {
                const sValue = selectedItem.getKey();
                const oModel = this.getView().getModel("addProductModel");
                oModel.setProperty("/ColorId", sValue);
            } else {
                console.log("Hiçbir öğe seçilmedi.");
            }
        },
        onCategoryChange: function(oEvent) {
            const selectedItem = oEvent.getParameter("selectedItem");
            if (selectedItem) {
                const sValue = selectedItem.getKey(); 
                const oModel = this.getView().getModel("addProductModel");
                oModel.setProperty("/CategoryId", sValue);
            } else {
                console.log("Hiçbir öğe seçilmedi.");
            }
            
        },
        onSubCategoryChange: function(oEvent) {
            const selectedItem = oEvent.getParameter("selectedItem");
            if (selectedItem) {
                const sValue = selectedItem.getKey(); 
                const oModel = this.getView().getModel("addProductModel");
                oModel.setProperty("/SubCategoryId", sValue);
            } else {
                console.log("Hiçbir öğe seçilmedi.");
            }
        },
        onSavePress: function() {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
            const randomNumber = Math.floor(10000 + Math.random() * 90000);


            const oModel = this.getView().getModel("addProductModel");
            console.log("ImageUrl değeri: ", oModel.getProperty("/ImageUrl"));
            oModel.setProperty("/SizeId", sap.ui.getCore().byId("addSizeList").getSelectedKey());
			oModel.setProperty("/ColorId", sap.ui.getCore().byId("addColorList").getSelectedKey());
			oModel.setProperty("/CategoryId", sap.ui.getCore().byId("addCategoryList").getSelectedKey());
			oModel.setProperty("/SubCategoryId", sap.ui.getCore().byId("addSubcategoryList").getSelectedKey());

            const updatedData = {
                ProductName: oModel.getProperty("/ProductName"),
                ProductCode: randomLetter + randomNumber,
                Quantity: parseInt(oModel.getProperty("/Quantity"), 10),
                ExtendedPrice: parseFloat(oModel.getProperty("/ExtendedPrice")),
                SizeId: oModel.getProperty("/SizeId"),
                ColorId: oModel.getProperty("/ColorId"), 
                CategoryId: oModel.getProperty("/CategoryId"), 
                SubCategoryId: oModel.getProperty("/SubCategoryId"), 
                ImageUrl: oModel.getProperty("/ImageUrl")
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
                    oModel.setProperty("/ProductName", "");
                    oModel.setProperty("/Quantity", "");
                    oModel.setProperty("/ExtendedPrice", "");
                    oModel.setProperty("/SizeId", "");
                    oModel.setProperty("/ColorId", "");
                    oModel.setProperty("/CategoryId", "");
                    oModel.setProperty("/SubCategoryId", "");
                    oModel.setProperty("/ImageUrl", "");

                    this._oAddProductDialog.close();
					this._toggleButtonsAndView(false);

                    
				}.bind(this), 
				error: function () {
					MessageToast.show("Ekleme sırasında hata oluştu.");
				}
			});
        },
        // handleUploadPress: function() {
        
        //     var oFileUploader = sap.ui.getCore().byId("fileUploaderList");
		// 	if (!oFileUploader.getValue()) {
		// 		MessageToast.show("Choose a file first");
		// 		return;
		// 	}
		// 	oFileUploader.checkFileReadable().then(function() {
		// 		oFileUploader.upload();
        //         console.log(oFileUploader.getDomRef().querySelector("input[type='file']").files[0]);
		// 	}, function(error) {
		// 		MessageToast.show("The file cannot be read. It may have changed.");
		// 	}).then(function() {
		// 		oFileUploader.clear();
		// 	});
        // },
        handleUploadPress: function () {
            var oFileUploader = sap.ui.getCore().byId("fileUploaderList");
            var oFile = oFileUploader.oFileUpload.files[0];
            console.log(oFile);
        
            if (!oFile) {
                sap.m.MessageToast.show("Lütfen bir dosya seçin.");
                return;
            }
        
            let formData = new FormData();
            formData.append("file", oFile);
            formData.append("type", "productImage");
        
            fetch("http://localhost:3000/fileUpload", {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("Dosya yükleme başarısız oldu.");
                })
                .then((data) => {
                    sap.m.MessageToast.show("Dosya yüklendi.");
                    console.log("Sunucu Yanıtı:", data);
                })
                .catch((error) => {
                    console.log("error");
                    sap.m.MessageToast.show("hata oluştu.");
                    console.error(error);
                });
        },
                
		handleTypeMissmatch: function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			aFileTypes.map(function(sType) {
				return "*." + sType;
			});
			MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
									" is not supported. Choose one of the following types: " +
									aFileTypes.join(", "));
		},

		handleValueChange: function(oEvent) {
			MessageToast.show("Press 'Save' to upload file '" +
									oEvent.getParameter("newValue") + "'");
		},

		handleUploadComplete: function(oEvent) {
            var oResponse = oEvent.getParameter("response"); 
            console.log("Sunucu yanıtı:", oResponse); 
        
            if (!oResponse) {
                sap.m.MessageToast.show("Sunucudan geçerli bir yanıt alınamadı.");
                return;
            }
            
            try {
                var oData = JSON.parse(oResponse);
                var oModel = this.getView().getModel("addProductModel");
                oModel.setProperty("/ImageUrl", oData.fileNames[0]);
                console.log("Yüklenen dosyanın adı (ImageUrl): ", oData.fileNames[0]);
                sap.m.MessageToast.show("Dosya başarıyla yüklendi: " + oData.fileNames[0]);
            } catch (error) {
                console.error("JSON parse hatası:", error);
                sap.m.MessageToast.show("JSON parse hatası: " + error.message);
            }
        }
        
        ,
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
        }
    });
});
