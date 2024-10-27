
sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
   "use strict";

   return Controller.extend("ui5.walkthrough.controller.App", {
      onInit() {
         var isLoggedIn = sessionStorage.getItem("isLoggedIn");
			console.log("isLoggedIn:", isLoggedIn); 

			if (isLoggedIn === "true") {
				console.log("Kullanıcı giriş yaptı, yönlendirme yapılmayacak.");
			} else {
				this.getOwnerComponent().getRouter().navTo("login"); 
			}
         this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

         this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched, this);
      },
      onRouteMatched: function (oEvent) {
         var sRouteName = oEvent.getParameter("name");
         var oSideNav = this.byId("sideNavigation");
         var oHeader = this.byId("navHeader");
     
         if (sRouteName === "login") {
             oSideNav.setVisible(false);
             oHeader.setVisible(false);
         } else {
             oSideNav.setVisible(true);
             oHeader.setVisible(true);
         }
     },
      getBundleText: function (sI18nKey) {
         var oBundle = this.getView().getModel("i18n").getResourceBundle();
         return oBundle.getText(sI18nKey);
      },
       onSideNavButtonPress: function () {
         const oSideNavigation = this.byId("sideNavigation"),
			bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
      },
      onItemSelect: function (oEvent) {
         var sKey = oEvent.getParameter("item").getKey();
         var oRouter = UIComponent.getRouterFor(this);
         if (sKey === "home") {
            oRouter.navTo("home");
         } else if (sKey === "addProduct") {
            oRouter.navTo("addProduct");
         } else if (sKey === "addCategory") {
            oRouter.navTo("addCategory");
         }
      },
      onLogoutButtonPress: function (oEvent){
         var oRouter = UIComponent.getRouterFor(this);
         localStorage.removeItem("isLoggedIn");
         oRouter.navTo("login");
         sap.ui.core.UIComponent.getRouterFor(this).navTo("login", {}, true);
      },
      onThemeButtonPress: function (oEvent){
         var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
         var sNewTheme = (sCurrentTheme === "sap_horizon") ? "sap_horizon_dark" : "sap_horizon";
         
         sap.ui.getCore().applyTheme(sNewTheme);
         const body = document.body;
         body.classList.toggle("dark-theme");
      }
      
   });
});
