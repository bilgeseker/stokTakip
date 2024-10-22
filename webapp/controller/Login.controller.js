sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Login", {
		
		onBtnClick: function () {
            var sUsername = this.byId("user").getValue();
            var sPassword = this.byId("pwd").getValue();
        
            if (sUsername === "admin" && sPassword === "password123") {
                localStorage.setItem("isLoggedIn", true);
        
                this.getOwnerComponent().getRouter().navTo("home");
            } else {
                sap.m.MessageToast.show("Kullanıcı adı veya şifre hatalı!");
            }
        }
        

	});
});