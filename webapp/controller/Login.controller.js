sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.Login", {
        onInit: function(){
        },
		
		onBtnClick: function () {
            var sUsername = this.byId("user").getValue();
            var sPassword = this.byId("pwd").getValue();
        
            if (sUsername === "admin" && sPassword === "password123") {
                console.log("Giriş yapıldı, isLoggedIn kaydediliyor.");
                sessionStorage.setItem("isLoggedIn", true);
                console.log(sessionStorage);
        
                this.getOwnerComponent().getRouter().navTo("home");
            } else {
                sap.m.MessageToast.show("Kullanıcı adı veya şifre hatalı!");
            }
        }

	});
});