sap.ui.define([  
    "sap/ui/core/mvc/Controller"  
  ], function(Controller) {  
    "use strict";  
    return Controller.extend("ui5.walkthrough.controller.ProductListController", {  
       onInit: function() {
            const oModel = this.getOwnerComponent().getModel("products");
            if (oModel) {
                this.getView().setModel(oModel);
            } else {
                console.error("Products modeli bulunamadı!");
            }
      }
    });  
  });  