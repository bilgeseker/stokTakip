
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

         UIComponent.prototype.init.apply(this, arguments);

         this.getRouter().initialize();
      },
      getContentDensityClass() {
			return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
		}
   });
});
