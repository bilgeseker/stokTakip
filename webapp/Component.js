
sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/Device"
], (UIComponent, JSONModel, Device) => {
   "use strict";

   return UIComponent.extend("ui5.walkthrough.Component", {
      metadata : {
         interfaces: ["sap.ui.core.IAsyncContentCreation"],
         manifest: "json"
      },

      init() {

         UIComponent.prototype.init.apply(this, arguments);

         var oProductsModel = new JSONModel();
         oProductsModel.loadData("http://localhost:3000/products");
         this.setModel(oProductsModel, "products");

         var oSizesModel = new JSONModel();
         oSizesModel.loadData("http://localhost:3000/sizes");
         this.setModel(oSizesModel, "sizes");

         var oColorsModel = new JSONModel();
         oColorsModel.loadData("http://localhost:3000/colors");
         this.setModel(oColorsModel, "colors");

         var oCategoriesModel = new JSONModel();
         oCategoriesModel.loadData("http://localhost:3000/categories");
         this.setModel(oCategoriesModel, "categories");

         var oSubCategoriesModel = new JSONModel();
         oSubCategoriesModel.loadData("http://localhost:3000/subCategories");
         this.setModel(oSubCategoriesModel, "subCategories");


         const oData = {
            ProductName: "",
            Quantity: "",
            ExtendedPrice: "",
            SizeId: "",
            ColorId: "",
            CategoryId: "",
            SubCategoryId: "",
            ImageUrl: ""
        };
        
        const oAddModel = new JSONModel(oData);
        this.setModel(oAddModel, "addProductModel");

        const oUpdateData = {
         ProductName: "",
         Quantity: "",
         ExtendedPrice: "",
         SizeId: "",
         ColorId: "",
         CategoryId: "",
         SubCategoryId: ""
         };

        const oUpdateModel = new JSONModel(oUpdateData);
        this.setModel(oUpdateModel, "updateProductModel");

        this.getRouter().initialize();

      },
      getContentDensityClass() {
			return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
		}
   });
});
